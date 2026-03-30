const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBooking } = require('../controllers/bookings.controller');

// @route   POST /api/bookings
// @desc    Create a new booking
router.post('/', (req, res) => createBooking(req, res));

// @route   GET /api/bookings
// @desc    Get bookings for a user (customer or worker)
router.get('/', (req, res) => getBookings(req, res));

// @route   PUT /api/bookings/:id
// @desc    Update booking status
router.put('/:id', (req, res) => updateBooking(req, res));

module.exports = router;
