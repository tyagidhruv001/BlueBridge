import { db, collection, addDoc, query, where, orderBy, getDocs } from '../utils/config.js';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// In production, set VITE_BACKEND_URL in your Cloudflare/Vercel dashboard
const PROD_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://deploy001-cyan.vercel.app';

export const API_BASE = isLocal
    ? "http://localhost:5000/api"
    : (PROD_BACKEND_URL ? (PROD_BACKEND_URL.endsWith('/') ? PROD_BACKEND_URL : PROD_BACKEND_URL) + "/api" : "/api");

export async function apiFetch(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout for heavy AI tasks
    
    try {
        const res = await fetch(API_BASE + path, {
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            ...options
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
        let errorMessage = "API Error";
        try {
            const data = await res.json();
            errorMessage = data.error || data.message || JSON.stringify(data);
        } catch (e) {
            try {
                const text = await res.text();
                errorMessage = text || res.statusText;
            } catch (textError) {
                errorMessage = res.statusText;
            }
        }
        throw new Error(errorMessage);
    }

    return res.json();
} catch (error) {
    if (error.name === 'AbortError') {
        throw new Error('API Request timed out (Backend is slow/offline)');
    }
    throw error;
}
}

// API object with organized endpoints
export const API = {
    bookings: {
        async create(bookingData) {
            return apiFetch('/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });
        },
        async getByUser(userId, role) {
            return apiFetch(`/bookings?user_id=${userId}&role=${role}`);
        },
        async getAvailable(limit = 50) {
            return apiFetch(`/bookings?status=pending&limit=${limit}`);
        },
        async update(bookingId, updates) {
            return apiFetch(`/bookings/${bookingId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        }
    },
    jobs: {
        getMyJobs: async (userId, role) => {
            return apiFetch(`/jobs?userId=${userId}&role=${role}`);
        },
        getAvailable: async () => {
            return apiFetch(`/jobs?type=available`);
        },
        getJobById: async (jobId) => {
            return apiFetch(`/jobs/${jobId}`);
        },
        create: async (jobData) => {
            return apiFetch('/jobs', {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
        },
        update: async (jobId, updates) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        },
        updateStatus: async (jobId, status, updates = {}) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify({ status, ...updates })
            });
        },
        cancel: async (jobId) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled' })
            });
        }
    },
    reviews: {
        getByWorker: async (workerId) => {
            return [];
        }
    },
    transactions: {
        create: async (transactionData) => {
            return apiFetch('/transactions', {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
        },
        getByUser: async (userId) => {
            return apiFetch(`/transactions/${userId}`);
        }
    },
    chat: {
        async send(payload) {
            return apiFetch('/chat/send', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        },
        async sendP2P(payload) {
            return apiFetch('/chat/p2p', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
    },
    payments: {
        getBalance: async (userId) => {
            return apiFetch(`/payments/balance/${userId}`);
        },
        createPayment: async (paymentData) => {
            return apiFetch('/payments/create', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
        },
        verifyPayment: async (paymentData) => {
            return apiFetch('/payments/verify', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
        }
    },
    notifications: {
        getAll: async (userId) => {
            return apiFetch(`/notifications/${userId}`);
        },
        markRead: async (notificationId) => {
            return apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
        }
    },
    workers: {
        getNearby: async (lat, lng, radius = 5000) => {
            return apiFetch(`/workers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        },
        getAll: async (filters = {}) => {
            const query = new URLSearchParams(filters).toString();
            return apiFetch(`/workers${query ? '?' + query : ''}`);
        },
        getById: async (workerId) => {
            return apiFetch(`/workers/${workerId}`);
        },
        async updateProfile(uid, data) {
            return apiFetch(`/auth/profile/${uid}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        // Dedicated endpoint for pushing GPS location for map display
        async updateLocation(uid, lat, lng) {
            return apiFetch(`/workers/${uid}/location`, {
                method: 'PATCH',
                body: JSON.stringify({ lat, lng, timestamp: new Date().toISOString() })
            });
        }
    },
    auth: {
        async login(credentials) {
            return apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        },
        async signup(userData) {
            return apiFetch('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        getProfile: async (userId) => {
            return apiFetch(`/users/${userId}`);
        },
        async updateProfile(uid, data) {
            return apiFetch(`/auth/profile/${uid}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        }
    },
    // Referrals removed as requested
    referrals: {
        async create(data) { return { success: false, message: 'Referral program disabled' }; },
        async getHistory(userId) { return []; }
    },
    support: {
        async createTicket(data) {
            try {
                return await addDoc(collection(db, 'support_tickets'), {
                    ...data,
                    status: 'open',
                    createdAt: new Date()
                });
            } catch (error) {
                console.error("Support ticket error:", error);
                throw error;
            }
        },
        async getUserTickets(userId) {
            try {
                const q = query(
                    collection(db, 'support_tickets'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc')
                );
                const snap = await getDocs(q);
                return snap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() || new Date()
                    };
                });
            } catch (error) {
                console.error("Error fetching tickets:", error);
                return [];
            }
        }
    }
};
