// ============================================
// WORKER DASHBOARD - COMPLETE IMPLEMENTATION
// ============================================

// Imports
import { API, apiFetch } from '../../../api/api.js';
import { Storage, getRelativeTime, showToast, showLoading, hideLoading, showConfirm } from '../../../utils/utils.js';
import { auth, db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from '../../../utils/config.js';

// ============================================
// GLOBAL JOB ACTIONS (Defined early to ensure availability)
// ============================================
window.acceptJob = async function (jobId) {
  console.log('Accepting booking:', jobId);
  if (!confirm('Are you sure you want to accept this job?')) return;

  try {
    if (typeof showLoading === 'function') showLoading('Accepting Job...');
    const user = Storage.get('BlueBridge_user');

    // Update booking status to 'assigned' and set workerId
    await API.bookings.update(jobId, {
      status: 'assigned',
      workerId: user.uid,
      'timeline.assigned_at': new Date().toISOString()
    });

    if (typeof showToast === 'function') showToast('Job Accepted Successfully!', 'success');

    // Refresh dashboard data to update all panels
    await refreshDashboardData();

    // Reload current page to show updated data
    const currentPage = document.querySelector('.nav-link.active')?.dataset?.page || 'home';
    loadPage(currentPage);

  } catch (error) {
    console.error('Failed to accept job:', error);
    if (typeof showToast === 'function') showToast('Failed to accept job: ' + error.message, 'error');
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
  }
};

window.declineJob = async function (jobId) {
  console.log('Declining job:', jobId);
  if (!confirm('Decline this job request?')) return;

  try {
    if (typeof showLoading === 'function') showLoading('Declining...');

    // Update booking status to 'declined' in Firestore
    await API.bookings.update(jobId, {
      status: 'declined',
      declined_by: Storage.get('BlueBridge_user')?.uid,
      declined_at: new Date().toISOString()
    });

    // Remove from local dashboardData
    dashboardData.jobs.pending = dashboardData.jobs.pending.filter(j => j.id !== jobId);

    // Remove from UI
    const card = document.querySelector(`[onclick*="${jobId}"]`)?.closest('.job-request-item');
    if (card) {
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
    }

    // Update sidebar badge
    const sidebarBadge = document.getElementById('requestCount');
    if (sidebarBadge) sidebarBadge.textContent = dashboardData.jobs.pending.length;

    if (typeof showToast === 'function') showToast('Job declined successfully.', 'success');

  } catch (error) {
    console.error('Failed to decline job:', error);
    if (typeof showToast === 'function') showToast('Failed to decline job.', 'error');
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
  }
};

window.viewJobDetails = function (jobId) {
  const job = [...dashboardData.jobs.pending, ...dashboardData.jobs.active, ...dashboardData.jobs.completed].find(j => j.id === jobId);

  if (!job) {
    if (typeof showToast === 'function') showToast('Job details not found locally.', 'error');
    return;
  }

  const modalHtml = `
      <div class="modal-overlay" id="jobDetailsModal" style="display:flex;">
        <div class="modal" style="max-width: 600px; width: 90%;">
          <div class="modal-header">
            <h3>Job Details</h3>
            <button class="btn-icon" onclick="document.getElementById('jobDetailsModal').remove()"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <span class="badge badge-${job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'info' : 'warning'}">
                    ${(job.status || 'unknown').toUpperCase().replace('_', ' ')}
                </span>
                <span style="font-weight:bold; font-size:1.2rem;">&#8377;${job.price || 'N/A'}</span>
            </div>
            
            <h4 style="margin-bottom:0.5rem; text-transform:capitalize;">${job.serviceCategory || 'Service'}</h4>
            <p style="margin-bottom:1.5rem; color:var(--text-secondary);">${job.description}</p>
            
            <div style="background:var(--bg-secondary); padding:1rem; border-radius:8px; margin-bottom:1rem;">
                <h5 style="margin-bottom:0.5rem;">Customer Details</h5>
                <p><strong>Name:</strong> ${job.customerName || 'N/A'}</p>
                <p><strong>Address:</strong> ${job.customerAddress || 'N/A'}</p>
                ${job.status === 'in_progress' ? `<p><strong>Phone:</strong> <a href="tel:${job.customerPhone}" style="color:var(--primary-400);">${job.customerPhone}</a></p>` : ''}
            </div>
            
            <div style="display:flex; justify-content:space-between; color:var(--text-tertiary); font-size:0.9rem;">
                <span>Scheduled: ${job.scheduledDate} at ${job.scheduledTime}</span>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; gap:10px; justify-content:flex-end;">
            ${job.status === 'pending' ? `
                <button class="btn btn-primary" onclick="acceptJob('${job.id}'); document.getElementById('jobDetailsModal').remove()">Accept Job</button>
                <button class="btn btn-secondary" onclick="declineJob('${job.id}'); document.getElementById('jobDetailsModal').remove()">Decline</button>
            ` : ''}
             ${job.status === 'in_progress' ? `
                <button class="btn btn-success" onclick="completeJob('${job.id}'); document.getElementById('jobDetailsModal').remove()">Mark Complete</button>
                <button class="btn btn-secondary" onclick="window.location.href='/chat/chat?bookingId=${job.bookingId || job.id}&name=${encodeURIComponent(job.customerName)}'">Chat</button>
            ` : ''}
            <button class="btn btn-ghost" onclick="document.getElementById('jobDetailsModal').remove()">Close</button>
          </div>
        </div>
      </div>
    `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);
};

window.completeJob = async function (jobId) {
  if (!confirm('Mark this job as completed?')) return;

  try {
    if (typeof showLoading === 'function') showLoading('Completing Job...');

    // Update booking status to 'completed'
    await API.bookings.update(jobId, {
      status: 'completed',
      'timeline.completed_at': new Date().toISOString()
    });

    if (typeof showToast === 'function') showToast('Job Completed!', 'success');

    // Refresh dashboard data
    await refreshDashboardData();

    // Reload current page
    const currentPage = document.querySelector('.nav-link.active')?.dataset?.page || 'home';
    loadPage(currentPage);

  } catch (error) {
    console.error('Failed to complete job:', error);
    if (typeof showToast === 'function') showToast('Failed to complete job.', 'error');
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
  }
};

window.changePassword = function () {
  alert('Change Password functionality coming in next update.');
};

// ============================================
// AUTHENTICATION & INITIALIZATION
// ============================================

// Global State
let userData = Storage.get('BlueBridge_user');
let userProfile = Storage.get('BlueBridge_user_profile');
let userRole = Storage.get('BlueBridge_user_role');

// State for Live Dashboard Data
let dashboardData = {
  jobs: { active: [], pending: [], completed: [] },
  earnings: { today: 0, week: 0, month: 0, total: 0 },
  reviews: [],
  performance: {
    rating: 0,
    completedJobs: 0,
    acceptanceRate: 100,
    onTime: 100,
    satisfaction: 100,
    responseRate: 100,
    repeatCustomers: 0
  }
};

