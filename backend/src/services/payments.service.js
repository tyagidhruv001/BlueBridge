const Razorpay = require('razorpay');
const crypto = require('crypto');
const { db } = require('../../config/firebase');

// Standardized platform currency
const DEFAULT_CURRENCY = process.env.PAYMENT_CURRENCY || 'USD';

class PaymentsService {
    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'default_secret'
        });
    }

    /**
     * Atomically credits a user's wallet inside a Firestore transaction.
     * Prevents duplicate credits, negative/invalid amounts, and race conditions.
     */
    async creditWallet({ userId, transactionId, amount, currency = DEFAULT_CURRENCY, provider = 'wallet', metadata = {} }) {
        if (!Number.isFinite(amount) || amount <= 0) {
            const err = new Error('Invalid transaction amount: Amount must be a positive finite number');
            err.statusCode = 400;
            throw err;
        }

        const userRef = db.collection('users').doc(userId);
        const transactionRef = db.collection('transactions').doc(transactionId);

        let finalBalance = 0;

        await db.runTransaction(async (t) => {
            const transactionDoc = await t.get(transactionRef);

            if (transactionDoc.exists) {
                const existing = transactionDoc.data();
                // Idempotency check: If already completed successfully, return without re-crediting
                if (existing.status === 'success') {
                    const uDoc = await t.get(userRef);
                    finalBalance = Number(uDoc.data()?.wallet?.balance || 0);
                    return;
                }
            }

            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                const err = new Error('User not found');
                err.statusCode = 404;
                throw err;
            }

            const currentBalance = Number(userDoc.data()?.wallet?.balance || 0);
            finalBalance = currentBalance + amount;

            t.set(userRef, {
                wallet: {
                    balance: finalBalance,
                    currency,
                    lastUpdated: new Date().toISOString()
                }
            }, { merge: true });

            const transactionData = {
                transactionId,
                userId,
                amount,
                currency,
                provider,
                status: 'success',
                type: 'credit',
                metadata,
                createdAt: new Date().toISOString()
            };

            if (transactionDoc.exists) {
                t.update(transactionRef, transactionData);
            } else {
                t.set(transactionRef, transactionData);
            }
        });

        return {
            success: true,
            transactionId,
            newBalance: finalBalance,
            currency
        };
    }

    /**
     * Atomically deducts payment from a user's wallet for a booking.
     * Prevents negative balances, validates booking ownership, and validates booking price.
     */
    async deductWallet({ userId, amount, currency = DEFAULT_CURRENCY, bookingId, description }) {
        if (!Number.isFinite(amount) || amount <= 0) {
            const err = new Error('Invalid transaction amount: Amount must be a positive finite number');
            err.statusCode = 400;
            throw err;
        }

        const userRef = db.collection('users').doc(userId);
        const jobRef = db.collection('jobs').doc(bookingId);
        const transactionId = `txn_deduct_${Date.now()}_${userId}`;
        const transactionRef = db.collection('transactions').doc(transactionId);

        let finalBalance = 0;

        await db.runTransaction(async (t) => {
            // 1. Verify user and wallet
            const userDoc = await t.get(userRef);
            if (!userDoc.exists || !userDoc.data().wallet) {
                const err = new Error('User wallet not initialized');
                err.statusCode = 400;
                throw err;
            }

            const currentBalance = Number(userDoc.data().wallet.balance || 0);
            if (currentBalance < amount) {
                const err = new Error(`Insufficient wallet balance. Available: ${currentBalance}, Required: ${amount}`);
                err.statusCode = 400;
                throw err;
            }

            // 2. Verify booking ownership and price matching
            const jobDoc = await t.get(jobRef);
            if (!jobDoc.exists) {
                const err = new Error('Booking not found');
                err.statusCode = 404;
                throw err;
            }

            const job = jobDoc.data();
            if (job.customerId !== userId) {
                const err = new Error('Access denied: You can only pay for your own booking');
                err.statusCode = 403;
                throw err;
            }

            // Validate that payment covers the required price
            const requiredPrice = Number(job.price || 0);
            if (requiredPrice > 0 && amount < requiredPrice) {
                const err = new Error(`Payment amount mismatch: Provided ${amount} is less than required price ${requiredPrice}`);
                err.statusCode = 400;
                throw err;
            }

            // 3. Atomically deduct balance
            finalBalance = currentBalance - amount;

            t.update(userRef, {
                'wallet.balance': finalBalance,
                'wallet.lastUpdated': new Date().toISOString()
            });

            // 4. Create transaction record
            t.set(transactionRef, {
                transactionId,
                userId,
                amount,
                currency,
                type: 'booking_payment',
                status: 'success',
                bookingId,
                description: description || 'Service booking payment',
                createdAt: new Date().toISOString()
            });

            // 5. Update booking payment status
            t.update(jobRef, {
                'payment.status': 'paid',
                'payment.method': 'wallet',
                'payment.amount': amount,
                'payment.transactionId': transactionId,
                'payment.paidAt': new Date().toISOString()
            });
        });

        return {
            success: true,
            transactionId,
            newBalance: finalBalance,
            currency
        };
    }

    /**
     * Creates a Razorpay order for wallet top-up.
     */
    async createRazorpayOrder({ userId, amount, currency = 'INR' }) {
        if (!Number.isFinite(amount) || amount < 10 || amount > 100000) {
            const err = new Error('Amount must be between 10 and 100,000');
            err.statusCode = 400;
            throw err;
        }

        const options = {
            amount: Math.round(amount * 100), // paise
            currency,
            receipt: `receipt_${userId}_${Date.now()}`,
            notes: {
                userId,
                purpose: 'wallet_topup'
            }
        };

        const order = await this.razorpay.orders.create(options);

        // Store pending transaction in Firestore
        await db.collection('transactions').doc(order.id).set({
            orderId: order.id,
            userId,
            amount,
            currency,
            provider: 'razorpay',
            status: 'pending',
            type: 'wallet_topup',
            createdAt: new Date().toISOString()
        });

        return {
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        };
    }

    /**
     * Verifies Razorpay payment signature server-side and credits wallet atomically.
     * Prevents duplicate verification, amount mismatches, and wrong-user fraud.
     */
    async verifyRazorpayPayment({ userId, orderId, paymentId, signature }) {
        if (!orderId || !paymentId || !signature) {
            const err = new Error('Missing required verification fields');
            err.statusCode = 400;
            throw err;
        }

        // 1. Verify HMAC SHA256 signature
        const body = orderId + '|' + paymentId;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'default_secret';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== signature) {
            const err = new Error('Invalid payment signature');
            err.statusCode = 400;
            throw err;
        }

        // 2. Fetch stored order record
        const transactionRef = db.collection('transactions').doc(orderId);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            const err = new Error('Transaction order record not found');
            err.statusCode = 404;
            throw err;
        }

        const transactionData = transactionDoc.data();

        // 3. Prevent wrong-user fraud: caller must match original order's userId
        if (transactionData.userId !== userId) {
            const err = new Error('Unauthorized verification: User does not match order recipient');
            err.statusCode = 403;
            throw err;
        }

        // 4. Idempotency check: If already processed, return current balance
        if (transactionData.status === 'success') {
            const userDoc = await db.collection('users').doc(userId).get();
            return {
                success: true,
                transactionId: orderId,
                newBalance: userDoc.data()?.wallet?.balance || 0,
                isDuplicate: true,
                message: 'Payment already verified'
            };
        }

        // 5. Atomically credit wallet with the exact amount stored in the original order
        const creditResult = await this.creditWallet({
            userId,
            transactionId: orderId,
            amount: transactionData.amount,
            currency: transactionData.currency || 'INR',
            provider: 'razorpay',
            metadata: { paymentId, signature }
        });

        // 6. Update transaction metadata
        await transactionRef.update({
            paymentId,
            signature,
            completedAt: new Date().toISOString()
        });

        return {
            success: true,
            transactionId: orderId,
            newBalance: creditResult.newBalance,
            message: `Amount credited to wallet successfully`
        };
    }

    /**
     * Retrieves user wallet balance.
     */
    async getWalletBalance(userId) {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists || !userDoc.data().wallet) {
            return {
                success: true,
                balance: 0,
                currency: DEFAULT_CURRENCY
            };
        }

        const wallet = userDoc.data().wallet;
        return {
            success: true,
            balance: Number(wallet.balance) || 0,
            currency: wallet.currency || DEFAULT_CURRENCY,
            lastUpdated: wallet.lastUpdated || null
        };
    }

    /**
     * Retrieves transaction history for the authenticated owner.
     */
    async getTransactionHistory(userId, options = {}) {
        const { limit = 50, type } = options;

        let query = db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit) || 50);

        if (type) {
            query = query.where('type', '==', type);
        }

        const snapshot = await query.get();
        const transactions = [];

        snapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            transactions,
            count: transactions.length
        };
    }

    /**
     * Processes payment refund with server-side validation.
     */
    async processRefund({ userId, paymentId, amount, reason, isAdmin = false }) {
        if (!paymentId) {
            const err = new Error('Payment ID is required');
            err.statusCode = 400;
            throw err;
        }

        // Find existing successful transaction
        const snapshot = await db.collection('transactions')
            .where('paymentId', '==', paymentId)
            .where('status', '==', 'success')
            .limit(1)
            .get();

        if (snapshot.empty) {
            const err = new Error('Original payment transaction not found');
            err.statusCode = 404;
            throw err;
        }

        const origDoc = snapshot.docs[0];
        const origData = origDoc.data();

        if (origData.userId !== userId && !isAdmin) {
            const err = new Error('Access denied: You cannot refund another user\'s payment');
            err.statusCode = 403;
            throw err;
        }

        const refund = await this.razorpay.payments.refund(paymentId, {
            amount: amount ? Math.round(Number(amount) * 100) : undefined,
            notes: {
                reason: reason || 'Customer refund request',
                requestedBy: userId
            }
        });

        const refundAmount = refund.amount / 100;

        await db.collection('transactions').add({
            userId: origData.userId,
            type: 'refund',
            amount: refundAmount,
            currency: origData.currency || DEFAULT_CURRENCY,
            status: 'success',
            refundId: refund.id,
            paymentId,
            reason: reason || 'Customer request',
            createdAt: new Date().toISOString()
        });

        return {
            success: true,
            refundId: refund.id,
            amount: refundAmount,
            status: refund.status
        };
    }
}

module.exports = new PaymentsService();
