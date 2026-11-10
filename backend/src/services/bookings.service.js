const { db, admin } = require('../../config/firebase');
const { canTransition } = require('../utils/bookingTransitions');

class BookingsService {
    /**
     * Authoritatively creates a new booking.
     * Enforces backend price calculation, worker validation, and idempotency.
     */
    async createBooking(user, bookingInput, idempotencyKey = null) {
        const customerId = user.uid;

        // 1. Prevent customer from assigning self as worker
        if (bookingInput.workerId && bookingInput.workerId !== 'auto-assign' && bookingInput.workerId === customerId) {
            const err = new Error('Customer cannot assign themselves as worker');
            err.statusCode = 400;
            throw err;
        }

        // 2. Validate worker existence and worker role if specified
        let workerName = bookingInput.workerName || null;
        let workerPhone = bookingInput.workerPhone || null;
        let baseRate = 450; // standard fallback base rate

        if (bookingInput.workerId && bookingInput.workerId !== 'auto-assign') {
            const workerUserDoc = await db.collection('users').doc(bookingInput.workerId).get();
            if (!workerUserDoc.exists || workerUserDoc.data().role !== 'worker') {
                const err = new Error('Selected worker does not exist or is not a registered worker');
                err.statusCode = 400;
                throw err;
            }
            const workerUserData = workerUserDoc.data();
            workerName = workerUserData.name || workerName;
            workerPhone = workerUserData.phone || workerPhone;

            const workerDoc = await db.collection('workers').doc(bookingInput.workerId).get();
            if (workerDoc.exists && workerDoc.data().base_price) {
                baseRate = Number(workerDoc.data().base_price) || 450;
            }
        }

        // 3. Authoritative Price Calculation (Platform fee = ₹49)
        const platformFee = 49;
        const authoritativePrice = baseRate + platformFee;

        // 4. Idempotency & deduplication check
        const resolvedIdempotencyKey = idempotencyKey || bookingInput.clientRequestId || null;
        if (resolvedIdempotencyKey) {
            const existingSnapshot = await db.collection('jobs')
                .where('customerId', '==', customerId)
                .where('idempotencyKey', '==', resolvedIdempotencyKey)
                .limit(1)
                .get();

            if (!existingSnapshot.empty) {
                const existingDoc = existingSnapshot.docs[0];
                return { id: existingDoc.id, ...existingDoc.data(), isDuplicate: true };
            }
        }

        // Construct scheduled time
        const scheduledTime = bookingInput.scheduledTime || bookingInput.scheduled_time ||
            (bookingInput.date && bookingInput.time ? `${bookingInput.date}T${bookingInput.time}:00.000Z` : null);

        const initialStatus = (bookingInput.workerId && bookingInput.workerId !== 'auto-assign') ? 'assigned' : 'pending';

        const bookingData = {
            customerId,
            customerName: bookingInput.customerName || user.email || 'Customer',
            customerPhone: bookingInput.customerPhone || null,
            workerId: bookingInput.workerId || 'auto-assign',
            workerName,
            workerPhone,
            serviceType: bookingInput.serviceType,
            location: bookingInput.location || null,
            address: bookingInput.address || null,
            date: bookingInput.date || null,
            time: bookingInput.time || null,
            scheduledTime,
            scheduled_time: scheduledTime,
            price: authoritativePrice,
            paymentMethod: bookingInput.paymentMethod || 'cod',
            status: initialStatus,
            isEmergency: !!bookingInput.isEmergency,
            idempotencyKey: resolvedIdempotencyKey,
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            payment: {
                status: 'pending',
                method: bookingInput.paymentMethod || 'cod',
                amount: authoritativePrice
            },
            media: { before_img: '', after_img: '' },
            tracking: {
                worker_location: null,
                eta: null,
                distance: null,
                last_updated: new Date().toISOString()
            },
            timeline: {
                created_at: new Date().toISOString(),
                assigned_at: (bookingInput.workerId && bookingInput.workerId !== 'auto-assign') ? new Date().toISOString() : null,
                accepted_at: null,
                started_at: null,
                completed_at: null,
                cancelled_at: null
            }
        };

        const docRef = await db.collection('jobs').add(bookingData);
        return { id: docRef.id, ...bookingData };
    }

    /**
     * Fetches bookings according to user role and ownership.
     */
    async getBookings(user, filters = {}) {
        const userId = user.uid;
        const role = user.role || filters.role;

        let query = db.collection('jobs');

        if (filters.type === 'available' || filters.status === 'pending') {
            query = query.where('status', '==', 'pending');
        } else if (role === 'worker') {
            query = query.where('workerId', '==', userId);
        } else if (role === 'customer' || userId) {
            query = query.where('customerId', '==', userId);
        }

        const snapshot = await query.get();
        const bookings = [];

        for (const doc of snapshot.docs) {
            const job = { id: doc.id, ...doc.data() };

            // Join with worker phone if needed
            if (job.workerId && job.workerId !== 'auto-assign' && !job.workerPhone) {
                try {
                    const workerUserDoc = await db.collection('users').doc(job.workerId).get();
                    if (workerUserDoc.exists) {
                        job.workerPhone = workerUserDoc.data().phone || '';
                    }
                } catch (e) {
                    // Non-fatal
                }
            }
            bookings.push(job);
        }

        bookings.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
        return bookings;
    }

