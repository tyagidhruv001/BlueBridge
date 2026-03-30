const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { db } = require('../../config/firebase');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'default_secret'
});

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for wallet top-up
 */
router.post('/create-order', async (req, res) => {
    try {
        const { amount, userId } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Amount and userId are required'
            });
        }

        // Validate amount (min ₹10, max ₹100,000)
        if (amount < 10 || amount > 100000) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be between ₹10 and ₹1,00,000'
            });
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
            notes: {
                userId,
                purpose: 'wallet_topup'
            }
        };

        const order = await razorpay.orders.create(options);

        // Store pending transaction in Firestore
        await db.collection('transactions').doc(order.id).set({
            orderId: order.id,
            userId,
            amount,
            currency: 'INR',
            status: 'pending',
            type: 'wallet_topup',
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and update wallet
 */
router.post('/verify', async (req, res) => {
    try {
        const { orderId, paymentId, signature, userId } = req.body;

        if (!orderId || !paymentId || !signature || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Verify signature
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === signature;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment signature'
            });
        }

        // Get transaction details
        const transactionDoc = await db.collection('transactions').doc(orderId).get();

        if (!transactionDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        const transaction = transactionDoc.data();

        // Update transaction status
        await db.collection('transactions').doc(orderId).update({
            status: 'success',
            paymentId,
            signature,
            completedAt: new Date().toISOString()
        });

        // Update user's wallet
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        let currentBalance = 0;
        if (userDoc.exists && userDoc.data().wallet) {
            currentBalance = userDoc.data().wallet.balance || 0;
        }

        const newBalance = currentBalance + transaction.amount;

        await userRef.set({
            wallet: {
                balance: newBalance,
                currency: 'INR',
                lastUpdated: new Date().toISOString()
            }
        }, { merge: true });

        res.json({
            success: true,
            transactionId: orderId,
            newBalance,
            message: `₹${transaction.amount} added to wallet successfully`
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/payments/deduct
 * Deduct amount from wallet for booking
 */
router.post('/deduct', async (req, res) => {
    try {
        const { userId, amount, bookingId, description } = req.body;

        if (!userId || !amount || !bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Get current wallet balance
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists || !userDoc.data().wallet) {
            return res.status(400).json({
                success: false,
                error: 'Wallet not found'
            });
        }

        const currentBalance = userDoc.data().wallet.balance || 0;

        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient wallet balance',
                currentBalance,
                required: amount
            });
        }

        const newBalance = currentBalance - amount;

        // Deduct from wallet
        await db.collection('users').doc(userId).update({
            'wallet.balance': newBalance,
            'wallet.lastUpdated': new Date().toISOString()
        });

        // Record transaction
        const transactionId = `txn_${Date.now()}_${userId}`;
        await db.collection('transactions').doc(transactionId).set({
            transactionId,
            userId,
            amount,
            type: 'booking_payment',
            status: 'success',
            bookingId,
            description: description || 'Service booking payment',
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            newBalance,
            transactionId,
            message: `₹${amount} deducted from wallet`
        });

    } catch (error) {
        console.error('Deduction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/payments/balance/:userId
 * Get wallet balance
 */
router.get('/balance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists || !userDoc.data().wallet) {
            return res.json({
                success: true,
                balance: 0,
                currency: 'INR'
            });
        }

        const wallet = userDoc.data().wallet;

        res.json({
            success: true,
            balance: wallet.balance || 0,
            currency: wallet.currency || 'INR',
            lastUpdated: wallet.lastUpdated
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/payments/history/:userId
 * Get transaction history
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, type } = req.query;

        let query = db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit));

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

        res.json({
            success: true,
            transactions,
            count: transactions.length
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/payments/refund
 * Initiate refund for a payment
 */
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, amount, reason, userId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID is required'
            });
        }

        // Create refund
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined, // Partial or full refund
            notes: {
                reason: reason || 'Customer request'
            }
        });

        // Record refund transaction
        await db.collection('transactions').add({
            userId,
            type: 'refund',
            amount: refund.amount / 100,
            status: 'success',
            refundId: refund.id,
            paymentId,
            reason,
            createdAt: new Date().toISOString()
        });

        // Update wallet if user exists
        if (userId) {
            const refundAmount = refund.amount / 100;
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists && userDoc.data().wallet) {
                const currentBalance = userDoc.data().wallet.balance || 0;
                await userRef.update({
                    'wallet.balance': currentBalance + refundAmount,
                    'wallet.lastUpdated': new Date().toISOString()
                });
            }
        }

        res.json({
            success: true,
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status
        });

    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
