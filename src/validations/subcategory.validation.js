import Joi from 'joi';

export const createSubcategorySchema = Joi.object({
    category: Joi.string().required().messages({
        'string.empty': 'Category reference is required',
        'any.required': 'Category reference is required',
    }),
    name: Joi.string().required().trim().messages({
        'string.empty': 'Subcategory name is required',
        'any.required': 'Subcategory name is required',
    }),
    image: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    tax_applicable: Joi.boolean().allow(null),
    tax_percentage: Joi.number().min(0).max(100).allow(null),
    is_active: Joi.boolean().default(true),
});

export const updateSubcategorySchema = Joi.object({
    category: Joi.string(),
    name: Joi.string().trim(),
    image: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    tax_applicable: Joi.boolean().allow(null),
    tax_percentage: Joi.number().min(0).max(100).allow(null),
    is_active: Joi.boolean(),
});
