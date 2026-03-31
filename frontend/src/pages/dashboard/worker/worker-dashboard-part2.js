// ============================================
// WORKER DASHBOARD - PART 2
// Additional Pages and Functionality
// ============================================

// Imports
import { API, apiFetch } from '../../../api/api.js';
import { Storage } from '../../../utils/utils.js';

// Note: This file uses ES modules and is loaded after worker-dashboard.js
let selectedWorkerName = null;

// Helper to safely get dashboardData from window
const getDashboardData = () => window.dashboardData || {
  jobs: { active: [], pending: [], completed: [] },
  earnings: { today: 0, week: 0, month: 0, total: 0 },
  reviews: [],
  performance: { satisfaction: 0, onTime: 0, responseRate: 0, repeatCustomers: 0 }
};

// ============================================
// AVAILABILITY PAGE
// ============================================

function getAvailabilityPage() {
  const defaultAvailability = {
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

  const availability = Storage.get('worker_availability') || defaultAvailability;
  if (!availability.workingHours) availability.workingHours = defaultAvailability.workingHours;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  let scheduleHTML = `<div class="schedule-grid">`;
  
  days.forEach(day => {
    const dayData = availability.workingHours[day] || defaultAvailability.workingHours[day];
    const isEnabled = dayData.enabled;
    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
    
    const activeClass = isEnabled ? 'active' : '';
    const timeDisplay = isEnabled ? 'flex' : 'none';
    const disabledDisplay = isEnabled ? 'none' : 'block';

    scheduleHTML += `
      <div class="schedule-day ${activeClass}" id="row-${day}">
        <div class="schedule-day-header">
          <span class="day-name">${dayCapitalized}</span>
          <label class="switch">
            <input type="checkbox" id="toggle-${day}" ${isEnabled ? 'checked' : ''} onchange="window.toggleDayStatus('${day}')">
            <span class="slider round"></span>
          </label>
        </div>
        
        <div class="schedule-time" id="time-group-${day}" style="display: ${timeDisplay};">
          <div class="time-input-group">
            <label class="time-input-label">From</label>
            <input type="time" id="start-${day}" value="${dayData.start}" class="time-input">
          </div>
          <div class="time-input-group">
            <label class="time-input-label">To</label>
            <input type="time" id="end-${day}" value="${dayData.end}" class="time-input">
          </div>
        </div>
        
        <div class="schedule-time-disabled" id="disabled-msg-${day}" style="display: ${disabledDisplay};">
          Not Available
        </div>
        
        ${day === 'monday' ? `
        <button class="btn btn-sm btn-ghost" title="Copy to all weekdays" onclick="window.copyMondayToAll()" style="margin-top: 0.5rem; width: 100%; border: 1px dashed var(--border-primary); color: var(--text-tertiary);">
          <i class="fas fa-copy"></i> Copy to Weekdays
        </button>` : ''}
      </div>
    `;
  });

  scheduleHTML += `</div>`;

  return `
    <div class="availability-container pb-20">
      <div class="page-header">
        <h1 class="page-title"><i class="fas fa-calendar-alt" style="color:var(--primary-400);"></i> Availability Settings</h1>
        <p class="page-subtitle">Manage your working hours and availability for job requests</p>
      </div>
      
      <div class="status-card">
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fas fa-clock" style="color: var(--neon-blue);"></i> Weekly Schedule</h2>
          <p style="color: var(--text-secondary); margin: 0;">Set the hours you are available to receive assignments.</p>
        </div>
        <button id="saveAvailabilityBtn" class="btn btn-primary" onclick="window.saveAvailability()" style="padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600;">
          <i class="fas fa-save" style="margin-right:8px;"></i> Save Changes
        </button>
      </div>
      
      ${scheduleHTML}
    </div>
  `;
}

// === Availability Helper Functions ===

window.toggleDayStatus = function(day) {
  const isChecked = document.getElementById(`toggle-${day}`).checked;
  const row = document.getElementById(`row-${day}`);
  const timeGroup = document.getElementById(`time-group-${day}`);
  const disabledMsg = document.getElementById(`disabled-msg-${day}`);
  
  if (isChecked) {
    row.classList.add('active');
    timeGroup.style.display = 'flex';
    disabledMsg.style.display = 'none';
  } else {
    row.classList.remove('active');
    timeGroup.style.display = 'none';
    disabledMsg.style.display = 'block';
  }
};

window.copyMondayToAll = function() {
  const startMonday = document.getElementById('start-monday').value;
  const endMonday = document.getElementById('end-monday').value;
  const isEnabled = document.getElementById('toggle-monday').checked;
  
  const weekdays = ['tuesday', 'wednesday', 'thursday', 'friday'];
  
  weekdays.forEach(day => {
    document.getElementById(`toggle-${day}`).checked = isEnabled;
    document.getElementById(`start-${day}`).value = startMonday;
    document.getElementById(`end-${day}`).value = endMonday;
    window.toggleDayStatus(day);
  });
  
  if (typeof window.showToast === 'function') {
    window.showToast('Copied Monday times to all weekdays', 'success');
  } else if (typeof showToast === 'function') {
    showToast('Copied Monday times to all weekdays', 'success');
  } else {
    alert('Copied Monday times to all weekdays');
  }
};

window.saveAvailability = async function() {
  const saveBtn = document.getElementById('saveAvailabilityBtn');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i> Saving...';
    saveBtn.disabled = true;
  }
  
  try {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const newWorkingHours = {};
    
    days.forEach(day => {
      newWorkingHours[day] = {
        enabled: document.getElementById(`toggle-${day}`).checked,
        start: document.getElementById(`start-${day}`).value || '09:00',
        end: document.getElementById(`end-${day}`).value || '17:00'
      };
    });
    
    // Retrieve original and merge
    const currentAvailability = Storage.get('worker_availability') || {};
    const updatedAvailability = {
      ...currentAvailability,
      workingHours: newWorkingHours
    };
    
    // Save to LocalStorage
    Storage.set('worker_availability', updatedAvailability);
    
    // Sync to Backend
    const user = Storage.get('BlueBridge_user');
    if (user && user.uid && typeof API !== 'undefined' && API.workers && typeof API.workers.updateProfile === 'function') {
      try {
        await API.workers.updateProfile(user.uid, { availability: updatedAvailability });
      } catch (apiErr) {
        console.warn('Backend sync for availability may have failed or endpoint differs:', apiErr);
      }
    }
    
    if (typeof window.showToast === 'function') {
      window.showToast('Availability schedule saved successfully!', 'success');
    } else if (typeof showToast === 'function') {
      showToast('Availability schedule saved successfully!', 'success');
    } else {
      alert('Availability schedule saved successfully!');
    }
    
  } catch (err) {
    console.error('Error saving availability:', err);
    if (typeof window.showToast === 'function') {
      window.showToast('Error saving: ' + err.message, 'error');
    } else if (typeof showToast === 'function') {
      showToast('Error saving: ' + err.message, 'error');
    }
  } finally {
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-save" style="margin-right:8px;"></i> Save';
      saveBtn.disabled = false;
    }
  }
}

