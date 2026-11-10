const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const paymentsService = require('../services/payments.service');

// @route   POST /api/transactions
// @desc    Direct client transaction creation is disabled for security
router.post('/', authenticate, async (req, res) => {
    return res.status(403).json({
        success: false,
        error: 'Direct transaction creation is disabled. Financial transactions must be processed via authorized payment flows.'
    });
});

// @route   GET /api/transactions/:userId
// @desc    Get transaction history for a user (Protected: owner only)
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: You can only view your own transactions' });
        }

        const result = await paymentsService.getTransactionHistory(userId, req.query);

        // Return array directly to preserve legacy frontend component contract
        res.json(result.transactions || []);
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
