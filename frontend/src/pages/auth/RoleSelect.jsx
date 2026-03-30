import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Storage } from '../../utils/utils';
import '../../styles/auth.css';

const RoleSelect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'signup';

    const handleRoleSelect = (role) => {
        const targetMode = mode === 'login' ? 'login' : 'signup';
        navigate(`/auth/${targetMode}?role=${role}`);
    };

    return (
        <div className="auth-container gradient-mesh">
            <div className="auth-card card-glass role-select-card">
                <div className="auth-header">
                    <Link to="/" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </Link>

                    <div className="logo">
                        <span className="logo-icon">🔧</span>
                        <span className="logo-text">BlueBridge</span>
                    </div>

                    <h1>Choose Your Role</h1>
                    <p>How would you like to use BlueBridge?</p>
                </div>

                <div className="role-options">
                    <div className="role-card" onClick={() => handleRoleSelect('customer')}>
                        <div className="role-icon gradient-primary">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2>I'm a Customer</h2>
                        <p>I need to hire skilled workers for my jobs</p>
                        <ul className="role-features">
                            <li>✓ Post job requirements</li>
                            <li>✓ Find verified workers</li>
                            <li>✓ Track job progress</li>
                            <li>✓ Rate and review</li>
                        </ul>
                        <button className="btn btn-primary btn-lg">Continue as Customer</button>
                    </div>

                    <div className="role-card" onClick={() => handleRoleSelect('worker')}>
                        <div className="role-icon gradient-accent">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9C14.3 4.5 13.7 4.5 13.3 4.9L8.7 9.5C8.3 9.9 8.3 10.5 8.7 10.9L13.3 15.5C13.7 15.9 14.3 15.9 14.7 15.5C15.1 15.1 15.1 14.5 14.7 14.1L11.4 10.7L14.7 7.3V6.3ZM22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12Z" fill="white" />
                            </svg>
                        </div>
                        <h2>I'm a Worker</h2>
                        <p>I want to find work and earn money</p>
                        <ul className="role-features">
                            <li>✓ Get job opportunities</li>
                            <li>✓ Build your profile</li>
                            <li>✓ Earn fair wages</li>
                            <li>✓ Grow your business</li>
                        </ul>
                        <button className="btn btn-accent btn-lg">Continue as Worker</button>
                    </div>
                </div>
            </div>

            <div className="auth-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
        </div>
    );
};

export default RoleSelect;
