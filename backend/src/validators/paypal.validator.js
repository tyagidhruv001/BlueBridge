const Joi = require('joi');

const createPayPalOrderSchema = Joi.object({
    bookingId: Joi.string().trim().required().messages({
        'string.empty': 'Booking ID is required',
        'any.required': 'Booking ID is required'
    }),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').default('USD').optional()
});

const capturePayPalOrderSchema = Joi.object({
    orderId: Joi.string().trim().required().messages({
        'string.empty': 'PayPal Order ID is required',
        'any.required': 'PayPal Order ID is required'
    }),
    bookingId: Joi.string().trim().allow(null, '').optional()
});

module.exports = {
    createPayPalOrderSchema,
    capturePayPalOrderSchema
};
