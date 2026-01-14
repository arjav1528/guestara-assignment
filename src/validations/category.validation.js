import Joi from 'joi';

export const createCategorySchema = Joi.object({
    name: Joi.string().required().trim().messages({
        'string.empty': 'Category name is required',
        'any.required': 'Category name is required',
    }),
    image: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    tax_applicable: Joi.boolean().default(false),
    tax_percentage: Joi.when('tax_applicable', {
        is: true,
        then: Joi.number().min(0).max(100).required().messages({
            'number.base': 'Tax percentage must be a number',
            'number.min': 'Tax percentage cannot be negative',
            'number.max': 'Tax percentage cannot exceed 100',
            'any.required': 'Tax percentage is required when tax_applicable is true',
        }),
        otherwise: Joi.number().min(0).max(100).allow(null),
    }),
    is_active: Joi.boolean().default(true),
    restaurant_id: Joi.string().required().messages({
        'string.empty': 'Restaurant ID is required',
        'any.required': 'Restaurant ID is required',
    }),
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().trim(),
    image: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    tax_applicable: Joi.boolean(),
    tax_percentage: Joi.when('tax_applicable', {
        is: true,
        then: Joi.number().min(0).max(100).required(),
        otherwise: Joi.number().min(0).max(100).allow(null),
    }),
    is_active: Joi.boolean(),
    restaurant_id: Joi.string(),
});
