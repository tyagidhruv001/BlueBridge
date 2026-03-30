// ============================================
// REAL-TIME WORKER LOCATION UPDATES
// Firestore listeners for live worker tracking
// ============================================

// Stores
let currentWorkerIds = [];
let globalPollInterval = null;
let currentFilters = {};
let isSubscribedToWorkers = false;
let workerLocationListeners = {};
let trackingMarkers = [];

// Subscribe to real-time worker location updates
function subscribeToWorkerUpdates(workerIds, filters = {}) {
    currentWorkerIds = workerIds || [];
    currentFilters = filters;

    if (workerIds.length === 0) {
        console.log('No workers to subscribe to');
        stopPolling();
        return;
    }

    console.log(`📡 Subscribing to ${workerIds.length} workers via Polling...`);
    const useRealtime = localStorage.getItem('use_firestore_realtime') === 'true';

    if (useRealtime && window.firebase && firebase.apps.length) {
        enableFirestoreRealtime(workerIds);
    } else {
        // Fallback to Global Single-Request Polling
        startGlobalPolling();
        isSubscribedToWorkers = true;
    }
}

function startGlobalPolling() {
    stopPolling(); // Clear existing

    console.log('🔄 Starting Global Worker Polling (10s interval)');

    // Initial Poll
    pollAllWorkers();

    // Loop
    globalPollInterval = setInterval(pollAllWorkers, 60000); // 1 minute interval to save quota
}

async function pollAllWorkers() {
    if (document.hidden) return; // Skip if tab hidden

    try {
        // Use the same filters as the dashboard to get relevant updates
        // If filters are empty, it might return all workers, which is acceptable for now
        // or we could optimistically just update only the markers we have.

        console.log('🔄 Polling for worker location updates...');
        const workers = await API.workers.getAll(currentFilters);

        if (!Array.isArray(workers)) return;

        workers.forEach(worker => {
            // Only update if this worker is in our relevant list (optional check)
            // or if they are already on the map
            const uid = worker.uid || worker.id;
            if (uid && worker.location && worker.location.lat && worker.location.lng) {
                updateWorkerMarkerPosition(uid, worker.location.lat, worker.location.lng);
            }
        });

    } catch (error) {
        console.warn('⚠️ Global polling partial failure:', error);
    }
}

function stopPolling() {
    if (globalPollInterval) {
        clearInterval(globalPollInterval);
        globalPollInterval = null;
    }
}

// ... Firestore logic remains ...


// Unsubscribe from all workers
function unsubscribeFromAllWorkers() {
    Object.keys(workerLocationListeners).forEach(uid => {
        unsubscribeFromWorker(uid);
    });
    isSubscribedToWorkers = false;
    console.log('🛑 Unsubscribed from all workers');
}

// Update worker marker position with animation
function updateWorkerMarkerPosition(workerId, newLat, newLng) {
    const marker = trackingMarkers.find(m => m.workerId === workerId);

    if (!marker) {
        console.warn(`Marker not found for worker: ${workerId}`);
        return;
    }

    const currentLatLng = marker.getLatLng();
    const newLatLng = L.latLng(newLat, newLng);

    // Check if position actually changed
    const distance = currentLatLng.distanceTo(newLatLng);
    if (distance < 5) {
        // Less than 5 meters, don't update
        return;
    }

    console.log(`🚶 Worker ${workerId} moved ${distance.toFixed(0)}m`);

    // Animate marker movement
    animateMarker(marker, currentLatLng, newLatLng, 1000); // 1 second animation
}

// Animate marker from old position to new position
function animateMarker(marker, startLatLng, endLatLng, duration) {
    const startTime = Date.now();
    const startLat = startLatLng.lat;
    const startLng = startLatLng.lng;
    const endLat = endLatLng.lat;
    const endLng = endLatLng.lng;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentLat = startLat + (endLat - startLat) * eased;
        const currentLng = startLng + (endLng - startLng) * eased;

        marker.setLatLng([currentLat, currentLng]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Cleanup listeners when leaving page
window.addEventListener('beforeunload', () => {
    unsubscribeFromAllWorkers();
});

// Pause updates when page is hidden (battery optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Page hidden, pausing worker updates');
        unsubscribeFromAllWorkers();
    } else if (isSubscribedToWorkers) {
        console.log('▶️ Page visible, resuming worker updates');
        // Re-subscribe will happen on next map render
    }
});

console.log('📡 Real-time worker tracking initialized');

