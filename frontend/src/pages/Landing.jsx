import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/landing.css';

const Landing = () => {
    useEffect(() => {
        // Optional: Re-implement any vanilla scroll observers from landing.js here
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.service-card, .feature-card, .step, .about-card').forEach(el => {
            el.classList.add('fade-up');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero gradient-mesh">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <span className="badge badge-primary">🚀 Trusted by 10,000+ Users</span>
                            </div>

                            <h1 className="hero-title">
                                Find Skilled Workers <span className="gradient-text">Instantly</span>
                            </h1>

                            <p className="hero-description">
                                Connect with verified plumbers, mechanics, and more.
                                Get your work done quickly, safely, and affordably.
                            </p>

                            <div className="hero-actions">
                                <a href="#contact" className="btn btn-outline btn-lg">
                                    <span>Learn More</span>
                                </a>
                            </div>

                            <div className="hero-stats">
                                <div className="stat-item">
                                    <div className="stat-value">10K+</div>
                                    <div className="stat-label">Active Workers</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">50K+</div>
                                    <div className="stat-label">Jobs Completed</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">4.8★</div>
                                    <div className="stat-label">Average Rating</div>
                                </div>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="hero-image-container">
                                <img src="/assets/images/hero-illustration.svg" alt="BlueBridge Platform" className="hero-image" id="heroImage" />

                                <div className="floating-card card-1">
                                    <div className="card-icon">⚡</div>
                                    <div className="card-text">
                                        <div className="card-title">Fast Response</div>
                                        <div className="card-subtitle">Within 5 minutes</div>
                                    </div>
                                </div>

                                <div className="floating-card card-2">
                                    <div className="card-icon">✓</div>
                                    <div className="card-text">
                                        <div className="card-title">Verified Workers</div>
                                        <div className="card-subtitle">100% Background Check</div>
                                    </div>
                                </div>

                                <div className="floating-card card-3">
                                    <div className="card-icon">💰</div>
                                    <div className="card-text">
                                        <div className="card-title">Fair Pricing</div>
                                        <div className="card-subtitle">Transparent Costs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services" id="services">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Services</h2>
                        <p>Find the right professional for any job</p>
                    </div>

                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">🔧</div>
                            <h3>Mechanic</h3>
                            <p>Vehicle repairs and maintenance</p>
                            <Link to="/auth/role-select?mode=signup" className="service-link">Book Now →</Link>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🚰</div>
                            <h3>Plumber</h3>
                            <p>Pipe repairs and installations</p>
                            <Link to="/auth/role-select?mode=signup" className="service-link">Book Now →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose BlueBridge?</h2>
                        <p>We make finding skilled workers simple and safe</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon gradient-primary">
                                <span style={{ fontSize: "24px", color: "white" }}>✓</span>
                            </div>
                            <h3>Verified Professionals</h3>
                            <p>All workers undergo background checks and skill verification</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon gradient-accent">
                                <span style={{ fontSize: "24px", color: "white" }}>⚡</span>
                            </div>
                            <h3>Instant Matching</h3>
                            <p>Get matched with nearby workers in under 5 minutes</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon gradient-success">
                                <span style={{ fontSize: "24px", color: "white" }}>★</span>
                            </div>
                            <h3>Quality Guaranteed</h3>
                            <p>Rated workers with customer reviews and ratings</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon gradient-primary">
                                <span style={{ fontSize: "24px", color: "white" }}>ℹ</span>
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock customer support for any issues</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon gradient-accent">
                                <span style={{ fontSize: "24px", color: "white" }}>💰</span>
                            </div>
                            <h3>Transparent Pricing</h3>
                            <p>Know the cost upfront with no hidden charges</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon gradient-success">
                                <span style={{ fontSize: "24px", color: "white" }}>💳</span>
                            </div>
                            <h3>Secure Payments</h3>
                            <p>Safe and encrypted payment processing</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in three simple steps</p>
                    </div>

                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Post Your Job</h3>
                                <p>Describe what you need and when you need it</p>
                            </div>
                        </div>

                        <div className="step-connector"></div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Get Matched</h3>
                                <p>We find the best workers near you instantly</p>
                            </div>
                        </div>

                        <div className="step-connector"></div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Job Done</h3>
                                <p>Worker completes the job, you pay and rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="cta-section">
                        <Link to="/auth/role-select?mode=signup" className="btn btn-primary btn-lg">Start Your First Job</Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section" id="about" style={{ padding: '6rem 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'var(--primary-500)', filter: 'blur(120px)', opacity: '0.1', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--accent-purple)', filter: 'blur(120px)', opacity: '0.1', borderRadius: '50%' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="section-header">
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>About <span className="gradient-text">Us</span></h2>
                        <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                            Bridging the gap between skilled hands and modern homes with trust, safety, and innovation.
                        </p>
                    </div>

                    <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="about-card mission">
                            <div className="about-icon"><span style={{ fontSize: '32px' }}>🎯</span></div>
                            <h3>Our Mission</h3>
                            <p>To organize India's blue-collar workforce by providing them with a dignified digital identity. We connect workers with consistent opportunities while ensuring customers get safe, reliable, and high-quality services.</p>
                        </div>
                        <div className="about-card identity">
                            <div className="about-icon"><span style={{ fontSize: '32px' }}>🤝</span></div>
                            <h3>Who We Are</h3>
                            <p>BlueBridge is a community-driven platform built on trust. We are a team dedicated to solving the daily struggle of finding reliable help, advocating for fair wages for workers and transparent pricing for you.</p>
                        </div>
                        <div className="about-card promise">
                            <div className="about-icon"><span style={{ fontSize: '32px' }}>🛡️</span></div>
                            <h3>Our Promise</h3>
                            <p>Every worker is background-verified, and every job is insured. We stand behind every service with our satisfaction guarantee, giving you complete peace of mind.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta gradient-cyan">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Get Started?</h2>
                        <p>Join thousands of satisfied customers and workers</p>
                        <div className="cta-buttons">
                            <Link to="/auth/role-select?mode=signup" className="btn btn-primary btn-lg">I'm a Customer</Link>
                            <Link to="/auth/role-select?mode=signup" className="btn btn-accent btn-lg">I'm a Worker</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
