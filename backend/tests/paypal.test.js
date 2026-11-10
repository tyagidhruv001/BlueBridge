const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { Readable, EventEmitter } = require('node:stream');

process.env.NODE_ENV = 'test';
process.env.PAYPAL_CLIENT_ID = 'test_paypal_client_id_123';
process.env.PAYPAL_CLIENT_SECRET = 'test_paypal_client_secret_xyz';
process.env.PAYPAL_MODE = 'sandbox';
process.env.PAYMENT_CURRENCY = 'USD';

const paypalService = require('../src/services/paypal.service');
const { db } = require('../config/firebase');

// Helper to simulate HTTP requests in-process without TCP network binding
function dispatch(app, { method, path, headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const req = new Readable({
            read() {
                if (body) {
                    const data = typeof body === 'string' ? body : JSON.stringify(body);
                    this.push(data);
                }
                this.push(null);
            }
        });

        req.method = method;
        req.url = path;
        req.headers = {
            'content-type': 'application/json',
            ...headers
        };

        const res = new EventEmitter();
        res.statusCode = 200;
        res._headers = {};
        res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
        res.getHeader = (k) => res._headers[k.toLowerCase()];

        let resData = '';
        res.write = (chunk) => {
            if (chunk) resData += chunk.toString();
            return true;
        };

        res.end = (chunk) => {
            if (chunk) resData += chunk.toString();
            let json = null;
            try {
                json = JSON.parse(resData);
            } catch (e) {
                json = resData;
            }
            resolve({
                status: res.statusCode,
                headers: res._headers,
                body: json
            });
        };

        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        res.json = (obj) => {
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(obj));
        };

        app(req, res, (err) => {
            if (err) reject(err);
            else resolve({ status: res.statusCode, body: resData });
        });
    });
}

test('PayPal - Public Config endpoint returns sanitized client credentials', () => {
    const config = paypalService.getClientConfig();
    assert.equal(config.success, true);
    assert.equal(config.clientId, 'test_paypal_client_id_123');
    assert.equal(config.currency, 'USD');
    assert.equal(config.mode, 'sandbox');
    assert.equal(config.clientSecret, undefined, 'Client secret must never be exposed');
});

