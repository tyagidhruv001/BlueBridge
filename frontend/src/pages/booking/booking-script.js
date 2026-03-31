import { API } from '../../api/api.js';
import { Storage } from '../../utils/utils.js';

let currentStep = 1;
const totalSteps = 4;
let bookingData = {
    serviceType: '',
    date: '',
    time: '',
    address: '',
    workerId: null,
    workerName: '',
    workerPrice: 0,
    paymentMethod: 'wallet',
    totalPrice: 49
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooking);
} else {
    initBooking();
}

function initBooking() {
    const user = Storage.get('BlueBridge_user');
    if (!user || (!user.uid && !user.user_id)) {
        alert('Please log in first to book a service.');
        window.location.href = '/auth/login';
        return;
    }

    // Pre-fill from Storage
    const savedService = Storage.get('BlueBridge_selected_service');
    if (savedService) {
        document.getElementById('booking-category').value = savedService;
    }

    const savedWorkerId = Storage.get('BlueBridge_selected_worker_id');
    if (savedWorkerId) {
        bookingData.workerId = savedWorkerId;
    }

    // Nav Buttons
    document.getElementById('next-btn').addEventListener('click', handleNext);
    document.getElementById('prev-btn').addEventListener('click', handlePrev);

    // Initial State Setup
    updateUI();
}

function updateUI() {
    // Update step indicators
    document.querySelectorAll('.step-item').forEach((el, index) => {
        const stepNum = index + 1;
        if (stepNum === currentStep) {
            el.className = 'step-item active';
        } else if (stepNum < currentStep) {
            el.className = 'step-item completed';
        } else {
            el.className = 'step-item';
        }
    });

    // Update form content sections
    document.querySelectorAll('.step-content').forEach((el, index) => {
        if (index + 1 === currentStep) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    // Update buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    if (currentStep === totalSteps) {
        nextBtn.textContent = 'Confirm Booking';
        nextBtn.classList.remove('btn-secondary');
        nextBtn.classList.add('btn-primary');
        nextBtn.style.background = 'var(--neon-green)';
        nextBtn.style.color = '#000';
    } else {
        nextBtn.textContent = 'Next Step';
        nextBtn.classList.add('btn-primary');
        nextBtn.style.background = '';
        nextBtn.style.color = '';
    }
}

async function handleNext() {
    if (currentStep === 1) {
        // Validate Step 1
        bookingData.date = document.getElementById('booking-date').value;
        bookingData.time = document.getElementById('booking-time').value;
        bookingData.serviceType = document.getElementById('booking-category').value;
        bookingData.address = document.getElementById('booking-address').value;

        if (!bookingData.date || !bookingData.address) {
            alert('Please select a date and enter an address.');
            return;
        }
        await loadWorkers();
    } else if (currentStep === 2) {
        // Validate Step 2
        if (!bookingData.workerId) {
            alert('Please select a professional.');
            return;
        }
        updatePaymentSummary(); // prepare step 3
    } else if (currentStep === 3) {
        // Prepare Step 4 Summary
        prepareFinalSummary();
    } else if (currentStep === totalSteps) {
        // Submit Booking
        await submitBooking();
        return;
    }

    currentStep++;
    updateUI();
}

function handlePrev() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
}

async function loadWorkers() {
    const list = document.getElementById('worker-list');
    list.innerHTML = '<p class="text-tertiary">Loading professionals...</p>';
    
    try {
        // Add random radius or location details if backend expects it
        const workers = await API.workers.getAll({ category: bookingData.serviceType });
        
        if (!workers || workers.length === 0) {
            list.innerHTML = '<p class="text-tertiary">No professionals found for this category. Please try a different service.</p>';
            return;
        }

        list.innerHTML = '';
        workers.forEach(w => {
            const card = document.createElement('div');
            card.className = `worker-selection-card ${bookingData.workerId === (w.uid || w.id) ? 'selected' : ''}`;
            const price = w.base_price || w.price || 450;
            const name = w.name || 'Professional';
            const initials = name.substring(0, 2).toUpperCase();

            card.innerHTML = `
                <div class="card-avatar">${initials}</div>
                <div class="card-info">
                    <div class="worker-name">${name}</div>
                    <div class="worker-meta">
                        <span>⭐ ${w.rating_avg || 4.5}</span>
                        <span>${w.experience_years || 2} yrs exp</span>
                    </div>
                    <div class="worker-price">₹${price}/hr</div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.worker-selection-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                bookingData.workerId = w.uid || w.id;
                bookingData.workerName = name;
                bookingData.workerPrice = price;
            });
            list.appendChild(card);
        });
    } catch (e) {
        console.error('Error fetching workers', e);
        list.innerHTML = '<p class="text-danger">Failed to load professionals. Please try again.</p>';
    }
}

window.selectPayment = function(method) {
    document.querySelectorAll('.payment-option').forEach(c => c.classList.remove('selected'));
    const selectedObj = Array.from(document.querySelectorAll('.payment-option')).find(c => c.getAttribute('onclick').includes(method));
    if (selectedObj) selectedObj.classList.add('selected');
    bookingData.paymentMethod = method;
}

function updatePaymentSummary() {
    document.getElementById('summary-base-rate').textContent = '₹' + bookingData.workerPrice;
    document.getElementById('summary-total-price').textContent = '₹' + (bookingData.workerPrice + 49);
    bookingData.totalPrice = bookingData.workerPrice + 49;
    
    // User Wallet Check
    const user = Storage.get('BlueBridge_user');
    const walletText = document.getElementById('wallet-balance-info');
    if (walletText && user && user.wallet) {
        walletText.textContent = `Balance: ₹${user.wallet.balance || 0}`;
    }
}

function prepareFinalSummary() {
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    document.getElementById('final-service-desc').textContent = `${bookingData.serviceType} standard service`;
    document.getElementById('final-date-time').textContent = `${formattedDate} at ${bookingData.time}`;
    document.getElementById('final-address').textContent = bookingData.address;
    document.getElementById('final-worker-name').textContent = bookingData.workerName || 'Auto-Assigned Professional';
}

async function submitBooking() {
    const user = Storage.get('BlueBridge_user');
    const submitBtn = document.getElementById('next-btn');
    submitBtn.textContent = 'Getting Location & Processing...';
    submitBtn.disabled = true;

    try {
        // Fetch actual GPS location
        const getGPSLocation = () => new Promise((resolve) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
                    (error) => resolve(null),
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            } else {
                resolve(null);
            }
        });
        
        const userGPS = await getGPSLocation();
        
        const payload = {
            customerId: user.uid || user.user_id,
            customerName: user.name || 'User',
            workerId: bookingData.workerId,
            workerName: bookingData.workerName,
            serviceType: bookingData.serviceType,
            address: bookingData.address,
            date: bookingData.date,
            time: bookingData.time,
            price: bookingData.totalPrice,
            paymentMethod: bookingData.paymentMethod,
            scheduledTime: `${bookingData.date}T${bookingData.time}:00.000Z`,
            location: userGPS // Attached pure GPS coordinates
        };

        const result = await API.jobs.create(payload);
        
        alert('Booking Confirmed! You can track it in your dashboard.');
        
        // Clean up pre-selected worker
        Storage.remove('BlueBridge_selected_worker_id');
        Storage.remove('BlueBridge_selected_service');
        
        window.location.href = '/dashboard/customer';
    } catch (e) {
        console.error('Booking failed', e);
        alert('Failed to process booking: ' + e.message);
        submitBtn.textContent = 'Confirm Booking';
        submitBtn.disabled = false;
    }
}
