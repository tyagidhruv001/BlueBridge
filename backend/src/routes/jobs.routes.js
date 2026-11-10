const express = require('express');
const router = express.Router();
const bookingsService = require('../services/bookings.service');
const { createBookingSchema, updateBookingSchema } = require('../validators/booking.validator');
const authenticate = require('../middlewares/auth.middleware');

// @route   POST /api/jobs
// @desc    Create a new job/booking (Protected)
router.post('/', authenticate, async (req, res) => {
    try {
        const { error, value } = createBookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const idempotencyKey = req.headers['idempotency-key'] || req.body.clientRequestId || null;
        const result = await bookingsService.createBooking(req.user, value, idempotencyKey);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/jobs
// @desc    Get jobs/bookings for authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const jobs = await bookingsService.getBookings(req.user, req.query);
        res.status(200).json(jobs);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job/booking details (Protected: participant only)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const job = await bookingsService.getBookingById(req.user, req.params.id);
        res.status(200).json(job);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job/booking (Protected: participant only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { error, value } = updateBookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const result = await bookingsService.updateBooking(req.user, req.params.id, value);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
});

module.exports = router;
