import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Storage } from '../../utils/utils';
import { API } from '../../api/api';
import '../../styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || Storage.get('BlueBridge_user_role');
    
    const [role, setRole] = useState(initialRole);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            navigate('/auth/role-select?mode=login');
        } else {
            Storage.set('BlueBridge_user_role', role);
        }
    }, [role, navigate]);

    const validate = () => {
        const errors = {};
        if (!phone.match(/^\d{10}$/)) errors.phone = "Valid 10-digit phone number is required";
        if (password.length < 6) errors.password = "Password must be at least 6 characters";
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsLoading(true);
        setError(null);

        const formattedPhone = phone.startsWith('+') ? phone.replace(/\s+/g, '') : `+91${phone.replace(/\s+/g, '')}`;

        try {
            // Restore standard login flow using the API utility
            const data = await API.auth.login({ 
                idToken: 'mock-token', 
                phone: formattedPhone, 
                password,
                role 
            });

            const userData = {
                uid: data.user.uid,
                name: data.user.name,
                email: data.user.email,
                phone: formattedPhone,
                role,
                loggedIn: true,
                loginTime: new Date().toISOString(),
                ...data.user
            };

            Storage.set('BlueBridge_user', userData);
            Storage.set('BlueBridge_user_role', role);

            navigate(`/dashboard/${role}`);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
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
            <div className="ambient-orb orb-primary" style={{top: '5%', left: '15%'}}></div>
            <div className="ambient-orb orb-secondary" style={{bottom: '10%', right: '15%'}}></div>
            
            <div className={`auth-card role-card-3d ${cardColorClass} login-card`} style={{ zIndex: 10, width: '100%', maxWidth: '440px' }}>
                <div className="auth-header">
                    <Link to="/auth/role-select?mode=login" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </Link>
                    <div className="logo">
                        <span className="logo-icon">🔧</span>
                        <span className="logo-text">BlueBridge</span>
                    </div>
                    <h1>Login as {roleText}</h1>
                    <p>Welcome back! Please sign in.</p>
                </div>
                <form className="auth-form" onSubmit={handleLogin} noValidate>
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <div className={`input-group ${fieldErrors.phone ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="phone">Phone Number</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📱</span>
                            <input type="tel" id="phone" className="input-field" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength="10" />
                        </div>
                        {fieldErrors.phone && <span className="error-message">{fieldErrors.phone}</span>}
                    </div>
                    <div className={`input-group ${fieldErrors.password ? 'error' : ''}`}>
                        <label className="input-label" htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔐</span>
                            <input type={showPassword ? "text" : "password"} id="password" className="input-field" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                <span>{showPassword ? '👁️‍🗨️' : '👁️'}</span>
                            </button>
                        </div>
                        {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
                        {!fieldErrors.password && <span className="input-helper">Minimum 6 characters</span>}
                    </div>
                    <button type="submit" className={`btn ${btnColorClass} btn-lg`} disabled={isLoading} style={{ width: '100%', marginTop: '1.5rem' }}>
                        {!isLoading ? <span>Sign In</span> : <div className="spinner spinner-sm"></div>}
                    </button>
                    <div className="auth-footer">
                        <p>Don't have an account? <Link to={`/auth/signup?role=${role}`} className="link">Sign Up</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
