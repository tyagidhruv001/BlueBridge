import { apiFetch } from "../../../api/api.js";

class WorkerLocationTracker {
    constructor() {
        this.isTracking = false;
        this.watchId = null;
        this.updateInterval = null;
        this.lastUpdate = null;
        this.currentPosition = null;
        this.UPDATE_FREQUENCY = 30000;
        this.MIN_DISTANCE_METERS = 10;
    }

    async start() {
        if (this.isTracking) return;

        const user = Storage.get('BlueBridge_user');
        if (!user || !user.uid) return;

        const trackingEnabled = localStorage.getItem(`tracking_enabled_${user.uid}`) !== 'false';
        if (!trackingEnabled) return;

        const batterySaver = localStorage.getItem('BlueBridge_battery_saver') === 'true';
        this.UPDATE_FREQUENCY = batterySaver ? 120000 : 30000;
        this.MIN_DISTANCE_METERS = batterySaver ? 30 : 10;

        if (!navigator.geolocation) return;

        console.log(`🎯 Starting live tracking...`);
        this.isTracking = true;

        await this.clearQueuedLocationUpdates();

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => this.handlePositionError(error),
            {
                enableHighAccuracy: !batterySaver,
                timeout: 10000,
                maximumAge: batterySaver ? 60000 : 25000
            }
        );

        this.updateInterval = setInterval(() => {
            this.getCurrentPosition();
        }, this.UPDATE_FREQUENCY);

        this.updateTrackingIndicator(true);
    }

    stop() {
        if (!this.isTracking) return;
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isTracking = false;
        this.updateTrackingIndicator(false);
    }

    getCurrentPosition() {
        navigator.geolocation.getCurrentPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => console.warn('Position update failed:', error),
            { timeout: 10000, maximumAge: 25000 }
        );
    }

    async handlePositionUpdate(position) {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;

        if (this.shouldUpdate(lat, lng)) {
            this.currentPosition = { lat, lng, accuracy, timestamp: Date.now() };
            await this.sendLocationUpdate(lat, lng);
        }
    }

    shouldUpdate(lat, lng) {
        if (!this.currentPosition) return true;
        const timeSinceLastUpdate = Date.now() - (this.lastUpdate || 0);
        if (timeSinceLastUpdate >= this.UPDATE_FREQUENCY) return true;

        const distance = this.calculateDistance(
            this.currentPosition.lat,
            this.currentPosition.lng,
            lat,
            lng
        );
        return distance >= this.MIN_DISTANCE_METERS;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async sendLocationUpdate(lat, lng) {
        const user = Storage.get('BlueBridge_user');
        if (!user || !user.uid) return;

        const locationData = {
            lat,
            lng,
            timestamp: new Date().toISOString(),
            accuracy: this.currentPosition?.accuracy || 0
        };

        try {
            await apiFetch(`/workers/${user.uid}/location`, {
                method: 'PATCH',
                body: JSON.stringify(locationData)
            });
            await this.clearQueuedLocationUpdates();
            this.lastUpdate = Date.now();
            console.log('✅ Location updated successfully');
        } catch (error) {
            console.error('❌ Failed to update location:', error);
            this.queueLocationUpdate(locationData);
        }
    }

    handlePositionError(error) {
        console.error('Geolocation error:', error);
        if (error.code === 1) this.stop();
    }

    updateTrackingIndicator(isActive) {
        const indicator = document.getElementById('liveTrackingIndicator');
        if (indicator) indicator.style.display = isActive ? 'flex' : 'none';
    }

    queueLocationUpdate(data) {
        try {
            const queue = JSON.parse(localStorage.getItem('BlueBridge_location_queue') || '[]');
            queue.push(data);
            if (queue.length > 50) queue.shift();
            localStorage.setItem('BlueBridge_location_queue', JSON.stringify(queue));
        } catch (e) {
            console.error('Queue error:', e);
        }
    }

    async clearQueuedLocationUpdates() {
        const queue = JSON.parse(localStorage.getItem('BlueBridge_location_queue') || '[]');
        if (queue.length === 0) return;

        const user = Storage.get('BlueBridge_user');
        if (!user) return;

        for (const data of queue) {
            try {
                await apiFetch(`/workers/${user.uid}/location`, {
                    method: 'PATCH',
                    body: JSON.stringify(data)
                });
            } catch (e) {
                return;
            }
        }
        localStorage.removeItem('BlueBridge_location_queue');
    }
}

// Global instance helper
window.locationTracker = new WorkerLocationTracker();
window.startLiveTracking = () => window.locationTracker.start();
window.stopLiveTracking = () => window.locationTracker.stop();

window.addEventListener('beforeunload', () => {
    if (window.locationTracker) window.locationTracker.stop();
});

export default WorkerLocationTracker;

