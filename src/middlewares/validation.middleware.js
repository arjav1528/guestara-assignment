import { Constants } from '../config/constants.js';

export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        req.body = value;
        next();
    };
};

export const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Query validation error',
                errors,
            });
        }

        req.query = value;
        next();
    };
};
