const { db } = require('../../config/firebase');
const ngeohash = require('ngeohash');
const { getDistanceFromLatLonInKm } = require('../utils/location.utils');

exports.updateWorker = async (req, res) => {
    try {
        const { uid } = req.params;
        if (uid === 'onboarding') return res.status(400).json({ error: 'Invalid UID' });
        const {
            category,
            is_online,
            is_verified,
            base_price,
            experience_years,
            location,
            identity_docs,
            qualifications,
            bio,
            portfolio,
            verification_status,
            verification_notes,
            total_jobs,
            avg_rating,
            lifetime_earnings
        } = req.body;

        const workerData = {
            uid,
            category,
            is_online,
            is_verified,
            base_price,
            experience_years,
            identity_docs,
            qualifications: qualifications || [],
            bio: bio || '',
            portfolio: portfolio || [],
            verification_status: verification_status || 'pending',
            verification_notes: verification_notes || '',
            verified_at: verification_status === 'verified' ? new Date().toISOString() : null,
            stats: {
                total_jobs: total_jobs || 0,
                avg_rating: avg_rating || 0,
                lifetime_earnings: lifetime_earnings || 0
            },
            updated_at: new Date().toISOString()
        };

        // Note: Location filtering is currently disabled as requested.
        // We will stop processing and storing location data here.

        await db.collection('workers').doc(uid).set(workerData, { merge: true });

        res.status(200).json({ message: 'Worker data updated', data: workerData });
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkers = async (req, res) => {
    try {
        const { category } = req.query;
        console.log(`[WORKERS] Fetching real registered workers. Filter: category=${category}`);

        // We fetch from 'users' collection first to see all registered workers
        const usersSnapshot = await db.collection('users').where('role', '==', 'worker').get();
        let workers = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const uid = userDoc.id;

            // Try to get extended professional data from 'workers' collection
            const workerDoc = await db.collection('workers').doc(uid).get();
            const workerData = workerDoc.exists ? workerDoc.data() : {};

            // Combine data
            const combinedData = {
                uid,
                id: uid,
                name: userData.name || 'Unknown Professional',
                avatar: userData.profile_pic || userData.avatar || '',
                is_online: userData.is_online !== undefined ? userData.is_online : (workerData.is_online || false),
                category: workerData.category || (userData.skills ? userData.skills[0].toLowerCase() : 'general'),
                rating_avg: workerData.avg_rating || workerData.stats?.avg_rating || 4.5,
                experience_years: workerData.experience_years || 0,
                base_price: workerData.base_price || 0,
                bio: workerData.bio || userData.bio || '',
                // Include real-time GPS location so map markers render correctly
                location: workerData.location || userData.location || null,
                ...workerData
            };

            // Filter by category if requested
            if (category && category !== 'all') {
                const targetCategory = category.toLowerCase();
                if (combinedData.category !== targetCategory) {
                    continue;
                }
            }

            workers.push(combinedData);
        }

        console.log(`[WORKERS] Found ${workers.length} registered workers`);

        // Simple scoring for recommendation (Top rated first)
        workers = workers.map(w => {
            const rating = w.rating_avg || 4.5;
            const experience = w.experience_years || 0;
            w.ai_score = (rating * 0.7) + (Math.min(experience, 10) * 0.3);
            return w;
        });

        workers.sort((a, b) => b.ai_score - a.ai_score);

        res.status(200).json(workers);
    } catch (error) {
        console.error('Error in getWorkers:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkerHistory = async (req, res) => {
    try {
        const { uid } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const snapshot = await db.collection('workers')
            .doc(uid)
            .collection('locationHistory')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(history.reverse());
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateWorkerLocation = async (req, res) => {
    try {
        const { uid } = req.params;
        const { lat, lng, timestamp, accuracy } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const locationData = {
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timestamp: timestamp || new Date().toISOString(),
                accuracy: accuracy || 0
            },
            last_seen: new Date().toISOString()
        };

        await db.collection('workers').doc(uid).update(locationData);
        await db.collection('users').doc(uid).update({
            location: locationData.location
        });

        await db.collection('workers').doc(uid).collection('locationHistory').add({
            ...locationData.location,
            timestamp: locationData.location.timestamp,
            accuracy: locationData.location.accuracy
        });

        res.status(200).json({
            message: 'Location updated successfully',
            location: locationData.location
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: error.message });
    }
};
