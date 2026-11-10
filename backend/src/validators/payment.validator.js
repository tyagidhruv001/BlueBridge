const Joi = require('joi');

const createOrderSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a valid number',
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required'
    }),
    currency: Joi.string().valid('USD', 'INR').default('USD').optional()
});

const verifyPaymentSchema = Joi.object({
    orderId: Joi.string().trim().required().messages({
        'string.empty': 'Order ID is required',
        'any.required': 'Order ID is required'
    }),
    paymentId: Joi.string().trim().required().messages({
        'string.empty': 'Payment ID is required',
        'any.required': 'Payment ID is required'
    }),
    signature: Joi.string().trim().required().messages({
        'string.empty': 'Payment signature is required',
        'any.required': 'Payment signature is required'
    })
});

const deductWalletSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a valid number',
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required'
    }),
    bookingId: Joi.string().trim().required().messages({
        'string.empty': 'Booking ID is required',
        'any.required': 'Booking ID is required'
    }),
    description: Joi.string().trim().allow(null, '').optional()
});

const refundSchema = Joi.object({
    paymentId: Joi.string().trim().required().messages({
        'string.empty': 'Payment ID is required',
        'any.required': 'Payment ID is required'
    }),
    amount: Joi.number().positive().optional(),
    reason: Joi.string().trim().allow(null, '').optional()
});

module.exports = {
    createOrderSchema,
    verifyPaymentSchema,
    deductWalletSchema,
    refundSchema
};
