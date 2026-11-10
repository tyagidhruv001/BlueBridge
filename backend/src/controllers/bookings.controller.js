const bookingsService = require('../services/bookings.service');
const { createBookingSchema, updateBookingSchema } = require('../validators/booking.validator');

exports.createBooking = async (req, res, next) => {
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
};

exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await bookingsService.getBookings(req.user, req.query);
        res.status(200).json(bookings);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await bookingsService.getBookingById(req.user, req.params.id);
        res.status(200).json(booking);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.updateBooking = async (req, res, next) => {
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
};
