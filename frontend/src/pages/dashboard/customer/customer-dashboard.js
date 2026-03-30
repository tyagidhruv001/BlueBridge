/**
 * BlueBridge - CUSTOMER DASHBOARD JAVASCRIPT
 * Comprehensive dashboard logic with persistence and AI integration.
 */

// Imports
import { API, apiFetch } from '../../../api/api.js';
import { Storage, formatDate, formatCurrency, showToast, showConfirm } from '../../../utils/utils.js';
import { auth, db, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from '../../../utils/config.js';

// --- Persistence & State Management ---
const STORAGE_KEYS = {
    USER: 'BlueBridge_user',
    BOOKINGS: 'BlueBridge_bookings',
    WALLET: 'BlueBridge_wallet'
};

// --- DOM Elements ---
const getEl = (id) => document.getElementById(id);
const getAll = (sel) => document.querySelectorAll(sel);

// --- Initialization ---
let isInitialized = false;
function init() {
    if (isInitialized) return;
    isInitialized = true;
    console.log('[DASHBOARD] Initializing customer dashboard...');
    const userData = Storage.get(STORAGE_KEYS.USER);
    console.log('[DASHBOARD] User data from storage:', userData);
    if (!userData || !userData.loggedIn) {
        console.warn('[DASHBOARD] User not logged in, redirecting to login page');
        window.location.href = '/auth/login';
        return;
    }
    console.log('[DASHBOARD] User authenticated, continuing initialization');

    // MIGRATION: Clear old mock bookings to avoid "nothing changed" confusion
    if (!Storage.get('BlueBridge_v2_migration')) {

        Storage.remove(STORAGE_KEYS.BOOKINGS);
        Storage.set('BlueBridge_v2_migration', 'done');
    }

    setupEventListeners();
    updateUIWithUserData(userData);
    updateDashboardStats(); // This now fetches live balance

    // Initial data load from Firestore
    refreshCustomerDashboardData();

    startClock();
    handleTabSwitching();
    subscribeToBookings(userData.uid);
    setupDashboardActions();
}

async function refreshCustomerDashboardData() {
    try {
        await renderOverview();
        await renderBookingsGrid(); // Loads 'all' by default
        await renderWallet();
        await renderProfile();

        renderSupport();
    } catch (e) {
        console.error('Initial rendering error:', e);
    }

    startClock(); // Start Real-time Clock
    handleTabSwitching();
}

let bookingsUnsubscribe = null;

function subscribeToBookings(uid) {
    if (bookingsUnsubscribe) {
        bookingsUnsubscribe();
    }

    const q = query(
        collection(db, 'jobs'),
        where('customerId', '==', uid),
        orderBy('createdAt', 'desc')
    );

    console.log('Subscribing to bookings for:', uid);
    bookingsUnsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            bookings.push({
                id: doc.id,
                service: data.serviceType || 'General',
                worker: data.workerName || (data.workerId === 'auto-assign' ? 'Assigning...' : 'Worker assigned'),
                workerId: data.workerId,
                workerPhone: data.workerPhone || '',
                date: data.date || data.scheduledTime?.split('T')[0] || 'TBD',
                time: data.time || '09:00 AM',
                status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1)) : 'Pending',
                price: data.price || 450,
                address: data.address
            });
        });

        console.log('Real-time bookings update:', bookings.length);
        Storage.set(STORAGE_KEYS.BOOKINGS, bookings);

        // Update UI
        updateDashboardStats();
        // Only re-render grid if we are on the bookings tab or overview
        // For simplicity, we just re-render grid if it exists
        const grid = document.getElementById('bookings-grid');
        if (grid) renderBookingsGrid();

        // Also update overview header stats
        const overviewContainer = document.getElementById('overview-container');
        if (overviewContainer) renderOverview(); // This might be too heavy? Maybe just stats.

    }, (error) => {
        console.error('Error listening to bookings:', error);
    });
}

function setupDashboardActions() {
    window.openTracking = function(bookingId) {
        showToast('Switching to maps for worker tracking...', 'info');
        // Switch to the Nearby Workers tab
        const nearbyTab = document.querySelector('[data-tab="nearby-workers"]');
        if (nearbyTab) {
            nearbyTab.click();
            // In a real app, we would scroll to the worker or focus the map
        }
    };

    window.cancelBooking = async function(bookingId) {
        const confirmed = await showConfirm('Are you sure you want to cancel this booking?');
        if (!confirmed) return;

        try {
            await API.jobs.cancel(bookingId);
            showToast('Booking cancelled successfully', 'success');
            // Data will refresh automatically via listener
        } catch (e) {
            console.error('Failed to cancel:', e);
            showToast('Failed to cancel booking: ' + e.message, 'error');
        }
    };
}

function setupEventListeners() {
    getEl('menu-toggle')?.addEventListener('click', () => {
        getEl('sidebar')?.classList.toggle('active');
        getEl('sidebar-overlay')?.classList.toggle('active');
    });

    getEl('sidebarToggle')?.addEventListener('click', () => {
        getEl('sidebar')?.classList.remove('active');
        getEl('sidebar-overlay')?.classList.remove('active');
    });





    document.addEventListener('change', (e) => {
        if (e.target && (e.target.id === 'profile-upload' || e.target.id === 'profile-upload-main')) {
            e.stopPropagation();
            handleProfileUpload(e);
        }
    });

    window.toggleChatPopup = toggleChatPopup;
    getEl('ai-widget-toggle')?.addEventListener('click', toggleChatPopup);
    getEl('close-chat-popup')?.addEventListener('click', toggleChatPopup);

    // Maximize Button Logic
    getEl('maximize-chat-popup')?.addEventListener('click', () => {
        const popup = getEl('ai-chat-popup');
        popup.classList.toggle('maximized');
    });

    // Minimize Button Logic
    getEl('minimize-chat-popup')?.addEventListener('click', () => {
        const popup = getEl('ai-chat-popup');
        if (popup.classList.contains('maximized')) {
            popup.classList.remove('maximized'); // Restore from Max to Normal
        } else {
            toggleChatPopup(); // Hide completely (Back to Icon)
        }
    });

    const aiSendBtn = getEl('ai-popup-send');
    if (aiSendBtn) {

        aiSendBtn.addEventListener('click', (e) => {

            e.preventDefault();
            handleAIMessage();
        });
    } else {
        console.error('AI Send Button NOT FOUND');
    }

    const aiInput = getEl('ai-popup-input');
    if (aiInput) {
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter Key Pressed');
                e.preventDefault();
                handleAIMessage();
            }
        });
    }
}

function handleProfileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Max 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Img = event.target.result;
        const user = Storage.get(STORAGE_KEYS.USER) || {};
        user.profilePic = base64Img;
        Storage.set(STORAGE_KEYS.USER, user);
        updateUIWithUserData(user);
    };
    reader.readAsDataURL(file);
}

function updateUIWithUserData(user) {
    const userNameDisp = getEl('user-display-name');
    const welcomeName = getEl('welcome-name');
    const userAvatarInit = getEl('user-avatar-initials');
    const userAvatarImg = getEl('user-avatar-img');

    const rPoints = user.reward_points || user.profile?.reward_points || 0;

    if (userNameDisp) {
        userNameDisp.innerHTML = `
            ${user.name || 'User'} 
        `;
    }
    if (welcomeName) welcomeName.textContent = (user.name || 'User').split(' ')[0];

    if (user.profilePic && userAvatarImg) {
        userAvatarImg.src = user.profilePic;
        userAvatarImg.style.display = 'block';
        if (userAvatarInit) userAvatarInit.style.display = 'none';

        const miniAvatars = getAll('.user-profile-mini .avatar');
        miniAvatars.forEach(av => {
            av.style.backgroundImage = `url(${user.profilePic})`;
            av.style.backgroundSize = 'cover';
            av.textContent = '';
        });
    } else if (userAvatarInit) {
        userAvatarImg.style.display = 'none';
        userAvatarInit.style.display = 'flex';
        const names = (user.name || 'U').split(' ');
        userAvatarInit.textContent = names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    }
}

function handleTabSwitching() {
    const navItems = getAll('.nav-item[data-tab]');
    const tabContents = getAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(content => {
                content.style.display = 'none';
                if (content.id === `${tabId}-tab`) {
                    content.style.display = 'block';
                }
            });
            loadTabData(tabId);
        });
    });
}

function loadTabData(tabId) {
    try {
        if (tabId === 'my-bookings') renderBookingsGrid();
        if (tabId === 'overview') renderOverview();
        if (tabId === 'wallet') renderWallet();
        if (tabId === 'profile') renderProfile();

        if (tabId === 'support') renderSupport();
        if (tabId === 'nearby-workers') renderNearbyWorkers();
        if (tabId === 'settings') renderSettings();
    } catch (e) {
        console.error(`Error loading data for tab ${tabId}:`, e);
    }
}

function renderSettings() {
    console.log('Rendering Settings...');
    const method = localStorage.getItem('use_firestore_realtime') === 'true' ? 'firestore' : 'polling';

    const pollingRadio = getEl('tracking-polling');
    const firestoreRadio = getEl('tracking-firestore');

    if (pollingRadio && firestoreRadio) {
        if (method === 'firestore') {
            firestoreRadio.checked = true;
        } else {
            pollingRadio.checked = true;
        }
    }
}

