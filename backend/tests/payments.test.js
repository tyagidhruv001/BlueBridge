const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const express = require('express');
const { Readable, EventEmitter } = require('node:stream');

process.env.NODE_ENV = 'test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_key123';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_abc';

const paymentsService = require('../src/services/payments.service');
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

test('Payments - creditWallet rejects negative, zero or non-finite amounts', async () => {
    await assert.rejects(
        () => paymentsService.creditWallet({ userId: 'u1', transactionId: 'tx1', amount: -50 }),
        (err) => err.statusCode === 400 && err.message.includes('positive finite number')
    );

    await assert.rejects(
        () => paymentsService.creditWallet({ userId: 'u1', transactionId: 'tx1', amount: 0 }),
        (err) => err.statusCode === 400
    );

    await assert.rejects(
        () => paymentsService.creditWallet({ userId: 'u1', transactionId: 'tx1', amount: NaN }),
        (err) => err.statusCode === 400
    );
});

test('Payments - creditWallet atomically credits user wallet and creates transaction', async () => {
    const memory = {
        users: {
            u100: { wallet: { balance: 200, currency: 'USD' } }
        },
        transactions: {}
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
            set: async (data, opt) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = opt?.merge ? { ...memory[colName][docId], ...data } : data;
            },
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

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data, opt) => ref.set(data, opt),
            update: (ref, data) => ref.update(data)
        };
        return await updateFunction(mockT);
    };

    try {
        const result = await paymentsService.creditWallet({
            userId: 'u100',
            transactionId: 'txn_credit_1',
            amount: 50,
            currency: 'USD'
        });

        assert.equal(result.success, true);
        assert.equal(result.newBalance, 250);
        assert.equal(memory.users.u100.wallet.balance, 250);
        assert.equal(memory.transactions.txn_credit_1.status, 'success');
        assert.equal(memory.transactions.txn_credit_1.amount, 50);
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - creditWallet idempotency prevents duplicate wallet credit', async () => {
    const memory = {
        users: {
            u100: { wallet: { balance: 250, currency: 'USD' } }
        },
        transactions: {
            txn_credit_1: {
                transactionId: 'txn_credit_1',
                userId: 'u100',
                amount: 50,
                status: 'success'
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
            set: async (data, opt) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = opt?.merge ? { ...memory[colName][docId], ...data } : data;
            },
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

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data, opt) => ref.set(data, opt),
            update: (ref, data) => ref.update(data)
        };
        return await updateFunction(mockT);
    };

    try {
        // Re-call creditWallet with the exact same transaction ID
        const result = await paymentsService.creditWallet({
            userId: 'u100',
            transactionId: 'txn_credit_1',
            amount: 50,
            currency: 'USD'
        });

        assert.equal(result.success, true);
        assert.equal(result.newBalance, 250, 'Balance must remain 250 without duplicate credit');
        assert.equal(memory.users.u100.wallet.balance, 250);
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - deductWallet rejects insufficient balance with 400', async () => {
    const memory = {
        users: {
            u200: { wallet: { balance: 30, currency: 'USD' } }
        },
        jobs: {
            job_1: { customerId: 'u200', price: 100 }
        },
        transactions: {}
    };

    const originalCollection = db.collection;
    const originalRunTransaction = db.runTransaction;

    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            })
        })
    });

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data) => {},
            update: (ref, data) => {}
        };
        return await updateFunction(mockT);
    };

    try {
        await assert.rejects(
            () => paymentsService.deductWallet({
                userId: 'u200',
                amount: 100,
                bookingId: 'job_1'
            }),
            (err) => err.statusCode === 400 && err.message.includes('Insufficient wallet balance')
        );
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - deductWallet rejects user attempting to pay for another user\'s booking', async () => {
    const memory = {
        users: {
            hacker_user: { wallet: { balance: 500, currency: 'USD' } }
        },
        jobs: {
            victim_job: { customerId: 'victim_user', price: 100 }
        },
        transactions: {}
    };

    const originalCollection = db.collection;
    const originalRunTransaction = db.runTransaction;

    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            })
        })
    });

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data) => {},
            update: (ref, data) => {}
        };
        return await updateFunction(mockT);
    };

    try {
        await assert.rejects(
            () => paymentsService.deductWallet({
                userId: 'hacker_user',
                amount: 100,
                bookingId: 'victim_job'
            }),
            (err) => err.statusCode === 403 && err.message.includes('only pay for your own booking')
        );
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - deductWallet rejects payment if amount is less than required booking price', async () => {
    const memory = {
        users: {
            u_payer: { wallet: { balance: 500, currency: 'USD' } }
        },
        jobs: {
            job_expensive: { customerId: 'u_payer', price: 200 }
        },
        transactions: {}
    };

    const originalCollection = db.collection;
    const originalRunTransaction = db.runTransaction;

    db.collection = (colName) => ({
        doc: (docId) => ({
            get: async () => ({
                exists: Boolean(memory[colName]?.[docId]),
                data: () => memory[colName]?.[docId]
            })
        })
    });

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data) => {},
            update: (ref, data) => {}
        };
        return await updateFunction(mockT);
    };

    try {
        await assert.rejects(
            () => paymentsService.deductWallet({
                userId: 'u_payer',
                amount: 50, // Less than required 200
                bookingId: 'job_expensive'
            }),
            (err) => err.statusCode === 400 && err.message.includes('Payment amount mismatch')
        );
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - deductWallet successfully decrements balance, updates booking payment status, and creates transaction', async () => {
    const memory = {
        users: {
            u300: { wallet: { balance: 300, currency: 'USD' } }
        },
        jobs: {
            job_300: { customerId: 'u300', price: 150, status: 'pending', payment: { status: 'unpaid' } }
        },
        transactions: {}
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
            set: async (data) => {
                memory[colName] = memory[colName] || {};
                memory[colName][docId] = data;
            },
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

    db.runTransaction = async (updateFunction) => {
        const mockT = {
            get: async (ref) => ref.get(),
            set: (ref, data) => ref.set(data),
            update: (ref, data) => ref.update(data)
        };
        return await updateFunction(mockT);
    };

    try {
        const result = await paymentsService.deductWallet({
            userId: 'u300',
            amount: 150,
            bookingId: 'job_300',
            description: 'Payment for electrical service'
        });

        assert.equal(result.success, true);
        assert.equal(result.newBalance, 150);
        assert.equal(memory.users.u300.wallet.balance, 150);
        assert.equal(memory.jobs.job_300.payment.status, 'paid');
        assert.equal(memory.jobs.job_300.payment.amount, 150);
    } finally {
        db.collection = originalCollection;
        db.runTransaction = originalRunTransaction;
    }
});

