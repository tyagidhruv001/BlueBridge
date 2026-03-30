import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <span className="logo-icon">🔧</span>
                            <span className="logo-text">BlueBridge</span>
                        </div>
                        <p>Connecting skilled workers with customers across India</p>
                    </div>

                    <div className="footer-section">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="#services">Mechanic</a></li>
                            <li><a href="#services">Plumber</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><Link to="#">Careers</Link></li>
                            <li><Link to="#">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="#">Privacy Policy</Link></li>
                            <li><Link to="#">Terms of Service</Link></li>
                            <li><Link to="#">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 BlueBridge. All rights reserved.</p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook">📘</a>
                        <a href="#" aria-label="Twitter">🐦</a>
                        <a href="#" aria-label="Instagram">📷</a>
                        <a href="#" aria-label="LinkedIn">💼</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
