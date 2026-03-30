const { db, admin } = require('../../config/firebase');

exports.createBooking = async (req, res) => {
    try {
        const {
            customerId,
            workerId,
            serviceType,
            location,
            isEmergency,
            payment,
            scheduled_time,
            address,
            date,
            time,
            price,
            paymentMethod,
            customerName,
            workerName,
            customerPhone,
            workerPhone
        } = req.body;

        const bookingData = {
            customerId,
            workerId: workerId || 'auto-assign',
            customerName,
            workerName,
            status: 'pending',
            serviceType,
            location: location || null,
            address: address || null,
            date: date || null,
            time: time || null,
            price: price || 0,
            paymentMethod: paymentMethod || 'cod',
            customerPhone: customerPhone || null,
            workerPhone: workerPhone || null,
            isEmergency: !!isEmergency,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            payment: payment || { status: 'pending', method: paymentMethod || 'cod', amount: price || 0 },
            media: { before_img: "", after_img: "" },
            tracking: {
                worker_location: null,
                eta: null,
                distance: null,
                last_updated: new Date().toISOString()
            },
            timeline: {
                created_at: new Date().toISOString(),
                assigned_at: workerId && workerId !== 'auto-assign' ? new Date().toISOString() : null,
                started_at: null,
                completed_at: null
            }
        };

        if (scheduled_time) bookingData.scheduled_time = scheduled_time;

        // Use 'jobs' collection for real-time sync with dashboard
        const docRef = await db.collection('jobs').add(bookingData);

        res.status(201).json({ id: docRef.id, ...bookingData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const { user_id, role } = req.query;

        if (!user_id && req.query.status !== 'pending') return res.status(400).json({ error: 'user_id is required' });

        let query = db.collection('jobs');

        if (role === 'customer') {
            query = query.where('customerId', '==', user_id);
        } else if (role === 'worker') {
            // Workers should see:
            // 1. Jobs specifically assigned to them
            // 2. Jobs that are 'pending' and unassigned (auto-assign pool)
            // Note: Firestore doesn't support OR queries easily here without separate fetches, 
            // but we can return pending jobs if requested specifically or handle in multiple queries.
            if (req.query.status === 'pending') {
                query = query.where('status', '==', 'pending');
            } else {
                query = query.where('workerId', '==', user_id);
            }
        } else if (req.query.status === 'pending') {
            // For available jobs pool
            query = query.where('status', '==', 'pending');
        }

        const snapshot = await query.get();
        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });

        bookings.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const docRef = db.collection('jobs').doc(id);
        const bookingDoc = await docRef.get();
        if (!bookingDoc.exists) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const bookingData = bookingDoc.data();

        // Map updates to consistent fields
        if (updates.status === 'assigned' || (updates.workerId && updates.workerId !== 'auto-assign' && bookingData.workerId === 'auto-assign')) {
            updates['timeline.assigned_at'] = new Date().toISOString();
        }

        if (updates.status === 'in_progress') {
            updates.status = 'in_progress'; // Ensure consistent name
            updates['timeline.started_at'] = new Date().toISOString();
        }

        if (updates.status === 'completed' && bookingData.status !== 'completed') {
            updates['timeline.completed_at'] = new Date().toISOString();

            const workerId = updates.workerId || bookingData.workerId;
            if (workerId && workerId !== 'auto-assign') {
                const workerRef = db.collection('workers').doc(workerId);
                const earnings = updates.price || bookingData.price || 0;

                await workerRef.update({
                    'stats.total_jobs': admin.firestore.FieldValue.increment(1),
                    'stats.lifetime_earnings': admin.firestore.FieldValue.increment(earnings)
                }).catch(err => console.error("Stats update failed:", err));
            }
        }

        await docRef.update(updates);
        res.json({ id, ...updates, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
