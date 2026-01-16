import Joi from 'joi';

const pricingSchema = Joi.object({
    type: Joi.string()
        .valid('static', 'tiered', 'complimentary', 'discounted', 'dynamic')
        .required()
        .messages({
            'any.only':
                'Pricing type must be one of: static, tiered, complimentary, discounted, dynamic',
            'any.required': 'Pricing type is required',
        }),
    price: Joi.when('type', {
        is: 'static',
        then: Joi.number().min(0).required(),
        otherwise: Joi.number().min(0).allow(null),
    }),
    tiers: Joi.when('type', {
        is: 'tiered',
        then: Joi.array()
            .items(
                Joi.object({
                    max: Joi.number().min(0).required(),
                    price: Joi.number().min(0).required(),
                }),
            )
            .min(1)
            .required(),
        otherwise: Joi.array().allow(null),
    }),
    basePrice: Joi.when('type', {
        is: 'discounted',
        then: Joi.number().min(0).required(),
        otherwise: Joi.number().min(0).allow(null),
    }),
    discountType: Joi.when('type', {
        is: 'discounted',
        then: Joi.string().valid('flat', 'percentage').required(),
        otherwise: Joi.string().allow(null),
    }),
    discountValue: Joi.when('type', {
        is: 'discounted',
        then: Joi.number().min(0).required(),
        otherwise: Joi.number().min(0).allow(null),
    }),
    timeWindows: Joi.when('type', {
        is: 'dynamic',
        then: Joi.array()
            .items(
                Joi.object({
                    start: Joi.string()
                        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    end: Joi.string()
                        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    price: Joi.number().min(0).required(),
                }),
            )
            .min(1)
            .required(),
        otherwise: Joi.array().allow(null),
    }),
});

const availabilitySchema = Joi.object({
    availableDays: Joi.array()
        .items(
            Joi.string().valid(
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ),
        )
        .default([]),
    timeSlots: Joi.array()
        .items(
            Joi.object({
                start: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .allow(null, ''),
                end: Joi.string()
                    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
                    .allow(null, ''),
            }),
        )
        .default([]),
});

export const createItemSchema = Joi.object({
    name: Joi.string().required().trim().messages({
        'string.empty': 'Item name is required',
        'any.required': 'Item name is required',
    }),
    description: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
    is_active: Joi.boolean().default(true),
    category: Joi.string().allow(null, ''),
    subcategory: Joi.string().allow(null, ''),
    pricing: pricingSchema.required(),
    availability: availabilitySchema.default({
        availableDays: [],
        timeSlots: [],
    }),
}).xor('category', 'subcategory');

export const updateItemSchema = Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
    is_active: Joi.boolean(),
    category: Joi.string().allow(null, ''),
    subcategory: Joi.string().allow(null, ''),
    pricing: pricingSchema,
    availability: availabilitySchema,
});
