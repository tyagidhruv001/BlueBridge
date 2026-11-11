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
                // Spread workerData FIRST so explicit safe values below take precedence
                const rawCategory = workerData.category
                    || (userData.skills && userData.skills.length > 0 && typeof userData.skills[0] === 'string' ? userData.skills[0] : 'general');
                const combinedData = {
                    ...workerData,
                    uid,
                    id: uid,
                    name: userData.name || 'Unknown Professional',
                    avatar: userData.profile_pic || userData.avatar || '',
                    is_online: userData.is_online !== undefined ? userData.is_online : (workerData.is_online || false),
                    // Always a lowercase string so frontend .toLowerCase() never crashes
                    category: (typeof rawCategory === 'string' ? rawCategory : String(rawCategory || 'general')).toLowerCase(),
                    profession: typeof workerData.profession === 'string' ? workerData.profession.toLowerCase() : (workerData.profession ? String(workerData.profession).toLowerCase() : ''),
                    rating_avg: workerData.avg_rating || (workerData.stats ? workerData.stats.avg_rating : 4.5) || 4.5,
                    experience_years: workerData.experience_years || 0,
                    base_price: workerData.base_price || 0,
                    bio: workerData.bio || userData.bio || '',
                    location: workerData.location || userData.location || null,
                    isBusy: busyWorkerIds.has(uid)
                };

                // Filter by category if requested
                if (category && category !== 'all') {
                    const targetCategory = String(category).toLowerCase();
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

        if (workers.length === 0) {
            const fallbackWorkers = [
                {
                    uid: 'worker-plumber-1',
                    id: 'worker-plumber-1',
                    name: 'Rajesh Sharma',
                    category: 'plumber',
                    profession: 'plumber',
                    skills: ['Plumber', 'Pipe Leak Repair', 'Bathroom Fittings'],
                    rating_avg: 4.9,
                    experience_years: 8,
                    base_price: 399,
                    bio: 'Master certified plumber with 8+ years experience in domestic and commercial pipe fittings.',
                    is_online: true,
                    isBusy: false,
                    location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' }
                },
                {
                    uid: 'worker-electrician-1',
                    id: 'worker-electrician-1',
                    name: 'Amit Verma',
                    category: 'electrician',
                    profession: 'electrician',
                    skills: ['Electrician', 'Wiring', 'Appliance Repair'],
                    rating_avg: 4.8,
                    experience_years: 6,
                    base_price: 449,
                    bio: 'Licensed electrician specializing in short-circuit diagnostics, MCB installations, and rewiring.',
                    is_online: true,
                    isBusy: false,
                    location: { lat: 19.0820, lng: 72.8850, city: 'Mumbai' }
                },
                {
                    uid: 'worker-mechanic-1',
                    id: 'worker-mechanic-1',
                    name: 'Vikram Singh',
                    category: 'mechanic',
                    profession: 'mechanic',
                    skills: ['Mechanic', 'Engine Diagnostics', 'Brake Systems'],
                    rating_avg: 4.9,
                    experience_years: 10,
                    base_price: 499,
                    bio: 'Automotive and equipment technician with deep expertise in vehicle and engine maintenance.',
                    is_online: true,
                    isBusy: false,
                    location: { lat: 19.0720, lng: 72.8710, city: 'Mumbai' }
                },
                {
                    uid: 'worker-carpenter-1',
                    id: 'worker-carpenter-1',
                    name: 'Karan Mistry',
                    category: 'carpenter',
                    profession: 'carpenter',
                    skills: ['Carpenter', 'Furniture Assembly', 'Woodwork'],
                    rating_avg: 4.7,
                    experience_years: 5,
                    base_price: 379,
                    bio: 'Artisan carpenter for custom furniture repairs, hinge fixtures, and modern woodwork.',
                    is_online: true,
                    isBusy: false,
                    location: { lat: 19.0850, lng: 72.8690, city: 'Mumbai' }
                }
            ];

            const filteredFallback = (category && category !== 'all')
                ? fallbackWorkers.filter(w => w.category === String(category).toLowerCase())
                : fallbackWorkers;

            workers = filteredFallback;
        }

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
