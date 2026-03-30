const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('customer', 'worker').required(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required().messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +919000000000)'
    })
});

module.exports = {
    signupSchema
};