    /**
     * Retrieves single booking by ID with ownership verification.
     */
    async getBookingById(user, jobId) {
        const docRef = db.collection('jobs').doc(jobId);
        const doc = await docRef.get();

        if (!doc.exists) {
            const err = new Error('Booking not found');
            err.statusCode = 404;
            throw err;
        }

        const job = { id: doc.id, ...doc.data() };
        const isCustomer = job.customerId === user.uid;
        const isWorker = job.workerId === user.uid;
        const isAdmin = user.role === 'admin';
        const isAvailableToWorker = job.status === 'pending' && user.role === 'worker';

        if (!isCustomer && !isWorker && !isAdmin && !isAvailableToWorker) {
            const err = new Error('Access denied: You are not authorized to view this booking');
            err.statusCode = 403;
            throw err;
        }

        return job;
    }

    /**
     * Authoritatively updates a booking inside a Firestore transaction.
     * Enforces valid state transitions, role permissions, worker assignment race safety, and immutable prices.
     */
    async updateBooking(user, jobId, rawUpdates) {
        return await db.runTransaction(async (transaction) => {
            const jobRef = db.collection('jobs').doc(jobId);
            const snapshot = await transaction.get(jobRef);

            if (!snapshot.exists) {
                const error = new Error('Booking not found');
                error.statusCode = 404;
                throw error;
            }

            const booking = snapshot.data();
            const uid = user.uid;

            const isCustomer = booking.customerId === uid;
            const isAssignedWorker = booking.workerId === uid;
            const isAdmin = user.role === 'admin';

            // Check if a worker is claiming an unassigned pending job
            const isPendingUnassigned = booking.status === 'pending' && (!booking.workerId || booking.workerId === 'auto-assign');
            const isWorkerClaiming = isPendingUnassigned && user.role === 'worker' &&
                (rawUpdates.status === 'assigned' || rawUpdates.status === 'accepted' || rawUpdates.workerId === uid);

            if (!isCustomer && !isAssignedWorker && !isAdmin && !isWorkerClaiming) {
                const error = new Error('Access denied: You are not authorized to update this booking');
                error.statusCode = 403;
                throw error;
            }

            const targetStatus = rawUpdates.status;

            // State transition validation
            if (targetStatus && targetStatus !== booking.status) {
                if (!canTransition(booking.status, targetStatus)) {
                    const error = new Error(`Invalid booking transition from '${booking.status}' to '${targetStatus}'`);
                    error.statusCode = 400;
                    throw error;
                }

                // Cancellation rules
                if (targetStatus === 'cancelled') {
                    if (!isCustomer && !isAdmin) {
                        const error = new Error('Only the customer or administrator can cancel a booking');
                        error.statusCode = 403;
                        throw error;
                    }
                    if (['in_progress', 'completed'].includes(booking.status)) {
                        const error = new Error(`Cannot cancel a booking that is already ${booking.status}`);
                        error.statusCode = 400;
                        throw error;
                    }
                }

                // Worker action rules (accept, in_progress, completed)
                if (['accepted', 'in_progress', 'completed'].includes(targetStatus)) {
                    if (!isAssignedWorker && !isWorkerClaiming && !isAdmin) {
                        const error = new Error('Worker permission required to accept, start, or complete booking');
                        error.statusCode = 403;
                        throw error;
                    }
                }
            }

            // Strip immutable and financial fields to prevent client manipulation
            const safeUpdates = { ...rawUpdates };
            delete safeUpdates.id;
            delete safeUpdates.customerId;
            delete safeUpdates.price;
            delete safeUpdates.amount;
            delete safeUpdates.totalPrice;
            delete safeUpdates.payment; // Cannot directly manipulate payment records here
            delete safeUpdates.idempotencyKey;
            delete safeUpdates.createdAt;

            // Worker claiming race condition protection
            if (isWorkerClaiming) {
                // Ensure no other worker claimed it first
                if (booking.workerId && booking.workerId !== 'auto-assign' && booking.workerId !== uid) {
                    const error = new Error('Booking has already been claimed by another worker');
                    error.statusCode = 409;
                    throw error;
                }
                safeUpdates.workerId = uid;

                const workerUserDoc = await transaction.get(db.collection('users').doc(uid));
                if (workerUserDoc.exists) {
                    safeUpdates.workerName = workerUserDoc.data().name || 'Worker';
                    safeUpdates.workerPhone = workerUserDoc.data().phone || '';
                }
                safeUpdates['timeline.assigned_at'] = new Date().toISOString();
            }

            if (targetStatus === 'accepted') {
                safeUpdates['timeline.accepted_at'] = new Date().toISOString();
            }

            if (targetStatus === 'in_progress') {
                safeUpdates['timeline.started_at'] = new Date().toISOString();
            }

            if (targetStatus === 'cancelled') {
                safeUpdates['timeline.cancelled_at'] = new Date().toISOString();
            }

            // Record completion timestamp
            if (targetStatus === 'completed' && booking.status !== 'completed') {
                safeUpdates['timeline.completed_at'] = new Date().toISOString();
            }

            safeUpdates.updatedAt = new Date().toISOString();

            // 1. Update primary booking document
            transaction.update(jobRef, safeUpdates);

            // 2. Atomically increment worker stats on completion (only once)
            if (targetStatus === 'completed' && booking.status !== 'completed') {
                const workerId = booking.workerId || safeUpdates.workerId;
                if (workerId && workerId !== 'auto-assign') {
                    const workerRef = db.collection('workers').doc(workerId);
                    const earnings = booking.price || 0;
                    transaction.update(workerRef, {
                        'stats.total_jobs': admin.firestore.FieldValue.increment(1),
                        'stats.lifetime_earnings': admin.firestore.FieldValue.increment(earnings)
                    });
                }
            }

            return {
                id: jobId,
                ...booking,
                ...safeUpdates,
                success: true
            };
        });
    }
}

module.exports = new BookingsService();
