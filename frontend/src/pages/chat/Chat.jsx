import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/config';
import { API } from '../../api/api';
import './Chat.css';

const Chat = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // URL Params
    const bookingId = searchParams.get('bookingId');
    const receiverId = searchParams.get('receiverId');
    const receiverName = searchParams.get('receiverName') || 'Chat';
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const userStr = localStorage.getItem('BlueBridge_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser ? (currentUser.uid || currentUser.user_id) : null;

    useEffect(() => {
        if (!bookingId || !currentUserId) return;

        const q = query(
            collection(db, "chats", bookingId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate 
                    ? doc.data().timestamp.toDate().toISOString() 
                    : doc.data().timestamp 
            }));
            
            setMessages(fetchedMessages);
            scrollToBottom();
        });

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
        setInput("");
        
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        setDoc(doc(db, 'chats', bookingId), {
            typing: { [currentUserId]: false }
        }, { merge: true });

        try {
            await API.chat.sendP2P({
                bookingId,
                text,
                senderId: currentUserId,
                receiverId: receiverId
            });
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message", error);
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
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                
                <div className="worker-avatar">
                    {receiverName.substring(0, 2).toUpperCase()}
                    <div className={`status-dot ${partnerTyping ? 'typing' : ''}`}></div>
                </div>
                
                <div className="header-info">
                    <h3>{receiverName}</h3>
                    <p style={{ color: partnerTyping ? '#39ff14' : 'rgba(255,255,255,0.6)' }}>
                        {partnerTyping ? 'typing...' : 'Online and active'}
                    </p>
                </div>
                
                <div style={{ marginLeft: 'auto' }}>
                    <button className="back-btn" onClick={() => window.open(`tel:${searchParams.get('phone') || ''}`)}>
                        <i className="fas fa-phone-alt"></i>
                    </button>
                </div>
            </div>

            <div className="chat-container" ref={chatContainerRef}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '2rem' }}>
                        <i className="fas fa-shield-alt" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                        <p>Messages are end-to-end encrypted</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSent = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`message ${isSent ? 'msg-sent' : 'msg-received'}`}>
                                <div className="text-content">{msg.text}</div>
                                <div className="msg-time">
                                    {formatTime(msg.timestamp)}
                                    {isSent && (
                                        <i className={`fas fa-check-double ${msg.seen ? 'text-cyan-400' : ''}`} 
                                           style={{ color: msg.seen ? '#00d2ff' : 'inherit' }}></i>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                
                {partnerTyping && (
                    <div className="typing-wrapper">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}
                
                <div ref={chatEndRef} />
            </div>

            <div className="chat-footer">
                <button className="attachment-btn" onClick={() => alert('Attachments coming soon!')}>
                    <i className="fas fa-plus"></i>
                </button>

                <div className="input-container">
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
                    <button 
                        className="send-btn" 
                        onClick={handleSend}
                        style={{ position: 'absolute', right: '4px', height: '40px', width: '40px', borderRadius: '12px' }}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
