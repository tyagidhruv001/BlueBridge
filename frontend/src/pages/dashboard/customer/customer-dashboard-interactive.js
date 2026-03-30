// ============================================
// CUSTOMER DASHBOARD - ENHANCED INTERACTIVITY
// ============================================

// Add this to customer-dashboard.js or include separately

// ============================================
// INTERACTIVE ENHANCEMENTS
// ============================================

// Counter Animation with Easing
function animateCounterEnhanced(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    const range = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (range * easeOutCubic));

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end + suffix;
        }
    }

    requestAnimationFrame(update);
}

// Ripple Effect on Click
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn, .service-quick-item, .worker-card').forEach(element => {
        element.addEventListener('click', createRipple);
    });
});

// Particle Background Effect
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Smooth Scroll to Section
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Real-time Search Filter
function setupSearchFilter() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.service-quick-item, .worker-card');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = '';
                item.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    }, 300));
}

// Interactive Notifications
function showInteractiveNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="notification-progress"></div>
  `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Skeleton Loading Effect
function showSkeletonLoading(container) {
    const skeleton = `
    <div class="skeleton-card">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
  `;

    container.innerHTML = skeleton.repeat(3);
}

// Lazy Loading for Images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Interactive Worker Card Flip
function setupWorkerCardFlip() {
    document.querySelectorAll('.worker-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (!e.target.closest('.worker-actions')) {
                this.classList.toggle('flipped');
            }
        });
    });
}

// Floating Action Button
function createFloatingActionButton() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '📞';
    fab.setAttribute('data-tooltip', 'Quick Book Service');
    fab.addEventListener('click', () => {
        showInteractiveNotification('Opening quick booking...', 'info');
        loadPage('mechanic');
    });

    document.body.appendChild(fab);
}

// Confetti Effect for Success Actions
function triggerConfetti() {
    const confettiCount = 50;
    const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Enhanced Booking with Real API Integration
async function bookWorkerEnhanced(workerId, workerName, serviceType = 'General') {
    const user = Storage.get('BlueBridge_user');
    if (!user || !user.uid) {
        showInteractiveNotification('Please log in to book a service.', 'error');
        return;
    }

    if (confirm(`Book ${workerName} for ${serviceType}?`)) {
        // Show loading animation
        if (typeof showLoading === 'function') showLoading('Processing booking...');
        else showInteractiveNotification('Processing booking...', 'info');

        try {
            const jobData = {
                customerId: user.uid,
                workerId: workerId || 'auto-assign',
                serviceType: serviceType,
                status: 'pending',
                price: 450, // Default price or fetched from worker profile
                scheduledTime: new Date().toISOString(),
                address: user.address || 'User Address'
            };

            const response = await API.jobs.create(jobData);

            if (typeof hideLoading === 'function') hideLoading();
            triggerConfetti();
            showInteractiveNotification(`Successfully booked ${workerName}!`, 'success');

            // Refresh dashboards
            if (window.refreshCustomerDashboardData) {
                window.refreshCustomerDashboardData();
            }

            // Update stats
            const activeBookings = document.getElementById('stat-active-count');
            if (activeBookings) {
                const current = parseInt(activeBookings.textContent) || 0;
                animateCounterEnhanced(activeBookings, current, current + 1, 1000);
            }
        } catch (error) {
            if (typeof hideLoading === 'function') hideLoading();
            console.error('Booking Error:', error);
            showInteractiveNotification(`Failed to book: ${error.message}`, 'error');
        }
    }
}

// Interactive Service Selection
function enhanceServiceSelection() {
    document.querySelectorAll('.service-quick-item').forEach((item, index) => {
        // Stagger animation
        item.classList.add('stagger-item');
        item.style.animationDelay = (index * 0.1) + 's';

        // Add hover sound effect (optional)
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.05)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });
}

// Real-time Activity Feed Updates
function simulateRealTimeUpdates() {
    const activities = [
        { icon: '✓', title: 'Booking confirmed', time: 'Just now', type: 'success' },
        { icon: '📋', title: 'New worker available nearby', time: '2 min ago', type: 'info' },
        { icon: '💰', title: 'Payment processed', time: '5 min ago', type: 'warning' }
    ];

    setInterval(() => {
        const activityList = document.getElementById('activityList');
        if (activityList && Math.random() > 0.7) {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
        <div class="activity-icon activity-${activity.type}">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      `;

            newActivity.style.animation = 'slideInRight 0.5s ease-out';
            activityList.insertBefore(newActivity, activityList.firstChild);

            // Remove oldest if more than 5
            if (activityList.children.length > 5) {
                activityList.lastChild.remove();
            }
        }
    }, 15000);
}

// Interactive Map Preview
function showMapPreview(location) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
    <div class="modal map-modal">
      <div class="modal-header">
        <h3>📍 ${location}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="map-placeholder">
          <p>🗺️ Interactive Map</p>
          <p>Showing workers near ${location}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Enhanced Stats with Progress Rings
function createProgressRing(percentage, color) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '120');
    svg.classList.add('progress-ring-svg');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '60');
    circle.setAttribute('cy', '60');
    circle.setAttribute('r', '54');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', '12');
    circle.setAttribute('stroke-dasharray', '339.292');
    circle.setAttribute('stroke-dashoffset', 339.292 * (1 - percentage / 100));
    circle.classList.add('progress-ring');

    svg.appendChild(circle);
    return svg;
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.querySelector('.search-input')?.focus();
        }

        // Ctrl/Cmd + B for quick booking
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            loadPage('mechanic');
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        }
    });
}


// Voice Search (if supported)
function setupVoiceSearch() {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'voice-search-btn';
    voiceBtn.innerHTML = '🎤';
    voiceBtn.setAttribute('data-tooltip', 'Voice Search');

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.querySelector('.search-input').value = transcript;
        voiceBtn.classList.remove('listening');
    };

    recognition.onerror = () => {
        voiceBtn.classList.remove('listening');
    };

    document.querySelector('.topbar-search')?.appendChild(voiceBtn);
}

// Initialize all enhancements
function initializeEnhancements() {
    createParticles();
    setupSearchFilter();
    setupLazyLoading();
    setupWorkerCardFlip();
    // createFloatingActionButton(); // Commented out to avoid covering the AI Chat Widget
    enhanceServiceSelection();
    simulateRealTimeUpdates();
    setupKeyboardShortcuts();

    setupVoiceSearch();

    // Add stagger animation to stat cards
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.animationDelay = (index * 0.1) + 's';
    });

    console.log('✨ Customer Dashboard Enhanced!');
}

// Run enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements);
} else {
    initializeEnhancements();
}

// Export enhanced functions
window.customerDashboardEnhanced = {
    animateCounterEnhanced,
    showInteractiveNotification,
    bookWorkerEnhanced,
    showMapPreview,
    triggerConfetti,
    createProgressRing
};

console.log('🚀 Customer Dashboard Interactivity Loaded');

