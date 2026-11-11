import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Pages lazily loaded to speed up dev and initial render
const Landing = lazy(() => import('./pages/Landing'));
const RoleSelect = lazy(() => import('./pages/auth/RoleSelect'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));

const CustomerDashboard = lazy(() => import('./pages/dashboard/customer/CustomerDashboard'));
const WorkerDashboard = lazy(() => import('./pages/dashboard/worker/WorkerDashboard'));

const CustomerVerification = lazy(() => import('./pages/onboarding/CustomerVerification'));
const WorkerVerification = lazy(() => import('./pages/onboarding/WorkerVerification'));
const WorkerAbout = lazy(() => import('./pages/onboarding/WorkerAbout'));
const Booking = lazy(() => import('./pages/booking/Booking'));

const Chat = lazy(() => import('./pages/chat/Chat'));
const Share = lazy(() => import('./pages/tracking/Share'));
const Track = lazy(() => import('./pages/tracking/Track'));

const AddMoney = lazy(() => import('./pages/wallet/AddMoney'));
const AddMoneyDemo = lazy(() => import('./pages/wallet/AddMoneyDemo'));

// Error Boundary for resilient navigation
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background, #F8F9F7)', color: 'var(--color-text-primary, #17201F)', padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something didn't load quite right</h2>
          <p style={{ color: 'var(--color-text-secondary, #68736F)', maxWidth: '480px', marginBottom: '1.5rem' }}>
            We've caught this error safely. Please reload the page or return to the home screen.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary, #245BDB)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload Page
            </button>
            <a
              href="/"
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-surface, #FFFFFF)', color: 'var(--color-text-primary, #17201F)', border: '1px solid var(--color-border, #E5E9E5)', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}
            >
              Go to Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Fallback Component
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-background, #F8F9F7)', flexDirection: 'column', gap: '12px' }}>
    <div style={{ width: '28px', height: '28px', border: '3px solid var(--color-border, #E5E9E5)', borderTopColor: 'var(--color-primary, #245BDB)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <span style={{ color: 'var(--color-text-secondary, #68736F)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>Loading BlueBridge...</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/role-select" element={<RoleSelect />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Dashboards */}
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
            <Route path="/dashboard/worker" element={<WorkerDashboard />} />

            {/* Onboarding */}
            <Route path="/onboarding/customer-verification" element={<CustomerVerification />} />
            <Route path="/onboarding/worker-verification" element={<WorkerVerification />} />
            <Route path="/onboarding/worker-about" element={<WorkerAbout />} />

            {/* Booking */}
            <Route path="/booking" element={<Booking />} />

            {/* Chat (Both /chat and /chat/chat aliases) */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/chat" element={<Chat />} />

            {/* Tracking */}
            <Route path="/tracking/share" element={<Share />} />
            <Route path="/tracking/track" element={<Track />} />

            {/* Wallet */}
            <Route path="/wallet/add-money" element={<AddMoney />} />
            <Route path="/wallet/add-money-demo" element={<AddMoneyDemo />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