test('PayPal - createOrder rejects non-existent booking with 404', async () => {
    const originalCollection = db.collection;
    db.collection = () => ({
        doc: () => ({
            get: async () => ({ exists: false })
        })
    });

    try {
        await assert.rejects(
            () => paypalService.createOrder({ userId: 'u1', bookingId: 'nonexistent_booking' }),
            (err) => err.statusCode === 404 && err.message.includes('Booking not found')
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('PayPal - createOrder prevents user from paying for another user\'s booking with 403', async () => {
    const originalCollection = db.collection;
    db.collection = (name) => ({
        doc: () => ({
            get: async () => ({
                exists: true,
                data: () => ({
                    customerId: 'legit_customer_123',
                    price: 120,
                    status: 'pending'
                })
            })
        })
    });

    try {
        await assert.rejects(
            () => paypalService.createOrder({ userId: 'attacker_uid', bookingId: 'booking_123' }),
            (err) => err.statusCode === 403 && err.message.includes('only pay for your own booking')
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('PayPal - createOrder prevents duplicate payment if booking already marked paid', async () => {
    const originalCollection = db.collection;
    db.collection = (name) => ({
        doc: () => ({
            get: async () => ({
                exists: true,
                data: () => ({
                    customerId: 'user_cust',
                    price: 120,
                    status: 'accepted',
                    payment: { status: 'paid' }
                })
            })
        })
    });

    try {
        await assert.rejects(
            () => paypalService.createOrder({ userId: 'user_cust', bookingId: 'booking_already_paid' }),
            (err) => err.statusCode === 400 && err.message.includes('already paid')
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('PayPal - createOrder derives authoritative price and creates pending transaction', async () => {
    const memory = {
        jobs: {
            booking_789: {
                customerId: 'cust_abc',
                price: 149.00,
                serviceType: 'Plumbing',
                status: 'pending'
            }
        },
        transactions: {}
    };

    const originalCollection = db.collection;
    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            }),
            set: async (data) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = data;
            },
            update: async (data) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = memory[colName][docId] || {};
                Object.assign(memory[colName][docId], data);
            }
        })
    });

    // Mock global fetch for PayPal API
    const originalFetch = global.fetch;
    global.fetch = async (url, options) => {
        if (url.includes('/v1/oauth2/token')) {
            return {
                ok: true,
                json: async () => ({ access_token: 'mock_access_token_123', expires_in: 3600 })
            };
        }
        if (url.includes('/v2/checkout/orders')) {
            const body = JSON.parse(options.body);
            assert.equal(body.purchase_units[0].amount.value, '149.00', 'Must use authoritative price from database');
            return {
                ok: true,
                json: async () => ({
                    id: 'PAYPAL_ORDER_999',
                    status: 'CREATED'
                })
            };
        }
        return { ok: false, text: async () => 'Unexpected URL' };
    };

    try {
        const result = await paypalService.createOrder({
            userId: 'cust_abc',
            bookingId: 'booking_789',
            currency: 'USD'
        });

        assert.equal(result.success, true);
        assert.equal(result.orderId, 'PAYPAL_ORDER_999');
        assert.equal(result.amount, 149.00);

        // Verify stored pending transaction
        const savedTxn = memory.transactions['PAYPAL_ORDER_999'];
        assert.ok(savedTxn, 'Pending transaction must be stored');
        assert.equal(savedTxn.status, 'pending');
        assert.equal(savedTxn.userId, 'cust_abc');
        assert.equal(savedTxn.bookingId, 'booking_789');
        assert.equal(savedTxn.amount, 149.00);
    } finally {
        db.collection = originalCollection;
        global.fetch = originalFetch;
    }
});

test('PayPal - captureOrder rejects user mismatch with 403', async () => {
    const originalCollection = db.collection;
    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: true,
                data: () => ({
                    userId: 'legit_customer',
                    bookingId: 'booking_xyz',
                    status: 'pending'
                })
            })
        })
    });

    try {
        await assert.rejects(
            () => paypalService.captureOrder({
                userId: 'rogue_user',
                orderId: 'ORDER_123'
            }),
            (err) => err.statusCode === 403 && err.message.includes('User does not match order record')
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('PayPal - captureOrder successfully captures payment and updates booking atomically', async () => {
    const memory = {
        transactions: {
            PAYPAL_ORDER_456: {
                orderId: 'PAYPAL_ORDER_456',
                userId: 'cust_good',
                bookingId: 'booking_456',
                amount: 89.00,
                currency: 'USD',
                status: 'pending'
            }
        },
        jobs: {
            booking_456: {
                id: 'booking_456',
                customerId: 'cust_good',
                workerId: 'worker_good',
                status: 'pending',
                price: 89.00,
                payment: { status: 'awaiting_payment' }
            }
        }
    };

    const originalCollection = db.collection;
    const originalRunTransaction = db.runTransaction;

    db.collection = (colName) => ({
        doc: (docId) => ({
            id: docId,
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            }),
            update: async (data) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = memory[colName][docId] || {};
                for (const [key, val] of Object.entries(data)) {
                    if (key.includes('.')) {
                        const parts = key.split('.');
                        let curr = memory[colName][docId];
                        for (let i = 0; i < parts.length - 1; i++) {
                            curr[parts[i]] = curr[parts[i]] || {};
                            curr = curr[parts[i]];
                        }
                        curr[parts[parts.length - 1]] = val;
                    } else {
                        memory[colName][docId][key] = val;
                    }
                }
            }
        })
    });

    db.runTransaction = async (updateFn) => {
        const mockT = {
            get: async (ref) => ref.get(),
            update: (ref, data) => ref.update(data)
        };
        return await updateFn(mockT);
    };

    const originalFetch = global.fetch;
    global.fetch = async (url) => {
        if (url.includes('/v1/oauth2/token')) {
            return {
                ok: true,
                json: async () => ({ access_token: 'mock_token', expires_in: 3600 })
            };
        }
        if (url.includes('/capture')) {
            return {
                ok: true,
                json: async () => ({
                    id: 'PAYPAL_ORDER_456',
                    status: 'COMPLETED',
                    purchase_units: [
                        {
                            payments: {
                                captures: [
                                    {
                                        id: 'CAPTURE_ID_789',
                                        status: 'COMPLETED',
                                        amount: { currency_code: 'USD', value: '89.00' }
                                    }
                                ]
                            }
                        }
                    ]
                })
            };
        }
        return { ok: false, text: async () => 'Not found' };
    };

    try {
        const result = await paypalService.captureOrder({
            userId: 'cust_good',
            orderId: 'PAYPAL_ORDER_456',
            bookingId: 'booking_456'
        });

        assert.equal(result.success, true);
        assert.equal(result.status, 'COMPLETED');
        assert.equal(result.captureId, 'CAPTURE_ID_789');

        // Check transaction document
        assert.equal(memory.transactions.PAYPAL_ORDER_456.status, 'success');
        assert.equal(memory.transactions.PAYPAL_ORDER_456.captureId, 'CAPTURE_ID_789');

        // Check booking document
        assert.equal(memory.jobs.booking_456.payment.status, 'paid');
        assert.equal(memory.jobs.booking_456.payment.method, 'paypal');
        assert.equal(memory.jobs.booking_456.payment.captureId, 'CAPTURE_ID_789');
        assert.equal(memory.jobs.booking_456.payment.amount, 89.00);
        assert.equal(memory.jobs.booking_456.status, 'assigned');
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
        global.fetch = originalFetch;
    }
});

