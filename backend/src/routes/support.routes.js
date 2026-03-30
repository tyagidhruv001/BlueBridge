const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');

// @route   POST /api/support
// @desc    Create a support ticket
router.post('/', async (req, res) => {
    try {
        const { userId, subject, description, priority } = req.body;

        const ticketData = {
            userId,
            subject,
            description,
            status: 'open',
            priority: priority || 'normal',
            createdAt: new Date().toISOString(),
            messages: [] // Array of { sender: 'user'|'support', text, timestamp }
        };

        const docRef = await db.collection('support_tickets').add(ticketData);
        res.status(201).json({ id: docRef.id, ...ticketData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/support/:userId
// @desc    Get tickets for a user
router.get('/:userId', async (req, res) => {
    try {
        const snapshot = await db.collection('support_tickets')
            .where('userId', '==', req.params.userId)
            .orderBy('createdAt', 'desc')
            .get();

        const tickets = [];
        snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/support/:id/message
// @desc    Add a message to a ticket
router.post('/:id/message', async (req, res) => {
    try {
        const { text, sender } = req.body; // sender: 'user' or 'admin'
        const message = {
            text,
            sender: sender || 'user',
            timestamp: new Date().toISOString()
        };

        await db.collection('support_tickets').doc(req.params.id).update({
            messages: admin.firestore.FieldValue.arrayUnion(message),
            lastUpdated: new Date().toISOString()
        });

        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