test('Payments - verifyRazorpayPayment rejects invalid HMAC signature', async () => {
    await assert.rejects(
        () => paymentsService.verifyRazorpayPayment({
            userId: 'u1',
            orderId: 'order_123',
            paymentId: 'pay_123',
            signature: 'fake_tampered_signature'
        }),
        (err) => err.statusCode === 400 && err.message.includes('Invalid payment signature')
    );
});

test('Payments - verifyRazorpayPayment rejects verification if user does not match order recipient', async () => {
    const orderId = 'order_valid_1';
    const paymentId = 'pay_valid_1';
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const validSignature = crypto
        .createHmac('sha256', secret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    const memory = {
        transactions: {
            [orderId]: {
                orderId,
                userId: 'original_user_legit',
                amount: 500,
                status: 'pending'
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
        await assert.rejects(
            () => paymentsService.verifyRazorpayPayment({
                userId: 'attacker_user',
                orderId,
                paymentId,
                signature: validSignature
            }),
            (err) => err.statusCode === 403 && err.message.includes('User does not match order recipient')
        );
    } finally {
        db.collection = originalCollection;
    }
});

test('Payments Routes - Direct transaction creation POST /api/transactions returns 403', async () => {
    const app = express();
    app.use(express.json());
    // Stub auth to authenticate as user
    const transactionsRoutes = require('../src/routes/transactions.routes');
    const { auth } = require('../config/firebase');
    const originalVerify = auth.verifyIdToken;
    auth.verifyIdToken = async () => ({ uid: 'user_test', email: 'test@example.com' });

    app.use('/api/transactions', transactionsRoutes);

    try {
        const res = await dispatch(app, {
            method: 'POST',
            path: '/api/transactions',
            headers: { authorization: 'Bearer dummy-token' },
            body: { amount: 1000, type: 'credit' }
        });

        assert.equal(res.status, 403);
        assert.match(res.body.error, /Direct transaction creation is disabled/i);
    } finally {
        auth.verifyIdToken = originalVerify;
    }
});

test('Payments Routes - User cannot view another user balance on GET /api/payments/balance/:userId', async () => {
    const app = express();
    app.use(express.json());
    const paymentsRoutes = require('../src/routes/payments.routes');
    const { auth } = require('../config/firebase');
    const originalVerify = auth.verifyIdToken;
    auth.verifyIdToken = async () => ({ uid: 'user_victim', email: 'victim@example.com' });

    app.use('/api/payments', paymentsRoutes);

    try {
        const res = await dispatch(app, {
            method: 'GET',
            path: '/api/payments/balance/user_other',
            headers: { authorization: 'Bearer dummy-token' }
        });

        assert.equal(res.status, 403);
        assert.match(res.body.error, /Access denied/i);
    } finally {
        auth.verifyIdToken = originalVerify;
    }
});
