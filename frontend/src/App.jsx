import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';

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

// Loading Fallback Component
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#05060a' }}>
    <div style={{ color: '#00d2ff', fontSize: '1.2rem', fontFamily: 'sans-serif' }}>Loading...</div>
  </div>
);

function App() {
  return (
    <Router>
      <CustomCursor />
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

          {/* Chat */}
          <Route path="/chat/chat" element={<Chat />} />

          {/* Tracking */}
          <Route path="/tracking/share" element={<Share />} />
          <Route path="/tracking/track" element={<Track />} />

          {/* Wallet */}
          <Route path="/wallet/add-money" element={<AddMoney />} />
          <Route path="/wallet/add-money-demo" element={<AddMoneyDemo />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
