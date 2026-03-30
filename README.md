# 🛠️ BlueBridge - Modern Home Service Platform

**BlueBridge** is a comprehensive, premium platform designed to bridge the gap between skilled service professionals and customers. Built with a focus on reliability, transparency, and modern user experience, it offers a seamless way to book and manage home services.

---

## ✨ Core Features

### 🏠 For Customers
- **15+ Service Categories** - Seamlessly book professionals for plumbing, electrical, cleaning, carpentry, and more.
- **Smart Worker Matching** - Find the best-rated and nearest professionals using location-based discovery.
- **Real-time GPS Tracking** - Track your service provider's arrival in real-time with live map integration.
- **Digital Wallet** - Integrated payment system with a secure wallet for instant, hassle-free transactions.
- **AI Chat Assistant** - Context-aware support to help with bookings, queries, and platform navigation.
- **Ratings & Reviews** - Rate services and read verified reviews to ensure top-quality help.

### 👷 For Service Workers
- **Onboarding & Verification** - Simplified registration with AI-powered document verification (Aadhaar, PAN, DL).
- **Job Management** - Smart dashboard to accept, track, and manage active and upcoming service requests.
- **Earnings Tracker** - Detailed history of transactions, income breakdown, and wallet management.
# BlueBridge Platform

A comprehensive service platform connecting skilled blue-collar workers with customers instantly.

## Architecture

This project is structured into two main components:

- **`frontend/`**: The client-side application built with HTML, CSS, JavaScript, and Vite.
- **`backend/`**: The server-side API built with Node.js, Express, and Firebase.

## Getting Started

### Prerequisites
- Node.js (v20+)
- Firebase Project configured
- API keys for external services (Razorpay, Google Gen AI)

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 2. Backend Setup
```bash
cd backend
npm install
```

# Start Backend (from backend directory)
npm start

# Start Frontend (from root, using any static server)
# Example using npx:
cd ../frontend
npx http-server -p 3000
```

---

## 🧪 Testing & Demo Modes

The platform includes several "Demo modes" to test features without active API keys:

- **Demo Wallet:** [http://localhost:3000/wallet/add-money-demo.html](http://localhost:3000/wallet/add-money-demo.html)
- **GPS Simulator:** [http://localhost:3000/tracking/test-map.html](http://localhost:3000/tracking/test-map.html)
- **Identity Verification Test:** [http://localhost:3000/test-ai-verification.html](http://localhost:3000/test-ai-verification.html)

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by the BlueBridge Team**
*Connecting India's skilled workforce with modern technology.*