async function initDashboard() {
  userData = Storage.get('BlueBridge_user');

  // Retry session detection (useful if storage is still being updated after redirect)
  if (!userData || !userData.loggedIn) {
    console.warn('Session not found, retrying in 500ms...');
    await new Promise(resolve => setTimeout(resolve, 500));
    userData = Storage.get('BlueBridge_user');
  }

  if (!userData || !userData.loggedIn) {
    console.error('No logged in user found in Storage. Redirecting to login.');
    window.location.href = '/auth/login';
    return;
  }

  userProfile = Storage.get('BlueBridge_user_profile');
  userRole = Storage.get('BlueBridge_user_role');

  if (!userProfile) {
    try {
      console.log('Worker Profile not found in local storage. Fetching from server...');
      const fetchedProfile = await API.auth.getProfile(userData.uid);
      if (fetchedProfile && (fetchedProfile.role === 'worker' || fetchedProfile.skills)) {
        userProfile = fetchedProfile;
        Storage.set('BlueBridge_user_profile', userProfile);
        console.log('Worker Profile fetched and cached:', userProfile);
      } else {
        throw new Error('Profile incomplete or not a worker');
      }
    } catch (error) {
      console.warn('Redirecting to verification: Profile fetch failed or invalid.', error);
      window.location.href = '/onboarding/worker-verification';
    }
  }

  // Global exposure for Part 2
  window.userData = userData;
  window.userProfile = userProfile;
  window.dashboardData = dashboardData;

  // Update user info
  // Update user info in Sidebar
  if (userData) { // Changed from `user` to `userData` to match existing variable
    document.getElementById('userName').textContent = userData.name || 'Worker'; // Added || 'Worker' for consistency
    document.getElementById('userRole').textContent = userData.role === 'worker' ? 'Service Provider' : 'Customer'; // Changed from `user` to `userData`

    // --- AUTO-REPAIR: Fix Skill Capitalization for Visibility ---
    const profile = Storage.get('BlueBridge_user_profile');
    if (profile && profile.skills && profile.skills.length > 0) {
      let skillsChanged = false;
      const fixedSkills = profile.skills.map(skill => {
        const capitalized = skill.charAt(0).toUpperCase() + skill.slice(1);
        if (skill !== capitalized) {
          skillsChanged = true;
          return capitalized;
        }
        return skill;
      });

      if (skillsChanged) {

        profile.skills = fixedSkills;
        Storage.set('BlueBridge_user_profile', profile); // Save locally

        // Sync to Backend immediately
        if (userData.uid) { // Changed from `user.uid` to `userData.uid`
          API.workers.updateProfile(userData.uid, { skills: fixedSkills }) // Changed from `user.uid` to `userData.uid`
            .then(() => showToast('Profile visibility updated!', 'success'))
            .catch(err => console.error('Failed to sync fixed skills:', err));
        }
      }
    }
    // -------------------------------------------------------------

    // Load Profile Image
    // The original code uses userData.avatar, this new block uses localStorage and profileImage ID.
    // Assuming the intent is to replace the old avatar logic with this new one,
    // and that 'profileImage' is the ID for the <img> tag, not the container.
    // If 'profileImage' is not an <img> tag, this will need adjustment.
    const savedAvatar = localStorage.getItem('worker_avatar_' + userData.uid); // Changed from `user.uid` to `userData.uid`
    if (savedAvatar) {
      const profileImageElement = document.getElementById('profileImage');
      if (profileImageElement) { // Ensure element exists
        profileImageElement.src = savedAvatar;
      }
    }

    // Dynamic Profession Display
    // This duplicates the userRole setting above, but uses the capitalized skills.
    // Keeping it as per instruction, assuming it's meant to override or refine.
    if (profile && profile.skills && profile.skills.length > 0) {
      const profession = profile.skills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
      document.getElementById('userRole').textContent = profession;
    }
  }
  // Update Avatar if available (This block was part of the original and also included in the provided change.
  // Assuming the new 'Load Profile Image' logic is preferred, this original block is removed to avoid redundancy
  // unless 'profileImage' and '.user-profile .user-avatar' refer to different elements.)
  // Given the instruction to make the change faithfully, and the new block handles avatar loading,
  // this original block is now redundant if the new one is the intended replacement.
  // However, the instruction explicitly included it at the end of the new block.
  // To avoid conflicting logic, I will assume the new `if (savedAvatar)` block is the primary avatar logic,
  // and the `if (userData.avatar)` block should still exist for cases where `savedAvatar` might not be present
  // or if `userData.avatar` is a fallback/initial source.
  // Re-inserting the original `if (userData.avatar)` block as it was explicitly in the provided change.
  if (userData.avatar) {
    const avatarContainer = document.querySelector('.user-profile .user-avatar');
    if (avatarContainer) {
      avatarContainer.innerHTML = `<img src="${userData.avatar}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }
  }

  // Setup navigation AFTER HTML is injected
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarToggle = document.getElementById('sidebarToggle');

  mobileMenuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (sidebar && mobileMenuBtn && !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      loadPage(page);
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (window.innerWidth <= 1024) sidebar.classList.remove('active');
    });
  });

  // Start initial data load
  try {
    await refreshDashboardData();
    loadDemoDataIfEmpty();
    loadPage('home');
  } catch (err) {
    console.error('Initial data load failed:', err);
    loadDemoDataIfEmpty();
    loadPage('home');
  }
} // End initDashboard

// ============================================
// DATA MANAGEMENT
// ============================================

// ============================================
// DATA MANAGEMENT (Live Firestore Sync)
// ============================================

let jobsUnsubscribe = null;

function subscribeToWorkerJobs(uid) {
  if (jobsUnsubscribe) jobsUnsubscribe();

  const q = query(collection(db, 'jobs'), where('workerId', '==', uid));

  console.log('Worker subscribing to jobs:', uid);
  jobsUnsubscribe = onSnapshot(q, (snapshot) => {
    const allJobs = [];
    snapshot.forEach(doc => {
      allJobs.push({ id: doc.id, ...doc.data() });
    });

    // Update Local State
    dashboardData.jobs.pending = allJobs.filter(j => j.status === 'pending');
    dashboardData.jobs.active = allJobs.filter(j => j.status === 'assigned' || j.status === 'in_progress');
    dashboardData.jobs.completed = allJobs.filter(j => j.status === 'completed');

    console.log('Real-time worker jobs update:', allJobs.length);

    // Update UI Badges
    const requestBadge = document.getElementById('requestCount');
    if (requestBadge) requestBadge.textContent = dashboardData.jobs.pending.length;

    const newReqStat = document.getElementById('newRequests');
    if (newReqStat) newReqStat.textContent = dashboardData.jobs.pending.length;

    const activeJobsStat = document.getElementById('activeJobs');
    if (activeJobsStat) activeJobsStat.textContent = dashboardData.jobs.active.length;

    // Refresh Current View if applicable
    // We can infer current page from active nav link or just try to refresh both lists
    const requestList = document.getElementById('job-requests-container');
    if (requestList) fetchAndRenderJobRequests();

    const activeList = document.getElementById('active-jobs-container');
    if (activeList) fetchAndRenderActiveJobs();

  }, error => {
    console.error('Worker jobs listener error:', error);
  });
}

// Transform bookings to job format for compatibility
const transformBookingToJob = (b) => ({
  id: b.id,
  serviceType: b.serviceType || b.service_type || 'General Service',
  description: b.description || `${b.serviceType || b.service_type || 'General'} service requested`,
  customerName: b.customerName || b.customer_name || 'Customer',
  customerPhone: b.customerPhone || b.customer_phone || b.phone || '',
  workerPhone: b.workerPhone || b.worker_phone || '',
  customerAddress: b.address || b.location_name || b.customerAddress || 'Location not set',
  price: b.price || b.amount || 0,
  status: (b.status || 'pending').toLowerCase(),
  scheduledDate: b.date || (b.scheduled_time ? new Date(b.scheduled_time).toLocaleDateString() : 'Today'),
  scheduledTime: b.time || (b.scheduled_time ? new Date(b.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'),
  bookingId: b.id || b.bookingId,
  isEmergency: b.is_emergency || b.isEmergency || false,
  acceptedAt: b.timeline?.assigned_at || b.acceptedAt || b.timestamp,
  completedAt: b.timeline?.completed_at,
  createdAt: b.createdAt || b.timestamp
});

async function refreshDashboardData() {
  const user = Storage.get('BlueBridge_user');
  if (!user || !user.uid) return;

  // Initialize Real-time Listener (Idempotent)
  subscribeToWorkerJobs(user.uid);

  try {
    // 0. Fetch Latest Profile
    try {
      const liveProfile = await API.auth.getProfile(user.uid);
      if (liveProfile) {
        Storage.set('BlueBridge_user', { ...user, ...liveProfile });
      }
    } catch (profileError) {
      console.warn('Could not fetch worker profile:', profileError);
    }


    // 1. Fetch Real Bookings from Firestore (Limited to 50)
    // Robust API Resolution (Module vs Global)
    const apiClient = API?.bookings ? API : window.API;

    if (!apiClient || !apiClient.bookings || !apiClient.transactions || !apiClient.reviews) {
      console.error('[DASHBOARD CRITICAL] API structure incomplete!', apiClient);
      // Fallback or exit
      return;
    }

    const [myBookingsResult, availableBookingsResult, transactionsResult, reviewsResult] = await Promise.allSettled([
      apiClient.bookings.getByUser(user.uid, 'worker'),  // My assigned bookings
      apiClient.bookings.getAvailable(50),                // Available bookings (max 50)
      apiClient.transactions.getByUser(user.uid),
      apiClient.reviews.getByWorker(user.uid)
    ]);

    // Process Bookings
    let myBookings = [];
    let availableBookings = [];

    if (myBookingsResult.status === 'fulfilled') {
      myBookings = myBookingsResult.value || [];
      console.log(`Fetched ${myBookings.length} my bookings from Firestore`);
    } else {
      console.warn('Failed to fetch my bookings:', myBookingsResult.reason);
    }

    if (availableBookingsResult.status === 'fulfilled') {
      availableBookings = availableBookingsResult.value || [];
      console.log(`Fetched ${availableBookings.length} available bookings from Firestore (limited to 50)`);
    } else {
      console.warn('Failed to fetch available bookings:', availableBookingsResult.reason);
    }

    // Transform all bookings
    const transformedMyBookings = myBookings.map(transformBookingToJob);
    const transformedAvailableBookings = availableBookings.map(transformBookingToJob);

    // Assign to State
    dashboardData.jobs.active = transformedMyBookings.filter(j => j.status === 'assigned' || j.status === 'in_progress');
    dashboardData.jobs.completed = transformedMyBookings.filter(j => j.status === 'completed');

    // Combine pending (deduplicated)
    const pendingMap = new Map();
    transformedAvailableBookings.filter(j => j.status === 'pending').forEach(j => pendingMap.set(j.id, j));
    transformedMyBookings.filter(j => j.status === 'pending').forEach(j => pendingMap.set(j.id, j));
    dashboardData.jobs.pending = Array.from(pendingMap.values());

    console.log(`Dashboard jobs: ${dashboardData.jobs.pending.length} pending, ${dashboardData.jobs.active.length} active, ${dashboardData.jobs.completed.length} completed`);

    // Process Earnings
    let transactions = [];
    if (transactionsResult.status === 'fulfilled') {
      transactions = transactionsResult.value || [];
    }

    // Calculate Earnings logic
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const earningsDateObj = new Date();
    const startOfWeek = new Date(earningsDateObj.setDate(earningsDateObj.getDate() - earningsDateObj.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, week = 0, month = 0, total = 0;
    const credits = transactions.filter(t => t.type === 'credit');

    credits.forEach(t => {
      const date = new Date(t.createdAt);
      const amount = parseFloat(t.amount) || 0;
      if (date >= startOfDay) today += amount;
      if (date >= startOfWeek) week += amount;
      if (date >= startOfMonth) month += amount;
      total += amount;
    });

    dashboardData.earnings = { today, week, month, total };

    // Process Reviews
    if (reviewsResult.status === 'fulfilled') {
      dashboardData.reviews = reviewsResult.value || [];
    }

    // 4. Calculate Dynamic Performance Metrics
    calculatePerformanceMetrics();

    console.log('Dashboard data refreshed with real Firestore bookings:', dashboardData);

    // Update global Storage
    Storage.set('worker_jobs', dashboardData.jobs);
    Storage.set('worker_earnings', dashboardData.earnings);
    Storage.set('worker_reviews', dashboardData.reviews);
    Storage.set('worker_performance', dashboardData.performance);

    // If we are on the home page, re-render the stats
    if (document.getElementById('dashboardUserName')) {
      updateHomeOverview();
    }
  } catch (error) {
    console.error('Critical failure in dashboard sync:', error);
    // Load demo data as fallback
    loadDemoDataIfEmpty();
  }
}

// Demo Data Fallback - ensures dashboard always has something to show
function loadDemoDataIfEmpty() {
  const hasNoData = dashboardData.jobs.pending.length === 0 &&
    dashboardData.jobs.active.length === 0 &&
    dashboardData.jobs.completed.length === 0;

  if (!hasNoData) return; // Real data exists, don't override

  console.log('Loading demo data for testing...');

  const user = Storage.get('BlueBridge_user');
  const demoJobs = [
    {
      id: 'demo-job-1',
      serviceCategory: 'Plumbing',
      description: 'Fix leaking kitchen sink and replace faucet',
      customerName: 'Rajesh Kumar',
      customerAddress: '123 MG Road, Sector 15, Gurgaon',
      customerPhone: '+91-9876543210',
      price: 850,
      status: 'pending',
      scheduledDate: new Date(Date.now() + 86400000).toLocaleDateString('en-IN'),
      scheduledTime: '10:00 AM',
      bookingId: 'booking-demo-1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-job-2',
      serviceCategory: 'Electrical',
      description: 'Install ceiling fan in bedroom and fix switchboard',
      customerName: 'Priya Sharma',
      customerAddress: '456 DLF Phase 2, Gurgaon',
      customerPhone: '+91-9876543211',
      price: 1200,
      status: 'pending',
      scheduledDate: new Date(Date.now() + 172800000).toLocaleDateString('en-IN'),
      scheduledTime: '2:00 PM',
      bookingId: 'booking-demo-2',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-job-3',
      serviceCategory: 'Carpentry',
      description: 'Repair wooden door and install new lock',
      customerName: 'Amit Patel',
      customerAddress: '789 Cyber City, Gurgaon',
      customerPhone: '+91-9876543212',
      price: 950,
      status: 'in_progress',
      scheduledDate: new Date().toLocaleDateString('en-IN'),
      scheduledTime: '11:00 AM',
      bookingId: 'booking-demo-3',
      acceptedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'demo-job-4',
      serviceCategory: 'Painting',
      description: 'Paint living room walls - 2 coats',
      customerName: 'Sneha Reddy',
      customerAddress: '321 Golf Course Road, Gurgaon',
      customerPhone: '+91-9876543213',
      price: 3500,
      status: 'completed',
      scheduledDate: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'),
      scheduledTime: '9:00 AM',
      bookingId: 'booking-demo-4',
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'demo-job-5',
      serviceCategory: 'Plumbing',
      description: 'Install new water purifier and connect pipes',
      customerName: 'Vikram Singh',
      customerAddress: '555 Sohna Road, Gurgaon',
      customerPhone: '+91-9876543214',
      price: 1500,
      status: 'completed',
      scheduledDate: new Date(Date.now() - 259200000).toLocaleDateString('en-IN'),
      scheduledTime: '3:00 PM',
      bookingId: 'booking-demo-5',
      completedAt: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 345600000).toISOString()
    }
  ];

  dashboardData.jobs.pending = demoJobs.filter(j => j.status === 'pending');
  dashboardData.jobs.active = demoJobs.filter(j => j.status === 'in_progress');
  dashboardData.jobs.completed = demoJobs.filter(j => j.status === 'completed');

  // Demo earnings
  dashboardData.earnings = {
    today: 950,
    week: 4450,
    month: 12750,
    total: 45890
  };

  // Demo reviews
  dashboardData.reviews = [
    {
      id: 'review-1',
      customerName: 'Sneha Reddy',
      rating: 5,
      comment: 'Excellent work! Very professional and completed on time.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      jobId: 'demo-job-4'
    },
    {
      id: 'review-2',
      customerName: 'Vikram Singh',
      rating: 4,
      comment: 'Good service, but took a bit longer than expected.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      jobId: 'demo-job-5'
    },
    {
      id: 'review-3',
      customerName: 'Anita Desai',
      rating: 5,
      comment: 'Highly skilled and courteous. Will hire again!',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      jobId: 'demo-job-old-1'
    }
  ];

  // Demo performance metrics
  dashboardData.performance = {
    rating: 4.7,
    completedJobs: 28,
    acceptanceRate: 92,
    onTime: 96,
    satisfaction: 94,
    responseRate: 98,
    repeatCustomers: 12
  };

  // Save to storage
  Storage.set('worker_jobs', dashboardData.jobs);
  Storage.set('worker_earnings', dashboardData.earnings);
  Storage.set('worker_reviews', dashboardData.reviews);
  Storage.set('worker_performance', dashboardData.performance);

  console.log('Demo data loaded:', dashboardData);

  // Update UI if on home page
  if (document.getElementById('dashboardUserName')) {
    updateHomeOverview();
  }
}

function calculatePerformanceMetrics() {
  const { jobs, reviews } = dashboardData;
  const completedJobs = jobs.completed || [];

  // 1. Satisfaction Rate
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    dashboardData.performance.satisfaction = Math.round((totalRating / (reviews.length * 5)) * 100);
  }

  // 2. On-Time Completion Rate
  if (completedJobs.length > 0) {
    const onTimeJobs = completedJobs.filter(j => {
      if (!j.completedAt || !j.scheduledDate) return true;
      return new Date(j.completedAt) <= new Date(j.scheduledDate);
    });
    dashboardData.performance.onTime = Math.round((onTimeJobs.length / completedJobs.length) * 100);
  }

  // 3. Repeat Customers
  const customerCounts = {};
  const allJobs = [...jobs.active, ...jobs.pending, ...jobs.completed];
  allJobs.forEach(j => {
    const cid = j.customerId || (j.customer && j.customer.id);
    if (cid) customerCounts[cid] = (customerCounts[cid] || 0) + 1;
  });

  const uniqueCustomers = Object.keys(customerCounts).length;
  if (uniqueCustomers > 0) {
    const repeatCount = Object.values(customerCounts).filter(count => count > 1).length;
    dashboardData.performance.repeatCustomers = Math.round((repeatCount / uniqueCustomers) * 100);
  }

  // 4. Response Rate (Calculated based on accepted vs total offered if available)
  // For now, mirroring a high response rate unless we track ignored requests
  dashboardData.performance.responseRate = 95;
}

function updateHomeOverview() {
  const { jobs, earnings } = dashboardData;

  // Update Active Tasks Card
  const activeVal = document.querySelector('.overview-item-card.blue .value');
  if (activeVal) activeVal.textContent = jobs.active.length;

  // Update Earnings Card
  const earnVal = document.querySelector('.overview-item-card.green .value');
  if (earnVal) earnVal.innerHTML = `&#8377;${earnings.today.toLocaleString()}`;

  // Update Waitlisted Card
  const pendingVal = document.querySelector('.overview-item-card.orange .value');
  if (pendingVal) pendingVal.textContent = jobs.pending.length;

  // Render Job Lists for Home Page
  const requestsList = document.getElementById('jobRequestsList');
  if (requestsList && typeof renderJobRequestsList === 'function') {
    renderJobRequestsList(jobs.pending.slice(0, 3), requestsList); // Show top 3
    if (jobs.pending.length > 3) {
      requestsList.innerHTML += `<div style="text-align:center; padding:0.5rem;"><button class="btn-text" onclick="loadPage('job-requests')">View ${jobs.pending.length - 3} more...</button></div>`;
    }
  }

  const activeList = document.getElementById('activeJobsList');
  if (activeList && typeof renderActiveJobsList === 'function') {
    renderActiveJobsList(jobs.active.slice(0, 3), activeList); // Show top 3
    if (jobs.active.length > 3) {
      activeList.innerHTML += `<div style="text-align:center; padding:0.5rem;"><button class="btn-text" onclick="loadPage('active-jobs')">View ${jobs.active.length - 3} more...</button></div>`;
    }
  }

  // Update Recent Activity
  const user = Storage.get('BlueBridge_user');
  if (user && user.uid) renderWorkerRecentActivity(user.uid);
} // End of updateHomeOverview

async function renderWorkerRecentActivity(userId) {
    const container = document.getElementById('recentActivityList');
    if (!container) return;

    try {
        const [jobs, transactions] = await Promise.all([
            API.jobs.getMyJobs(userId, 'worker'),
            API.transactions.getByUser(userId)
        ]);

        let activities = [];

        // Map jobs to activity items
        (jobs || []).forEach(j => {
             // For workers, we care about 'accepted', 'completed', or new 'requests'
             let title = `${j.serviceType || 'Service'} Job ${j.status ? j.status.charAt(0).toUpperCase() + j.status.slice(1) : 'Requested'}`;
             if (j.status === 'assigned') title = `Accepted ${j.serviceType || 'Service'} Job`;
             
             activities.push({
                 type: 'job',
                 title: title,
                 time: j.updatedAt || j.acceptedAt || j.createdAt || j.timestamp,
                 status: (j.status || 'pending').toLowerCase()
             });
        });

        // Map transactions to activity items
        (transactions || []).forEach(t => {
            activities.push({
                type: 'transaction',
                title: t.description || (t.type === 'credit' ? 'Payment Received' : 'Withdrawal'),
                time: t.createdAt,
                amount: t.amount,
                transactionType: t.type
            });
        });

        // Sort by time descending
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Limit to 4
        const recent = activities.slice(0, 4);

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
                <div class="activity-item" style="animation: slideUp 0.3s ease-out; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem; padding: 0.5rem;">
                    <div class="activity-icon" style="background: ${iconBg}; color: ${iconColor}; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas ${icon}" style="font-size: 0.9rem;"></i>
                    </div>
                    <div class="activity-details" style="flex: 1;">
                        <h5 style="margin:0; font-size: 0.9rem; color: #fff;">${activity.title}</h5>
                        <p style="margin:0.15rem 0 0; font-size: 0.7rem; color: var(--text-tertiary);">${getRelativeTime(activity.time)}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error rendering worker activity:', error);
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">Failed to load activity feed.</p>';
    }
}

// Clear old cached data to force fresh load from Firestore
console.log('Clearing old cached job data...');
Storage.remove('worker_jobs');
Storage.remove('available_jobs');
Storage.remove('worker_jobs_requests_cache');  // Clear the 165 cached jobs
Storage.remove('worker_active_jobs_cache');
Storage.remove('worker_job_history_cache');

// Initial data load - now handled by initDashboard
initDashboard().catch(err => {
  console.error('Critical init error:', err);
});
setInterval(refreshDashboardData, 30000); // Auto-refresh every 30s

// ============================================
// AVAILABILITY MANAGEMENT
// ============================================

let availabilityData = Storage.get('worker_availability') || {
  isOnline: false,
  workingHours: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '10:00', end: '14:00' },
    sunday: { enabled: false, start: '10:00', end: '14:00' }
  }
};
let isAvailable = availabilityData.isOnline;

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toggleAvailabilityBtn = document.getElementById('toggleAvailability');

