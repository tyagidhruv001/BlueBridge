const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const { EventEmitter } = require('node:events');

// Load environment and app
process.env.NODE_ENV = 'test';
const app = require('../src/app');
const authenticate = require('../src/middlewares/auth.middleware');
const requireRole = require('../src/middlewares/role.middleware');
const { requireSelf } = require('../src/middlewares/ownership.middleware');
const { updateProfile, getDemoUser } = require('../src/controllers/auth.controller');
const { auth, db } = require('../config/firebase');

// Fast, in-memory HTTP dispatcher for Express (no network sockets needed)
function dispatch(appInstance, { method = 'GET', url = '/', headers = {}, body = null }) {
    return new Promise((resolve) => {
        const payload = body ? (typeof body === 'object' ? JSON.stringify(body) : body) : null;
        let sent = false;
        const req = new Readable({
            read() {
                if (!sent && payload) {
                    this.push(payload);
                    sent = true;
                }
                this.push(null);
            }
        });
        req.method = method;
        req.url = url;
        req.headers = {
            'content-type': 'application/json',
            ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
        };

        const res = new EventEmitter();
        res.statusCode = 200;
        res.headers = {};
        res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
        res.getHeader = (k) => res.headers[k.toLowerCase()];
        res.removeHeader = (k) => { delete res.headers[k.toLowerCase()]; };

        let data = '';
        res.write = (c) => { if (c) data += c.toString(); return true; };
        res.end = (c) => {
            if (c) data += c.toString();
            let parsed = null;
            try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
            resolve({ status: res.statusCode, body: parsed, raw: data });
        };

        appInstance(req, res, (err) => {
            if (err) resolve({ status: 500, error: err.message });
        });
    });
}

test('Authentication Middleware - Missing token returns 401', async () => {
    let statusCode = null;
    let jsonBody = null;

    const req = { headers: {} };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.equal(statusCode, 401, 'Status code must be 401 for missing token');
    assert.equal(jsonBody?.success, false);
    assert.equal(nextCalled, false, 'next() must not be called when token is missing');
});

test('Authentication Middleware - Malformed authorization header returns 401', async () => {
    let statusCode = null;
    let jsonBody = null;

    const req = { headers: { authorization: 'Basic 12345' } };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.equal(statusCode, 401, 'Status code must be 401 for non-Bearer auth');
    assert.equal(jsonBody?.error, 'Authentication required');
    assert.equal(nextCalled, false);
});

test('Authentication Middleware - Invalid token returns 401', async () => {
    let statusCode = null;
    let jsonBody = null;

    const req = { headers: { authorization: 'Bearer invalid.bogus.token' } };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.equal(statusCode, 401, 'Status code must be 401 for invalid token');
    assert.equal(jsonBody?.error, 'Invalid or expired authentication token');
    assert.equal(nextCalled, false);
});

test('Role Middleware - User with customer role cannot access worker-only route', async () => {
    const originalCollection = db.collection;
    db.collection = (name) => {
        if (name === 'users') {
            return {
                doc: (uid) => ({
                    get: async () => ({
                        exists: true,
                        data: () => ({ uid, role: 'customer' })
                    })
                })
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false, data: () => ({}) }) }) };
    };

    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = { user: { uid: 'customer_123' } };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    const workerOnly = requireRole('worker');

    try {
        await workerOnly(req, res, () => { nextCalled = true; });

        assert.equal(statusCode, 403, 'Customer accessing worker route must return 403');
        assert.equal(jsonBody?.error, 'Insufficient permissions');
        assert.equal(nextCalled, false);
    } finally {
        db.collection = originalCollection;
    }
});

test('Role Middleware - Valid customer access permitted for customer route', async () => {
    const originalCollection = db.collection;
    db.collection = (name) => {
        if (name === 'users') {
            return {
                doc: (uid) => ({
                    get: async () => ({
                        exists: true,
                        data: () => ({ uid, role: 'customer' })
                    })
                })
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false, data: () => ({}) }) }) };
    };

    let nextCalled = false;
    const req = { user: { uid: 'customer_123' } };
    const res = {
        status(code) { return this; },
        json(body) { return this; }
    };

    const customerAllowed = requireRole('customer');

    try {
        await customerAllowed(req, res, () => { nextCalled = true; });
        assert.equal(nextCalled, true, 'Customer accessing customer route must call next()');
        assert.equal(req.user.role, 'customer');
    } finally {
        db.collection = originalCollection;
    }
});

test('Ownership Middleware - User cannot access another user profile', async () => {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = {
        user: { uid: 'user_alice', role: 'customer' },
        params: { uid: 'user_bob' }
    };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    const selfMiddleware = requireSelf('uid');
    selfMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(statusCode, 403, 'Must return 403 when trying to access another user profile');
    assert.equal(nextCalled, false);
});

