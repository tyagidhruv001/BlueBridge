🛠️ BlueBridge – A Modern Home Services Platform

BlueBridge is a scalable, technology-driven platform designed to seamlessly connect customers with verified skilled professionals for on-demand home services. The platform emphasizes trust, efficiency, and user-centric design, delivering a reliable and transparent service experience.

🚀 Overview

BlueBridge addresses the fragmented nature of the home services market by providing a centralized, intelligent ecosystem where customers can easily discover, book, and manage services, while service professionals gain access to consistent job opportunities and streamlined operations.

✨ Key Features

🏠 Customer Experience

• Multi-Service Marketplace
Access 15+ service categories including plumbing, electrical work, cleaning, carpentry, and more.

• Intelligent Worker Matching
Algorithm-driven recommendations based on proximity, ratings, and availability.

• Real-Time Service Tracking
Live GPS-based tracking enables users to monitor service provider arrival in real time.

• Secure Digital Wallet
Integrated payment system ensuring fast, secure, and cashless transactions.

• AI-Powered Assistant
Context-aware chatbot for booking assistance, query resolution, and navigation support.

• Transparent Ratings & Reviews
Verified feedback system to ensure quality and accountability.

👷 Service Professional Experience

• Streamlined Onboarding & Verification
AI-assisted document verification (Aadhaar, PAN, Driving License) for faster onboarding.

• Smart Job Management Dashboard
Manage incoming requests, track ongoing jobs, and schedule future bookings efficiently.

• Earnings & Financial Insights
Comprehensive earnings dashboard with transaction history and wallet integration.

🏗️ System Architecture

BlueBridge follows a modular full-stack architecture:

• Frontend
Built using HTML, CSS, JavaScript, and Vite to deliver a fast and responsive user interface.

• Backend
Developed using Node.js and Express, with Firebase integration for authentication, database, and real-time features.

## 📂 Folder Structure

```text
BlueBridge/
├── backend/                  # Node.js + Express backend application
│   ├── config/               # Configuration files
│   ├── src/                  # Backend source code (routes, controllers, etc.)
│   ├── clear-db.js           # Database cleanup utility
│   └── package.json          # Backend dependencies and scripts
│
├── frontend/                 # React + Vite frontend application
│   ├── public/               # Static assets
│   ├── src/                  # React source code (components, pages, assets)
│   ├── index.html            # Main HTML entry point
│   ├── vite.config.js        # Vite bundler configuration
│   └── package.json          # Frontend dependencies and scripts
│
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

## ⚙️ Getting Started

Prerequisites include Node.js (v20 or higher), a configured Firebase project, and API keys such as Razorpay and Google Generative AI.

### 1. Backend Setup

Open a terminal and configure the backend:

```bash
cd backend
npm install
```

Start the backend server (runs on port defined in your environment):
```bash
npm run dev    # Starts with nodemon for development
# or
npm start      # Standard start
```

### 2. Frontend Setup

Open a separate terminal and configure the frontend:

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

🧪 Testing & Demo Modes

BlueBridge includes demo environments to test features without external integrations:

• Demo Wallet Interface
• GPS Tracking Simulator
• AI-Based Identity Verification Test

📈 Impact

BlueBridge aims to empower blue-collar workers with better job visibility and income stability, enhance customer convenience through reliable and transparent services, and digitize the informal service sector using scalable technology.