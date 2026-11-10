const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
const bookingsService = require('../src/services/bookings.service');
const { canTransition } = require('../src/utils/bookingTransitions');
const { db, admin } = require('../config/firebase');

test('Booking Transitions - canTransition rules', () => {
    // Valid transitions
    assert.equal(canTransition('pending', 'assigned'), true);
    assert.equal(canTransition('pending', 'accepted'), true);
    assert.equal(canTransition('pending', 'cancelled'), true);
    assert.equal(canTransition('assigned', 'accepted'), true);
    assert.equal(canTransition('assigned', 'cancelled'), true);
    assert.equal(canTransition('accepted', 'in_progress'), true);
    assert.equal(canTransition('accepted', 'cancelled'), true);
    assert.equal(canTransition('in_progress', 'completed'), true);

    // Idempotent transitions
    assert.equal(canTransition('pending', 'pending'), true);
    assert.equal(canTransition('in_progress', 'in_progress'), true);

    // Invalid transitions
    assert.equal(canTransition('pending', 'completed'), false, 'Cannot jump pending directly to completed');
    assert.equal(canTransition('completed', 'in_progress'), false, 'Completed is terminal');
    assert.equal(canTransition('completed', 'cancelled'), false, 'Completed cannot be cancelled');
    assert.equal(canTransition('cancelled', 'in_progress'), false, 'Cancelled is terminal');
    assert.equal(canTransition('in_progress', 'cancelled'), false, 'Cannot cancel in_progress job');
});

test('Booking Creation - CustomerId is derived from authenticated user, ignoring request body', async () => {
    let savedJob = null;
    const originalCollection = db.collection;

    db.collection = (name) => {
        if (name === 'jobs') {
            return {
                add: async (data) => {
                    savedJob = data;
                    return { id: 'job_gen_123' };
                },
                where: () => ({ limit: () => ({ get: async () => ({ empty: true }) }) })
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false }) }) };
    };

    const user = { uid: 'real_cust_id', email: 'cust@test.com', role: 'customer' };
    const bookingInput = {
        customerId: 'attacker_hacked_id', // MUST BE IGNORED
        serviceType: 'Plumbing',
        address: '123 Main St',
        workerId: 'auto-assign',
        price: 5 // ATTEMPTED SPOOFED PRICE
    };

    try {
        const result = await bookingsService.createBooking(user, bookingInput);

        assert.equal(savedJob.customerId, 'real_cust_id', 'CustomerId must come strictly from req.user.uid');
        assert.equal(result.customerId, 'real_cust_id');
        assert.equal(savedJob.price, 499, 'Price must be calculated server-side (450 base + 49 platform fee)');
        assert.equal(savedJob.status, 'pending');
    } finally {
        db.collection = originalCollection;
    }
});

test('Booking Creation - Prevents customer from assigning themselves as worker', async () => {
    const user = { uid: 'user_both', email: 'user@test.com', role: 'customer' };
    const bookingInput = {
        serviceType: 'Electrician',
        workerId: 'user_both' // Self-assignment attempt
    };

    await assert.rejects(
        async () => {
            await bookingsService.createBooking(user, bookingInput);
        },
        (err) => {
            assert.equal(err.statusCode, 400);
            assert.match(err.message, /Customer cannot assign themselves as worker/);
            return true;
        }
    );
});

test('Booking Creation - Validates worker existence and role', async () => {
    const originalCollection = db.collection;

    db.collection = (name) => {
        if (name === 'users') {
            return {
                doc: (uid) => ({
                    get: async () => ({
                        exists: true,
                        data: () => ({ uid, role: 'customer' }) // Not a worker!
                    })
                })
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false }) }) };
    };

    const user = { uid: 'cust_1', email: 'c@test.com', role: 'customer' };
    const bookingInput = {
        serviceType: 'Carpentry',
        workerId: 'not_a_worker_uid'
    };

    try {
        await assert.rejects(
            async () => {
                await bookingsService.createBooking(user, bookingInput);
            },
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.match(err.message, /not a registered worker/);
                return true;
            }
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('Booking Creation - Deduplication via idempotencyKey returns existing booking', async () => {
    const originalCollection = db.collection;
    let addCalled = false;

    db.collection = (name) => {
        if (name === 'jobs') {
            return {
                where: (field, op, val) => ({
                    where: (f2, o2, v2) => ({
                        limit: () => ({
                            get: async () => ({
                                empty: false,
                                docs: [
                                    {
                                        id: 'existing_job_777',
                                        data: () => ({
                                            customerId: 'cust_1',
                                            idempotencyKey: 'idem_key_xyz',
                                            serviceType: 'Plumbing',
                                            price: 499
                                        })
                                    }
                                ]
                            })
                        })
                    })
                }),
                add: async () => { addCalled = true; return { id: 'new_job' }; }
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false }) }) };
    };

    const user = { uid: 'cust_1', email: 'c@test.com', role: 'customer' };
    const bookingInput = {
        serviceType: 'Plumbing',
        workerId: 'auto-assign',
        clientRequestId: 'idem_key_xyz'
    };

    try {
        const result = await bookingsService.createBooking(user, bookingInput, 'idem_key_xyz');

        assert.equal(result.id, 'existing_job_777');
        assert.equal(result.isDuplicate, true);
        assert.equal(addCalled, false, 'add() must not be called when duplicate exists');
    } finally {
        db.collection = originalCollection;
    }
});