test('PayPal - captureOrder is idempotent for already captured orders', async () => {
    const memory = {
        transactions: {
            ALREADY_CAPTURED_1: {
                orderId: 'ALREADY_CAPTURED_1',
                userId: 'cust_good',
                bookingId: 'booking_456',
                status: 'success',
                captureId: 'CAPTURE_ID_EXISTING'
            }
        }
    };

    const originalCollection = db.collection;
    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            })
        })
    });

    try {
        const result = await paypalService.captureOrder({
            userId: 'cust_good',
            orderId: 'ALREADY_CAPTURED_1'
        });

        assert.equal(result.success, true);
        assert.equal(result.isDuplicate, true);
        assert.equal(result.captureId, 'CAPTURE_ID_EXISTING');
    } finally {
        db.collection = originalCollection;
    }
});

test('PayPal Routes - Full HTTP integration create-order and capture-order', async () => {
    const app = express();
    app.use(express.json());

    const paymentsRoutes = require('../src/routes/payments.routes');
    const { auth } = require('../config/firebase');
    const originalVerify = auth.verifyIdToken;
    auth.verifyIdToken = async () => ({ uid: 'http_customer', email: 'http@test.com' });

    app.use('/api/payments', paymentsRoutes);

    try {
        // Test GET /api/payments/paypal/config
        const configRes = await dispatch(app, {
            method: 'GET',
            path: '/api/payments/paypal/config'
        });
        assert.equal(configRes.status, 200);
        assert.equal(configRes.body.success, true);
        assert.equal(configRes.body.clientId, 'test_paypal_client_id_123');

        // Test POST /api/payments/paypal/create-order without token (must fail with 401)
        auth.verifyIdToken = async () => { throw new Error('No token'); };
        const unauthRes = await dispatch(app, {
            method: 'POST',
            path: '/api/payments/paypal/create-order',
            body: { bookingId: 'b1' }
        });
        assert.equal(unauthRes.status, 401);
    } finally {
        auth.verifyIdToken = originalVerify;
    }
});
