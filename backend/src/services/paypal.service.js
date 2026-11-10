const { db } = require('../../config/firebase');

class PayPalService {
    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID || 'mock_paypal_client_id';
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'mock_paypal_client_secret';
        this.mode = process.env.PAYPAL_MODE || 'sandbox';
        this.baseUrl = process.env.PAYPAL_BASE_URL || (
            this.mode === 'live' 
                ? 'https://api-m.paypal.com' 
                : 'https://api-m.sandbox.paypal.com'
        );
        this.webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
        this.cachedToken = null;
        this.tokenExpiresAt = 0;
    }

    /**
     * Obtains OAuth 2.0 access token using client credentials flow.
     * Caches token in memory until 60 seconds before expiration.
     */
    async getAccessToken() {
        const now = Date.now();
        if (this.cachedToken && this.tokenExpiresAt > now + 60000) {
            return this.cachedToken;
        }

        const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errText = await response.text();
            const err = new Error(`PayPal OAuth authentication failed: ${response.status} ${errText}`);
            err.statusCode = 502;
            throw err;
        }

        const data = await response.json();
        this.cachedToken = data.access_token;
        this.tokenExpiresAt = now + (data.expires_in * 1000);

        return this.cachedToken;
    }

    /**
     * Creates an authoritative PayPal Checkout order for a booking.
     * Validates customer ownership and derives price authoritatively from Firestore.
     */
    async createOrder({ userId, bookingId, currency = 'USD' }) {
        if (!bookingId) {
            const err = new Error('Booking ID is required');
            err.statusCode = 400;
            throw err;
        }

        // 1. Fetch booking from Firestore jobs collection
        const jobRef = db.collection('jobs').doc(bookingId);
        const jobDoc = await jobRef.get();

        if (!jobDoc.exists) {
            const err = new Error('Booking not found');
            err.statusCode = 404;
            throw err;
        }

        const job = jobDoc.data();

        // 2. Validate customer ownership: only the customer who created the booking can pay
        if (job.customerId !== userId) {
            const err = new Error('Access denied: You can only pay for your own booking');
            err.statusCode = 403;
            throw err;
        }

        // 3. Prevent duplicate payment if already paid
        if (job.payment?.status === 'paid') {
            const err = new Error('Booking is already paid');
            err.statusCode = 400;
            throw err;
        }

        // 4. Derive authoritative price from the booking record (never trust client)
        const price = Number(job.price);
        if (!Number.isFinite(price) || price <= 0) {
            const err = new Error('Invalid booking price on record');
            err.statusCode = 400;
            throw err;
        }

        const formattedPrice = price.toFixed(2);
        const accessToken = await this.getAccessToken();

        // 5. Call PayPal Orders API v2
        const payload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: bookingId,
                    description: `BlueBridge Service Booking: ${job.serviceType || 'Service'} (#${bookingId.slice(0, 8)})`,
                    amount: {
                        currency_code: currency,
                        value: formattedPrice
                    }
                }
            ],
            application_context: {
                brand_name: 'BlueBridge AI',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW'
            }
        };

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            const err = new Error(`Failed to create PayPal order: ${response.status} ${errText}`);
            err.statusCode = 502;
            throw err;
        }

        const order = await response.json();

        // 6. Record pending transaction in Firestore
        await db.collection('transactions').doc(order.id).set({
            orderId: order.id,
            userId,
            bookingId,
            amount: price,
            currency,
            provider: 'paypal',
            status: 'pending',
            type: 'booking_payment',
            createdAt: new Date().toISOString()
        });

        // 7. Store pending PayPal Order ID on booking
        await jobRef.update({
            'payment.paypalOrderId': order.id,
            'payment.status': 'awaiting_payment',
            'payment.amount': price,
            'payment.currency': currency
        });

        return {
            success: true,
            orderId: order.id,
            amount: price,
            currency,
            status: order.status
        };
    }

    /**
     * Authoritatively captures a PayPal order server-side.
     * Enforces user ownership, idempotency, and atomic booking state updates via Firestore transaction.
     */
    async captureOrder({ userId, orderId, bookingId }) {
        if (!orderId) {
            const err = new Error('PayPal Order ID is required');
            err.statusCode = 400;
            throw err;
        }

        const transactionRef = db.collection('transactions').doc(orderId);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            const err = new Error('Payment order record not found');
            err.statusCode = 404;
            throw err;
        }

        const transactionData = transactionDoc.data();

        // 1. Ownership check: user must be the original payer
        if (transactionData.userId !== userId) {
            const err = new Error('Access denied: User does not match order record');
            err.statusCode = 403;
            throw err;
        }

        const targetBookingId = bookingId || transactionData.bookingId;
        if (!targetBookingId) {
            const err = new Error('Associated booking not found for this order');
            err.statusCode = 400;
            throw err;
        }

        const jobRef = db.collection('jobs').doc(targetBookingId);

        // 2. Idempotency check: if transaction is already successful, return idempotent success
        if (transactionData.status === 'success') {
            return {
                success: true,
                orderId,
                captureId: transactionData.captureId || null,
                status: 'COMPLETED',
                bookingId: targetBookingId,
                isDuplicate: true,
                message: 'Payment already captured successfully'
            };
        }

        // 3. Execute capture against PayPal REST API v2
        const accessToken = await this.getAccessToken();

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            const err = new Error(`PayPal order capture failed: ${response.status} ${errText}`);
            err.statusCode = 502;
            throw err;
        }

        const captureData = await response.json();

        if (captureData.status !== 'COMPLETED') {
            const err = new Error(`PayPal order not completed. Status: ${captureData.status}`);
            err.statusCode = 400;
            throw err;
        }

        const captureDetails = captureData.purchase_units?.[0]?.payments?.captures?.[0] || {};
        const captureId = captureDetails.id || `cap_${Date.now()}`;
        const capturedAmount = parseFloat(captureDetails.amount?.value) || transactionData.amount;
        const capturedCurrency = captureDetails.amount?.currency_code || transactionData.currency || 'USD';

        // 4. Atomically finalize financial transaction and booking record
        await db.runTransaction(async (t) => {
            const currentTxnDoc = await t.get(transactionRef);
            if (currentTxnDoc.exists && currentTxnDoc.data().status === 'success') {
                return; // Already captured in race condition
            }

            const currentJobDoc = await t.get(jobRef);
            if (!currentJobDoc.exists) {
                const err = new Error('Booking record not found during transaction');
                err.statusCode = 404;
                throw err;
            }

            const currentJob = currentJobDoc.data();

            // Update transaction
            t.update(transactionRef, {
                status: 'success',
                captureId,
                capturedAmount,
                capturedCurrency,
                completedAt: new Date().toISOString(),
                rawStatus: captureData.status
            });

            // Update booking payment and state
            const bookingUpdates = {
                'payment.status': 'paid',
                'payment.method': 'paypal',
                'payment.amount': capturedAmount,
                'payment.currency': capturedCurrency,
                'payment.transactionId': orderId,
                'payment.captureId': captureId,
                'payment.paidAt': new Date().toISOString()
            };

            // If job is in pending state, advance to assigned or accepted
            if (currentJob.status === 'pending') {
                bookingUpdates.status = currentJob.workerId && currentJob.workerId !== 'auto-assign' 
                    ? 'assigned' 
                    : 'pending';
            }

            t.update(jobRef, bookingUpdates);
        });

        return {
            success: true,
            orderId,
            captureId,
            status: 'COMPLETED',
            bookingId: targetBookingId,
            amount: capturedAmount,
            currency: capturedCurrency,
            message: 'Payment captured and booking confirmed successfully'
        };
    }

    /**
     * Verifies PayPal webhook signature server-side.
     */
    async verifyWebhookSignature({ headers, rawBody }) {
        if (!this.webhookId) {
            // If no webhook ID configured (e.g. in development), return true with a warning
            console.warn('PAYPAL_WEBHOOK_ID not set. Skipping cryptographic signature verification.');
            return true;
        }

        const accessToken = await this.getAccessToken();

        const payload = {
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: this.webhookId,
            webhook_event: typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
        };

        const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.verification_status === 'SUCCESS';
    }

    /**
     * Handles verified PayPal webhook events idempotently.
     */
    async handleWebhookEvent(event) {
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`Received PayPal Webhook Event: ${eventType} (ID: ${event.id})`);

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const captureId = resource.id;
            const amount = parseFloat(resource.amount?.value || 0);
            const currency = resource.amount?.currency_code || 'USD';
            const customId = resource.custom_id || resource.invoice_id;

            // Find matching transaction
            const snapshot = await db.collection('transactions')
                .where('captureId', '==', captureId)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                // Already processed
                return { success: true, processed: false, reason: 'Already recorded' };
            }

            // If we have an order reference
            const orderId = resource.supplementary_data?.related_ids?.order_id;
            if (orderId) {
                const orderDoc = await db.collection('transactions').doc(orderId).get();
                if (orderDoc.exists && orderDoc.data().status !== 'success') {
                    const orderData = orderDoc.data();
                    const bookingId = orderData.bookingId;

                    await db.runTransaction(async (t) => {
                        t.update(db.collection('transactions').doc(orderId), {
                            status: 'success',
                            captureId,
                            completedAt: new Date().toISOString()
                        });

                        if (bookingId) {
                            t.update(db.collection('jobs').doc(bookingId), {
                                'payment.status': 'paid',
                                'payment.method': 'paypal',
                                'payment.amount': amount,
                                'payment.currency': currency,
                                'payment.captureId': captureId,
                                'payment.paidAt': new Date().toISOString()
                            });
                        }
                    });

                    return { success: true, processed: true, orderId, captureId };
                }
            }
        }

        return { success: true, processed: false, reason: 'Ignored or unhandled event type' };
    }

    /**
     * Returns sanitized public PayPal client configuration for the frontend.
     */
    getClientConfig() {
        return {
            success: true,
            clientId: this.clientId,
            currency: process.env.PAYMENT_CURRENCY || 'USD',
            mode: this.mode
        };
    }
}

module.exports = new PayPalService();