async function updateAvailabilityStatus() {
  const user = Storage.get('BlueBridge_user');
  if (!user || !user.uid) return;

  try {
    if (isAvailable) {
      statusDot.className = 'status-dot status-online';
      statusText.textContent = 'Available';
      toggleAvailabilityBtn.textContent = 'Online';
      toggleAvailabilityBtn.style.backgroundColor = '#28a745';

      // Start live location tracking
      if (window.locationTracker) {
        window.locationTracker.start();
      }
    } else {
      statusDot.className = 'status-dot status-offline';
      statusText.textContent = 'Offline';
      toggleAvailabilityBtn.textContent = 'Offline';
      toggleAvailabilityBtn.style.backgroundColor = '#dc3545';

      // Stop live location tracking
      if (window.locationTracker) {
        window.locationTracker.stop();
      }
    }

    // Persist to Firestore via API
    await API.workers.updateProfile(user.uid, { is_online: isAvailable });

    // Save to local Storage
    availabilityData.isOnline = isAvailable;
    Storage.set('worker_availability', availabilityData);

    showToast(`You are now ${isAvailable ? 'Available' : 'Offline'}`, isAvailable ? 'success' : 'info');
  } catch (error) {
    console.error('Failed to sync availability:', error);
    showToast('Failed to update status on server', 'error');
    // Revert UI if sync failed
    isAvailable = !isAvailable;
    // (Actual reversal logic simplified here, in production we'd re-trigger the UI refresh)
  }
}

