import { subcategoryService } from '../services/index.js';
import { Constants } from '../config/constants.js';

export const createSubcategory = async (req, res, next) => {
    try {
        const subcategory = await subcategoryService.createSubcategory(req.body);
        res.status(Constants.HTTP_STATUS.CREATED).json({
            success: true,
            data: subcategory,
        });
    } catch (err) {
        next(err);
    }
};

export const getSubcategories = async (req, res, next) => {
    try {
        const result = await subcategoryService.getSubcategories(req.query);
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: result.subcategories.length,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: result.subcategories,
        });
    } catch (err) {
        next(err);
    }
};

export const getSubcategoryById = async (req, res, next) => {
    try {
        const subcategory = await subcategoryService.getSubcategoryById(
            req.params.id,
        );
        if (!subcategory) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Subcategory not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: subcategory,
        });
    } catch (err) {
        next(err);
    }
};

export const updateSubcategory = async (req, res, next) => {
    try {
        const subcategory = await subcategoryService.updateSubcategory(
            req.params.id,
            req.body,
        );
        if (!subcategory) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Subcategory not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: subcategory,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteSubcategory = async (req, res, next) => {
    try {
        const subcategory = await subcategoryService.deleteSubcategory(
            req.params.id,
        );
        if (!subcategory) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Subcategory not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            message: 'Subcategory deactivated successfully',
            data: subcategory,
        });
    } catch (err) {
        next(err);
    }
};
