import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Storage } from '../../utils/utils';
import { API } from '../../api/api';
import '../../styles/auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || Storage.get('BlueBridge_user_role');
    
    const [role, setRole] = useState(initialRole);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // Mouse tracking for ambient background
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const handleMouseMove = (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        setMousePos({ x, y });
    };

    useEffect(() => {
        if (!role) {
            navigate('/auth/role-select?mode=signup');
        } else {
            Storage.set('BlueBridge_user_role', role);
        }
    }, [role, navigate]);

    const validate = () => {
        const errors = {};
        if (!name.trim()) errors.name = "Full name is required";
        if (!phone.match(/^\d{10}$/)) errors.phone = "Valid 10-digit phone number is required";
        if (!email.includes("@")) errors.email = "Valid email is required";
        if (password.length < 6) errors.password = "Password must be at least 6 characters";
        if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
        if (!acceptedTerms) errors.terms = "You must accept the terms";
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsLoading(true);
        setError(null);

        const formattedPhone = phone.startsWith('+') ? phone.replace(/\s+/g, '') : `+91${phone.replace(/\s+/g, '')}`;

        try {
            const data = await API.auth.signup({
                name,
                phone: formattedPhone, 
                email,
                password,
                role
            });

            const userData = {
                uid: data.uid,
                name,
                email,
                phone: formattedPhone,
                role,
                loggedIn: true,
                signupTime: new Date().toISOString()
            };

            Storage.set('BlueBridge_user', userData);
            Storage.set('BlueBridge_user_role', role);

            navigate(`/onboarding/${role}-verification`);
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleText = role === 'customer' ? 'Customer' : 'Worker';
    const cardColorClass = role === 'customer' ? 'cyber-blue' : 'neon-orange';
    const btnColorClass = role === 'customer' ? 'btn-neon-blue' : 'btn-neon-orange';

    return (
        <div 
            className="modern-deep-space auth-layout"
            onMouseMove={handleMouseMove}
            style={{
                '--mx': `${mousePos.x * 100}%`,
                '--my': `${mousePos.y * 100}%`,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div className="ambient-orb orb-primary" style={{top: '10%', right: '15%', opacity: 0.8}}></div>
            <div className="ambient-orb orb-secondary" style={{bottom: '5%', left: '10%', opacity: 0.6}}></div>

            <div className={`auth-card role-card-3d ${cardColorClass} login-card`} style={{ zIndex: 10, width: '100%', maxWidth: '440px', margin: '2rem 1rem' }}>
                <div className="auth-header">
                    <Link to="/auth/role-select?mode=signup" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </Link>

                    <div className="logo">
                        <span className="logo-icon">🔧</span>
                        <span className="logo-text">BlueBridge</span>
                    </div>

                    <h1>Sign Up as {roleText}</h1>
                    <p>Join BlueBridge today</p>
                </div>

                <form className="auth-form" onSubmit={handleSignup} noValidate>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className={`input-group ${fieldErrors.name ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="name">Full Name</label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input type="text" id="name" className="input-field" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        {fieldErrors.name && <span className="error-message">{fieldErrors.name}</span>}
                    </div>

                    <div className={`input-group ${fieldErrors.phone ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="phone">Phone Number</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📱</span>
                            <input type="tel" id="phone" className="input-field" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength="10" />
                        </div>
                        {fieldErrors.phone && <span className="error-message">{fieldErrors.phone}</span>}
                    </div>

                    <div className={`input-group ${fieldErrors.email ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📬</span>
                            <input type="email" id="email" className="input-field" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        {fieldErrors.email && <span className="error-message">{fieldErrors.email}</span>}
                    </div>

                    <div className={`input-group ${fieldErrors.password ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔐</span>
                            <input type={showPassword ? "text" : "password"} id="password" className="input-field" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                <span>{showPassword ? '👁️‍🗨️' : '👁️'}</span>
                            </button>
                        </div>
                        {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
                        {!fieldErrors.password && <span className="input-helper">Minimum 6 characters</span>}
                    </div>

                    <div className={`input-group ${fieldErrors.confirmPassword ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🛡️</span>
                            <input type={showPassword ? "text" : "password"} id="confirmPassword" className="input-field" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        {fieldErrors.confirmPassword && <span className="error-message">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <div className={`form-options ${fieldErrors.terms ? 'error' : ''}`}>
                        <label className="checkbox-label">
                            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                            <span>I agree to the <Link to="#" className="link">Terms & Conditions</Link></span>
                        </label>
                        {fieldErrors.terms && <span className="error-message">{fieldErrors.terms}</span>}
                    </div>

                    <button type="submit" className={`btn ${btnColorClass} btn-lg`} disabled={isLoading || !acceptedTerms} style={{ width: '100%', marginTop: '1.5rem' }}>
                        {!isLoading ? <span>Create Account</span> : <div className="spinner spinner-sm"></div>}
                    </button>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to={`/auth/login?role=${role}`} className="link">Login</Link></p>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Signup;