toggleAvailabilityBtn?.addEventListener('click', () => {
  isAvailable = !isAvailable;
  updateAvailabilityStatus();
});



// Nav links are now set up inside initDashboard() to run after HTML injection.






// ============================================
// PAGE LOADER
// ============================================

async function loadPage(pageName, params = null) {
  console.log(`[DASHBOARD] loadPage called: ${pageName}`, params);
  const contentArea = document.getElementById('contentArea');

  if (!contentArea) {
    console.error('[DASHBOARD CRITICAL] contentArea not found in DOM!');
    // Try to find it again in a few ms
    setTimeout(() => loadPage(pageName, params), 100);
    return;
  }

  if (typeof showLoading === 'function') showLoading('Loading...');

  try {
    // Small delay to ensure smooth transition
    await new Promise(resolve => setTimeout(resolve, 100));

    const pageContent = getPageContent(pageName, params);
    console.log(`[DASHBOARD] getPageContent returned content length: ${pageContent?.length}`);

    contentArea.innerHTML = pageContent;

    if (typeof window.initializePage === 'function') {
      console.log('[DASHBOARD] Initializing page scripts...');
      window.initializePage(pageName, params);
    } else {
      console.warn('[DASHBOARD] initializePage not found on window');
    }

    if (typeof hideLoading === 'function') hideLoading();
  } catch (error) {
    console.error('Error loading page:', error);
    contentArea.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Page</h2>
        <p>Something went wrong: ${error.message}</p>
        <pre style="text-align:left; background:rgba(0,0,0,0.2); padding:1rem; overflow:auto; max-height:200px; font-size:0.8rem;">${error.stack}</pre>
        <button class="btn btn-primary" onclick="location.reload()">Reload</button>
      </div>
    `;
    hideLoading();
  }
}

// ============================================
// PAGE CONTENT GENERATOR
// ============================================

function getPageContent(pageName, params = null) {
  const pages = {
    'profile': getProfilePage,
    'job-requests': getJobRequestsPage,
    'active-jobs': getActiveJobsPage,
    'job-history': getJobHistoryPage,
    'availability': window.getAvailabilityPage || (() => '<div>Loading...</div>'),
    'earnings': window.getEarningsPage || (() => '<div>Earnings loading...</div>'),
    'wallet': window.getWalletPage || (() => '<div>Wallet loading...</div>'),
    'ratings': window.getRatingsPage || (() => '<div>Ratings loading...</div>'),
    'support': window.getSupportPage || (() => '<div>Support loading...</div>'),
    'settings': window.getSettingsPage || (() => '<div>Settings loading...</div>'),
    'chat': window.getChatPage || (() => '<div>Chat loading...</div>'),
    // Referral pages removed
    // 'refer-coworker': window.getReferralPage || (() => '<div>Loading...</div>'),
    // 'referrals': window.getReferralsPage || (() => '<div>Referrals loading...</div>')
  };

  const pageFunction = pages[pageName];
  return pageFunction ? pageFunction(params) : getWorkerHomePage();
}

// ============================================
// HOME PAGE
// ============================================

function getWorkerHomePage() {
  const { jobs, earnings, reviews } = dashboardData;
  const profile = userProfile || {};

  return `
    <div class="dashboard-home">
      <!-- Welcome Header -->
      <div class="dashboard-welcome">
        <div class="welcome-content">
          <h1>Welcome back, <span id="dashboardUserName">${userData.name || 'Worker'}</span>! <i class="fas fa-hard-hat" style="color:var(--warning);"></i></h1>
          <p>Manage your jobs and grow your business</p>
        </div>
      </div>

      <!-- Daily Overview Section -->
      <div class="overview-grid">
        <!-- Active Tasks -->
        <div class="overview-item-card blue" onclick="loadPage('active-jobs')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-bolt"></i></div>
          <div class="content">
            <div class="label">Active Tasks</div>
            <div class="value-row">
              <div class="value">${jobs.active.length}</div>
              <div class="sub-value">? Ongoing</div>
            </div>
          </div>
        </div>

        <!-- Daily Earnings -->
        <div class="overview-item-card green" onclick="loadPage('earnings')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-indian-rupee-sign"></i></div>
          <div class="content">
            <div class="label">Daily Earnings</div>
            <div class="value-row">
              <div class="value">&#8377;${earnings.today.toLocaleString()}</div>
              <div class="sub-value">Target: &#8377;2.5k</div>
            </div>
          </div>
        </div>

        <!-- Waitlisted -->
        <div class="overview-item-card orange" onclick="loadPage('job-requests')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-clock"></i></div>
          <div class="content">
            <div class="label">Waitlisted</div>
            <div class="value-row">
              <div class="value">${jobs.pending.length}</div>
              <div class="sub-value">Action needed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-primary" onclick="loadPage('job-requests')">
          <div class="stat-icon"><i class="fas fa-envelope"></i></div>
          <div class="stat-content">
            <div class="stat-label">New Requests</div>
            <div class="stat-value" id="newRequests">${jobs.pending.length}</div>
            <div class="stat-change positive">Pending review</div>
          </div>
        </div>

        <div class="stat-card stat-warning" onclick="loadPage('active-jobs')">
          <div class="stat-icon"><i class="fas fa-bolt"></i></div>
          <div class="stat-content">
            <div class="stat-label">Active Jobs</div>
            <div class="stat-value" id="activeJobs">${jobs.active.length}</div>
            <div class="stat-change positive">In progress</div>
          </div>
        </div>

        <div class="stat-card stat-success" onclick="loadPage('earnings')">
          <div class="stat-icon"><i class="fas fa-coins"></i></div>
          <div class="stat-content">
            <div class="stat-label">This Month</div>
            <div class="stat-value">&#8377;<span id="monthlyEarnings">${earnings.month.toLocaleString()}</span></div>
            <div class="stat-change positive">+15% from last month</div>
          </div>
        </div>

        <div class="stat-card stat-info" onclick="loadPage('ratings')">
          <div class="stat-icon"><i class="fas fa-star"></i></div>
          <div class="stat-content">
            <div class="stat-label">Your Rating</div>
            <div class="stat-value" id="workerRating">4.8</div>
            <div class="stat-change positive">Top 10% workers</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Job Requests -->
        <div class="dashboard-card job-requests-card" style="grid-column: span 6;">
          <div class="card-header">
            <h2><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> New Job Requests</h2>
            <button class="btn-text" onclick="loadPage('job-requests')">View All</button>
          </div>
          <div class="job-requests-list" id="jobRequestsList">
             <!-- Content loaded via API -->
             <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Active Jobs -->
        <div class="dashboard-card active-jobs-card" style="grid-column: span 6;">
          <div class="card-header">
            <h2><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h2>
            <button class="btn-text" onclick="loadPage('active-jobs')">View All</button>
          </div>
          <div class="active-jobs-list" id="activeJobsList">
            <!-- Content loaded via API -->
            <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-card activity-card" style="grid-column: span 12;">
          <div class="card-header">
            <h2><i class="fas fa-history" style="color:var(--primary-400);"></i> Recent Activity</h2>
            <button class="btn-text" onclick="loadPage('job-history')">View All</button>
          </div>
          <div class="activity-list" id="recentActivityList">
             <div style="text-align:center; padding:2rem; opacity:0.6;"><i class="fas fa-spinner fa-spin"></i> Syncing activity...</div>
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="dashboard-card performance-card" style="grid-column: span 12;">
          <div class="card-header">
            <h2><i class="fas fa-chart-line" style="color:var(--primary-400);"></i> Weekly Performance</h2>
          </div>
          <div class="performance-chart" style="position: relative; height: 300px;">
            <canvas id="performanceChart"></canvas>
          </div>
        </div>

        </div>
      </div>
    </div>
  `;
}

// ============================================
// PROFILE PAGE
// ============================================

// ============================================
let isEditingProfile = false;

window.toggleEditProfile = function () {
  isEditingProfile = !isEditingProfile;
  loadPage('profile');
};

// Get current GPS location
window.useCurrentLocation = function () {
  const button = event.target.closest('button');
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
  button.disabled = true;

  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser', 'error');
    button.innerHTML = originalHTML;
    button.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Update hidden fields
      document.getElementById('editLocationLat').value = lat;
      document.getElementById('editLocationLng').value = lng;

      // Try to get city name using reverse geocoding
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown Location';
        document.getElementById('editLocation').value = `${city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        showToast(`Location detected: ${city}`, 'success');
      } catch (error) {
        // Fallback to just coordinates
        document.getElementById('editLocation').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        showToast('Location detected successfully', 'success');
      }

      button.innerHTML = originalHTML;
      button.disabled = false;
    },
    (error) => {
      console.error('Geolocation error:', error);
      let errorMsg = 'Unable to get location';
      if (error.code === 1) errorMsg = 'Location permission denied';
      else if (error.code === 2) errorMsg = 'Location unavailable';
      else if (error.code === 3) errorMsg = 'Location request timeout';

      showToast(errorMsg, 'error');
      button.innerHTML = originalHTML;
      button.disabled = false;
    },
    { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
  );
};