test('Profile Controller - User cannot change their role or verification status', async () => {
    let updatedPayload = null;
    const originalCollection = db.collection;

    db.collection = (name) => {
        if (name === 'users') {
            return {
                doc: (uid) => ({
                    update: async (fields) => { updatedPayload = fields; },
                    get: async () => ({
                        exists: true,
                        data: () => ({ uid, name: 'Alice', role: 'customer', ...updatedPayload })
                    })
                })
            };
        }
        return { doc: () => ({ get: async () => ({ exists: false, data: () => ({}) }) }) };
    };

    const req = {
        user: { uid: 'user_alice', role: 'customer' },
        params: { uid: 'user_alice' },
        body: {
            name: 'Alice Updated',
            role: 'admin',                // ATTEMPT TO ELEVATE ROLE
            is_verified: true,             // ATTEMPT TO SET VERIFICATION
            verification_status: 'verified' // ATTEMPT TO SET STATUS
        }
    };

    let responseData = null;
    const res = {
        json(data) { responseData = data; return this; },
        status() { return this; }
    };

    try {
        await updateProfile(req, res);

        assert.ok(updatedPayload, 'Update must be called');
        assert.equal(updatedPayload.name, 'Alice Updated');
        assert.equal(updatedPayload.role, undefined, 'Role must be stripped from updates');
        assert.equal(updatedPayload.is_verified, undefined, 'is_verified must be stripped from updates');
        assert.equal(updatedPayload.verification_status, undefined, 'verification_status must be stripped');
    } finally {
        db.collection = originalCollection;
    }
});

test('Demo User Endpoint - Disabled in production', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    let statusCode = null;
    let jsonBody = null;

    const req = { params: { role: 'customer' } };
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    try {
        await getDemoUser(req, res);
        assert.equal(statusCode, 403, 'Demo user endpoint must return 403 in production');
        assert.equal(jsonBody?.error, 'Demo user access is disabled in production');
    } finally {
        process.env.NODE_ENV = prevEnv;
    }
});

test('HTTP End-to-End: Protected endpoints reject requests with missing token', async () => {
    const endpoints = [
        { url: '/api/bookings', method: 'GET' },
        { url: '/api/jobs', method: 'GET' },
        { url: '/api/payments/create-order', method: 'POST', body: { amount: 100 } },
        { url: '/api/payments/balance/test_user', method: 'GET' },
        { url: '/api/users/test_user', method: 'GET' },
        { url: '/api/chat/p2p', method: 'POST', body: { bookingId: '1', text: 'hi' } }
    ];

    for (const ep of endpoints) {
        const res = await dispatch(app, {
            method: ep.method,
            url: ep.url,
            body: ep.body
        });

        assert.equal(res.status, 401, `Endpoint ${ep.method} ${ep.url} must return 401 when unauthenticated`);
        assert.equal(res.body?.success, false);
        assert.equal(res.body?.error, 'Authentication required');
    }
});

test('HTTP End-to-End: Protected endpoints reject invalid token with 401', async () => {
    const res = await dispatch(app, {
        method: 'GET',
        url: '/api/bookings',
        headers: {
            'Authorization': 'Bearer fake_invalid_jwt_token'
        }
    });

    assert.equal(res.status, 401, 'Should return 401 for invalid bearer token');
    assert.equal(res.body?.error, 'Invalid or expired authentication token');
});

test('HTTP End-to-End: Valid customer token accesses customer routes and enforces ownership', async () => {
    const originalVerify = auth.verifyIdToken;
    const originalCollection = db.collection;

    auth.verifyIdToken = async (token) => {
        if (token === 'valid_customer_token') {
            return { uid: 'cust_abc', email: 'cust@test.com', email_verified: true };
        }
        throw new Error('Invalid token');
    };

    db.collection = (name) => {
        if (name === 'users') {
            return {
                doc: (uid) => ({
                    get: async () => ({
                        exists: true,
                        data: () => ({ uid, name: 'Alice Customer', role: 'customer' })
                    })
                })
            };
        }
        if (name === 'jobs') {
            return {
                where: (field, op, val) => ({
                    get: async () => ({
                        docs: [
                            { id: 'job_1', data: () => ({ customerId: 'cust_abc', status: 'pending' }) }
                        ],
                        forEach: (cb) => {
                            cb({ id: 'job_1', data: () => ({ customerId: 'cust_abc', status: 'pending' }) });
                        }
                    })
                })
            };
        }
        return {
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) })
            })
        };
    };

    try {
        // 1. Valid customer token accesses /api/bookings
        const resBookings = await dispatch(app, {
            method: 'GET',
            url: '/api/bookings',
            headers: { 'Authorization': 'Bearer valid_customer_token' }
        });
        assert.equal(resBookings.status, 200, 'Authenticated customer can access bookings');
        assert.equal(Array.isArray(resBookings.body), true);
        assert.equal(resBookings.body[0].id, 'job_1');

        // 2. Customer accessing own profile -> 200
        const resProfileSelf = await dispatch(app, {
            method: 'GET',
            url: '/api/users/cust_abc',
            headers: { 'Authorization': 'Bearer valid_customer_token' }
        });
        assert.equal(resProfileSelf.status, 200, 'Customer can access own profile');

        // 3. Customer accessing another user profile -> 403 Forbidden
        const resProfileOther = await dispatch(app, {
            method: 'GET',
            url: '/api/users/user_other_person',
            headers: { 'Authorization': 'Bearer valid_customer_token' }
        });
        assert.equal(resProfileOther.status, 403, 'Customer cannot access another user profile');

    } finally {
        auth.verifyIdToken = originalVerify;
        db.collection = originalCollection;
    }
});
