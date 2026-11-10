const Joi = require('joi');

const createBookingSchema = Joi.object({
    serviceType: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Service type is required',
        'any.required': 'Service type is required'
    }),
    workerId: Joi.string().trim().allow(null, '', 'auto-assign').optional().default('auto-assign'),
    workerName: Joi.string().trim().allow(null, '').optional(),
    workerPhone: Joi.string().trim().allow(null, '').optional(),
    customerName: Joi.string().trim().allow(null, '').optional(),
    customerPhone: Joi.string().trim().allow(null, '').optional(),
    address: Joi.string().trim().min(3).max(500).allow(null, '').optional(),
    date: Joi.string().trim().allow(null, '').optional(),
    time: Joi.string().trim().allow(null, '').optional(),
    scheduledTime: Joi.string().trim().allow(null, '').optional(),
    scheduled_time: Joi.string().trim().allow(null, '').optional(),
    location: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional()
    }).allow(null).optional(),
    isEmergency: Joi.boolean().optional().default(false),
    paymentMethod: Joi.string().valid('wallet', 'paypal', 'cod', 'razorpay').default('cod').optional(),
    clientRequestId: Joi.string().trim().max(100).optional()
}).unknown(true); // Allow non-critical frontend UI fields while validating key attributes

const updateBookingSchema = Joi.object({
    status: Joi.string().valid(
        'pending',
        'assigned',
        'accepted',
        'in_progress',
        'completed',
        'cancelled',
        'declined'
    ).optional(),
    workerId: Joi.string().trim().allow(null, '', 'auto-assign').optional(),
    workerName: Joi.string().trim().allow(null, '').optional(),
    workerPhone: Joi.string().trim().allow(null, '').optional(),
    address: Joi.string().trim().min(3).max(500).optional(),
    date: Joi.string().trim().optional(),
    time: Joi.string().trim().optional(),
    tracking: Joi.object().optional(),
    media: Joi.object().optional()
}).unknown(true);

module.exports = {
    createBookingSchema,
    updateBookingSchema
};

