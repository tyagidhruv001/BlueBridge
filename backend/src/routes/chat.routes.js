const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');
const authenticate = require('../middlewares/auth.middleware');
const aiAgentService = require('../services/aiAgent.service');

/**
 * Optional authentication helper:
 * Extracts user if Bearer token is provided, without rejecting unauthenticated users.
 */
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authenticate(req, res, next);
    }
    req.user = null;
    next();
}

/**
 * @route   POST /api/chat/send
 * @desc    Intelligent service-commerce agent: requirements, recommendations, comparison, and booking proposals
 */
router.post('/send', optionalAuth, async (req, res) => {
    try {
        const { message, previousHistory, customerLocation } = req.body || {};

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const result = await aiAgentService.processAgentMessage({
            userId: req.user ? req.user.uid : null,
            message: message.trim(),
            previousHistory: previousHistory || [],
            customerLocation: customerLocation || null
        });

        // Legacy compatibility: ensure `reply` is top-level string
        res.json({
            success: true,
            reply: result.reply,
            proposal: result.proposal || null,
            recommendations: result.recommendations || [],
            comparison: result.comparison || null,
            activeBookings: result.activeBookings || null
        });

    } catch (error) {
        console.error('[AGENT CHAT ERROR]:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'AI Assistant is currently unavailable'
        });
    }
});

/**
 * @route   POST /api/chat/p2p
 * @desc    Send a P2P message between customer and assigned worker (Protected: participant only)
 */
router.post('/p2p', authenticate, async (req, res) => {
    try {
        const { bookingId, receiverId, text, type } = req.body;
        const senderId = req.user.uid;

        if (!bookingId || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify participant ownership of booking
        const bookingDoc = await db.collection('jobs').doc(bookingId).get();
        if (bookingDoc.exists) {
            const booking = bookingDoc.data();
            const isParticipant = booking.customerId === senderId || booking.workerId === senderId || req.user.role === 'admin';
            if (!isParticipant) {
                return res.status(403).json({ error: 'Access denied: You are not a participant in this booking' });
            }
        }

        const messageData = {
            senderId,
            receiverId: receiverId || null,
            text,
            type: type || 'text',
            timestamp: new Date().toISOString(),
            seen: false
        };

        // Add to subcollection 'messages' inside the specific booking chat doc
        await db.collection('chats').doc(bookingId).collection('messages').add(messageData);

        const chatRef = db.collection('chats').doc(bookingId);
        const chatUpdate = {
            lastMessage: text,
            lastMessageTime: new Date().toISOString(),
            bookingId: bookingId
        };

        if (req.body.senderName) chatUpdate[`participants.${senderId}.name`] = req.body.senderName;
        if (req.body.senderPic) chatUpdate[`participants.${senderId}.pic`] = req.body.senderPic;

        await chatRef.set(chatUpdate, { merge: true });

        res.status(200).json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('P2P Chat Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/chat/p2p/:bookingId
 * @desc    Get chat history for a booking (Protected: participant only)
 */
router.get('/p2p/:bookingId', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.uid;

        // Verify participant
        const bookingDoc = await db.collection('jobs').doc(bookingId).get();
        if (bookingDoc.exists) {
            const booking = bookingDoc.data();
            const isParticipant = booking.customerId === userId || booking.workerId === userId || req.user.role === 'admin';
            if (!isParticipant) {
                return res.status(403).json({ error: 'Access denied: You are not a participant in this booking' });
            }
        }

        const snapshot = await db.collection('chats').doc(bookingId).collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        res.json(messages);
    } catch (error) {
        console.error('P2P Chat Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
