const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');
const authenticate = require('../middlewares/auth.middleware');

// @route   POST /api/notifications
// @desc    Send a notification to a user (Protected)
router.post('/', authenticate, async (req, res) => {
    try {
        const { userId, title, message, type, actionLink } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const notificationData = {
            userId,
            title,
            message,
            type: type || 'system',
            actionLink: actionLink || null,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('notifications').add(notificationData);
        res.status(201).json({ id: docRef.id, ...notificationData });
    } catch (error) {
        console.error('Send Notification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/notifications/:userId
// @desc    Get notifications for a user (Protected: owner only)
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: You can only view your own notifications' });
        }

        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });

        res.json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read (Protected)
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const notifDoc = await db.collection('notifications').doc(id).get();
        if (!notifDoc.exists) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        if (notifDoc.data().userId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        await db.collection('notifications').doc(id).update({ isRead: true });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Update Notification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
