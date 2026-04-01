import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                            <Link to="/auth/role-select?mode=signup" className="btn-neon-orange" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', borderRadius: '30px', fontWeight: '600', textDecoration: 'none' }}>Get Started</Link>
                        </div>

                        <button
                            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <Link to="/auth/role-select?mode=login" className="btn btn-ghost" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/auth/role-select?mode=signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
            </div>
        </>
    );
};

export default Navbar;
