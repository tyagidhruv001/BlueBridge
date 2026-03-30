const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');

// @route   POST /api/favorites
// @desc    Add a worker to favorites
router.post('/', async (req, res) => {
    try {
        const { customerId, workerId } = req.body;

        // Check availability
        if (!customerId || !workerId) return res.status(400).json({ error: 'Missing IDs' });

        // Prevent duplicates
        const snapshot = await db.collection('favorites')
            .where('customerId', '==', customerId)
            .where('workerId', '==', workerId)
            .get();

        if (!snapshot.empty) {
            return res.status(400).json({ message: 'Already a favorite' });
        }

        await db.collection('favorites').add({
            customerId,
            workerId,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/favorites/:customerId
// @desc    Get favorite workers
router.get('/:customerId', async (req, res) => {
    try {
        const snapshot = await db.collection('favorites')
            .where('customerId', '==', req.params.customerId)
            .get();

        const favorites = [];
        const workerIds = [];
        snapshot.forEach(doc => {
            favorites.push(doc.data());
            workerIds.push(doc.data().workerId);
        });

        // Optionally fetch worker details here if needed, or let frontend do it
        // For efficiency, we can return just IDs or do a parallel fetch

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   DELETE /api/favorites
// @desc    Remove from favorites
router.delete('/', async (req, res) => {
    try {
        const { customerId, workerId } = req.body;
        const snapshot = await db.collection('favorites')
            .where('customerId', '==', customerId)
            .where('workerId', '==', workerId)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
