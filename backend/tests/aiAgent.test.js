const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { Readable, EventEmitter } = require('node:stream');

process.env.NODE_ENV = 'test';
process.env.PAYMENT_CURRENCY = 'USD';

const aiAgentService = require('../src/services/aiAgent.service');
const { db } = require('../config/firebase');

// Default in-memory collection stub so tests never hit external network in sandbox
const originalCollection = db.collection;
const defaultMock = {
    where: () => defaultMock,
    orderBy: () => defaultMock,
    limit: () => defaultMock,
    get: async () => ({
        empty: true,
        docs: [],
        forEach: () => {}
    }),
    doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
        update: async () => {}
    })
};
db.collection = () => defaultMock;

function dispatch(app, { method, path, headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const bodyData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
        const req = new Readable({
            read() {
                if (bodyData) {
                    this.push(bodyData);
                }
                this.push(null);
            }
        });

        req.method = method;
        req.url = path;
        req.headers = {
            'content-type': 'application/json',
            ...(bodyData ? { 'content-length': Buffer.byteLength(bodyData).toString() } : {}),
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

test('AI Agent - Natural Language Service Recommendation', async () => {
    const response = await aiAgentService.processAgentMessage({
        userId: 'cust_test_1',
        message: 'I have a leaking pipe under my sink and need an urgent plumber'
    });

    assert.ok(response.reply, 'Should return natural language response');
    assert.ok(response.recommendations && response.recommendations.length > 0, 'Should return worker recommendations');
    const firstRec = response.recommendations[0];
    assert.ok(firstRec.name, 'Recommendation must have name');
    assert.ok(firstRec.rating >= 4.0, 'Recommended worker must have rating');
    assert.ok(firstRec.totalEstimatedPrice > 0, 'Must have estimated price');
    assert.equal(firstRec.currency, 'USD');
});

test('AI Agent - Worker Comparison Feature', async () => {
    const response = await aiAgentService.processAgentMessage({
        userId: 'cust_test_1',
        message: 'Compare Rahul and Vikram for electrical and plumbing'
    });

    assert.equal(response.intent, 'compare_workers');
    assert.match(response.reply, /Rahul Sharma/i);
    assert.match(response.reply, /Vikram Singh/i);
    assert.ok(response.comparison && response.comparison.length >= 2, 'Should provide at least two comparison profiles');
});

test('AI Agent - Booking Proposal Generation (Requires Customer Approval)', async () => {
    let jobsCreatedDirectly = false;
    db.collection = (name) => {
        if (name === 'jobs') {
            return {
                add: async () => {
                    jobsCreatedDirectly = true;
                    return { id: 'should_not_happen' };
                },
                where: () => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ empty: true, forEach: () => {} }) }) }) })
            };
        }
        return defaultMock;
    };

    try {
        const response = await aiAgentService.processAgentMessage({
            userId: 'cust_test_1',
            message: 'Please book Rahul Sharma for plumbing tomorrow at 10 AM'
        });

        assert.equal(response.intent, 'prepare_booking');
        assert.ok(response.proposal, 'Must generate structured booking proposal');
        assert.equal(response.proposal.type, 'booking_proposal');
        assert.equal(response.proposal.requiresApproval, true, 'Proposal must require explicit customer approval');
        assert.ok(response.proposal.price > 0, 'Must calculate price');
        assert.equal(response.proposal.currency, 'USD');
        assert.equal(jobsCreatedDirectly, false, 'Rule 17: Gemini must NEVER directly create database or financial records');
    } finally {
        db.collection = () => defaultMock;
    }
});

test('AI Agent - Active Booking Status Tracking Query', async () => {
    db.collection = (name) => {
        if (name === 'jobs') {
            return {
                where: () => ({
                    orderBy: () => ({
                        limit: () => ({
                            get: async () => ({
                                forEach: (fn) => {
                                    fn({
                                        id: 'job_active_999',
                                        data: () => ({
                                            serviceType: 'Plumbing Repair',
                                            status: 'in_progress',
                                            workerName: 'Rahul Sharma',
                                            price: 499,
                                            payment: { status: 'paid', currency: 'USD' },
                                            date: '2026-11-12',
                                            time: '11:00 AM'
                                        })
                                    });
                                }
                            })
                        })
                    })
                })
            };
        }
        return defaultMock;
    };

    try {
        const response = await aiAgentService.processAgentMessage({
            userId: 'cust_test_1',
            message: 'Where is my worker and what is the status of my booking?'
        });

        assert.equal(response.intent, 'track_booking');
        assert.match(response.reply, /IN_PROGRESS/i);
        assert.match(response.reply, /PAID/i);
        assert.match(response.reply, /Rahul Sharma/i);
        assert.ok(response.activeBookings && response.activeBookings.length > 0);
    } finally {
        db.collection = () => defaultMock;
    }
});

test('AI Agent HTTP Route - POST /api/chat/send', async () => {
    db.collection = () => defaultMock;

    const app = express();
    app.use(express.json());
    const chatRoutes = require('../src/routes/chat.routes');
    app.use('/api/chat', chatRoutes);

    const res = await dispatch(app, {
        method: 'POST',
        path: '/api/chat/send',
        body: { message: 'Can you recommend an experienced plumber?' }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.reply, 'Must contain reply');
    assert.ok(Array.isArray(res.body.recommendations));
});
