import { Category } from '../models/category.model.js';
import { Constants } from '../config/constants.js';

export const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(Constants.HTTP_STATUS.CREATED).json({
            success: true,
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc',
        } = req.query;
        const skip = (page - 1) * limit;
        const sortOrder = order === 'asc' ? 1 : -1;

        const query = { is_active: true };
        if (req.query.restaurant_id) {
            query.restaurant_id = req.query.restaurant_id;
        }

        const categories = await Category.find(query)
            .sort({ [sort]: sortOrder })
            .skip(skip)
            .limit(Number(limit));

        const total = await Category.countDocuments(query);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: categories.length,
            total,
            page: Number(page),
            limit: Number(limit),
            data: categories,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !category.is_active) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );
        if (!category) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: category,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { is_active: false },
            { new: true },
        );
        if (!category) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            message: 'Category deactivated successfully',
            data: category,
        });
    } catch (err) {
        next(err);
    }
};