window.saveTrackingMethod = function (method) {
    const isFirestore = method === 'firestore';
    localStorage.setItem('use_firestore_realtime', isFirestore);
    console.log(`Tracking method set to: ${method}`);

    // If we're on the nearby-workers tab, refresh subscriptions
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab');
    if (activeTab === 'nearby-workers') {
        renderNearbyWorkers(); // This will re-call subscribeToWorkerUpdates with the new method
    }

    showToast(`Tracking changed to ${method}`, 'success');
};

// --- Worker Profile Modal for Dashboard ---
window.showWorkerProfileInDashboard = async function (uid) {
    console.log('showWorkerProfileInDashboard called with uid:', uid);
    try {
        // Fetch full worker details (including profile)
        const worker = await API.workers.getById(uid);
        console.log('Worker data fetched:', worker);
        if (!worker) {
            console.error('Worker not found for uid:', uid);
            alert('Could not load worker profile. Please try again.');
            return;
        }

        // Trigger the modal
        renderDashboardWorkerModal(worker);
    } catch (e) {
        console.error('Failed to show profile:', e);
        alert('Error loading profile: ' + e.message);
    }
}

function renderDashboardWorkerModal(worker) {
    const modal = document.getElementById('dashboard-worker-modal');
    if (!modal) return;

    const name = worker.name || 'Professional';
    const initials = name.substring(0, 2).toUpperCase();
    const category = worker.category || 'Specialist';
    const rating = worker.rating_avg || worker.stats?.avg_rating || 4.5;
    const totalJobs = worker.stats?.total_jobs || worker.total_jobs || 0;
    const experienceYears = worker.experience_years || 3;
    const basePrice = worker.base_price || 500;
    const bio = worker.bio || "Excellent professional with highly rated services.";
    const phone = worker.phone || 'Not available';
    const email = worker.email || '';
    const isVerified = worker.is_verified || worker.verification_status === 'verified';
    const qualifications = worker.qualifications || [];
    const skills = worker.skills || [category];
    const profilePic = worker.profile_pic || worker.avatar || '';

    // Generate star rating HTML
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star" style="color: var(--neon-orange);"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt" style="color: var(--neon-orange);"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star" style="color: var(--neon-orange); opacity: 0.3;"></i>';
    }

    // Update modal with comprehensive details
    const modalContent = modal.querySelector('.profile-modal-content');
    modalContent.innerHTML = `
        <button class="profile-close" onclick="closeDashboardWorkerModal()"><i class="fas fa-times"></i></button>
        
        <div class="profile-header-banner" style="background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); padding: 2rem; text-align: center; position: relative;">
            ${isVerified ? '<div style="position: absolute; top: 15px; right: 15px; background: var(--neon-green); color: #000; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px;"><i class="fas fa-check-circle"></i> VERIFIED</div>' : ''}
            
            ${profilePic ?
            `<div style="width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
                    <img src="${profilePic}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>` :
            `<div class="profile-avatar-large" style="width: 120px; height: 120px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">${initials}</div>`
        }
        </div>
        
        <div class="profile-body" style="padding: 2rem;">
            <!-- Name & Title -->
            <div style="text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem;">
                <h2 style="margin: 0; font-size: 1.8rem; color: #fff;">${name}</h2>
                <p style="margin: 5px 0; color: var(--neon-blue); font-weight: 600; font-size: 1.1rem;">${category}</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;">
                    <div style="display: flex; gap: 3px;">${starsHtml}</div>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${rating.toFixed(1)} (${totalJobs}+ jobs)</span>
                </div>
            </div>

            <!-- Quick Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border);">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-blue); font-weight: 700;">${experienceYears}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Years Exp</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-green); font-weight: 700;">₹${basePrice}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Base Rate</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-purple); font-weight: 700;">${totalJobs}+</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Jobs Done</div>
                </div>
            </div>

            <!-- Contact Info -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border);">
                <h4 style="margin-bottom: 12px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-address-card" style="color: var(--neon-blue);"></i> Contact Information
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
                    <div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                        <i class="fas fa-phone" style="width: 20px; color: var(--neon-green);"></i>
                        <span>${phone}</span>
                    </div>
                    ${email ? `<div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                        <i class="fas fa-envelope" style="width: 20px; color: var(--neon-blue);"></i>
                        <span>${email}</span>
                    </div>` : ''}
                </div>
            </div>

            ${qualifications.length > 0 ? `
            <!-- Certifications -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-certificate" style="color: var(--neon-orange);"></i> Certifications
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${qualifications.map(q => `<span style="background: rgba(255,165,0,0.1); color: var(--neon-orange); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(255,165,0,0.3);">${q}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            <!-- About -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-circle" style="color: var(--neon-purple);"></i> About Professional
                </h4>
                <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">${bio}</p>
            </div>

            <!-- Skills -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-tools" style="color: var(--neon-blue);"></i> Skills & Expertise
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${skills.map(s => `<span class="skill-tag" style="background: rgba(0,210,255,0.1); color: var(--neon-blue); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(0,210,255,0.3);">${s}</span>`).join('')}
                </div>
            </div>

            <!-- View Route History -->
            <button class="btn btn-secondary" style="width: 100%; margin-bottom: 1.5rem; border: 1px solid var(--neon-purple); color: var(--neon-purple); background: rgba(157, 80, 187, 0.1); padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="closeDashboardWorkerModal(); window.visualizeWorkerHistory('${worker.uid || worker.id}')">
                <i class="fas fa-route"></i> View Location Path (Beta)
            </button>

            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn btn-primary" style="background: var(--neon-blue); color: #000; font-weight: 700; padding: 0.75rem;" onclick="closeDashboardWorkerModal(); document.querySelector('[data-tab=book-service]').click()">
                    <i class="fas fa-calendar-check"></i> Book Now
                </button>
                <button class="btn btn-secondary" style="border: 2px solid var(--neon-green); color: var(--neon-green); background: transparent; font-weight: 700; padding: 0.75rem;" onclick="window.open('tel:${phone}')">
                    <i class="fas fa-phone-alt"></i> Call Now
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

window.closeDashboardWorkerModal = function () {
    document.getElementById('dashboard-worker-modal')?.classList.remove('active');
}

window.visualizeWorkerHistory = async function (workerId) {
    console.log(`🎬 Visualizing history for worker: ${workerId}`);
    try {
        const history = await API.workers.getLocationHistory(workerId);

        if (!history || history.length < 2) {
            alert("No travel history found for this professional recently.");
            return;
        }

        if (!nearbyMap) {
            alert("Please open the Nearby Workers map first.");
            return;
        }

        // Draw on map
        const latlngs = history.map(p => [p.lat, p.lng]);

        // Remove old polyline if any
        if (window.historyPolyline) {
            nearbyMap.removeLayer(window.historyPolyline);
        }

        window.historyPolyline = L.polyline(latlngs, {
            color: '#a855f7', // purple-500
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 15',
            lineJoin: 'round',
            className: 'history-path-animation'
        }).addTo(nearbyMap);

        // Add start and end icons
        const startIcon = L.divIcon({ html: '<i class="fas fa-play-circle" style="color: #a855f7;"></i>', className: 'history-edge' });
        const endIcon = L.divIcon({ html: '<i class="fas fa-flag-checkered" style="color: #34d399;"></i>', className: 'history-edge' });

        const startMarker = L.marker(latlngs[0], { icon: startIcon }).addTo(nearbyMap);
        const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(nearbyMap);

        // Zoom to fit
        nearbyMap.fitBounds(window.historyPolyline.getBounds(), { padding: [100, 100] });

        console.log(`✅ Path drawn with ${history.length} points.`);

        // Auto-cleanup helper
        const cleanup = () => {
            if (window.historyPolyline) nearbyMap.removeLayer(window.historyPolyline);
            nearbyMap.removeLayer(startMarker);
            nearbyMap.removeLayer(endMarker);
            window.historyPolyline = null;
        };

        // Add a "Clear Path" button to the map or just auto-remove
        setTimeout(cleanup, 45000); // 45 seconds

    } catch (e) {
        console.error("History visualization error:", e);
        alert("Error loading history: " + e.message);
    }
}

// Expose to window for inline HTML access
window.handleAIMessage = handleAIMessage;

async function updateDashboardStats() {
    const user = Storage.get(STORAGE_KEYS.USER);
    if (!user || !user.uid) return;

    try {
        // Only fetch balance every 5 minutes to save quota
        const lastFetch = user._lastBalanceFetch || 0;
        const now = Date.now();

        if (now - lastFetch > 300000) { // 5 minutes
            const data = await apiFetch(`/payments/balance/${user.uid}`);
            const walletBalEl = getEl('stat-wallet-bal');
            if (walletBalEl && data.success) {
                walletBalEl.textContent = `₹${data.balance.toFixed(2)}`;
                user.wallet = { balance: data.balance };
                user._lastBalanceFetch = now;
                Storage.set(STORAGE_KEYS.USER, user);
            }
        } else if (user.wallet) {
            const walletBalEl = getEl('stat-wallet-bal');
            if (walletBalEl) walletBalEl.textContent = `₹${(user.wallet.balance || 0).toFixed(2)}`;
        }

        // Update booking counts
        const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
        const activeCount = bookings.filter(b => ['Active', 'On the way', 'Running', 'Pending'].includes(b.status)).length;
        const completedCount = bookings.filter(b => b.status === 'Completed').length;

        if (getEl('stat-active-count')) getEl('stat-active-count').textContent = activeCount;
        if (getEl('stat-completed-count')) getEl('stat-completed-count').textContent = completedCount;

        // Also update recent activity
        renderRecentActivity(user.uid);

    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

function getRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

async function renderRecentActivity(userId) {
    const container = getEl('recent-activity-list');
    if (!container) return;

    try {
        const [bookings, transactions] = await Promise.all([
            API.jobs.getMyJobs(userId, 'customer'),
            API.transactions.getByUser(userId)
        ]);

        let activities = [];

        // Map bookings to activity items
        (bookings || []).forEach(b => {
             activities.push({
                 type: 'job',
                 title: `${b.serviceType || 'Service'} Job ${b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Requested'}`,
                 time: b.updatedAt || b.createdAt || b.timestamp,
                 status: (b.status || 'pending').toLowerCase()
             });
        });

        // Map transactions to activity items
        (transactions || []).forEach(t => {
            activities.push({
                type: 'transaction',
                title: t.description || (t.type === 'credit' ? 'Wallet Top-up' : 'Service Payment'),
                time: t.createdAt,
                amount: t.amount,
                transactionType: t.type
            });
        });

        // Sort by time descending
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Limit to 5
        const recent = activities.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">No recent activities found.</p>';
            return;
        }

        container.innerHTML = recent.map(activity => {
            const isJob = activity.type === 'job';
            const icon = isJob 
                ? (activity.status === 'completed' ? 'fa-check' : 'fa-tools') 
                : (activity.transactionType === 'credit' ? 'fa-wallet' : 'fa-receipt');
            const iconBg = isJob 
                ? (activity.status === 'completed' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(0, 210, 255, 0.1)') 
                : (activity.transactionType === 'credit' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)');
            const iconColor = isJob 
                ? (activity.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-blue)') 
                : (activity.transactionType === 'credit' ? 'var(--neon-blue)' : 'var(--neon-pink)');

            return `
                <div class="activity-item" style="animation: slideUp 0.3s ease-out; margin-bottom: 0.75rem;">
                    <div class="activity-icon" style="background: ${iconBg}; color: ${iconColor};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h5 style="margin:0; font-size: 0.95rem;">${activity.title}</h5>
                        <p style="margin:0.2rem 0 0; font-size: 0.75rem; color: var(--text-muted);">${getRelativeTime(activity.time)}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error rendering recent activity:', error);
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">Failed to load activity feed.</p>';
    }
}

// --- CALENDAR HELPER ---
function startClock() {
    setInterval(() => {
        const clockEl = document.getElementById('real-time-clock');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString();
        }
    }, 1000);
}

function handleCalendarDateClick(dateStr) {
    // Switch to Scheduled Tab
    const scheduledTab = document.querySelector('[data-tab="my-bookings"]');
    if (scheduledTab) scheduledTab.click();

    // Filter by scheduled
    setTimeout(() => {
        if (window.filterBookings) window.filterBookings('scheduled');
        // Optional: Scroll to specific date if we implemented IDs
    }, 100);
}

// --- CALENDAR HELPER (3D & Weeks) ---
function generateOverviewCalendar(bookings) {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    const todayDate = now.getDate();

    // Setup Dates
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDayIndex = firstDay.getDay(); // 0-Sun, 6-Sat

    // Inject 3D Styles Dynamically
    const styleId = 'calendar-3d-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cal-3d-container {
                perspective: 1000px;
            }
            .cal-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid transparent;
                border-radius: 12px;
                height: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-style: preserve-3d;
                cursor: default;
                position: relative;
            }
            .cal-card.interactive:hover {
                transform: translateY(-5px) scale(1.05) rotateX(10deg);
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 10px 20px rgba(0, 210, 255, 0.2);
                border-color: rgba(0, 210, 255, 0.3);
                z-index: 10;
            }
            .cal-card.today {
                background: rgba(0, 210, 255, 0.15);
                border: 1px solid var(--neon-blue);
                box-shadow: 0 0 15px rgba(0, 210, 255, 0.1);
            }
            .cal-card.today:hover {
                box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
            }
            .week-label {
                font-size: 0.7rem; 
                color: var(--text-muted); 
                writing-mode: vertical-lr; 
                transform: rotate(180deg);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }

    let gridHtml = '';

    // Header Row (Week + 7 Days)
    gridHtml += `<div class="text-muted" style="font-size: 0.7rem;">Wk</div>`;
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
        gridHtml += `<div class="text-muted" style="font-size: 0.75rem;">${d}</div>`;
    });

    let currentWeek = getWeekNumber(firstDay);
    let dayCount = 1;
    let currentRow = [];

    // First Week Logic
    // 1. Add Week Number
    gridHtml += `<div class="week-label">W${currentWeek}</div>`;

    // 2. Empty Slots
    for (let i = 0; i < startDayIndex; i++) {
        gridHtml += `<div></div>`;
    }

    // 3. Fill First Week
    for (let i = startDayIndex; i < 7; i++) {
        gridHtml += renderDayCell(dayCount, currentYear, now.getMonth() + 1, bookings, todayDate);
        dayCount++;
    }
    currentWeek++;

    // Remaining Weeks
    while (dayCount <= daysInMonth) {
        // New Week Row Start
        gridHtml += `<div class="week-label">W${currentWeek}</div>`;

        for (let i = 0; i < 7; i++) {
            if (dayCount <= daysInMonth) {
                gridHtml += renderDayCell(dayCount, currentYear, now.getMonth() + 1, bookings, todayDate);
                dayCount++;
            } else {
                gridHtml += `<div></div>`; // Empty filler
            }
        }
        currentWeek++;
        if (currentWeek > 52) currentWeek = 1; // Basic reset
    }

    return `
        <div class="calendar-widget cal-3d-container" style="margin-top: 2rem; background: rgba(255,255,255,0.02); border-radius: 20px; padding: 1.5rem; border: 1px solid var(--glass-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="far fa-calendar-alt" style="color: var(--neon-purple);"></i> ${currentMonth} ${currentYear}
                </h3>
                <div style="text-align: right;">
                     <div class="text-muted" style="font-size: 0.7rem; letter-spacing: 1px;">CURRENT TIME</div>
                     <div id="real-time-clock" style="font-family: monospace; font-size: 1.1rem; color: var(--neon-blue); font-weight: 700;">--:--:--</div>
                </div>
            </div>
            <!-- Grid: 8 Columns (1 for Week + 7 for Days) -->
            <div style="display: grid; grid-template-columns: 30px repeat(7, 1fr); gap: 0.6rem; text-align: center; align-items: center;">
                ${gridHtml}
            </div>
        </div>
    `;
}

function renderDayCell(day, year, month, bookings, todayDate) {
    const checkDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    // Include 'Pending' status and ensure exact date match or correct day-of-month check
    const hasBooking = bookings.some(b => {
        // Normalize status check
        const status = b.status ? b.status.toLowerCase() : '';
        const isValidStatus = ['scheduled', 'confirmed', 'active', 'pending'].includes(status);

        // Normalize date check (handle YYYY-MM-DD or full ISO)
        const bookingDate = b.date ? b.date.split('T')[0] : '';
        const isSameDate = bookingDate === checkDate;

        return isValidStatus && isSameDate;
    });
    const isToday = day === todayDate;

    // Classes
    let classes = 'cal-card';
    if (isToday) classes += ' today';
    if (hasBooking || isToday) classes += ' interactive';

    // Attrs
    const onClick = hasBooking ? `onclick="handleCalendarDateClick('${checkDate}')"` : '';
    const cursor = hasBooking ? 'pointer' : 'default';

    // Dot
    const dot = hasBooking ? `<div style="width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; margin-top: 4px; box-shadow: 0 0 8px var(--neon-green);"></div>` : '';

    return `
        <div class="${classes}" style="cursor: ${cursor};" ${onClick}>
            <span style="font-weight: 700; color: ${isToday ? 'var(--neon-blue)' : '#fff'}; font-size: 0.9rem;">${day}</span>
            ${dot}
        </div>
    `;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function renderOverview() {
    const container = getEl('overview-active-booking-container');
    if (!container) return;

    let bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];

    // Broadened filter to ensure 'On the way' and other active states show up
    const activeBookings = bookings.filter(b => ['Active', 'Confirmed', 'Scheduled', 'On the way', 'Running', 'Pending'].includes(b.status));
    const calendar = generateOverviewCalendar(bookings);

    try {
        // Fetch real userId
        const user = Storage.get(STORAGE_KEYS.USER);
        if (user && user.uid) renderRecentActivity(user.uid);

        let contentHtml = '';

        if (activeBookings.length > 0) {
            // Scrollable Container
            contentHtml += `<div style="display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 1.5rem; margin-top: 1rem; scrollbar-width: thin;">`;

            activeBookings.forEach(activeBooking => {
                const timeline = activeBooking.timeline || [];
                // Compact Card
                contentHtml += `
                    <div class="active-booking-card" style="min-width: 320px; max-width: 350px; flex-shrink: 0; position: relative; padding: 1.25rem; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);">
                        <div class="booking-header" style="margin-bottom: 1rem;">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <span class="text-muted" style="font-size: 0.65rem; letter-spacing: 1px; text-transform: uppercase;">Ongoing</span>
                                    <h3 style="font-size: 1.1rem; margin: 0.2rem 0; color: #fff;">${activeBooking.service}</h3>
                                    <p class="text-muted" style="font-size: 0.8rem; margin:0;">#${activeBooking.id}</p>
                                </div>
                                <span class="booking-badge" style="background: rgba(0, 210, 255, 0.1); border: 1px solid var(--neon-blue); padding: 0.25rem 0.6rem; font-size: 0.7rem; border-radius: 20px; color: var(--neon-blue);">${activeBooking.status}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: 10px;">
                            <div class="avatar" style="width: 40px; height: 40px; font-size: 0.9rem; border-color: var(--neon-blue);">${(activeBooking.worker || 'S')[0]}</div>
                            <div>
                                <p style="font-weight: 600; font-size: 0.95rem; margin:0;">${activeBooking.worker || 'Searching...'}</p>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin:0;"><i class="fas fa-star" style="color: var(--neon-orange);"></i> 4.8</p>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem;">
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">DATE</p>
                                <p style="margin:0; font-weight:600;">${activeBooking.date}</p>
                            </div>
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">TIME</p>
                                <p style="margin:0; font-weight:600;">${activeBooking.time}</p>
                            </div>
                        </div>

                        <div class="booking-timeline" style="margin-bottom: 1.2rem; display:flex; justify-content: space-between; position:relative;">
                            ${timeline.slice(0, 3).map((step, idx) => `
                                <div style="display:flex; flex-direction:column; align-items:center; z-index:1; width:33%;">
                                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${step.status === 'completed' ? 'var(--neon-green)' : step.status === 'active' ? 'var(--neon-blue)' : 'var(--bg-dark-600)'}; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#000;">
                                        ${step.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                                    </div>
                                    <span style="font-size: 0.6rem; margin-top: 4px; color: ${step.status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)'}; text-align:center;">${step.label}</span>
                                </div>
                            `).join('')}
                             <div style="position:absolute; top:10px; left:16%; right:16%; height:2px; background:var(--bg-dark-600); z-index:0;"></div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                            <button class="btn btn-primary btn-sm" style="flex:1; background: var(--neon-green); color: #000; font-size:0.8rem; padding:0.5rem;" title="Call Professional" onclick="window.open('tel:${activeBooking.workerPhone || ''}')"><i class="fas fa-phone-alt"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem;" title="Chat with Professional" onclick="window.location.href='/chat/chat?bookingId=${activeBooking.id}&receiverName=${encodeURIComponent(activeBooking.worker || activeBooking.workerName || 'Worker')}&receiverId=${activeBooking.workerId || ''}'"><i class="fas fa-comment-dots"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem; color: var(--neon-blue); border-color: var(--neon-blue);" title="Track Worker" onclick="window.openTracking('${activeBooking.id}')"><i class="fas fa-map-marker-alt"></i></button>
                            <button class="btn btn-ghost btn-sm" style="flex:1; color: var(--neon-pink); font-size:0.8rem; padding:0.5rem; border: 1px solid var(--neon-pink);" title="Cancel Booking" onclick="window.cancelBooking('${activeBooking.id}')"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `;
            });
            contentHtml += `</div>`; // Close container

        } else {
            contentHtml = `
                <div class="active-booking-card" style="text-align: center; padding: 2rem; background:rgba(255,255,255,0.02); border-radius:12px;">
                    <p class="text-muted">No active bookings found.</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;" onclick="document.querySelector('[data-tab=book-service]').click()">Book a Service Now</button>
                </div>
            `;
        }

        container.innerHTML = calendar + contentHtml;

    } catch (e) {
        console.error('Error rendering overview:', e);
        container.innerHTML = '<p class="text-muted">Error loading overview.</p>';
    }
}

async function renderBookingsGrid(filterType = 'all') {
    const grid = getEl('bookings-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div style="text-align:center; padding:2rem;"><div class="spinner"></div><p>Loading bookings...</p></div>';

    try {
        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user || !user.uid) {
            grid.innerHTML = '<p>Please log in to view bookings.</p>';
            return;
        }

        // Fetch from API - Real Firestore data only
        let bookings = [];
        try {
            const apiBookings = await API.jobs.getMyJobs(user.uid, 'customer');
            console.log('Fetched bookings from API:', apiBookings);

            if (apiBookings && apiBookings.length > 0) {
                // Map API data to UI format
                bookings = apiBookings.map(job => ({
                    id: job.id,
                    service: job.serviceType || 'General',
                    worker: job.workerName || (job.workerId === 'auto-assign' ? 'Assigning...' : 'Worker assigned'),
                    workerId: job.workerId,
                    workerPhone: job.workerPhone || '',
                    date: job.date || job.scheduledTime?.split('T')[0] || 'TBD',
                    time: job.time || '09:00 AM',
                    status: job.status ? (job.status.charAt(0).toUpperCase() + job.status.slice(1)) : 'Pending',
                    price: job.price || 450,
                    address: job.address
                }));
                // Update LocalStorage cache with real data
                Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
            }
        } catch (err) {
            console.error("Failed to fetch bookings from API:", err);
            // Don't fall back to demo data - show empty state instead
        }

        // Filter Logic
        let filtered = bookings;
        if (filterType === 'active') {
            // treat 'Pending' as active for now
            filtered = bookings.filter(b => ['Active', 'Running', 'On the way', 'Pending'].includes(b.status));
        } else if (filterType === 'completed') {
            filtered = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));
        } else if (filterType === 'scheduled') {
            filtered = bookings.filter(b => ['Confirmed', 'Scheduled'].includes(b.status));
        }

        // ... (Rest of the rendering logic remains mostly the same, just need to ensure variables match)

        // We need to re-include the rendering part since we replaced the start of the function
        // Copying the rendering logic from the original file to ensure it matches

        const getServiceStyle = (service) => {
            service = service.toLowerCase();
            if (service.includes('clean')) return { icon: 'fa-broom', color: '#00d2ff' };
            if (service.includes('plumb')) return { icon: 'fa-faucet', color: '#00ff9d' };
            if (service.includes('electric') || service.includes('ac') || service.includes('appliance')) return { icon: 'fa-bolt', color: '#ff9d00' };
            if (service.includes('paint') || service.includes('design')) return { icon: 'fa-paint-roller', color: '#ff00ff' };
            if (service.includes('salon') || service.includes('massage') || service.includes('yoga')) return { icon: 'fa-spa', color: '#ff0055' };
            if (service.includes('garden')) return { icon: 'fa-seedling', color: '#00ff00' };
            if (service.includes('move')) return { icon: 'fa-truck-moving', color: '#ffcc00' };
            return { icon: 'fa-tools', color: '#ffffff' };
        };

        const getStatusBadge = (status) => {
            const s = status ? status.toLowerCase() : '';
            if (['active', 'running', 'on the way', 'in_progress'].includes(s)) return `<span style="background: rgba(0, 210, 255, 0.15); color: #00d2ff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00d2ff; display:flex; align-items:center; gap:6px; font-weight: 700; letter-spacing: 0.5px;"><span style="width:8px; height:8px; background:#00d2ff; border-radius:50%; box-shadow: 0 0 5px #00d2ff; animation: pulse 2s infinite;"></span> ${s.toUpperCase()}</span>`;
            if (s === 'completed') return `<span style="background: rgba(57, 255, 20, 0.15); color: #00ff9d; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00ff9d; font-weight: 700; letter-spacing: 0.5px;">COMPLETED</span>`;
            if (s === 'cancelled' || s === 'declined') return `<span style="background: rgba(255, 59, 48, 0.15); color: #ff3b30; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #ff3b30; font-weight: 700; letter-spacing: 0.5px;">CANCELLED</span>`;
            if (s === 'pending') return `<span style="background: rgba(255, 165, 0, 0.15); color: #ffa500; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #ffa500; font-weight: 700; letter-spacing: 0.5px;">PENDING</span>`;
            return `<span style="background: rgba(255, 255, 255, 0.1); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem;">${status}</span>`;
        };

        const tabsHtml = `
           <div class="booking-tabs" style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 5px; overflow-x: auto;">
               <button class="filter-tab ${filterType === 'all' ? 'active' : ''}" onclick="window.filterBookings('all')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'all' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'all' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">ALL</button>
               <button class="filter-tab ${filterType === 'active' ? 'active' : ''}" onclick="window.filterBookings('active')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'active' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'active' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">IN PROGRESS</button>
               <button class="filter-tab ${filterType === 'completed' ? 'active' : ''}" onclick="window.filterBookings('completed')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'completed' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'completed' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">COMPLETED</button>
               <button class="filter-tab ${filterType === 'scheduled' ? 'active' : ''}" onclick="window.filterBookings('scheduled')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'scheduled' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'scheduled' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">SCHEDULED</button>
           </div>
       `;

        const cardsHtml = filtered.length > 0 ? filtered.map(b => {
            const style = getServiceStyle(b.service || b.serviceType || 'tools');
            const isLive = ['active', 'running', 'on the way', 'in_progress'].includes(b.status ? b.status.toLowerCase() : '');
            const isCancelled = b.status === 'cancelled' || b.status === 'cancelled';

            const serviceName = (b.service || b.serviceType || 'Service').toUpperCase();
            const workerName = b.worker || b.workerName || 'Assigning soon...';
            const dateVal = b.date || b.scheduledTime?.split('T')[0] || 'TBD';
            const timeVal = b.time || 'TBD';
            const priceVal = b.price || 350;

            const chatAction = isCancelled ? 'onclick="alert(\'Cannot chat on cancelled bookings.\')"' : `onclick="window.location.href='/chat/chat?bookingId=${b.id}&receiverName=${encodeURIComponent(workerName)}&receiverId=${b.workerId || ''}'"`;
            const callAction = isCancelled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'onclick="alert(\'Calling professional...\')"';

            const trackStyle = isLive
                ? 'background: var(--neon-blue); color: #fff; border:none; box-shadow: 0 0 10px rgba(0, 210, 255, 0.4); cursor: pointer;'
                : 'background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed;';
            const trackAction = isLive ? `onclick="window.openTracking('${b.id}')"` : 'disabled';

            return `
           <div class="booking-card" style="background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%); padding: 0; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; transition: transform 0.3s ease; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="height: 60px; background: linear-gradient(to right, ${style.color}33, transparent); border-left: 4px solid ${style.color}; display: flex; align-items: center; padding: 0 1.5rem;">
                   <div style="width: 36px; height: 36px; background: ${style.color}22; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${style.color}; margin-right: 1rem; border: 1px solid ${style.color}44;">
                       <i class="fas ${style.icon}"></i>
                   </div>
                   <span style="font-weight: 700; font-size: 1.1rem; color: #fff; letter-spacing: 0.5px;">${serviceName}</span>
                </div>
   
                <div style="padding: 1.5rem;">
                   <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 0.25rem; letter-spacing: 1px;">PROFESSIONAL</p>
                            <p style="font-weight: 600; font-size: 1.05rem;">${workerName}</p>
                       </div>
                       ${getStatusBadge(b.status)}
                   </div>
   
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">DATE</p>
                            <p style="font-size: 0.95rem; font-weight: 600;">${dateVal}</p>
                       </div>
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">TIME</p>
                            <p style="font-size: 0.95rem; font-weight: 600;">${timeVal}</p>
                       </div>
                   </div>
   
                   <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="font-weight: 800; font-size: 1.2rem; color: #fff;">₹${priceVal}</span>
                   </div>
                   
                   <div style="display: flex; gap: 0.8rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                       <button class="btn btn-sm" ${callAction} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-phone-alt" style="color:var(--neon-green)"></i> Call
                       </button>
                       <button class="btn btn-sm" ${chatAction} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-comment-dots" style="color:var(--neon-blue)"></i> Chat
                       </button>
                       <button class="btn btn-sm" ${trackAction} style="flex:1; ${trackStyle} border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-map-marker-alt"></i> Track
                       </button>
                   </div>
   
                </div>
           </div>`
        }).join('') : `
           <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
               <i class="far fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
               <p>No ${filterType !== 'all' ? filterType : ''} bookings available.</p>
           </div>
       `;

        grid.innerHTML = `
           ${tabsHtml}
           <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
               ${cardsHtml}
           </div>
       `;

    } catch (error) {
        console.error('Error fetching bookings:', error);
        grid.innerHTML = '<p class="text-error">Failed to load bookings.</p>';
    }
}

window.filterBookings = function (type) {
    renderBookingsGrid(type);
};

window.openTracking = function (id) {
    // Open the new live tracking page
    window.location.href = `../tracking/live-customer.html?bookingId=${id}`;
};

async function renderWallet() {
    const container = getEl('wallet-container');
    if (!container) return;

    const user = Storage.get(STORAGE_KEYS.USER) || {};
    let balance = 0;
    let transactions = [];

    try {
        const balData = await API.payments.getBalance(user.uid);
        if (balData.success) balance = balData.balance;

        const transactionsData = await API.transactions.getByUser(user.uid);
        transactions = transactionsData; // Backend returns array directly for this endpoint
    } catch (e) {
        console.error('Wallet data fetch failed:', e);
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <!-- Balance Card -->
            <div class="stat-card" style="background: linear-gradient(135deg, var(--bg-dark-600), var(--bg-dark-800)); border-color: var(--neon-blue); position: relative; overflow: hidden;">
                <p class="text-muted" style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Available Balance</p>
                <h1 style="font-size: 3rem; margin: 1rem 0;">₹${balance.toFixed(2)}</h1>
                <p style="color: var(--neon-green); font-size: 0.9rem; margin-bottom: 1.5rem;"><i class="fas fa-gift"></i> ${user.reward_points || 0} Reward Points Available</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <a href="../wallet/add-money.html" class="btn btn-primary btn-sm" style="text-decoration:none;">Add Money</a>
                    <a href="../wallet/add-money-demo.html" class="btn btn-secondary btn-sm" style="text-decoration:none;">Demo Top-up</a>
                    <button class="btn btn-ghost btn-sm" onclick="showToast('Withdraw feature coming soon!')">Withdraw</button>
                </div>
            </div>

            <!-- Saved Cards -->
            <div class="stat-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Your Cards</h3>
                    <button class="btn btn-ghost btn-sm" style="color: var(--neon-blue);">+ Add New</button>
                </div>
                <div style="background: linear-gradient(135deg, #1e264a, #0a0b14); border-radius: 20px; padding: 2rem; color: #fff; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Card Glow Effect -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%); pointer-events: none;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.6rem; letter-spacing: 2px; color: rgba(255,255,255,0.5);">BlueBridge PRIVILEGE</span>
                            <div style="width: 45px; height: 35px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; margin-top: 10px; position: relative;">
                                <div style="position: absolute; top: 10%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 30%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 50%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                            </div>
                        </div>
                        <i class="fab fa-cc-visa" style="font-size: 2.5rem; opacity: 0.9;"></i>
                    </div>
                    
                    <p style="font-size: 1.5rem; font-family: 'Courier New', monospace; letter-spacing: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 1.5rem;">•••• •••• •••• 4242</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">CARD HOLDER</p>
                            <p style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase;">${(user.name || 'USER')}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">EXPIRES</p>
                            <p style="font-weight: 600; font-size: 0.9rem;">12/25</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Recent Transactions</h3>
            <div style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Plumbing Service - BK-1102</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 15, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹350.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Wallet Top-up</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 10, 2023 • Added via UPI</p>
                    </div>
                    <p style="color: var(--neon-green); font-weight: 800;">+₹1,500.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0;">
                    <div>
                        <p style="font-weight: 600;">Mechanic Service - BK-1050</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Oct 28, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹600.00</p>
                </div>
            </div>
        </div>
    `;
}

window.removeProfilePic = function () {
    if (confirm('Remove profile picture?')) {
        const user = Storage.get(STORAGE_KEYS.USER) || {};
        delete user.profilePic;
        Storage.set(STORAGE_KEYS.USER, user);

        // Update Sidebar Avatar immediately
        const sidebarAvatar = document.getElementById('user-avatar-img');
        const sidebarInitials = document.getElementById('user-avatar-initials');
        if (sidebarAvatar && sidebarInitials) {
            sidebarAvatar.style.display = 'none';
            sidebarInitials.style.display = 'flex';
        }

        renderProfile();
        showToast('Profile picture removed.');
    }
};

async function renderProfile() {
    const container = getEl('profile-layout');
    if (!container) return;

    let user = Storage.get(STORAGE_KEYS.USER) || {};

    // 1. Fetch Fresh Data (if online)
    if (user.uid) {
        try {
            // Show loading opacity or indicator if needed, but for now we'll just update in place
            const freshProfile = await API.auth.getProfile(user.uid);

            if (freshProfile) {
                // Merge data
                user = { ...user, ...freshProfile };

                // Normalization: Ensure profilePic exists if photoURL is present
                if (freshProfile.photoURL) user.profilePic = freshProfile.photoURL;
                if (freshProfile.profile_pic) user.profilePic = freshProfile.profile_pic;

                // Normalization: Address
                // If backend returns address as string, we might need to objectify it for the UI fields
                // OR adapt the UI to show the string.
                if (typeof freshProfile.address === 'string') {
                    // Temporarily store it as a 'fullAddress' string if it's not an object
                    if (!user.address || typeof user.address !== 'object') {
                        user.address = {
                            house: freshProfile.address, // Put full string here for now
                            landmark: '',
                            city: freshProfile.location || '',
                            pincode: freshProfile.pincode || ''
                        };
                    }
                }

                // Normalization: Joined Date
                if (freshProfile.createdAt || freshProfile.metadata?.creationTime) {
                    const d = new Date(freshProfile.createdAt || freshProfile.metadata?.creationTime);
                    user.joinedDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }

                Storage.set(STORAGE_KEYS.USER, user);
                // Update header info too
                updateUIWithUserData(user);
            }
        } catch (e) {
            console.warn('Background profile fetch failed, using cached data:', e);
        }
    }

    // Profile Pic Logic
    let avatarSrc = user.profilePic || user.profile_pic || '';
    let avatarContent = avatarSrc
        ? `<img src="${avatarSrc}" onerror="this.src='../../assets/images/default-avatar.png'" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--neon-blue);">`
        : `<div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">${user.name ? user.name[0] : 'U'}</div>`;

    container.innerHTML = `
        <div class="stat-card" style="max-width: 900px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <!-- Avatar Section -->
                <div style="position: relative; width: 100px; height: 100px; cursor: pointer; flex-shrink: 0;" onclick="document.getElementById('profile-upload-main').click()">
                    ${avatarContent}
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--neon-green); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1a1a1a; z-index: 10;">
                        <i class="fas fa-camera" style="font-size: 12px; color: #000;"></i>
                    </div>
                </div>
                <input type="file" id="profile-upload-main" hidden accept="image/*">

                <!-- Name Section -->
                <div style="flex: 1;">
                    <h2 style="margin: 0; font-size: 1.8rem;">${user.name || 'User Name'}</h2>
                    <p class="text-muted" style="margin: 0.25rem 0 0;">Customer Account • ${user.reward_points || 0} Reward Points</p>
                    ${user.profilePic ? `<button onclick="removeProfilePic()" class="btn btn-sm btn-ghost" style="color: var(--neon-pink); margin-top: 0.5rem; padding: 0; font-size: 0.8rem;"><i class="fas fa-trash-alt"></i> Remove Photo</button>` : ''}
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <label class="text-muted" style="font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">BIO / ABOUT YOU</label>
                <textarea id="edit-bio" disabled style="width: 100%; min-height: 80px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 8px; color: #fff; padding: 10px; font-size: 0.95rem; resize: vertical; outline: none;">${user.bio || 'Tell us a bit about yourself...'}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">FULL NAME</label>
                    <input type="text" id="edit-name" value="${user.name || ''}" disabled 
                        style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">EMAIL ADDRESS</label>
                    <input type="email" id="edit-email" value="${user.email || ''}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PHONE NUMBER</label>
                    <input type="tel" id="edit-phone" value="${user.phone || ''}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">MEMBER SINCE</label>
                    <input type="text" id="edit-joined" value="${user.createdAt ? formatDate(user.createdAt) : 'Member'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <h3 style="margin-top: 2rem; margin-bottom: 1.5rem;">Address Info</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">ADDRESS / FLAT NO.</label>
                    <input type="text" id="edit-house" value="${user.address?.house || user.address || ''}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">LANDMARK</label>
                    <input type="text" id="edit-landmark" value="${user.address?.landmark || ''}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">CITY / STATE</label>
                    <input type="text" id="edit-city" value="${user.address?.city || user.location || ''}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PINCODE</label>
                    <input type="text" id="edit-pincode" value="${user.address?.pincode || user.pincode || ''}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <div style="margin-top: 2.5rem; text-align: right;">
                <button id="edit-profile-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">Edit Account Info</button>
            </div>
        </div>
    `;

    // Attach Listeners
    getEl('edit-profile-btn').addEventListener('click', handleProfileEditToggle);
}



function renderSupport() {
    const container = getEl('support-grid');
    if (!container) return;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-phone-alt" style="font-size: 2rem; color: var(--neon-blue); margin-bottom: 1rem;"></i>
                <h4>Call Support</h4>
                <p class="text-muted">24/7 Helpline available</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-comment-dots" style="font-size: 2rem; color: var(--neon-purple); margin-bottom: 1rem;"></i>
                <h4>Chat with Us</h4>
                <p class="text-muted">Wait time: ~2 mins</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-envelope" style="font-size: 2rem; color: var(--neon-orange); margin-bottom: 1rem;"></i>
                <h4>Email Support</h4>
                <p class="text-muted">Response in 24 hours</p>
            </div>
        </div>
        
        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Frequently Asked Questions</h3>
            <div style="margin-top: 1rem;">
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">How do I cancel a booking?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">You can cancel a booking from the 'My Bookings' tab or direct tracks on the overview page before the worker starts the job.</p>
                </details>
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">Is my payment secure?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Yes, BlueBridge uses industry-standard encryption for all transactions and supports secure wallet payments.</p>
                </details>
            </div>
        </div>
    `;
}

// --- AI Chat Logic (Gemini API Multimodal) ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

let currentAttachment = null; // { data: base64, mime: string }
let recognition = null;

function setupMultimodalListeners() {
    // Attach Button
    getEl('chat-attach-btn')?.addEventListener('click', () => getEl('chat-file-input').click());

    // File Input
    getEl('chat-file-input')?.addEventListener('change', handleFileSelect);

    // Mic Button
    getEl('chat-mic-btn')?.addEventListener('click', toggleVoiceInput);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size too large. Max 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        currentAttachment = {
            data: base64Data,
            mime: file.type
        };
        showFilePreview(file, event.target.result);
    };
    reader.readAsDataURL(file);
}

function showFilePreview(file, src) {
    const container = getEl('chat-file-preview');
    container.style.display = 'block';

    let previewHtml = '';
    if (file.type.startsWith('image/')) {
        previewHtml = `<img src="${src}" alt="preview">`;
    } else {
        previewHtml = `<div style="display:flex;align-items:center;gap:0.5rem;color:#fff;"><i class="fas fa-file-pdf"></i> <span>${file.name}</span></div>`;
    }

    container.innerHTML = `
        <div class="preview-item">
            ${previewHtml}
            <button class="preview-remove" onclick="removeAttachment()">×</button>
        </div>
    `;
}

function removeAttachment() {
    currentAttachment = null;
    getEl('chat-file-input').value = '';
    getEl('chat-file-preview').style.display = 'none';
    getEl('chat-file-preview').innerHTML = '';
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input is not supported in this browser.');
        return;
    }

    const btn = getEl('chat-mic-btn');

    if (recognition && btn.classList.contains('mic-active')) {
        recognition.stop();
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        btn.classList.add('mic-active');
    };

    recognition.onend = () => {
        btn.classList.remove('mic-active');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = getEl('ai-popup-input');
        input.value = (input.value + ' ' + transcript).trim();
        input.focus();
    };

    recognition.start();
}

function toggleChatPopup() {
    const popup = getEl('ai-chat-popup');
    if (popup) {
        popup.classList.toggle('active');
        if (popup.classList.contains('active')) {
            setTimeout(() => getEl('ai-popup-input')?.focus(), 300);
            if (!getEl('chat-file-input').hasAttribute('listening')) {
                setupMultimodalListeners();
                getEl('chat-file-input').setAttribute('listening', 'true');
            }
        }
    }
}

// Chat History State
let chatHistory = [];

async function handleAIMessage() {
    try {
        console.log('handleAIMessage triggered');
        const aiInput = getEl('ai-popup-input');

        if (!aiInput) {
            alert('Error: Chat input element not found!');
            return;
        }

        const query = aiInput.value.trim();

        // Allow sending just file without text (use default prompt)
        if (!query && !currentAttachment) return;

        // Append User Message with attachment
        let displayMsg = query;
        let attachmentToSend = null; // Hold ref before clearing

        if (currentAttachment) {
            attachmentToSend = currentAttachment; // Keep reference

            if (currentAttachment.mime.startsWith('image/')) {
                // Image Display
                const imgSrc = `data:${currentAttachment.mime};base64,${currentAttachment.data}`;
                displayMsg += `<br><img src="${imgSrc}" class="chat-uploaded-image" alt="Uploaded Image">`;
            } else {
                // File Display
                displayMsg += `
                    <div class="chat-file-card">
                        <i class="fas fa-file-alt"></i>
                        <span>Attached File</span>
                    </div>`;
            }
        }

        appendChatMessage('user', displayMsg);
        aiInput.value = '';

        // Handle Attachment (Text-only backend warning logic preserved but simplified)
        if (attachmentToSend) {
            appendChatMessage('ai', "I received your file. Analyzing...");
        }
        removeAttachment();

        // Only call backend if there is text to process
        if (query) {
            // Show typing indicator
            const typingId = showTypingIndicator();

            try {
                // Prepare payload for Backend API
                const payload = {
                    message: query,
                    previousHistory: chatHistory,
                    workerContext: { type: 'platform_assistant' } // Special context for General Assistant
                };

                const response = await API.chat.send(payload);
                removeTypingIndicator(typingId);

                const replyText = response.reply;
                appendChatMessage('ai', replyText);

                // Update History
                chatHistory.push(
                    { role: "user", parts: [{ text: query }] },
                    { role: "model", parts: [{ text: replyText }] }
                );

            } catch (error) {
                console.error('AI Chat Error:', error);
                removeTypingIndicator(typingId);
                appendChatMessage('ai', `⚠️ Error: ${error.message || 'Failed to connect to assistant'}.`);
            }
        }
    } catch (criticalError) {
        alert('Critical Chat Error: ' + criticalError.message);
        console.error(criticalError);
    }
}

// --- Multi-step Booking Page ---
function openBookingPage(serviceType, workerId = null) {
    console.log('openBookingPage called with:', { serviceType, workerId });

    // Save selection and redirect to dedicated booking page
    Storage.set('BlueBridge_selected_service', serviceType);
    console.log('Saved service to storage:', serviceType);

    if (workerId) {
        Storage.set('BlueBridge_selected_worker_id', workerId);
        console.log('Saved worker ID to storage:', workerId);
    } else {
        Storage.remove('BlueBridge_selected_worker_id');
    }

    console.log('Redirecting to booking page...');
    window.location.href = '/booking';
}
// Expose to window for inline HTML access
window.openBookingPage = openBookingPage;

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const bookingRef = doc(db, 'jobs', bookingId);
        await updateDoc(bookingRef, { status: 'cancelled' });
        showToast('Booking cancelled successfully.');
        // Listener will update UI automatically
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showToast('Failed to cancel booking.');
    }
}
window.cancelBooking = cancelBooking;

function openTracking(bookingId) {
    if (!bookingId) return;
    window.location.href = `/pages/tracking/track.html?bookingId=${bookingId}`;
}
window.openTracking = openTracking;

// --- Profile Edit Logic ---
async function handleProfileEditToggle() {
    const btn = getEl('edit-profile-btn');
    const inputs = [
        'edit-name', 'edit-email', 'edit-phone', 'edit-joined',
        'edit-house', 'edit-landmark', 'edit-city', 'edit-pincode',
        'edit-bio'
    ];

    if (btn.textContent.includes('Edit')) {
        // Switch to Edit Mode
        inputs.forEach(id => {
            const el = getEl(id);
            if (el) {
                el.disabled = false;
                el.style.borderBottom = '1px solid var(--neon-blue)';
            }
        });
        btn.textContent = 'Save Changes';
        btn.style.backgroundColor = 'var(--neon-green)';
        btn.style.color = '#000';
    } else {
        // Save Changes
        const btn = getEl('edit-profile-btn'); // Re-select to be safe
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const user = Storage.get(STORAGE_KEYS.USER) || {};

        // Prepare Update Data
        const updates = {
            name: getEl('edit-name').value,
            phone: getEl('edit-phone').value,
            address: {
                house: getEl('edit-house').value,
                landmark: getEl('edit-landmark').value,
                city: getEl('edit-city').value,
                pincode: getEl('edit-pincode').value
            },
            bio: getEl('edit-bio').value
        };

        try {
            // Check if we have a UID to update
            let updatedUser = { ...user };
            if (user.uid) {
                const response = await API.auth.updateProfile(user.uid, updates);
                if (response && response.user) {
                    // Use the specific user data returned from the server
                    updatedUser = { ...user, ...response.user };
                } else {
                    // Fallback to local merge if server didn't return user data
                    updatedUser = { ...user, ...updates };
                }
            } else {
                updatedUser = { ...user, ...updates };
            }

            // Update Local Storage with new values
            Storage.set(STORAGE_KEYS.USER, updatedUser);

            // Update UI (Header Name, etc.)
            const headerName = getEl('welcome-name');
            if (headerName) headerName.textContent = updatedUser.name.split(' ')[0];

            // Sidebar Name
            const sidebarName = getEl('user-display-name');
            if (sidebarName) sidebarName.textContent = updatedUser.name;

            // Re-render Profile to reflect changes (Important: Await since it's now async)
            await renderProfile();

            // Switch back to "Edit" View
            const inputIds = [
                'edit-name', 'edit-email', 'edit-phone', 'edit-joined',
                'edit-house', 'edit-landmark', 'edit-city', 'edit-pincode',
                'edit-bio'
            ];
            inputIds.forEach(id => {
                const el = getEl(id);
                if (el) {
                    el.disabled = true;
                    el.style.borderBottom = 'none';
                }
            });

            btn.textContent = 'Edit Profile';
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = '#fff';
            btn.disabled = false;

            showToast('Profile updated successfully!');

        } catch (error) {
            console.error('Profile Update Failed:', error);
            showToast('Failed to save profile changes. Please try again.', 'error');
            btn.textContent = 'Save Changes';
            btn.disabled = false;
        }
    }
}

// Run on load
// Only initialize if we are on the dashboard page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ai-chat-popup')) {
        init();
    }
});

// --- Nearby Workers Map Feature ---
let nearbyMap = null;
let mapMarkers = [];
let customerMarker = null;
let customerLocation = { lat: 19.0760, lng: 72.8777 }; // Default: Mumbai

// Get customer's current location
function getCustomerLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    customerLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Customer location obtained:', customerLocation);
                    resolve(customerLocation);
                },
                (error) => {
                    console.warn('Geolocation error:', error.message, '- Using default location');
                    resolve(customerLocation);
                },
                { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
            );
        } else {
            console.warn('Geolocation not supported - Using default location');
            resolve(customerLocation);
        }
    });
}

async function renderNearbyWorkers(category = 'all') {
    const listContainer = getEl('nearby-workers-list');
    if (!listContainer) {
        console.error('nearby-workers-list element not found!');
        return;
    }

    // STYLING: Enforce horizontal scrolling layout
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.overflowX = 'auto';
    listContainer.style.gap = '1rem';
    listContainer.style.padding = '0.5rem';
    listContainer.style.scrollBehavior = 'smooth';
    listContainer.style.scrollbarWidth = 'thin'; // Firefox

    // Initial loading state
    listContainer.innerHTML = '<div style="color: #aaa; text-align: center; padding: 2rem; width: 100%;"><i class="fas fa-spinner fa-spin"></i> Loading professionals...</div>';

    try {
        // Get customer location first
        await getCustomerLocation();
        console.log('Customer location:', customerLocation);

        // Build filters - simplified to match backend
        const filters = {};

        if (category !== 'all') {
            filters.category = category;
        }

        console.log('Fetching workers with filters:', filters);
        const workers = await API.workers.getAll(filters);
        console.log(`API returned ${workers.length} workers:`, workers);

        if (workers.length === 0) {
            listContainer.innerHTML = '<div style="color: #aaa; text-align: center; padding: 2rem; width: 100%;"><i class="fas fa-user-slash"></i><br><br>No workers found in this category.</div>';
            // Still initialize map with customer location
            setTimeout(() => initNearbyMap([]), 100);
            return;
        }

        listContainer.innerHTML = workers.map(w => {
            const name = w.name || 'Unknown Worker';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const skill = (w.category || 'General').charAt(0).toUpperCase() + (w.category || 'General').slice(1);
            const rating = w.rating_avg || 4.5;
            const totalJobs = w.stats?.total_jobs || w.total_jobs || 0;
            const price = w.base_price || 350;
            const isTrackable = !!w.location;
            const distance = w.distance ? `${w.distance.toFixed(1)} km away` : '';
            const isOnline = w.is_online !== false;

            return `
                <div class="nearby-worker-card ${!isOnline ? 'offline' : ''}" onclick="window.focusOnWorker('${w.uid}')" style="min-width: 300px; max-width: 320px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; cursor: pointer; transition: transform 0.2s; display: flex; gap: 1rem; align-items: flex-start;">
                    <div class="card-avatar-wrapper" style="position: relative;">
                        <div class="card-avatar" style="width: 50px; height: 50px; background: var(--neon-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000;">${initials}</div>
                        ${isOnline ? '<div class="online-indicator" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: var(--neon-green); border-radius: 50%; border: 2px solid #1a1a1a;"></div>' : ''}
                    </div>
                    <div class="card-info" style="flex: 1;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 class="worker-name" style="margin: 0; font-size: 1rem; color: #fff;">${name}</h4>
                            <div class="worker-price" style="color: var(--neon-green); font-weight: 700;">₹${price}<span>/hr</span></div>
                        </div>
                        <div class="worker-meta" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                            <span><i class="fas fa-briefcase"></i> ${skill}</span>
                            <span style="margin: 0 4px;">•</span>
                            <span><i class="fas fa-star" style="color: var(--neon-orange);"></i> ${rating.toFixed(1)}</span>
                            <span>(${totalJobs}+ jobs)</span>
                        </div>
                        ${distance ? `<div class="worker-distance" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fas fa-location-arrow"></i> ${distance}</div>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <div class="tracking-status ${isTrackable ? 'tracking-live' : 'tracking-unavailable'}" style="font-size: 0.75rem; color: ${isTrackable ? 'var(--neon-blue)' : 'var(--text-muted)'};">
                                <i class="fas ${isTrackable ? 'fa-map-marker-alt' : 'fa-map-marker-slash'}"></i>
                                ${isTrackable ? 'Live Location' : 'Tracking Unavailable'}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--neon-blue); font-weight: 600;">
                                <i class="fas fa-briefcase"></i> ${skill}
                            </div>
                        </div>
                        <div class="card-actions" style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.showWorkerProfileInDashboard('${w.uid}')" style="flex: 1; padding: 0.4rem; font-size: 0.8rem;"><i class="fas fa-info-circle"></i> Details</button>
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); window.openBookingPage('${w.category}')" style="flex: 1; padding: 0.4rem; font-size: 0.8rem;"><i class="fas fa-calendar-check"></i> Book</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update map with workers and customer location
        setTimeout(() => initNearbyMap(workers.map(w => ({
            id: w.uid,
            name: w.name,
            category: w.category,
            rating: w.rating_avg || 4.5,
            lat: w.location?.lat,
            lng: w.location?.lng,
            price: w.base_price || 350,
            isOnline: w.is_online !== false
        })).filter(w => w.lat && w.lng)), 100);

        // Subscribe to real-time updates for all workers
        if (typeof subscribeToWorkerUpdates === 'function') {
            const workerIds = workers.map(w => w.uid).filter(uid => uid);
            subscribeToWorkerUpdates(workerIds, filters);
        }

    } catch (error) {
        console.error('Error loading nearby workers:', error);
        listContainer.innerHTML = '<div style="color: #ff4444; text-align: center; padding: 2rem;"><i class="fas fa-exclamation-triangle"></i><br><br>Failed to load workers. Please try again.</div>';
    }

    // One-time setup for controls
    if (!window.mapControlsInitialized) {
        getEl('worker-category-filter')?.addEventListener('change', (e) => {
            renderNearbyWorkers(e.target.value);
        });
        getEl('refresh-map')?.addEventListener('click', () => {
            renderNearbyWorkers(getEl('worker-category-filter').value);
        });
        window.mapControlsInitialized = true;
    }
}

function getCategoryColor(category) {
    const colors = {
        'plumber': '#00d2ff',
        'plumbing': '#00d2ff',
        'electrician': '#ff9d00',
        'electrical': '#ff9d00',
        'carpenter': '#8b4513',
        'painter': '#9d50bb',
        'painting': '#9d50bb',
        'cleaning': '#39ff14',
        'cleaner': '#39ff14',
        'mechanic': '#f00b47'
    };
    return colors[category?.toLowerCase()] || '#00d2ff';
}

function initNearbyMap(workers) {
    const mapEl = getEl('nearby-map');

    // Debug logging
    console.log('🗺️ initNearbyMap called with', workers.length, 'workers');
    console.log('Map element exists:', !!mapEl);
    console.log('Leaflet loaded:', typeof L !== 'undefined');

    if (!mapEl) {
        console.error('❌ Map container #nearby-map not found!');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('❌ Leaflet library not loaded!');
        return;
    }

    // Initialize map if not exists
    if (!nearbyMap) {
        try {
            console.log('Creating new Leaflet map...');
            nearbyMap = L.map('nearby-map', {
                zoomControl: true,
                scrollWheelZoom: true
            }).setView([customerLocation.lat, customerLocation.lng], 13);

            console.log('✅ Map created, adding tile layer...');

            // Dark theme tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19,
                minZoom: 10
            }).addTo(nearbyMap);

            console.log('✅ Tile layer added');

            // Add scale control
            L.control.scale({ imperial: false, metric: true }).addTo(nearbyMap);

            // Add custom recenter button
            const recenterControl = L.Control.extend({
                options: { position: 'topright' },
                onAdd: function () {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    container.innerHTML = '<a href="#" title="Center on my location" style="background: rgba(15, 23, 42, 0.9); color: var(--neon-green); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; text-decoration: none; border: 1px solid var(--glass-border);"><i class="fas fa-crosshairs"></i></a>';
                    container.onclick = (e) => {
                        e.preventDefault();
                        if (customerMarker && nearbyMap) {
                            nearbyMap.setView(customerMarker.getLatLng(), 14);
                            customerMarker.openPopup();
                        }
                    };
                    return container;
                }
            });
            nearbyMap.addControl(new recenterControl());

            console.log('✅ Map fully initialized');
        } catch (error) {
            console.error('❌ Error creating map:', error);
            return;
        }
    }

    // Clear existing markers
    mapMarkers.forEach(m => nearbyMap.removeLayer(m));
    mapMarkers = [];

    // Add customer location marker (green)
    if (customerMarker) {
        nearbyMap.removeLayer(customerMarker);
    }

    console.log('Adding customer marker at:', customerLocation);

    const customerIcon = L.divIcon({
        className: 'customer-marker-icon',
        html: `<div style="position: relative;">
            <div style="background: var(--neon-green); width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px var(--neon-green), 0 0 10px rgba(57, 255, 20, 0.5);"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #000; border-radius: 50%;"></div>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    customerMarker = L.marker([customerLocation.lat, customerLocation.lng], {
        icon: customerIcon,
        zIndexOffset: 1000
    }).addTo(nearbyMap);

    customerMarker.bindPopup(`
        <div style="background: #1a1a1a; color: #fff; padding: 12px; border-radius: 8px; font-family: 'Inter', sans-serif; min-width: 150px;">
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--neon-green);"><i class="fas fa-map-marker-alt"></i> Your Location</h4>
            <p style="margin: 0; font-size: 0.75rem; color: #aaa;">Searching for workers nearby...</p>
        </div>
    `, { className: 'dark-popup' });

    console.log('✅ Customer marker added');

    // Add worker markers
    console.log('Adding', workers.length, 'worker markers...');
    let addedMarkers = 0;

    workers.forEach(w => {
        if (!w.lat || !w.lng) {
            console.warn('Skipping worker without location:', w.name);
            return;
        }

        const categoryColor = getCategoryColor(w.category);
        const initials = (w.name || 'W').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const workerIcon = L.divIcon({
            className: 'worker-marker-icon',
            html: `<div style="position: relative;">
                <div style="background: ${categoryColor}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 15px ${categoryColor}80; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; color: #000;">
                    ${initials}
                </div>
                ${w.isOnline ? `<div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: var(--neon-green); border: 2px solid #fff; border-radius: 50%;"></div>` : ''}
            </div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -21]
        });

        const marker = L.marker([w.lat, w.lng], { icon: workerIcon }).addTo(nearbyMap);
        marker.bindPopup(`
            <div style="background: linear-gradient(145deg, #1a1a1a, #0a0b14); color: #fff; padding: 15px; border-radius: 12px; font-family: 'Inter', sans-serif; min-width: 200px; border: 1px solid ${categoryColor}40;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: ${categoryColor}20; border: 2px solid ${categoryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: ${categoryColor};">
                        ${initials}
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${w.name}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: ${categoryColor}; text-transform: uppercase; font-weight: 600;">${w.category}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-size: 0.75rem; color: #aaa;"><i class="fas fa-star" style="color: var(--neon-orange);"></i> ${w.rating.toFixed(1)}</span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--neon-green);">₹${w.price}/hr</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <button onclick="event.stopPropagation(); window.showWorkerProfileInDashboard('${w.id}')" style="background: rgba(255,255,255,0.1); border: 1px solid ${categoryColor}40; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600; font-size: 0.7rem; transition: all 0.2s;"><i class="fas fa-user"></i> Profile</button>
                    <button onclick="event.stopPropagation(); window.openBookingPage('${w.category}')" style="background: ${categoryColor}; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #000; font-weight: 700; font-size: 0.7rem; transition: all 0.2s;"><i class="fas fa-calendar-check"></i> Book</button>
                </div>
            </div>
        `, { className: 'dark-popup', maxWidth: 250 });

        marker.workerId = w.id;
        mapMarkers.push(marker);
        addedMarkers++;
    });

    console.log(`✅ Added ${addedMarkers} worker markers to map`);

    // Fit bounds to show all markers including customer
    if (workers.length > 0) {
        const allMarkers = [...mapMarkers, customerMarker];
        const group = new L.featureGroup(allMarkers);
        nearbyMap.fitBounds(group.getBounds().pad(0.1));
        console.log('✅ Map bounds fitted');
    } else {
        // Just center on customer if no workers
        nearbyMap.setView([customerLocation.lat, customerLocation.lng], 13);
        console.log('✅ Map centered on customer (no workers)');
    }

    // Invalidate size to fix display issues
    setTimeout(() => {
        nearbyMap.invalidateSize();
        console.log('✅ Map size invalidated');
    }, 100);
}

window.focusOnWorker = (workerId) => {
    const marker = mapMarkers.find(m => m.workerId === workerId);
    if (marker && nearbyMap) {
        nearbyMap.setView(marker.getLatLng(), 16, { animate: true, duration: 0.5 });
        setTimeout(() => marker.openPopup(), 300);
    }
};

// --- Chat Helper Functions (Restored) ---
function appendChatMessage(sender, text) {
    const chatBody = getEl('chat-popup-body');
    if (!chatBody) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    msgDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const chatBody = getEl('chat-popup-body');
    if (!chatBody) return null;
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-message';
    msgDiv.id = id;
    msgDiv.innerHTML = `<p><i class="fas fa-ellipsis-h fa-pulse"></i></p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    if (id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

// Ensure handleAIMessage is globally available for inline HTML events
window.handleAIMessage = handleAIMessage;

// loadPage — used by interactive elements to navigate to a service booking
// Maps service name → booking page with pre-selected category
window.loadPage = function (serviceName) {
    // Try to activate the Booking nav tab if it exists
    const bookingNavLink = document.querySelector('.nav-item[data-page="booking"], .nav-link[data-page="booking"]');
    if (bookingNavLink) {
        bookingNavLink.click();
        return;
    }
    // Fallback: navigate to the booking route
    const serviceParam = serviceName ? `?service=${encodeURIComponent(serviceName)}` : '';
    window.location.href = `/booking${serviceParam}`;
};

// Expose rendering functions to window for global access
window.renderOverview = renderOverview;
window.renderBookingsGrid = renderBookingsGrid;
window.renderWallet = renderWallet;
window.renderProfile = renderProfile;
window.renderSupport = renderSupport;
window.renderNearbyWorkers = renderNearbyWorkers;
window.renderSettings = renderSettings;
window.refreshCustomerDashboardData = refreshCustomerDashboardData;
window.handleCalendarDateClick = handleCalendarDateClick;


// --- GLOBAL LOGOUT HANDLER (Failsafe) ---
let isLogoutConfirmOpen = false;

window.performLogout = function (e) {
    if (isLogoutConfirmOpen) return;

    if (e) {
        e.preventDefault?.();
        e.stopPropagation?.();
        e.stopImmediatePropagation?.();
    }

    console.log('[LOGOUT] performLogout triggered');

    const msg = 'Are you sure you want to sign out?';

    // ❌ remove fallback to native confirm
    if (typeof showConfirm !== 'function') {
        console.error('showConfirm is not defined');
        return;
    }

    isLogoutConfirmOpen = true;

    showConfirm(
        msg,
        async () => {
            console.log('[LOGOUT] User confirmed. Cleaning up...');

            try {
                if (auth && typeof auth.signOut === 'function') {
                    await auth.signOut();
                }
            } catch (err) {
                console.warn('[LOGOUT] Firebase signOut error:', err);
            }

            try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('[LOGOUT] Redirecting to home...');
                window.location.href = '/';
            } catch (err) {
                console.error('[LOGOUT] Cleanup error, forcing redirect:', err);
                window.location.href = '/';
            } finally {
                isLogoutConfirmOpen = false;
            }
        },
        () => {
            console.log('[LOGOUT] User cancelled');
            isLogoutConfirmOpen = false;
        }
    );
};

// delegation removed to avoid double-triggers with onclick attribute

init();

console.log('Customer Dashboard System Loaded - Chat Ready');



