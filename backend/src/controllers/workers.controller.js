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
            lifetime_earnings,
            profession
        } = req.body;

        const workerData = {
            uid,
            category: profession || category, // Keep in sync
            profession,
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

        // Identify all workers with active assignments
        const activeJobsSnapshot = await db.collection('jobs')
            .where('status', 'in', ['assigned', 'accepted', 'in_progress', 'running', 'on the way', 'active'])
            .get();
        
        const busyWorkerIds = new Set();
        activeJobsSnapshot.forEach(doc => {
            const job = doc.data();
            if (job.workerId && job.workerId !== 'auto-assign') {
                busyWorkerIds.add(job.workerId);
            }
        });

        for (const userDoc of usersSnapshot.docs) {
            try {
                const userData = userDoc.data() || {};
                const uid = userDoc.id;

                // Try to get extended professional data from 'workers' collection
                const workerDoc = await db.collection('workers').doc(uid).get();
                const workerData = (workerDoc.exists ? workerDoc.data() : {}) || {};

                // Combine data with extreme defensive checks
                const combinedData = {
                    uid,
                    id: uid,
                    name: userData.name || 'Unknown Professional',
                    avatar: userData.profile_pic || userData.avatar || '',
                    is_online: userData.is_online !== undefined ? userData.is_online : (workerData.is_online || false),
                    category: workerData.category || (userData.skills && userData.skills.length > 0 ? userData.skills[0].toLowerCase() : 'general'),
                    rating_avg: workerData.avg_rating || (workerData.stats ? workerData.stats.avg_rating : 4.5) || 4.5,
                    experience_years: workerData.experience_years || 0,
                    base_price: workerData.base_price || 0,
                    bio: workerData.bio || userData.bio || '',
                    location: workerData.location || userData.location || null,
                    isBusy: busyWorkerIds.has(uid),
                    ...workerData
                };

                // Filter by category if requested
                if (category && category !== 'all') {
                    const targetCategory = category.toLowerCase();
                    const workerCategory = (combinedData.category || '').toLowerCase();
                    const workerProfession = (combinedData.profession || '').toLowerCase();
                    
                    if (workerCategory !== targetCategory && workerProfession !== targetCategory) {
                        continue;
                    }
                }

                workers.push(combinedData);
            } catch (innerError) {
                console.error(`[WORKERS ERROR] Failed to process worker ${userDoc.id}:`, innerError);
                // Continue to next worker so one bad record doesn't crash everything
            }
        }

        console.log(`[WORKERS] Found ${workers.length} registered workers`);

        workers = workers.map(w => {
            const rating = w.rating_avg || 4.5;
            const exp = w.experience_years || 0;
            w.ai_score = (rating * 0.7) + (Math.min(exp, 10) * 0.3);
            return w;
        }).sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));

        res.status(200).json(workers);
    } catch (error) {
        console.error('CRITICAL: Error in getWorkers:', error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
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

exports.getWorkerById = async (req, res) => {
    try {
        const { uid } = req.params;
        console.log(`[WORKERS] Fetching detailed profile for: ${uid}`);

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        const userData = userDoc.data();
        const workerDoc = await db.collection('workers').doc(uid).get();
        const workerData = workerDoc.exists ? workerDoc.data() : {};

        const combinedData = {
            uid,
            id: uid,
            name: userData.name || 'Unknown Professional',
            avatar: userData.profile_pic || userData.avatar || '',
            is_online: userData.is_online !== undefined ? userData.is_online : (workerData.is_online || false),
            category: workerData.category || (userData.skills ? userData.skills[0].toLowerCase() : 'general'),
            rating_avg: workerData.avg_rating || workerData.stats?.avg_rating || 4.5,
            ...userData,
            ...workerData,
            stats: {
                total_jobs: workerData.stats?.total_jobs || 0,
                avg_rating: workerData.stats?.avg_rating || 4.5,
                lifetime_earnings: workerData.stats?.lifetime_earnings || 0,
                ...workerData.stats
            }
        };

        res.status(200).json(combinedData);
    } catch (error) {
        console.error('Error in getWorkerById:', error);
        res.status(500).json({ error: error.message });
    }
};