// ============================================
// EARNINGS PAGE
// ============================================

async function fetchAndRenderEarningsPage() {
  const user = Storage.get('BlueBridge_user');
  if (!user) return;

  const container = document.getElementById('earnings-placeholder');
  if (!container) return;

  container.innerHTML = `
      <div style="text-align:center; padding: 4rem;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--success);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your earnings...</p>
      </div>
  `;

  try {
    const transactions = await API.transactions.getByUser(user.uid);

    // Calculate Metrics
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const earningsNow = new Date();
    const startOfWeek = new Date(earningsNow.setDate(earningsNow.getDate() - earningsNow.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, week = 0, month = 0, total = 0;

    // Filter credits only for earnings
    const credits = transactions.filter(t => t.type === 'credit');

    credits.forEach(t => {
      const date = new Date(t.createdAt);
      const amount = parseFloat(t.amount);

      if (date >= startOfDay) today += amount;
      if (date >= startOfWeek) week += amount;
      if (date >= startOfMonth) month += amount;
      total += amount;
    });

    container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title"><i class="fas fa-wallet" style="color:var(--success);"></i> My Earnings</h1>
          <p class="page-subtitle">Track your income and financial performance</p>
        </div>
        
        <div class="earnings-dashboard">
          <div class="earnings-summary-grid">
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-calendar-day"></i></div>
              <div class="summary-content">
                <span class="summary-label">Today</span>
                <span class="summary-value">₹${today.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-bar"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Week</span>
                <span class="summary-value">₹${week.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-line"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Month</span>
                <span class="summary-value">₹${month.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-gem"></i></div>
              <div class="summary-content">
                <span class="summary-label">Total Earned</span>
                <span class="summary-value">₹${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <!-- Weekly Chart -->
          <div class="card">
            <div class="card-header">
              <h2>Weekly Earnings</h2>
            </div>
            <div class="chart-container" style="height: 300px; position: relative;">
              <canvas id="earningsChart"></canvas>
            </div>
          </div>
          
          <!-- Recent Transactions -->
          <div class="card">
            <div class="card-header">
              <h2>Recent Transactions</h2>
              <button class="btn-text" onclick="loadPage('wallet')">View All</button>
            </div>
            <div class="earnings-history">
              ${credits.slice(0, 5).map(t => `
                <div class="earning-item">
                  <div class="earning-info">
                    <h4>${t.description || t.source}</h4>
                    <span class="earning-date">${new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div class="earning-amount">
                    <span class="amount-value">+₹${t.amount}</span>
                    <span class="badge badge-success">${t.status}</span>
                  </div>
                </div>
              `).join('')}
              ${credits.length === 0 ? '<p>No earnings yet.</p>' : ''}
            </div>
          </div>
        </div>
    `;

    // Initialize Chart
    if (typeof initializeEarningsChart === 'function') {
      setTimeout(() => initializeEarningsChart(transactions), 100);
    }

  } catch (err) {
    console.error("Earnings Load Error:", err);
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--error);"></i>
            <h3>Failed to load earnings</h3>
            <p>Please try again later. Error: ${err.message}</p>
            <button class="btn btn-secondary" onclick="fetchAndRenderEarningsPage()">Retry</button>
        </div>
    `;
  }
}

function getEarningsPage() {
  const earnings = getDashboardData().earnings || { today: 0, week: 0, month: 0, total: 0 };

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-wallet"></i> My Earnings</h1>
      <p class="page-subtitle">Track your income and payment history</p>
    </div>
    
    <div id="earnings-placeholder" class="earnings-dashboard-placeholder">
        <!-- Will be populated by fetchAndRenderEarningsPage -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${earnings.today}</div>
              <div class="stat-label">Today</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${earnings.week}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${earnings.month}</div>
              <div class="stat-label">This Month</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="fas fa-coins"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${earnings.total}</div>
              <div class="stat-label">Total Earned</div>
            </div>
          </div>
        </div>
    </div>
  `;
}

// ============================================
// WALLET PAGE
// ============================================

function getWalletPage() {
  const earnings = getDashboardData().earnings;
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-credit-card"></i> Wallet</h1>
      <p class="page-subtitle">Manage your balance and withdrawals</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Wallet Balance</h2>
      </div>
      <div class="card-body">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; font-weight: bold; color: var(--primary-400);">₹${earnings.total || 0}</div>
          <p style="color: var(--text-secondary); margin-top: 0.5rem;">Available Balance</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="alert('Withdrawal feature coming soon!')">
            <i class="fas fa-money-bill-wave"></i> Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// RATINGS & REVIEWS PAGE
// ============================================

function getRatingsPage() {
  const reviews = Storage.get('worker_reviews') || getDashboardData().reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (ratingDistribution[r.rating] !== undefined) ratingDistribution[r.rating]++; });

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-star" style="color:#fbbf24;"></i> Ratings & Reviews</h1>
      <p class="page-subtitle">See what customers say about your work</p>
    </div>
    
    <div class="ratings-container">
      <div class="card rating-summary-card">
        <div class="rating-summary">
          <div class="rating-score">
            <div class="score-value">${avgRating.toFixed(1)}</div>
            <div class="score-stars">${'⭐'.repeat(Math.round(avgRating))}</div>
            <div class="score-count">${reviews.length} reviews</div>
          </div>
          
          <div class="rating-distribution">
            ${[5, 4, 3, 2, 1].map(star => {
    const count = ratingDistribution[star];
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return `
                <div class="rating-bar">
                  <span class="rating-label">${star} <i class="fas fa-star" style="color:#fbbf24;"></i></span>
                  <div class="rating-progress">
                    <div class="rating-progress-fill" style="width: ${percentage}%"></div>
                  </div>
                  <span class="rating-count">${count}</span>
                </div>
              `;
  }).join('')}
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Customer Reviews</h2>
        </div>
        <div class="reviews-list">
          ${reviews.length > 0 ? reviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-customer">
                  <div class="customer-avatar">${(review.customerName || 'U').charAt(0)}</div>
                  <div class="customer-info">
                    <h4>${review.customerName || 'Anonymous'}</h4>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="review-rating">
                  <span class="rating-stars">${'⭐'.repeat(review.rating || 0)}</span>
                  <span class="rating-value">${review.rating || 0}/5</span>
                </div>
              </div>
              <p class="review-comment">"${review.comment || 'No comment provided'}"</p>
            </div>
          `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No reviews yet</p>'}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-chart-pie" style="color:var(--primary-400);"></i> Performance Insights</h2>
        </div>
        <div class="insights-grid">
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bullseye" style="color:var(--error);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.satisfaction}%</span>
              <span class="insight-label">Customer Satisfaction</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bolt" style="color:#fbbf24;"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.onTime}%</span>
              <span class="insight-label">On-Time Completion</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-comments" style="color:var(--info);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.responseRate}%</span>
              <span class="insight-label">Response Rate</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-sync" style="color:var(--success);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.repeatCustomers}%</span>
              <span class="insight-label">Repeat Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add missing chart functions
function initializeEarningsChart(transactions) {
  const ctx = document.getElementById('earningsChart')?.getContext('2d');
  if (!ctx) return;

  if (window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Earnings (₹)',
          data: [0, 0, 0, 0, 0, 0, 0], // Placeholder
          borderColor: '#3b82f6',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

function updateEarningsChart(range) {
  console.log('Update earnings chart for:', range);
}

window.updatePerformanceChart = function(range) {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Match canvas to its display size
  const container = canvas.parentElement;
  canvas.width = container.clientWidth || 800;
  canvas.height = container.clientHeight || 300;

  const W = canvas.width;
  const H = canvas.height;

  // --- Build weekly data from real jobs ---
  const data = getDashboardData();
  const allJobs = [
    ...(data.jobs.completed || []),
    ...(data.jobs.active || []),
    ...(data.jobs.pending || [])
  ];

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  const now = new Date();
  const startOfWeek = new Date(now);
  // Roll back to the most recent Monday
  const dayOfWeek = now.getDay(); // Sun=0, Mon=1...
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(now.getDate() - diffToMon);
  startOfWeek.setHours(0, 0, 0, 0);

  allJobs.forEach(job => {
    // Check all possible date fields from Firestore
    const dStr = job.createdAt || job.created_at || job.updated_at || job.timestamp || job.date;
    if (!dStr) return;
    
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return;
    
    // Calculate days since this week's Monday
    const diffDays = Math.floor((d.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      dayCounts[diffDays]++;
    }
  });

  const maxVal = Math.max(...dayCounts, 1);

  // --- Layout ---
  const PAD_LEFT  = 46;
  const PAD_RIGHT = 24;
  const PAD_TOP   = 24;
  const PAD_BOT   = 48;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOT;

  const barCount   = 7;
  const groupWidth = chartW / barCount;
  const barWidth   = groupWidth * 0.45;

  // --- Clear ---
  ctx.clearRect(0, 0, W, H);

  // ---- Grid lines ----
  const gridLines = 5;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridLines; i++) {
    const y = PAD_TOP + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD_LEFT, y);
    ctx.lineTo(PAD_LEFT + chartW, y);
    ctx.stroke();
    const label = Math.round((i / gridLines) * maxVal);
    ctx.fillText(label, PAD_LEFT - 8, y + 4);
  }

  // ---- Bars ----
  const today = (now.getDay() + 6) % 7; // Mon=0 … Sun=6

  dayCounts.forEach((count, i) => {
    const x = PAD_LEFT + i * groupWidth + (groupWidth - barWidth) / 2;
    const barH = (count / maxVal) * chartH;
    const y = PAD_TOP + chartH - barH;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    if (i === today) {
      grad.addColorStop(0, 'rgba(0, 210, 255, 0.95)');
      grad.addColorStop(1, 'rgba(0, 120, 200, 0.6)');
    } else {
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.85)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.25)');
    }
    ctx.fillStyle = grad;

    // Rounded top corners
    const r = Math.min(6, barWidth / 2, barH || 1);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barWidth - r, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
    ctx.lineTo(x + barWidth, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Value label above bar
    if (count > 0) {
      ctx.fillStyle = i === today ? 'rgba(0,210,255,0.9)' : 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(count, x + barWidth / 2, y - 6);
    }

    // Day label below
    ctx.fillStyle = i === today ? 'rgba(0,210,255,0.9)' : 'rgba(255,255,255,0.45)';
    ctx.font = i === today ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(dayLabels[i], x + barWidth / 2, PAD_TOP + chartH + 20);
  });

  // ---- X-axis baseline ----
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD_LEFT, PAD_TOP + chartH);
  ctx.lineTo(PAD_LEFT + chartW, PAD_TOP + chartH);
  ctx.stroke();
}


// ============================================
// SUPPORT PAGE
// ============================================

function getSupportPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-life-ring"></i> Support</h1>
      <p class="page-subtitle">Get help when you need it</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Contact Support</h2>
      </div>
      <div class="card-body">
        <p>Need help? Contact our support team:</p>
        <p style="margin-top: 1rem;"><strong>Email:</strong> support@BlueBridge.com</p>
        <p><strong>Phone:</strong> +91-1800-123-4567</p>
        <p><strong>Hours:</strong> 9 AM - 6 PM (Mon-Sat)</p>
      </div>
    </div>
  `;
}

// ============================================
// SETTINGS PAGE
// ============================================

function getSettingsPage() {
  const user = Storage.get('BlueBridge_user') || {};

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-cog"></i> Settings</h1>
      <p class="page-subtitle">Manage your account preferences</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Account Settings</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" value="${user.email || ''}" readonly>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" class="form-control" value="${user.phone || ''}" readonly>
        </div>
        <button class="btn btn-primary" onclick="alert('Change password coming soon!')">
          <i class="fas fa-key"></i> Change Password
        </button>
      </div>
    </div>
  `;
}

// REFERRALS REMOVED

// ============================================
// CHAT PAGE
// ============================================

function getChatPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-comments"></i> Messages</h1>
      <p class="page-subtitle">Chat with customers</p>
    </div>
    
    <div class="card">
      <div class="card-body">
        <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No messages yet</p>
      </div>
    </div>
  `;
}

// REFERRAL FEATURE REMOVED

function initializePage(pageName, params) {
  console.log(`Initialized page: ${pageName}`, params);

  if (pageName === 'home') {
    updatePerformanceChart('week');
    if (typeof window.fetchAndRenderJobRequests === 'function') window.fetchAndRenderJobRequests();
    if (typeof window.fetchAndRenderActiveJobs === 'function') window.fetchAndRenderActiveJobs();
  } else if (pageName === 'job-history') {
    if (typeof window.fetchAndRenderJobHistory === 'function') window.fetchAndRenderJobHistory();
  } else if (pageName === 'earnings') {
    fetchAndRenderEarningsPage();
    updateEarningsChart('week');
  } else if (pageName === 'active-jobs') {
    if (typeof window.fetchAndRenderActiveJobs === 'function') window.fetchAndRenderActiveJobs();
  } else if (pageName === 'job-requests') {
    if (typeof window.fetchAndRenderJobRequests === 'function') window.fetchAndRenderJobRequests();
  }
}

// ============================================
// GLOBAL EXPOSURE
// ============================================

window.getAvailabilityPage = getAvailabilityPage;
window.getEarningsPage = getEarningsPage;
window.getWalletPage = getWalletPage;
window.getRatingsPage = getRatingsPage;
window.getRatingsReviewsPage = getRatingsPage;
window.getSupportPage = getSupportPage;
window.getSettingsPage = getSettingsPage;
// window.getReferralsPage = getReferralsPage;
// window.getReferralPage = getReferralsPage;
// window.showReferralModal = referCoWorker;
// window.selectCoWorker = selectCoWorker;
// window.confirmReferralPage = confirmReferralPage;
window.initializePage = initializePage;
window.fetchAndRenderEarningsPage = fetchAndRenderEarningsPage;

