const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');

// @route   GET /api/metadata/categories
// @desc    Get all service categories
router.get('/categories', async (req, res) => {
    try {
        const snapshot = await db.collection('service_categories').get();
        if (snapshot.empty) {
            // Return default categories if none in DB
            return res.json([
                { id: '1', name: 'Mechanic', slug: 'mechanic', icon: 'wrench' },
                { id: '2', name: 'Plumber', slug: 'plumber', icon: 'droplet' }
            ]);
        }

        const categories = [];
        snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/metadata/categories
// @desc    Add a new category (Admin only)
router.post('/categories', async (req, res) => {
    try {
        const { name, slug, icon, base_price } = req.body;
        await db.collection('service_categories').add({
            name,
            slug: slug || name.toLowerCase().replace(/ /g, '-'),
            icon,
            base_price,
            isActive: true
        });
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
