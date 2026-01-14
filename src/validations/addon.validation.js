import Joi from 'joi';

export const createAddonSchema = Joi.object({
    item: Joi.string().required().messages({
        'string.empty': 'Item reference is required',
        'any.required': 'Item reference is required',
    }),
    name: Joi.string().required().trim().messages({
        'string.empty': 'Addon name is required',
        'any.required': 'Addon name is required',
    }),
    description: Joi.string().allow(null, ''),
    price: Joi.number().min(0).required().messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required',
    }),
    isMandatory: Joi.boolean().default(false),
    group: Joi.string().allow(null, ''),
    is_active: Joi.boolean().default(true),
});

export const updateAddonSchema = Joi.object({
    item: Joi.string(),
    name: Joi.string().trim(),
    description: Joi.string().allow(null, ''),
    price: Joi.number().min(0),
    isMandatory: Joi.boolean(),
    group: Joi.string().allow(null, ''),
    is_active: Joi.boolean(),
});
