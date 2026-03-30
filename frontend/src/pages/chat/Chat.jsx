import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/config';
import { API } from '../../api/api';
import './Chat.css';

const Chat = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // URL Params
    const bookingId = searchParams.get('bookingId');
    const receiverId = searchParams.get('receiverId'); // The ID of the person we are chatting with
    const receiverName = searchParams.get('receiverName') || 'Chat';
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get current user from localStorage
    const userStr = localStorage.getItem('BlueBridge_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser ? (currentUser.uid || currentUser.user_id) : null;

    useEffect(() => {
        if (!bookingId || !currentUserId) return;

        // 1. Listen for new messages
        const q = query(
            collection(db, "chats", bookingId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Firestore timestamp fallback
                timestamp: doc.data().timestamp?.toDate 
                    ? doc.data().timestamp.toDate().toISOString() 
                    : doc.data().timestamp 
            }));
            
            setMessages(fetchedMessages);
            
            // Auto-scroll if near bottom
            if (chatContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                if (isNearBottom) {
                    scrollToBottom();
                } else if (fetchedMessages.length > 0 && fetchedMessages[fetchedMessages.length - 1].senderId === currentUserId) {
                    // Always scroll if WE sent the message
                    scrollToBottom();
                }
            } else {
                scrollToBottom();
            }
        });

        // 2. Listen for metadata (Typing indicator & unread count updates)
        const unsubscribeMeta = onSnapshot(doc(db, "chats", bookingId), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data.typing && receiverId && data.typing[receiverId]) {
                    setPartnerTyping(true);
                } else {
                    setPartnerTyping(false);
                }
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeMeta();
        };
    }, [bookingId, currentUserId, receiverId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleInput = (e) => {
        setInput(e.target.value);

        if (!bookingId || !currentUserId) return;

        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
            setDoc(doc(db, 'chats', bookingId), {
                typing: { [currentUserId]: true }
            }, { merge: true });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setDoc(doc(db, 'chats', bookingId), {
                typing: { [currentUserId]: false }
            }, { merge: true });
        }, 1500);
    };

    const handleSend = async () => {
        if (!input.trim() || !bookingId || !currentUserId) return;

        const text = input.trim();
        const tempId = 'temp-' + Date.now();
        
        // Optimistic UI update
        const tempMessage = {
            id: tempId,
            text,
            senderId: currentUserId,
            receiverId: receiverId,
            timestamp: new Date().toISOString(),
            type: "text",
            seen: false
        };

        setMessages(prev => [...prev, tempMessage]);
        setInput("");
        
        // Stop typing indicator immediately
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        setDoc(doc(db, 'chats', bookingId), {
            typing: { [currentUserId]: false }
        }, { merge: true });
        
        scrollToBottom();

        try {
            await API.chat.sendP2P({
                bookingId,
                text,
                senderId: currentUserId,
                receiverId: receiverId
            });
        } catch (error) {
            console.error("Failed to send message", error);
            // Revert optimistic update gracefully if desired
            alert("Failed to send message");
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                <button 
                    onClick={() => history.back()}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div className="worker-avatar">
                    {receiverName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{receiverName}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--neon-green)' }}>
                        {partnerTyping ? 'typing...' : 'Online'}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => alert('Calling...')}>
                        <i className="fas fa-phone-alt"></i>
                    </button>
                </div>
            </div>

            <div className="chat-container" ref={chatContainerRef}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'white', opacity: 0.5, marginTop: '20px' }}>
                        Start of conversation
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSent = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`message ${isSent ? 'msg-sent' : 'msg-received'}`}>
                                <div>{msg.text}</div>
                                <span className="msg-time">{formatTime(msg.timestamp)} {isSent && (msg.seen ? <i className="fas fa-check-double text-blue-500"></i> : <i className="fas fa-check"></i>)}</span>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-footer">
                <button className="action-btn" onClick={() => alert('Attachments coming soon!')}>
                    <i className="fas fa-paperclip"></i>
                </button>

                <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Type a message..." 
                    value={input}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                />
                
                <button className="send-btn" onClick={handleSend}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

export default Chat;
