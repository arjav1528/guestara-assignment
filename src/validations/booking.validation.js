import Joi from 'joi';

export const bookSlotSchema = Joi.object({
    startTime: Joi.date().iso().required().messages({
        'date.base': 'Start time must be a valid date',
        'date.format': 'Start time must be in ISO format',
        'any.required': 'Start time is required',
    }),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
        'date.base': 'End time must be a valid date',
        'date.format': 'End time must be in ISO format',
        'date.greater': 'End time must be after start time',
        'any.required': 'End time is required',
    }),
    customerName: Joi.string().allow(null, ''),
    customerEmail: Joi.string().email().allow(null, '').messages({
        'string.email': 'Customer email must be a valid email address',
    }),
    customerPhone: Joi.string().allow(null, ''),
});

export const getAvailabilitySchema = Joi.object({
    date: Joi.date().iso().allow(null, ''),
});

export const getItemPriceSchema = Joi.object({
    duration: Joi.number().min(0).allow(null, ''),
    requestTime: Joi.date().iso().allow(null, ''),
});
