const express = require('express');
const router = express.Router();
const { db, admin } = require('../../config/firebase');

// @route   POST /api/transactions
// @desc    Create a new transaction (credit/debit)
router.post('/', async (req, res) => {
    try {
        const { userId, amount, type, description, source, referenceId } = req.body;

        if (!userId || !amount || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const transactionData = {
            userId,
            amount: Number(amount),
            type, // 'credit' | 'debit'
            description: description || '',
            source: source || 'manual', // 'job_payment', 'withdrawal'
            referenceId: referenceId || null,
            status: 'success', // Assuming immediate success for now
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('transactions').add(transactionData);

        // Update User Wallet Balance (Atomic operation)
        const userRef = db.collection('users').doc(userId); // Or 'workers' depending on who has the wallet
        // Checking if it's a worker or customer? Usually workers have wallets. 
        // Let's assume 'users' collection covers generic wallet or check 'workers'.
        // For simplicity, we try to update a 'walletBalance' field on the user doc.

        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) {
                // Try worker collection if user not found (or handle error)
                const workerRef = db.collection('workers').doc(userId);
                const workerDoc = await t.get(workerRef);
                if (workerDoc.exists) {
                    const newBalance = (workerDoc.data().walletBalance || 0) + (type === 'credit' ? amount : -amount);
                    t.update(workerRef, { walletBalance: newBalance });
                }
                return;
            }
            const newBalance = (doc.data().walletBalance || 0) + (type === 'credit' ? amount : -amount);
            t.update(userRef, { walletBalance: newBalance });
        });

        res.status(201).json({ id: docRef.id, ...transactionData });
    } catch (error) {
        console.error('Transaction Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/transactions/:userId
// @desc    Get transaction history for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .get();

        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        // Sort in memory to avoid complex index requirements for simple demo
        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(transactions);
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
