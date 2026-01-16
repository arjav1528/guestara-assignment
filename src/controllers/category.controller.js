import { categoryService } from '../services/index.js';
import { Constants } from '../config/constants.js';

export const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
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
        const result = await categoryService.getCategories(req.query);
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: result.categories.length,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: result.categories,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
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

export const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.body,
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
        const category = await categoryService.deleteCategory(req.params.id);
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