test('Booking Updates - Prevents unauthorized user from modifying booking', async () => {
    const originalRunTransaction = db.runTransaction;
    const originalCollection = db.collection;

    db.runTransaction = async (cb) => {
        const mockTransaction = {
            get: async () => ({
                exists: true,
                data: () => ({
                    customerId: 'cust_owner',
                    workerId: 'worker_assigned',
                    status: 'pending',
                    price: 499
                })
            }),
            update: () => {}
        };
        return cb(mockTransaction);
    };

    const attacker = { uid: 'attacker_random', role: 'customer' };

    try {
        await assert.rejects(
            async () => {
                await bookingsService.updateBooking(attacker, 'job_1', { status: 'cancelled' });
            },
            (err) => {
                assert.equal(err.statusCode, 403);
                assert.match(err.message, /not authorized/);
                return true;
            }
        );
    } finally {
        db.runTransaction = originalRunTransaction;
        db.collection = originalCollection;
    }
});

test('Booking Updates - Customer cannot cancel in_progress job', async () => {
    const originalRunTransaction = db.runTransaction;

    db.runTransaction = async (cb) => {
        const mockTransaction = {
            get: async () => ({
                exists: true,
                data: () => ({
                    customerId: 'cust_owner',
                    workerId: 'worker_assigned',
                    status: 'in_progress',
                    price: 499
                })
            }),
            update: () => {}
        };
        return cb(mockTransaction);
    };

    const customer = { uid: 'cust_owner', role: 'customer' };

    try {
        await assert.rejects(
            async () => {
                await bookingsService.updateBooking(customer, 'job_1', { status: 'cancelled' });
            },
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.match(err.message, /Invalid booking transition/);
                return true;
            }
        );
    } finally {
        db.runTransaction = originalRunTransaction;
    }
});

test('Booking Updates - Customer cannot set status to completed or mutate payment/price', async () => {
    const originalRunTransaction = db.runTransaction;
    let transactionUpdates = null;

    db.runTransaction = async (cb) => {
        const mockTransaction = {
            get: async () => ({
                exists: true,
                data: () => ({
                    customerId: 'cust_owner',
                    workerId: 'worker_assigned',
                    status: 'in_progress',
                    price: 499
                })
            }),
            update: (ref, fields) => { transactionUpdates = fields; }
        };
        return cb(mockTransaction);
    };

    const customer = { uid: 'cust_owner', role: 'customer' };

    // 1. Attempting transition to completed as customer -> 403
    await assert.rejects(
        async () => {
            await bookingsService.updateBooking(customer, 'job_1', { status: 'completed' });
        },
        (err) => {
            assert.equal(err.statusCode, 403);
            assert.match(err.message, /Worker permission required/);
            return true;
        }
    );

    db.runTransaction = originalRunTransaction;
});

test('Booking Updates - Worker can transition in_progress to completed and increment earnings atomically', async () => {
    const originalRunTransaction = db.runTransaction;
    const originalCollection = db.collection;
    let jobUpdated = null;
    let workerUpdated = null;

    db.runTransaction = async (cb) => {
        const mockTransaction = {
            get: async (ref) => ({
                exists: true,
                data: () => ({
                    customerId: 'cust_owner',
                    workerId: 'worker_1',
                    status: 'in_progress',
                    price: 600
                })
            }),
            update: (ref, fields) => {
                if (!jobUpdated) jobUpdated = fields;
                else workerUpdated = fields;
            }
        };
        return cb(mockTransaction);
    };

    const worker = { uid: 'worker_1', role: 'worker' };

    try {
        const result = await bookingsService.updateBooking(worker, 'job_1', {
            status: 'completed',
            price: 10,                 // Tampering attempt: MUST BE STRIPPED
            payment: { status: 'paid' } // Tampering attempt: MUST BE STRIPPED
        });

        assert.equal(result.status, 'completed');
        assert.ok(jobUpdated['timeline.completed_at']);
        assert.equal(jobUpdated.price, undefined, 'Price in update must be stripped');
        assert.equal(jobUpdated.payment, undefined, 'Payment in update must be stripped');
        assert.ok(workerUpdated, 'Worker stats must be updated on completion');
    } finally {
        db.runTransaction = originalRunTransaction;
        db.collection = originalCollection;
    }
});

test('Booking Updates - Worker claiming unassigned pending job sets assignment in transaction', async () => {
    const originalRunTransaction = db.runTransaction;
    let jobUpdated = null;

    db.runTransaction = async (cb) => {
        const mockTransaction = {
            get: async (ref) => ({
                exists: true,
                data: () => ({
                    customerId: 'cust_owner',
                    workerId: 'auto-assign',
                    status: 'pending',
                    price: 499
                })
            }),
            update: (ref, fields) => { jobUpdated = fields; }
        };
        return cb(mockTransaction);
    };

    const worker = { uid: 'worker_2', role: 'worker' };

    try {
        const result = await bookingsService.updateBooking(worker, 'job_pool_1', {
            status: 'accepted'
        });

        assert.equal(result.status, 'accepted');
        assert.equal(jobUpdated.workerId, 'worker_2', 'Worker claiming job must be recorded');
        assert.ok(jobUpdated['timeline.assigned_at']);
        assert.ok(jobUpdated['timeline.accepted_at']);
    } finally {
        db.runTransaction = originalRunTransaction;
    }
});

