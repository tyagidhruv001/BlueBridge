import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-logo" style={{ flex: 1 }}>
                            <span className="logo-icon">🔧</span>
                            <span className="logo-text">BlueBridge</span>
                        </div>

                        <div className="nav-links" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <a href="#">Home</a>
                            <a href="#services">Services</a>
                            <a href="#features">Why Us</a>
                            <a href="#how-it-works">How It Works</a>
                            <a href="#about">About</a>
                        </div>

                        <div className="nav-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '1.2rem', alignItems: 'center' }}>
                            <button
                                type="button"
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                )}
                            </button>
                            <Link to="/auth/role-select?mode=login" style={{ color: 'var(--color-text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>Login</Link>
                            <Link to="/auth/role-select?mode=signup" className="btn-neon-orange" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', borderRadius: '30px', fontWeight: '600', textDecoration: 'none' }}>Get Started</Link>
                        </div>

                        <button
                            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} style={{ display: isMenuOpen ? 'flex' : 'none' }}>
                <a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>Why Us</a>
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                <a href="#about" onClick={() => setIsMenuOpen(false)}>About Us</a>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                    style={{ justifyContent: 'flex-start' }}
                >
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
                <Link to="/auth/role-select?mode=login" className="btn btn-ghost" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/auth/role-select?mode=signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
            </div>
        </>
    );
};

export default Navbar;
