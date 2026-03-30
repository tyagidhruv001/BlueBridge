const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');


let genAI;

// @route   POST /api/chat/send
// @desc    Get a response from the AI worker
router.post('/send', async (req, res) => {
    try {
        console.log('[CHAT] Request Body Received:', JSON.stringify(req.body));
        const { message, previousHistory, workerContext } = req.body;
        console.log('[CHAT] Incoming request:', { message, historyItems: (previousHistory || []).length });

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
        if (!apiKey || apiKey.includes('YOUR_KEY')) {
            console.error('[CHAT ERROR]: Invalid or missing GEMINI_API_KEY');
            return res.status(500).json({ error: 'AI Assistant is not configured correctly.' });
        }

        if (!genAI) {
            genAI = new GoogleGenerativeAI(apiKey);
        }

        const workerName = workerContext?.name || 'Professional';
        const workerRole = workerContext?.role || 'Service Worker';
        const contextType = workerContext?.type || 'worker';

        let sysPrompt;
        if (contextType === 'platform_assistant') {
            sysPrompt = `You are the BlueBridge Platform Assistant. Help customers find workers and manage bookings. 
            Features: Booking, Tracking, Wallet, Nearby Workers. 
            Be friendly, professional, and concise. Do not use markdown.`;
        } else {
            sysPrompt = `You are ${workerName}, a professional ${workerRole}. Be polite and concise. Keep it plain text.`;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: sysPrompt
        });

        const chat = model.startChat({
            history: previousHistory || []
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log('[CHAT] Success. Reply generated.');
        res.json({ reply: text });

    } catch (error) {
        console.error('[CHAT ERROR]:', error);

        let errorHint = '';
        if (error.message.includes('API_KEY_INVALID')) errorHint = 'Invalid API Key. ';
        if (error.message.includes('quota')) errorHint = 'Quota Exceeded. ';
        if (error.message.includes('safety')) errorHint = 'Content blocked by safety filters. ';

        // Return the actual error message so we can see it in the UI
        res.status(500).json({
            error: `${errorHint}${error.message}`,
            details: error.stack
        });
    }
});

// @route   POST /api/chat/p2p
// @desc    Send a P2P message
router.post('/p2p', async (req, res) => {
    try {
        const { bookingId, senderId, receiverId, text, type } = req.body;

        if (!bookingId || !senderId || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const messageData = {
            senderId,
            receiverId: receiverId || null,
            text,
            type: type || 'text',
            timestamp: new Date().toISOString(), // Fallback, though frontend uses serverTimestamp
            seen: false
        };

        // Add to subcollection 'messages' inside the specific booking chat doc
        await db.collection('chats').doc(bookingId).collection('messages').add(messageData);

        // Update chat metadata. Increment unread count for receiver if applicable.
        const chatRef = db.collection('chats').doc(bookingId);
        
        // We do a transaction or a simple set merge for metadata
        // For simplicity with standard REST, we'll just merge the lastMessage.
        // If unreadCount logic is strict, we should track which role the receiver is (customer or worker).
        // Since we don't strictly know if receiver is customer/worker without DB lookup, 
        // we'll update basic metadata. 
        
        const chatUpdate = {
            lastMessage: text,
            lastMessageTime: new Date().toISOString(), // Fallback for backend HTTP
            bookingId: bookingId
        };
        
        // Let frontend handle unreadCount strictly with FieldValue.increment or we assume the receiver's unread goes up.
        // We'll leave unreadCount calculation to be managed via Firestore triggers or client updates, 
        // but we'll include the lastMessage update here.
        if (req.body.senderName) chatUpdate[`participants.${senderId}.name`] = req.body.senderName;
        if (req.body.senderPic) chatUpdate[`participants.${senderId}.pic`] = req.body.senderPic;

        await chatRef.set(chatUpdate, { merge: true });

        res.status(200).json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('P2P Chat Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/chat/p2p/:bookingId
// @desc    Get chat history for a booking
router.get('/p2p/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

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
