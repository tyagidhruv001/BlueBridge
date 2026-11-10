const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, updateBooking } = require('../controllers/bookings.controller');
const authenticate = require('../middlewares/auth.middleware');

// @route   POST /api/bookings
// @desc    Create a new booking (Protected)
router.post('/', authenticate, (req, res, next) => createBooking(req, res, next));

// @route   GET /api/bookings
// @desc    Get bookings for authenticated user
router.get('/', authenticate, (req, res, next) => getBookings(req, res, next));

// @route   GET /api/bookings/:id
// @desc    Get booking details (Protected: participant only)
router.get('/:id', authenticate, (req, res, next) => getBookingById(req, res, next));

// @route   PUT /api/bookings/:id
// @desc    Update booking status (Protected: participant only)
router.put('/:id', authenticate, (req, res, next) => updateBooking(req, res, next));

module.exports = router;