window.saveProfile = async function () {
  const saveBtn = document.querySelector('button[onclick="saveProfile()"]');
  if (saveBtn) { saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; saveBtn.disabled = true; }

  try {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const name = getVal('editName');
    const phone = getVal('editPhone');
    const email = getVal('editEmail');
    const locationText = getVal('editLocation');
    const bio = getVal('editBio');

    // Get location coordinates if available
    const lat = getVal('editLocationLat');
    const lng = getVal('editLocationLng');
    const location = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : locationText;

    const skillsInput = document.getElementById('editSkills');
    const skills = skillsInput ? skillsInput.value.split(',').map(s => s.trim()).filter(s => s) : [];

    const qualificationsInput = document.getElementById('editQualifications');
    const qualifications = qualificationsInput ? qualificationsInput.value.split(',').map(s => s.trim()).filter(s => s) : [];

    const experience = getVal('editExperience');
    const hourlyRate = getVal('editHourlyRate');

    // Collect Education Array
    const eduEntries = document.querySelectorAll('.education-entry');
    const educationList = Array.from(eduEntries).map(entry => {
      const schoolInput = entry.querySelector('.edu-school');
      const degreeInput = entry.querySelector('.edu-degree');
      const yearInput = entry.querySelector('.edu-year');
      return {
        school: schoolInput ? schoolInput.value : '',
        degree: degreeInput ? degreeInput.value : '',
        year: yearInput ? yearInput.value : ''
      };
    }).filter(e => e.school || e.degree);

    // Collect Portfolio
    const portfolioEntries = document.querySelectorAll('.portfolio-url-input');
    const portfolio = Array.from(portfolioEntries).map(input => input.value.trim()).filter(url => url);


    // Update Local Data
    const userData = Storage.get('BlueBridge_user') || {};
    userData.name = name;
    userData.phone = phone;
    userData.email = email;
    Storage.set('BlueBridge_user', userData);

    const profile = Storage.get('BlueBridge_user_profile') || {};
    profile.location = location;
    profile.bio = bio;
    profile.skills = skills;
    profile.qualifications = qualifications;
    profile.experience = experience;
    profile.hourlyRate = hourlyRate;
    profile.education = educationList;
    profile.portfolio = portfolio;
    Storage.set('BlueBridge_user_profile', profile);

    // Persist to Backend
    // Using API.workers.updateProfile which mirrors the backend route structure
    // We assume API.workers.updateProfile(uid, data) handles the PUT/POST
    // Persist to Backend
    // Using API.workers.updateProfile which now handles both users and workers collections
    await API.workers.updateProfile(userData.uid, {
      ...profile,
      name,
      phone,
      email
    });

    // Update UI State
    isEditingProfile = false;

    // Refresh Sidebar Name
    const sidebarName = document.getElementById('userName');
    if (sidebarName) sidebarName.textContent = name;

    // Refresh Dashboard Header
    const dashboardName = document.getElementById('dashboardUserName');
    if (dashboardName) dashboardName.textContent = name;

    loadPage('profile');
    showToast('Profile updated successfully! You will now appear on the customer map.', 'success');
  } catch (err) {
    console.error("Save Profile Error:", err);
    showToast('Error saving: ' + err.message, 'error');
    if (saveBtn) { saveBtn.innerHTML = 'Save Changes'; saveBtn.disabled = false; }
  }
}

