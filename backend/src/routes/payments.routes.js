const express = require('express');
const router = express.Router();
const paymentsService = require('../services/payments.service');
const {
    createOrderSchema,
    verifyPaymentSchema,
    deductWalletSchema,
    refundSchema
} = require('../validators/payment.validator');
const authenticate = require('../middlewares/auth.middleware');

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for wallet top-up (Protected)
 */
router.post('/create-order', authenticate, async (req, res) => {
    try {
        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const result = await paymentsService.createRazorpayOrder({
            userId: req.user.uid,
            amount: value.amount,
            currency: value.currency
        });

        res.json(result);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/payments/verify
 * Verify payment signature and atomically credit wallet (Protected)
 */
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { error, value } = verifyPaymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const result = await paymentsService.verifyRazorpayPayment({
            userId: req.user.uid,
            orderId: value.orderId,
            paymentId: value.paymentId,
            signature: value.signature
        });

        res.json(result);
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/payments/deduct
 * Deduct amount from wallet for booking using atomic Firestore transaction (Protected)
 */
router.post('/deduct', authenticate, async (req, res) => {
    try {
        const { error, value } = deductWalletSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const result = await paymentsService.deductWallet({
            userId: req.user.uid,
            amount: value.amount,
            bookingId: value.bookingId,
            description: value.description
        });

        res.json(result);
    } catch (err) {
        console.error('Deduction error:', err);
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/payments/balance/:userId
 * Get wallet balance (Protected: owner only)
 */
router.get('/balance/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied: You can only view your own balance' });
        }

        const result = await paymentsService.getWalletBalance(userId);
        res.json(result);
    } catch (err) {
        console.error('Get balance error:', err);
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/payments/history/:userId
 * Get transaction history (Protected: owner only)
 */
router.get('/history/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied: You can only view your own transaction history' });
        }

        const result = await paymentsService.getTransactionHistory(userId, req.query);
        res.json(result);
    } catch (err) {
        console.error('Get history error:', err);
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/payments/refund
 * Initiate refund for a payment (Protected: owner or admin)
 */
router.post('/refund', authenticate, async (req, res) => {
    try {
        const { error, value } = refundSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const result = await paymentsService.processRefund({
            userId: req.user.uid,
            paymentId: value.paymentId,
            amount: value.amount,
            reason: value.reason,
            isAdmin: req.user.role === 'admin'
        });

        res.json(result);
    } catch (err) {
        console.error('Refund error:', err);
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

module.exports = router;
