import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/landing.css';
import '../styles/auth.css'; // For the deep space utilties

const Landing = () => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Optional: Re-implement any vanilla scroll observers from landing.js here
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Give it a tiny delay to ensure transition binds
                    setTimeout(() => observer.unobserve(entry.target), 100);
                }
            });
        }, observerOptions);

        // Select all major sections and cards
        const elementsToReveal = document.querySelectorAll(
            '.section-header, .role-card-3d, .glass-feature, .how-step, .about-content, .footer-section'
        );

        elementsToReveal.forEach(el => {
            el.classList.add('reveal-up');
            observer.observe(el);
        });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-page modern-deep-space" style={{ '--mx': `${mousePos.x}%`, '--my': `${mousePos.y}%` }}>
            <Navbar />

            {/* Global Ambient Background Orbs */}
            <div className="ambient-orb orb-blue" style={{ top: '10%', left: '10%' }}></div>
            <div className="ambient-orb orb-purple" style={{ top: '30%', right: '5%', width: '800px', height: '800px' }}></div>
            <div className="ambient-orb orb-orange" style={{ top: '60%', left: '5%', width: '600px', height: '600px' }}></div>
            <div className="ambient-orb orb-blue" style={{ bottom: '10%', right: '20%' }}></div>

            {/* Hero Section */}
            {/* Hero Section */}
            <section className="hero hyper-hero">
                <div className="noise-overlay"></div>
                
                {/* Dynamic Spotlight mapped to mouse */}
                <div className="hero-spotlight" style={{ transform: `translate(calc(var(--mx) - 50%), calc(var(--my) - 50%))` }}></div>

                <div className="container relative-z">
                    <div className="hero-content hero-split-layout">
                        
                        <div className="hero-text text-hyper-left">
                            <h1 className="hero-title giant-title">
                                <span className="text-outline">FIND SKILLED</span><br/>
                                <span className="text-solid">WORKERS</span><br/>
                                <span className="gradient-text hyper-glow-text">INSTANTLY.</span>
                            </h1>

                            <div className="glass-panel description-panel">
                                <p className="hero-description subtitle">
                                    Connect with verified plumbers, mechanics, and more. 
                                    Get your work done quickly, safely, and affordably.
                                </p>
                            </div>

                            <div className="hero-actions hyper-actions">
                                <Link to="/auth/role-select?mode=signup" className="btn-hyper-glow">
                                    <span className="btn-text">Get Started</span>
                                    <div className="glow-ring"></div>
                                </Link>
                                <a href="#how-it-works" className="btn-glass hyper-glass-btn">
                                    <span>Learn More</span>
                                </a>
                            </div>
                        </div>

                        <div className="hero-visual parallax-constellation">
                            {/* Floating Parallax Chips mapped to mouse inversion */}
                            <div className="parallax-chip chip-1" style={{ transform: `translate(calc(var(--mx) * -0.5), calc(var(--my) * -0.5))` }}>
                                <span className="chip-icon glass-icon">🔧</span>
                                <span className="chip-text">Master Mechanic</span>
                            </div>
                            
                            <div className="parallax-chip chip-2" style={{ transform: `translate(calc(var(--mx) * 0.8), calc(var(--my) * 0.3))` }}>
                                <span className="chip-icon glass-icon">🚰</span>
                                <span className="chip-text">Expert Plumber</span>
                            </div>

                            <div className="parallax-chip chip-3" style={{ transform: `translate(calc(var(--mx) * -0.3), calc(var(--my) * 0.9))` }}>
                                <span className="chip-icon glass-icon">⚡</span>
                                <span className="chip-text">Electrician</span>
                            </div>

                            <div className="parallax-chip chip-4" style={{ transform: `translate(calc(var(--mx) * 0.4), calc(var(--my) * -0.8))` }}>
                                <span className="chip-icon glass-icon">🧹</span>
                                <span className="chip-text">Cleaning Pro</span>
                            </div>

                            {/* Left-side Constellation Chips */}
                            <div className="parallax-chip chip-5" style={{ transform: `translate(calc(var(--mx) * -0.4), calc(var(--my) * 0.6))` }}>
                                <span className="chip-icon glass-icon">🛠️</span>
                                <span className="chip-text">Handyman</span>
                            </div>

                            <div className="parallax-chip chip-6" style={{ transform: `translate(calc(var(--mx) * 0.7), calc(var(--my) * -0.4))` }}>
                                <span className="chip-icon glass-icon">👷</span>
                                <span className="chip-text">Construction</span>
                            </div>

                            <div className="parallax-chip chip-7" style={{ transform: `translate(calc(var(--mx) * -0.2), calc(var(--my) * 0.8))` }}>
                                <span className="chip-icon glass-icon">🌿</span>
                                <span className="chip-text">Landscaper</span>
                            </div>

                            <div className="parallax-chip chip-8" style={{ transform: `translate(calc(var(--mx) * 0.5), calc(var(--my) * 0.7))` }}>
                                <span className="chip-icon glass-icon">🎨</span>
                                <span className="chip-text">Painter</span>
                            </div>
                        </div>
                    </div>

                    {/* Clustered Glass Pills Stats */}
                    <div className="hero-stats hyper-stats">
                        <div className="stat-pill">
                            <div className="stat-value">10K+</div>
                            <div className="stat-label">Active Workers</div>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-value">50K+</div>
                            <div className="stat-label">Jobs Completed</div>
                        </div>
                        <div className="stat-pill highlight-pill">
                            <div className="stat-value">4.8★</div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services" id="services">
                <div className="container relative-z">
                    <div className="section-header">
                        <h2 className="gradient-text-silver">Our Services</h2>
                        <p className="subtitle">Find the right professional for any job</p>
                    </div>

                    <div className="services-grid">
                        <div className="role-card-3d cyber-blue">
                            <div className="card-glare"></div>
                            <div className="card-border-glow"></div>
                            <div className="role-card-content">
                                <div className="icon-wrapper">
                                    <div className="icon-glow"></div>
                                    <span style={{ fontSize: '32px' }}>🔧</span>
                                </div>
                                <h2>Mechanic</h2>
                                <p>Vehicle repairs, diagnostics, and routine maintenance right at your doorstep.</p>
                                <Link to="/auth/role-select?mode=signup" className="action-indicator" style={{ textDecoration: 'none' }}>
                                    <span>Book Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>

                        <div className="role-card-3d neon-orange">
                            <div className="card-glare"></div>
                            <div className="card-border-glow"></div>
                            <div className="role-card-content">
                                <div className="icon-wrapper">
                                    <div className="icon-glow"></div>
                                    <span style={{ fontSize: '32px' }}>🚰</span>
                                </div>
                                <h2>Plumber</h2>
                                <p>Expert pipe repairs, installations, and emergency leak fixes.</p>
                                <Link to="/auth/role-select?mode=signup" className="action-indicator" style={{ textDecoration: 'none' }}>
                                    <span>Book Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="container relative-z">
                    <div className="section-header">
                        <h2 className="gradient-text-silver">Why Choose BlueBridge?</h2>
                        <p className="subtitle">We make finding skilled workers simple and safe</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-blue">✓</div>
                            <h3>Verified Professionals</h3>
                            <p>All workers undergo detailed background checks.</p>
                        </div>
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-orange">⚡</div>
                            <h3>Instant Matching</h3>
                            <p>Get matched with nearby workers in under 5 minutes.</p>
                        </div>
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-purple">★</div>
                            <h3>Quality Guaranteed</h3>
                            <p>Rated workers with transparent customer reviews.</p>
                        </div>
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-blue">ℹ</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock live customer support.</p>
                        </div>
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-orange">💰</div>
                            <h3>Transparent Pricing</h3>
                            <p>Know the standard rates without hidden surprises.</p>
                        </div>
                        <div className="feature-card glass-feature">
                            <div className="feature-icon glow-icon-purple">💳</div>
                            <h3>Secure Payments</h3>
                            <p>Safe and encrypted in-app payment processing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works relative-z" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2 className="gradient-text-silver">How It Works</h2>
                        <p className="subtitle">Get started in three simple steps</p>
                    </div>

                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number neon-glow-blue">1</div>
                            <div className="step-content glass-step-card">
                                <h3>Post Your Job</h3>
                                <p>Describe what you need and when you need it</p>
                            </div>
                        </div>

                        <div className="step-connector neon-track"></div>

                        <div className="step">
                            <div className="step-number neon-glow-purple">2</div>
                            <div className="step-content glass-step-card">
                                <h3>Get Matched</h3>
                                <p>We find the best workers near you instantly</p>
                            </div>
                        </div>

                        <div className="step-connector neon-track"></div>

                        <div className="step">
                            <div className="step-number neon-glow-orange">3</div>
                            <div className="step-content glass-step-card">
                                <h3>Job Done</h3>
                                <p>Worker completes the job, you pay and rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="cta-section">
                        <Link to="/auth/role-select?mode=signup" className="btn-neon-blue">Start Your First Job</Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section relative-z" id="about">
                <div className="container">
                    <div className="section-header">
                        <h2 className="gradient-text-silver">About <span className="gradient-text">Us</span></h2>
                        <p className="subtitle">
                            Bridging the gap between skilled hands and modern homes with trust, safety, and innovation.
                        </p>
                    </div>

                    <div className="about-grid">
                        <div className="role-card-3d cyber-blue">
                            <div className="role-card-content">
                                <div className="icon-wrapper"><span style={{ fontSize: '32px' }}>🎯</span></div>
                                <h2>Our Mission</h2>
                                <p>To organize India's blue-collar workforce by providing them with a dignified digital identity. We connect workers with consistent opportunities.</p>
                            </div>
                        </div>
                        <div className="role-card-3d neon-orange">
                            <div className="role-card-content">
                                <div className="icon-wrapper"><span style={{ fontSize: '32px' }}>🤝</span></div>
                                <h2>Who We Are</h2>
                                <p>BlueBridge is a community-driven platform built on trust. We advocate for fair wages for workers and transparent pricing for you.</p>
                            </div>
                        </div>
                        <div className="role-card-3d cyber-blue">
                            <div className="role-card-content">
                                <div className="icon-wrapper"><span style={{ fontSize: '32px' }}>🛡️</span></div>
                                <h2>Our Promise</h2>
                                <p>Every worker is background-verified, and every job is insured. We stand behind every service with our satisfaction guarantee.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta ultra-glass relative-z" style={{ maxWidth: '1200px', margin: '4rem auto', textAlign: 'center' }}>
                <div className="container">
                    <div className="cta-content">
                        <h2 className="gradient-text-silver">Ready to Get Started?</h2>
                        <p className="subtitle" style={{ marginBottom: '2rem' }}>Join thousands of satisfied customers and workers</p>
                        <div className="cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/auth/role-select?mode=signup" className="btn-neon-blue">I'm a Customer</Link>
                            <Link to="/auth/role-select?mode=signup" className="btn-neon-orange">I'm a Worker</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