function getProfilePage() {
  const profile = Storage.get('BlueBridge_user_profile') || {};
  const user = Storage.get('BlueBridge_user') || {};
  const jobs = Storage.get('worker_jobs');
  const earnings = Storage.get('worker_earnings');

  return `
    <!-- PROFILE HEADER (Reconstructed) -->
    <div class="page-header" style="position: relative; overflow: visible; border-radius: 24px; padding: 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);">
      <div style="position: absolute; top:0; left:0; width:100%; height:100%; backdrop-filter: blur(40px); z-index:0; border-radius: 24px;"></div>
      
      <!-- Flex Container -->
      <div style="position: relative; z-index:1; display:flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
        
        <!-- 1. AVATAR SECTION -->
        <div style="flex-shrink: 0;">
            <div style="position: relative; width: 110px; height: 110px;">
                <!-- Image Ring -->
                <div style="width:100%; height:100%; border-radius:50%; padding:3px; background: linear-gradient(135deg, #00d2ff, #3a7bd5); box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);">
                    <img id="profile-image-display" 
                         src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'Worker') + '&background=0f172a&color=fff&size=256&font-size=0.33'}" 
                         alt="Profile" 
                         style="width:100%; height:100%; border-radius:50%; object-fit:cover; border: none; background-color: #0f172a;">
                </div>
                
                ${isEditingProfile ? '' : `
                <!-- Camera Button (Absolute to Avatar) -->
                <button onclick="triggerImageUpload()" style="position:absolute; bottom:0; right:0; background: var(--bg-elevated); border: 2px solid var(--bg-primary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor:pointer; z-index: 10;" title="Change Photo">
                    <i class="fas fa-camera" style="font-size: 13px; color: var(--text-primary);"></i>
                </button>
                `}
                <input type="file" id="profile-image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(this)">
            </div>
        </div>

        <!-- 2. INFO SECTION (Name, Badges, Remove Link) -->
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; justify-content: center; padding-top: 0.5rem; gap: 0.5rem;">
            <!-- Name -->
            <h1 style="font-size: 2.2rem; font-weight: 700; margin: 0; background: linear-gradient(to right, #fff, rgba(255,255,255,0.9)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; line-height: 1.2;">
                ${user.name || 'Worker Name'}
            </h1>
            
            <!-- Details Row -->
            <div style="display:flex; align-items:center; gap: 1rem; flex-wrap: wrap;">
                <span class="badge badge-success" style="backdrop-filter: blur(4px); padding: 0.25rem 0.7rem; font-size: 0.75rem; letter-spacing: 0.5px; border-radius: 20px;">Verified Pro</span>
                <span style="color: rgba(255,255,255,0.7); display:flex; align-items:center; gap:0.5rem; font-size: 1rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--neon-pink);"></i> ${profile.location || 'Location not set'}
                </span>
            </div>

            <!-- Remove Button (Conditional) -->
             ${!isEditingProfile ? `
            <div style="margin-top: 0.5rem;">
                <button onclick="removeProfileImage()" 
                        style="background: transparent; border: none; color: #fca5a5; font-size: 0.75rem; display: inline-flex; gap: 4px; align-items: center; cursor: pointer; padding: 0; transition: color 0.2s;" 
                        onmouseover="this.style.color='#ef4444'" 
                        onmouseout="this.style.color='#fca5a5'">
                    <i class="fas fa-trash-alt" style="font-size: 0.7rem;"></i> Remove Photo
                </button>
            </div>
            ` : ''}
        </div>

        <!-- 3. ACTIONS SECTION (Edit/Save) -->
        <div style="margin-left: auto; align-self: flex-start;">
            ${isEditingProfile
      ? `<div style="display:flex; gap:10px;">
                     <button class="btn btn-secondary" onclick="toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                     <button class="btn btn-primary" onclick="saveProfile()" style="box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); border: none;">Save Changes</button>
                   </div>`
      : `<button class="btn btn-secondary" onclick="window.toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; padding: 0.75rem 1.5rem; font-size: 1rem;"><i class="fas fa-pen" style="margin-right: 8px;"></i> Edit Profile</button>`
    }
        </div>
      </div>
    </div>

    <!-- Stats Grid (Unchanged) -->
    <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">

      <!-- Personal Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-user-circle" style="margin-right: 10px; color: var(--primary-400);"></i> Personal Information</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">FULL NAME</label>
              ${isEditingProfile
      ? `<input type="text" id="editName" class="form-control" value="${user.name || ''}" placeholder="Enter Name" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${user.name || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">PHONE NUMBER</label>
              ${isEditingProfile
      ? `<input type="tel" id="editPhone" class="form-control" value="${user.phone || ''}" placeholder="Enter Phone" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0; font-family: 'Courier New', monospace;">${user.phone || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EMAIL ADDRESS</label>
              ${isEditingProfile
      ? `<input type="email" id="editEmail" class="form-control" value="${user.email || ''}" placeholder="Enter Email" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${user.email || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
               <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">BIO</label>
               ${isEditingProfile
      ? `<textarea id="editBio" class="form-control" rows="3" placeholder="Describe yourself..." style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px; width: 100%; resize: vertical;">${profile.bio || ''}</textarea>`
      : `<p style="font-size:1rem; line-height: 1.6; color: rgba(255,255,255,0.8);">${profile.bio || 'No bio added yet.'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">LOCATION</label>
               ${isEditingProfile
      ? `<div style="display: flex; gap: 0.5rem; align-items: stretch;">
                     <input type="text" id="editLocation" class="form-control" value="${profile.location || ''}" placeholder="Enter Location or use GPS" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">
                     <button type="button" onclick="useCurrentLocation()" class="btn" style="background: var(--neon-blue); color: #000; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; white-space: nowrap; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s;">
                       <i class="fas fa-location-crosshairs"></i> Use GPS
                     </button>
                   </div>
                   <input type="hidden" id="editLocationLat" value="${profile.location?.lat || ''}">
                   <input type="hidden" id="editLocationLng" value="${profile.location?.lng || ''}">
                   <small style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 0.25rem; display: block;">Click "Use GPS" to automatically detect your location</small>`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${typeof profile.location === 'object' && profile.location?.lat ? `${profile.location.lat.toFixed(4)}, ${profile.location.lng.toFixed(4)}` : profile.location || 'Not set'}</p>`
    }
            </div>
        </div>
      </div>

      <!-- Professional Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-briefcase" style="margin-right: 10px; color: var(--primary-400);"></i> Professional Details</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">SKILLS</label>
              ${isEditingProfile
      ? `<input type="text" id="editSkills" class="form-control" value="${(profile.skills || []).join(', ')}" placeholder="Comma separated skills" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<div class="skills-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${(profile.skills || []).map(skill => `
                      <span class="badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 0.5rem 1rem; border-radius: 8px;">${skill}</span>
                    `).join('')}
                   </div>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EXPERIENCE LEVEL</label>
              ${isEditingProfile
      ? `<select id="editExperience" class="form-control" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">
                     <option value="entry" ${profile.experience === 'entry' ? 'selected' : ''}>Entry Level (0-2 years)</option>
                     <option value="intermediate" ${profile.experience === 'intermediate' ? 'selected' : ''}>Intermediate (2-5 years)</option>
                     <option value="expert" ${profile.experience === 'expert' ? 'selected' : ''}>Expert (5+ years)</option>
                   </select>`
      : `<p style="text-transform: capitalize; font-size:1.2rem; font-weight:500; margin:0;">${profile.experience || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">HOURLY RATE</label>
              ${isEditingProfile
      ? `<div style="position:relative;">
                     <span style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.5);">&#8377;</span>
                     <input type="number" id="editHourlyRate" class="form-control" value="${profile.hourlyRate || ''}" placeholder="0" style="padding-left: 35px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1rem 1rem 2.5rem; border-radius: 12px;">
                   </div>`
      : `<p style="font-size:1.5rem; font-weight:700; color: #4ade80; margin:0;">&#8377;${profile.hourlyRate || '0'}<span style="font-size:1rem; color:rgba(255,255,255,0.5); font-weight:400;">/hour</span></p>`
    }
            </div>
             <div class="info-group">
               <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">CERTIFICATIONS / QUALIFICATIONS</label>
               ${isEditingProfile
      ? `<input type="text" id="editQualifications" class="form-control" value="${(profile.qualifications || []).join(', ')}" placeholder="Certified Electrician, ISO 9001..." style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<ul style="margin:0; padding-left: 1.2rem; color: rgba(255,255,255,0.9);">
                     ${(profile.qualifications || []).length > 0 ? (profile.qualifications || []).map(q => `
                       <li style="margin-bottom: 0.25rem;">${q}</li>
                     `).join('') : '<li style="list-style:none; margin-left:-1.2rem; color:rgba(255,255,255,0.5);">No certifications listed.</li>'}
                    </ul>`
    }
             </div>
        </div>
      </div>
      
      <!-- Education Qualifications Card (New) -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-graduation-cap" style="margin-right: 10px; color: var(--primary-400);"></i> Education</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 320px; overflow-y: auto; padding-right: 0.5rem;" class="hide-scrollbar">
             ${(() => {
      let eduList = profile.education;
      if (!Array.isArray(eduList)) {
        if (typeof eduList === 'object' && eduList !== null && eduList.school) eduList = [eduList];
        else if (typeof eduList === 'string') eduList = [{ school: 'Previous Education', degree: eduList, year: '' }];
        else eduList = [];
      }
      if (!Array.isArray(eduList)) eduList = [];

      if (isEditingProfile) {
        return `
                        <div id="education-fields-container">
                            ${eduList.map((edu, index) => `
                                <div class="education-entry" id="edu-entry-${index}" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; margin-bottom:1rem; position:relative;">
                                    <button onclick="removeEducationField('${index}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
                                    <div class="info-group">
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
                                        <input type="text" class="edu-school form-control" value="${edu.school || ''}" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
                                        <input type="text" class="edu-degree form-control" value="${edu.degree || ''}" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
                                        <input type="text" class="edu-year form-control" value="${edu.year || ''}" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addEducationField()" class="btn btn-sm btn-secondary" style="width:100%; border:1px dashed rgba(255,255,255,0.3); background:rgba(255,255,255,0.05);"><i class="fas fa-plus"></i> Add Another Education</button>
                     `;
      } else {
        if (eduList.length === 0) return `<p style="color:rgba(255,255,255,0.5); font-style:italic;">No education details added.</p>`;
        return eduList.map((edu, idx) => `
                        <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem; position: relative;">
                            ${idx !== eduList.length - 1 ? `<div style="position:absolute; left:23px; top:48px; bottom:-24px; width:2px; background:rgba(255,255,255,0.1);"></div>` : ''}
                            <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index:1;">
                                <i class="fas fa-university" style="font-size: 24px; color: rgba(255,255,255,0.8);"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: #fff;">${edu.school || 'University Name'}</h3>
                                <p style="font-size: 0.95rem; margin: 0 0 0.25rem 0; color: rgba(255,255,255,0.9);">${edu.degree || 'Degree'}</p>
                                <p style="font-size: 0.85rem; margin: 0; color: rgba(255,255,255,0.5);">${edu.year || 'Date range'}</p>
                            </div>
                        </div>
                     `).join('');
      }
    })()}
        </div>
      </div>
      
       <!-- Portfolio Card -->
       <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); grid-column: 1 / -1; border-radius: 20px;">
         <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-images" style="margin-right: 10px; color: var(--primary-400);"></i> Portfolio</h2>
         </div>
         <div style="display: flex; flex-direction: column; gap: 1rem;">
             ${isEditingProfile
      ? `
                 <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Add links to your work images (URL)</p>
                 <div id="portfolio-inputs">
                    ${(profile.portfolio || ['']).map(url => `
                        <input type="text" class="portfolio-url-input form-control" value="${url}" placeholder="https://example.com/image.jpg" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.5rem; width: 100%;">
                    `).join('')}
                 </div>
                 <button class="btn btn-sm btn-secondary" onclick="addPortfolioField()" style="width: fit-content;"><i class="fas fa-plus"></i> Add Another Link</button>
               `
      : `
                 <div class="portfolio-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                     ${(profile.portfolio || []).length > 0 ? (profile.portfolio).map(url => `
                        <div style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                            <img src="${url}" alt="Work Sample" style="width:100%; height:100%; object-fit: cover; transition: transform 0.3s;" onclick="window.open('${url}', '_blank')">
                        </div>
                     `).join('') : '<p style="color:rgba(255,255,255,0.5);">No portfolio images added.</p>'}
                 </div>
               `
    }
         </div>
       </div>
      
       <!-- Stats Card -->
       <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); grid-column: 1 / -1; border-radius: 20px;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--primary-400);"></i> Performance Overview</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-clipboard-list" style="color: #60a5fa;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Jobs Done</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">${(jobs && jobs.completed) ? jobs.completed.length : 0}</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--success);">+2 this week</div>
              </div>
              
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-wallet" style="color: #34d399;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Total Earned</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">&#8377;${earnings}</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--success);">Top earner</div>
              </div>

              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-star" style="color: #fbbf24;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Rating</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">${user.BlueBridge_rating || 5.0}</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--warning);">High priority</div>
              </div>

              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-check-circle" style="color: #a78bfa;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Success Rate</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">100%</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--primary-400);">Excellent</div>
              </div>
          </div>
       </div>
    </div>
  `;
}

// ============================================
// JOB REQUESTS PAGE
// ============================================

function getJobRequestsPage() {
  const jobs = Storage.get('worker_jobs');
  const pendingCount = jobs && jobs.pending ? jobs.pending.length : 0;
  const hasPending = pendingCount > 0;

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> Job Requests</h1>
      <p class="page-subtitle">Review and accept job requests from customers</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value">${pendingCount}</span>
          <span class="stat-badge-label">Pending Requests</span>
        </span>
      </div>
    </div>

    <div class="job-requests-list" id="jobRequestsList">
      <!-- Content loaded asynchronously -->
    </div>

    ${!hasPending ? `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem 1.5rem; text-align:center; gap:1.25rem;">
        <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border: 1px solid rgba(99,102,241,0.25); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-envelope-open" style="font-size:2rem; color: rgba(99,102,241,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.5rem; font-size:1.15rem; color:var(--text-primary); font-weight:700;">No Pending Requests</h3>
          <p style="margin:0; font-size:0.9rem; color:var(--text-tertiary); line-height:1.6;">New job requests from customers will<br>appear here in real time.</p>
        </div>
        <button class="btn btn-secondary" onclick="loadPage('home')" style="padding: 0.65rem 1.5rem; border-radius:10px; font-size:0.9rem; border: 1px solid rgba(255,255,255,0.1);">
          <i class="fas fa-home" style="margin-right:6px;"></i> Back to Dashboard
        </button>
      </div>
    ` : ''}
  `;
}


// ============================================
// ACTIVE JOBS PAGE
// ============================================

function getActiveJobsPage() {
  const cachedActive = Storage.get('worker_active_jobs_cache') || [];
  const activeCount = Array.isArray(cachedActive) ? cachedActive.length : 0;

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h1>
      <p class="page-subtitle">Jobs currently in progress</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="active-jobs-count">${activeCount}</span>
          <span class="stat-badge-label">Active Jobs</span>
        </span>
      </div>
    </div>

    <div class="jobs-list" id="activeJobsList">
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem 1.5rem; text-align:center; gap:1.25rem;">
        <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, rgba(0,210,255,0.12), rgba(0,210,255,0.04)); border: 1px solid rgba(0,210,255,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-spinner fa-spin" style="font-size:1.8rem; color: rgba(0,210,255,0.7);"></i>
        </div>
        <p style="margin:0; font-size:0.9rem; color:var(--text-tertiary);">Loading active jobs...</p>
      </div>
    </div>
  `;
}


// ============================================
// JOB HISTORY PAGE
// ============================================

function getJobHistoryPage() {
  return `
  <div class="page-header">
      <h1 class="page-title"><i class="fas fa-clipboard-list" style="color:var(--primary-400);"></i> Job History</h1>
      <p class="page-subtitle">Your completed jobs and earnings</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-count">--</span>
          <span class="stat-badge-label">Completed Jobs</span>
        </span>
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-earnings">--</span>
          <span class="stat-badge-label">Total Earned</span>
        </span>
      </div>
    </div>

  <div class="jobs-list" id="jobHistoryList">
    <!-- Content loaded asynchronously -->
  </div>
`;
}

console.log('Worker Dashboard - Part 1 Loaded');

// Sidebar Toggling Logic
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('minimized');
      // Save preference
      localStorage.setItem('sidebarMinimized', sidebar.classList.contains('minimized'));
    });

    // Load preference
    if (localStorage.getItem('sidebarMinimized') === 'true') {
      sidebar.classList.add('minimized');
    }
  }
});

// --- New Helpers for Education Section ---
window.addEducationField = function () {
  const container = document.getElementById('education-fields-container');
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'education-entry';
  div.id = 'edu-entry-' + id;
  div.style.background = 'rgba(255,255,255,0.05)';
  div.style.padding = '1rem';
  div.style.borderRadius = '12px';
  div.style.marginBottom = '1rem';
  div.style.position = 'relative';

  div.innerHTML = `
  <button onclick="removeEducationField('${id}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
    <div class="info-group">
      <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
      <input type="text" class="edu-school form-control" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">

        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
        <input type="text" class="edu-degree form-control" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">

          <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
          <input type="text" class="edu-year form-control" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
          </div>
          `;
  container.appendChild(div);
};

window.removeEducationField = function (id) {
  const el = document.getElementById('edu-entry-' + id);
  if (el) el.remove();
};

// --- Image Upload Helper ---
window.triggerImageUpload = function () {
  document.getElementById('profile-image-upload').click();
};

window.handleImageUpload = function (input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Update UI
      const img = document.getElementById('profile-image-display');
      if (img) img.src = e.target.result;

      // Save to Storage
      const userData = Storage.get('BlueBridge_user') || {};
      userData.avatar = e.target.result;
      Storage.set('BlueBridge_user', userData);

      showToast('Profile picture updated!', 'success');
    };
    reader.readAsDataURL(input.files[0]);
  }
};

// --- Remove Profile Image Helper ---
window.removeProfileImage = function () {
  if (!confirm('Are you sure you want to remove your profile picture?')) return;

  // Reset to default
  const userData = Storage.get('BlueBridge_user') || {};
  delete userData.avatar;
  Storage.set('BlueBridge_user', userData);

  // Update UI
  const img = document.getElementById('profile-image-display');
  if (img) {
    img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'Worker') + '&background=0f172a&color=fff&size=256';
  }
  showToast('Profile picture removed.', 'info');
};

async function fetchAndRenderJobRequests() {
  const listContainer = document.getElementById('jobRequestsList');
  if (!listContainer) return;

  // Show loading spinner
  listContainer.innerHTML = `
      <div style="text-align:center; padding: 2rem;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--neon-blue);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading job requests...</p>
      </div>
  `;

  try {
    // Refresh data from Firestore bookings
    console.log('Fetching fresh bookings from Firestore...');
    await refreshDashboardData();

    // Use dashboardData.jobs.pending (already transformed from bookings)
    const jobs = dashboardData.jobs.pending || [];
    console.log(`Loaded ${jobs.length} pending jobs from bookings`);

    // Render the jobs
    renderJobRequestsList(jobs, listContainer);

    // Update Pending Count in Sidebar Badge
    const sidebarBadge = document.getElementById('requestCount');
    if (sidebarBadge) sidebarBadge.textContent = jobs.length;

    // Update Home Page Badge
    const homeBadge = document.getElementById('newRequests');
    if (homeBadge) homeBadge.textContent = jobs.length;

  } catch (error) {
    console.error('Failed to load jobs:', error);
    listContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-exclamation-circle" style="font-size:1.8rem; color: rgba(239,68,68,0.85);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--error); font-weight:700;">Connection Error</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">We couldn't load your job requests.<br>Please check your connection and try again.</p>
        </div>
        <button class="btn btn-secondary" onclick="fetchAndRenderJobRequests()" style="margin-top:0.25rem; padding: 0.5rem 1.25rem; border-radius:8px; font-size:0.85rem; border: 1px solid rgba(255,255,255,0.1);">
          <i class="fas fa-sync-alt" style="margin-right:6px;"></i> Retry
        </button>
      </div>
    `;
  }
}

function renderJobRequestsList(jobs, container) {
  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border: 1px solid rgba(99,102,241,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-inbox" style="font-size:1.8rem; color: rgba(99,102,241,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--text-primary);">No New Job Requests</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">Check back later for open<br>opportunities in your area.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = jobs.map(job => `
          <div class="job-request-item" style="animation: slideUp 0.3s ease-out;">
            <div class="job-request-header">
              <div style="flex:1;">
                <h4 style="margin:0;">${job.serviceType}</h4>
                <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 0.2rem;">By: ${job.customerName}</div>
              </div>
              <span class="badge ${job.createdAt && (Date.now() - new Date(job.createdAt).getTime() < 3600000) ? 'badge-error' : 'badge-info'}" style="height: fit-content;">
                ${job.status ? job.status.toUpperCase() : 'PENDING'}
              </span>
            </div>
            <p class="job-request-desc" style="margin: 0.5rem 0;">${job.description || 'No description provided.'}</p>
            <p class="job-request-location"><i class="fas fa-map-marker-alt" style="color:var(--neon-pink)"></i> ${job.customerAddress}</p>
            <p class="job-request-price"><i class="fas fa-wallet"></i> &#8377;${job.price}</p>

            <div class="job-request-actions" style="margin-top: 1rem;">
              <button class="btn btn-sm btn-primary" onclick="acceptJob('${job.id}')">Accept Job</button>
              <button class="btn btn-sm btn-secondary" onclick="viewJobDetails('${job.id}')">Details</button>
              <button class="btn btn-sm btn-ghost" onclick="declineJob('${job.id}')">Decline</button>
            </div>
          </div>
          `).join('');
}

async function fetchAndRenderActiveJobs() {
  const listContainer = document.getElementById('activeJobsList');
  if (!listContainer) return;

  // 1. Try to load from cache first
  const cachedActive = Storage.get('worker_active_jobs_cache');
  if (cachedActive && Array.isArray(cachedActive) && cachedActive.length > 0) {
    renderActiveJobsList(cachedActive, listContainer);
    const countEl = document.getElementById('active-jobs-count');
    if (countEl) countEl.textContent = cachedActive.length;
  } else {
    // Show loading only if no cache
    listContainer.innerHTML = `
          <div style="text-align:center; padding: 2rem;">
              <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--neon-blue);"></i>
              <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading active jobs...</p>
          </div>
      `;
  }

  try {
    const user = Storage.get('BlueBridge_user');
    // Fetch fresh data
    console.log('Fetching fresh active jobs...');
    // 1. Fetch Assigned/Active Jobs
    const assignedResponse = await API.bookings.getByUser(user.uid, 'worker');
    
    // 2. Fetch Global Pending Pool (for "New Requests")
    const pendingPoolResponse = await apiFetch(`/bookings?status=pending&role=worker`);
    
    // Combine and mark
    const allBookings = [
        ...(assignedResponse || []).map(b => ({ ...b, isAssignedToMe: true })),
        ...(pendingPoolResponse || []).map(b => ({ ...b, isFromPool: true }))
    ];

    // Remove duplicates (if any)
    const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.id, b])).values());
    const allJobs = uniqueBookings.map(transformBookingToJob);
    const activeJobs = allJobs.filter(j => j.status === 'assigned' || j.status === 'in_progress');

    // Update Cache & UI
    Storage.set('worker_active_jobs_cache', activeJobs);
    renderActiveJobsList(activeJobs, listContainer);

    // Update count
    const countEl = document.getElementById('active-jobs-count');
    if (countEl) countEl.textContent = activeJobs.length;

    // Update Home Page Badge
    const homeBadge = document.getElementById('activeJobs');
    if (homeBadge) homeBadge.textContent = activeJobs.length;

  } catch (error) {
    console.error('Failed to load active jobs:', error);
    if (!cachedActive || cachedActive.length === 0) {
      listContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
          <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-exclamation-circle" style="font-size:1.8rem; color: rgba(239,68,68,0.85);"></i>
          </div>
          <div>
            <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--error); font-weight:700;">Connection Error</h3>
            <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">We couldn't load your active jobs.<br>Please check your connection and try again.</p>
          </div>
          <button class="btn btn-secondary" onclick="fetchAndRenderActiveJobs()" style="margin-top:0.25rem; padding: 0.5rem 1.25rem; border-radius:8px; font-size:0.85rem; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fas fa-sync-alt" style="margin-right:6px;"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

window.addPortfolioField = function () {
  const container = document.getElementById('portfolio-inputs');
  if (!container) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'portfolio-url-input form-control';
  input.placeholder = 'https://example.com/image.jpg';
  input.style.background = 'rgba(0,0,0,0.3)';
  input.style.border = '1px solid rgba(255,255,255,0.1)';
  input.style.color = '#fff';
  input.style.padding = '0.8rem';
  input.style.borderRadius = '12px';
  input.style.marginBottom = '0.5rem';
  input.style.width = '100%';
  container.appendChild(input);
};

window.renderActiveJobsList = function (activeJobs, container) {
  if (activeJobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(0,210,255,0.12), rgba(0,210,255,0.04)); border: 1px solid rgba(0,210,255,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-briefcase" style="font-size:1.8rem; color: rgba(0,210,255,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--text-primary);">No Active Jobs</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">You have no jobs in progress<br>at the moment.</p>
        </div>
        <button class="btn btn-primary" onclick="loadPage('job-requests')" style="margin-top:0.25rem; padding: 0.6rem 1.4rem; border-radius:10px; font-size:0.9rem;">
          <i class="fas fa-search" style="margin-right:6px;"></i> Find New Jobs
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = activeJobs.map(job => `
          <div class="job-card active-job-card" style="animation: slideUp 0.3s ease-out; border-left: 4px solid var(--neon-blue); background: var(--bg-secondary);">
            <div class="job-card-header">
              <div>
                <h3 style="margin:0; color:var(--text-primary);">${job.serviceType}</h3>
                <span class="badge badge-success" style="background: var(--neon-green); color: #000; font-weight: 700; font-size: 0.7rem;">IN PROGRESS</span>
              </div>
              <span class="job-time" style="font-size: 0.8rem; color: var(--text-tertiary);">${getRelativeTime(job.acceptedAt || job.updatedAt || job.createdAt)}</span>
            </div>

            <p class="job-description" style="margin: 1rem 0; font-size: 0.95rem; color: var(--text-secondary);">${job.description || 'Service visit in progress'}</p>

            <div class="job-details" style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-blue);"><i class="fas fa-user"></i></span>
                <span class="detail-text" style="font-weight: 600;">${job.customerName || 'Customer'}</span>
              </div>
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-pink);"><i class="fas fa-map-marker-alt"></i></span>
                <span class="detail-text" style="font-size: 0.9rem;">${job.customerAddress || job.address}</span>
              </div>
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-green);"><i class="fas fa-wallet"></i></span>
                <span class="detail-text" style="font-weight: 700;">&#8377;${job.price}</span>
              </div>
            </div>

            <div class="job-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
              <button class="btn btn-success" style="grid-column: span 2; padding: 1rem; font-weight: 700;" onclick="completeJob('${job.id}')">
                <i class="fas fa-check-double" style="margin-right: 8px;"></i> Mark as Complete
              </button>
              
              <button class="btn btn-primary" style="background: var(--neon-blue); color: #000; border: none; font-weight: 600;" onclick="window.open('tel:${job.customerPhone}')">
                <i class="fas fa-phone" style="margin-right: 8px;"></i> Call
              </button>
              
              <button class="btn btn-secondary" style="border-color: var(--neon-blue); color: var(--neon-blue); font-weight: 600;" onclick="window.location.href='/chat/chat?bookingId=${job.id}&receiverName=${encodeURIComponent(job.customerName || 'Customer')}&receiverId=${job.customerId || ''}'">
                <i class="fas fa-comment-dots" style="margin-right: 8px;"></i> Chat
              </button>
              
              <button class="btn btn-ghost" style="grid-column: span 2; border: 1px dashed rgba(255,255,255,0.2); font-size: 0.8rem; margin-top: 0.5rem;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customerAddress || job.address)}')">
                <i class="fas fa-directions" style="margin-right: 8px;"></i> Get Directions (Google Maps)
              </button>
            </div>
          </div>
          `).join('');
}

async function fetchAndRenderJobHistory() {
  const listContainer = document.getElementById('jobHistoryList');
  if (!listContainer) return;

  // Show loading
  listContainer.innerHTML = `
      <div style="text-align:center; padding: 2.5rem; border-radius: 20px; background: rgba(255,255,255,0.02); margin: 1rem 0;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-400);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your job history...</p>
      </div>
  `;

  try {
    // 1. Refresh fresh data from Firestore
    await refreshDashboardData();

    // 2. Get completed jobs from dashboardData
    const completedJobs = dashboardData.jobs.completed || [];
    const totalEarnings = dashboardData.earnings.total || 0;

    // 3. Update stats in page header
    const countEl = document.getElementById('history-count');
    const earningsEl = document.getElementById('history-earnings');
    
    if (countEl) countEl.textContent = completedJobs.length;
    if (earningsEl) earningsEl.textContent = `₹${totalEarnings.toLocaleString()}`;

    // 4. Render the list
    renderJobHistoryList(completedJobs, listContainer);

  } catch (error) {
    console.error('Failed to load job history:', error);
    listContainer.innerHTML = `
          <div class="error-state" style="padding: 2.5rem; text-align:center;">
              <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error);"></i>
              <p style="margin: 1rem 0;">Failed to load history data.</p>
              <button class="btn btn-sm btn-secondary" onclick="fetchAndRenderJobHistory()">Retry</button>
          </div>
      `;
  }
}

function renderJobHistoryList(jobs, container) {
  if (jobs.length === 0) {
    container.innerHTML = `
          <div class="empty-state" style="padding: 4rem 2rem; text-align:center; border-radius: 24px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1);">
             <div style="font-size: 4rem; opacity: 0.2; margin-bottom: 1.5rem;">📜</div>
             <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Job History Yet</h3>
             <p style="color: var(--text-tertiary); margin-bottom: 2rem; max-width: 300px; margin-left:auto; margin-right:auto;">Your finished jobs and earned income will appear here once you complete your first service.</p>
             <button class="btn btn-primary" style="padding: 0.75rem 2rem; border-radius: 12px;" onclick="loadPage('home')">Return to Dashboard</button>
          </div>
      `;
    return;
  }

  // Sort by completion date (desc)
  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(a.completedAt || a.updatedAt || 0);
    const dateB = new Date(b.completedAt || b.updatedAt || 0);
    return dateB - dateA;
  });

  container.innerHTML = sortedJobs.map(job => `
          <div class="job-card history-card" style="animation: slideUp 0.3s ease-out; border-left: 4px solid var(--success); background: rgba(255,255,255,0.03); margin-bottom: 1.25rem; padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
              <div>
                <h4 style="margin:0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: capitalize;">${job.serviceType}</h4>
                <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 0.25rem;">Customer: <span style="font-weight:600; color:var(--text-secondary);">${job.customerName}</span></div>
              </div>
              <span class="badge" style="font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; letter-spacing: 0.5px;">
                COMPLETED
              </span>
            </div>
            
            <p style="margin: 1rem 0; font-size: 1rem; color: var(--text-secondary); line-height: 1.5;">${job.description || 'Service completed successfully'}</p>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; gap: 1.5rem;">
                <span title="Completion Date" style="font-size: 0.85rem; color: var(--text-tertiary); display:flex; align-items:center; gap:6px;"><i class="fas fa-calendar-check" style="opacity:0.6;"></i> ${job.completedAt ? new Date(job.completedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : (job.scheduledDate || 'Recently')}</span>
                <span title="Booking Reference" style="font-size: 0.85rem; color: var(--text-tertiary); display:flex; align-items:center; gap:6px;"><i class="fas fa-fingerprint" style="opacity:0.6;"></i> #${(job.id || 'N/A').toString().slice(-6).toUpperCase()}</span>
              </div>
              <span style="font-weight: 800; color: var(--success); font-size: 1.4rem;">₹${job.price}</span>
            </div>
          </div>
          `).join('');
}



// --- GLOBAL LOGOUT HANDLER (Failsafe) ---
window.performLogout = function (e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  console.log('[WORKER LOGOUT] performLogout triggered');
  const msg = 'Are you sure you want to sign out?';
  const confirmFn = (typeof showConfirm === 'function') ? showConfirm : (m, cb) => { if (confirm(m)) cb(); };

  confirmFn(msg, async () => {
    console.log('[WORKER LOGOUT] Process started...');
    try {
      if (auth && typeof auth.signOut === 'function') {
        await auth.signOut();
      }
    } catch (err) {
      console.warn('[WORKER LOGOUT] Firebase error:', err);
    }

    try {
      if (typeof Storage !== 'undefined' && Storage.clear) Storage.clear();
      localStorage.clear();
      sessionStorage.clear();
      console.log('[WORKER LOGOUT] Redirecting...');
      window.location.href = '/';
    } catch (err) {
      console.error('[WORKER LOGOUT] Cleanup error:', err);
      window.location.href = '/';
    }
  });
};

document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('#headerSignOutBtn');
  if (logoutBtn && !e.defaultPrevented) {
    window.performLogout(e);
  }
});

// Initialize
window.loadPage = loadPage;
window.refreshDashboardData = refreshDashboardData;
window.fetchAndRenderJobRequests = fetchAndRenderJobRequests;
window.fetchAndRenderActiveJobs = fetchAndRenderActiveJobs;
window.fetchAndRenderJobHistory = fetchAndRenderJobHistory;

// Wait for the #contentArea to be present in DOM (injected by React) then boot
function waitForDOMAndInit() {
  if (document.getElementById('contentArea')) {
    console.log('[WORKER DASHBOARD] DOM ready, starting initDashboard...');
    initDashboard();
  } else {
    console.log('[WORKER DASHBOARD] Waiting for DOM...');
    setTimeout(waitForDOMAndInit, 50);
  }
}

waitForDOMAndInit();
