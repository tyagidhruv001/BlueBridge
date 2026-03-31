// Global utility functions for BlueBridge

// Local Storage helpers (Now using sessionStorage for tab isolation with localStorage fallback)
const Storage = {
    get(key) {
        try {
            // Try sessionStorage first (per-tab)
            let item = sessionStorage.getItem(key);
            
            // Fallback to localStorage if not found (cross-tab/persistent)
            if (!item) {
                item = localStorage.getItem(key);
            }

            if (!item) return null;
            try {
                return JSON.parse(item);
            } catch (jsonError) {
                // If it's not JSON, return the raw value (handles simple strings like "worker")
                return item;
            }
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            // Always set in both for maximum reliability during transitions
            sessionStorage.setItem(key, jsonValue);
            localStorage.setItem(key, jsonValue);
            return true;
        } catch (e) {
            console.error('Error writing to storage:', e);
            return false;
        }
    },

    remove(key) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    },

    clear() {
        sessionStorage.clear();
        localStorage.clear();
    }
};

// Date formatting
function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
}

function formatDateTime(date) {
    const d = new Date(date);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return `${d.toLocaleDateString('en-IN', dateOptions)} at ${d.toLocaleTimeString('en-IN', timeOptions)}`;
}

function getRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
}

// Currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// Get location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Format distance
function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
}

// Show loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    ">
      <div style="
        background: var(--bg-elevated);
        padding: 2rem;
        border-radius: var(--radius-xl);
        text-align: center;
      ">
        <div class="spinner" style="margin: 0 auto 1rem;"></div>
        <p style="color: var(--text-primary);">${message}</p>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: var(--bg-elevated);
    border-left: 4px solid ${colors[type] || colors.info};
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
    color: var(--text-primary);
  `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confirm dialog
function showConfirm(message, onConfirm, onCancel) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100000; animation: fadeIn 0.3s ease-out;">
          <div class="modal" style="background: var(--bg-elevated); padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--glass-border); max-width: 400px; width: 90%; text-align: center;">
            <div class="modal-header" style="margin-bottom: 1.5rem;">
              <h3 style="color: #fff; margin: 0;">Confirm</h3>
            </div>
            <div class="modal-body" style="margin-bottom: 2rem;">
              <p style="color: var(--text-secondary); line-height: 1.6;">${message}</p>
            </div>
            <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: center;">
              <button class="btn btn-ghost" id="cancelBtn" style="flex: 1; padding: 0.75rem; border-radius: 8px; cursor: pointer; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
              <button class="btn btn-primary" id="confirmBtn" style="flex: 1; padding: 0.75rem; border-radius: 8px; cursor: pointer; background: var(--neon-blue); color: #000; border: none; font-weight: 700;">Confirm</button>
            </div>
          </div>
        </div>
      `;

        document.body.appendChild(modal);

        const closeModal = (result) => {
            modal.remove();
            if (result) {
                if (onConfirm) onConfirm();
                resolve(true);
            } else {
                if (onCancel) onCancel();
                resolve(false);
            }
        };

        modal.querySelector('#confirmBtn').addEventListener('click', () => closeModal(true));
        modal.querySelector('#cancelBtn').addEventListener('click', () => closeModal(false));

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal(false);
            }
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export {
    Storage,
    formatDate,
    formatDateTime,
    getRelativeTime,
    formatCurrency,
    generateId,
    debounce,
    throttle,
    copyToClipboard,
    getCurrentLocation,
    calculateDistance,
    formatDistance,
    showLoading,
    hideLoading,
    showToast,
    showConfirm
};
