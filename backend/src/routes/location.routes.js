const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');

/**
 * PUT /api/location/:bookingId
 * Update location for a user (customer or worker)
 * Body: { userId, userType, latitude, longitude, timestamp }
 */
router.put('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { userId, userType, latitude, longitude, timestamp } = req.body;

        if (!userId || !userType || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, userType, latitude, longitude'
            });
        }

        // Validate userType
        if (userType !== 'customer' && userType !== 'worker') {
            return res.status(400).json({
                success: false,
                error: 'userType must be either "customer" or "worker"'
            });
        }

        // Get existing location document or create new one
        const locationRef = db.collection('locations').doc(bookingId);
        const locationDoc = await locationRef.get();

        const locationData = {
            [`${userType}Location`]: {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
                timestamp: timestamp || new Date().toISOString()
            },
            [`${userType}Id`]: userId,
            lastUpdated: new Date().toISOString(),
            status: 'active'
        };

        if (locationDoc.exists) {
            // Update existing document
            await locationRef.update(locationData);
        } else {
            // Create new document
            await locationRef.set({
                bookingId,
                ...locationData,
                createdAt: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: 'Location updated successfully',
            location: locationData[`${userType}Location`]
        });

    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/location/:bookingId
 * Get current locations for both customer and worker
 */
router.get('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const locationDoc = await db.collection('locations').doc(bookingId).get();

        if (!locationDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'No location data found for this booking'
            });
        }

        const data = locationDoc.data();

        res.json({
            success: true,
            data: {
                customerId: data.customerId,
                workerId: data.workerId,
                customerLocation: data.customerLocation || null,
                workerLocation: data.workerLocation || null,
                status: data.status,
                lastUpdated: data.lastUpdated
            }
        });

    } catch (error) {
        console.error('Location fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/location/:bookingId
 * Clear location tracking for a booking (when job is completed)
 */
router.delete('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        await db.collection('locations').doc(bookingId).update({
            status: 'completed',
            completedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Location tracking stopped'
        });

    } catch (error) {
        console.error('Location delete error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/location/:bookingId/distance
 * Calculate distance between customer and worker
 */
router.get('/:bookingId/distance', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const locationDoc = await db.collection('locations').doc(bookingId).get();

        if (!locationDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'No location data found'
            });
        }

        const data = locationDoc.data();
        const { customerLocation, workerLocation } = data;

        if (!customerLocation || !workerLocation) {
            return res.status(400).json({
                success: false,
                error: 'Both customer and worker locations are required'
            });
        }

        // Haversine formula to calculate distance
        const distance = calculateDistance(
            customerLocation.lat,
            customerLocation.lng,
            workerLocation.lat,
            workerLocation.lng
        );

        res.json({
            success: true,
            distance: {
                km: distance,
                miles: distance * 0.621371,
                meters: distance * 1000
            }
        });

    } catch (error) {
        console.error('Distance calculation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

module.exports = router;
