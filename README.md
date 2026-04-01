# 🛠️ BlueBridge – A Modern Home Services Platform

BlueBridge is a scalable, technology-driven platform designed to seamlessly connect customers with verified skilled professionals for on-demand home services. The platform emphasizes trust, efficiency, and user-centric design, delivering a reliable and transparent service experience.

---

## 🚀 Overview

BlueBridge addresses the fragmented nature of the home services market by providing a centralized, intelligent ecosystem where customers can easily discover, book, and manage services, while service professionals gain access to consistent job opportunities and streamlined operations.

---

## ✨ Key Features

### 🏠 Customer Experience

- **Multi-Service Marketplace** — Access 15+ service categories including plumbing, electrical work, cleaning, carpentry, and more.
- **Intelligent Worker Matching** — Algorithm-driven recommendations based on proximity, ratings, and availability.
- **Real-Time Service Tracking** — Live GPS-based tracking enables users to monitor service provider arrival in real time.
- **Secure Digital Wallet** — Integrated payment system ensuring fast, secure, and cashless transactions.
- **AI-Powered Assistant** — Context-aware chatbot for booking assistance, query resolution, and navigation support.
- **Transparent Ratings & Reviews** — Verified feedback system to ensure quality and accountability.

### 👷 Service Professional Experience

- **Streamlined Onboarding & Verification** — AI-assisted document verification (Aadhaar, PAN, Driving License) for faster onboarding.
- **Smart Job Management Dashboard** — Manage incoming requests, track ongoing jobs, and schedule future bookings efficiently.
- **Earnings & Financial Insights** — Comprehensive earnings dashboard with transaction history and wallet integration.

---

## 🧰 Tech Stack

### 🖥️ Frontend

| Technology | Purpose |
|---|---|
| **React + JSX** | Core UI framework for page components (Landing, Auth, Dashboards) |
| **Vite** | Build tool & dev server — fast HMR, production bundling |
| **Vanilla CSS** | Custom design system — glassmorphism, dark theme, animations |
| **Leaflet.js** | Interactive maps for real-time worker location tracking |
| **HTML + Vanilla JS** | Booking and customer dashboard pages (lightweight, no framework overhead) |
| **Firebase JS SDK** | Client-side auth & Firestore real-time listeners |
| **Browser Geolocation API** | GPS coordinates for customer location on booking |
| **Cloudflare Pages** | Frontend hosting & global CDN |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **Firebase Admin SDK** | Server-side Firestore reads/writes with full admin privileges |
| **Firestore (NoSQL)** | Primary database — users, workers, jobs, bookings, transactions |
| **Firebase Authentication** | User signup, login, and role-based access (customer / worker) |
| **Google Gemini AI** | AI chat assistant embedded in customer dashboard |
| **Razorpay** | Payment processing & wallet top-ups |
| **ngeohash** | Geohash encoding for proximity-based worker queries |
| **Joi** | Request body validation |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling between Cloudflare frontend & Railway backend |
| **Railway** | Backend cloud hosting with auto-deploy from GitHub |

### 🗄️ Data & Real-time

| Technology | Purpose |
|---|---|
| **Firestore** | All persistent data — users, jobs, bookings, chats, location history |
| **Firestore Real-time Listeners** | Live job status updates pushed to worker/customer dashboards |
| **Polling (`setInterval`)** | Fallback mechanism for worker location updates every 10s |

### 🔐 Auth & Security

| Technology | Purpose |
|---|---|
| **Firebase Authentication** | Email/password login, session token management |
| **Firebase Admin SDK** | Server-side token verification & privileged DB access |
| **Environment Variables** | Secrets (API keys, Firebase credentials) stored securely via Railway/Cloudflare env vars — never committed to git |

### 🚀 DevOps / Deployment

| Technology | Purpose |
|---|---|
| **GitHub** | Version control + webhook trigger for auto-deploys |
| **Cloudflare Pages** | Frontend CDN hosting, auto-build via `npm run build` on push to `main` |
| **Railway** | Backend Node.js hosting, auto-deploy on git push |

### 📡 Architecture Overview

```
Browser
  └── Cloudflare Pages  (React + Vite frontend)
        └── HTTPS API calls
              └── Railway  (Express backend)
                    ├── Firebase Admin  ↔  Firestore DB
                    ├── Google Gemini AI  (chat)
                    └── Razorpay  (payments)
```

---

## 📂 Folder Structure

```text
BlueBridge/
├── backend/                  # Node.js + Express backend application
│   ├── config/               # Firebase & environment configuration
│   ├── src/
│   │   ├── controllers/      # Route handler logic
│   │   ├── routes/           # Express route definitions
│   │   ├── middlewares/      # Auth, error handling
│   │   └── utils/            # Shared utilities (location, errors)
│   ├── railway.json          # Railway deployment config
│   └── package.json          # Backend dependencies and scripts
│
├── frontend/                 # React + Vite frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # Centralized API client
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Route-level pages (auth, dashboard, booking)
│   │   ├── styles/           # Global CSS design system
│   │   └── utils/            # Frontend utilities & Firebase config
│   ├── dist/                 # Production build output (committed for Cloudflare)
│   ├── vite.config.js        # Vite bundler configuration
│   └── package.json          # Frontend dependencies and scripts
│
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## ⚙️ Getting Started

**Prerequisites:** Node.js v20+, a configured Firebase project, and API keys for Razorpay and Google Gemini AI.

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT=<base64 encoded serviceAccountKey.json>
FIREBASE_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend:
```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Dev server on http://localhost:3000
```

Build for production:
```bash
npm run build  # Output goes to frontend/dist/
```

---

## 🧪 Testing & Demo Modes

BlueBridge includes demo environments to test features without external integrations:

- **AI Chatbot Assistant** — Powered by Google Gemini, providing real-time assistance for bookings, service queries, and platform navigation.
- **GPS Tracking Simulator** — Simulate worker location updates on the map for real-time monitoring tests.
- **AI-Based Identity Verification Test** — Automated document verification pipeline for faster professional onboarding.

---

## 📈 Impact

BlueBridge aims to:
- Empower blue-collar workers with better job visibility and income stability
- Enhance customer convenience through reliable and transparent services
- Digitize the informal service sector using scalable, modern technology