import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../../styles/auth.css';

const RoleSelect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'signup';
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // For interactive dynamic background/glow
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleRoleSelect = (role) => {
        const targetMode = mode === 'login' ? 'login' : 'signup';
        navigate(`/auth/${targetMode}?role=${role}`);
    };

    return (
        <div className="auth-container modern-deep-space" style={{ '--mx': `${mousePos.x}%`, '--my': `${mousePos.y}%` }}>
            {/* Ambient Background Orbs */}
            <div className="ambient-orb orb-blue"></div>
            <div className="ambient-orb orb-purple"></div>
            <div className="ambient-orb orb-orange"></div>

            <div className="auth-card ultra-glass role-select-modal">
                <div className="auth-header cyber-header">
                    <Link to="/" className="back-link modern-back">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </Link>

                    <div className="logo glowing-logo">
                        <span className="logo-icon">✨</span>
                        <span className="logo-text">BlueBridge</span>
                    </div>

                    <h1 className="gradient-text-silver">Choose Your Path</h1>
                    <p className="subtitle">Select how you want to experience the platform.</p>
                </div>

                <div className="role-options-grid">
                    {/* CUSTOMER CARD */}
                    <div className="role-card-3d cyber-blue" onClick={() => handleRoleSelect('customer')}>
                        <div className="card-glare"></div>
                        <div className="card-border-glow"></div>
                        <div className="role-card-content">
                            <div className="icon-wrapper">
                                <div className="icon-glow"></div>
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2>I'm a Customer</h2>
                            <p>Hire skilled professionals for your needs instantly.</p>
                            
                            <ul className="modern-features">
                                <li><span>◆</span> Post jobs & get quotes</li>
                                <li><span>◆</span> Verified, trusted workers</li>
                                <li><span>◆</span> Milestone tracking</li>
                            </ul>
                            
                            <div className="action-indicator">
                                <span>Continue</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* WORKER CARD */}
                    <div className="role-card-3d neon-orange" onClick={() => handleRoleSelect('worker')}>
                        <div className="card-glare"></div>
                        <div className="card-border-glow"></div>
                        <div className="role-card-content">
                            <div className="icon-wrapper">
                                <div className="icon-glow"></div>
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                                    <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9C14.3 4.5 13.7 4.5 13.3 4.9L8.7 9.5C8.3 9.9 8.3 10.5 8.7 10.9L13.3 15.5C13.7 15.9 14.3 15.9 14.7 15.5C15.1 15.1 15.1 14.5 14.7 14.1L11.4 10.7L14.7 7.3V6.3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2>I'm a Professional</h2>
                            <p>Find work, showcase skills, and grow earnings.</p>
                            
                            <ul className="modern-features">
                                <li><span>◆</span> Direct job opportunities</li>
                                <li><span>◆</span> Premium portfolio</li>
                                <li><span>◆</span> Guaranteed payouts</li>
                            </ul>
                            
                            <div className="action-indicator">
                                <span>Continue</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelect;
