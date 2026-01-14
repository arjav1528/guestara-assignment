import { Subcategory } from '../models/subcategory.model.js';
import { Constants } from '../config/constants.js';

export const createSubcategory = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.create(req.body);
        await subcategory.populate('category');
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
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc',
            category,
        } = req.query;
        const skip = (page - 1) * limit;
        const sortOrder = order === 'asc' ? 1 : -1;

        const query = { is_active: true };
        if (category) {
            query.category = category;
        }

        const subcategories = await Subcategory.find(query)
            .populate('category')
            .sort({ [sort]: sortOrder })
            .skip(skip)
            .limit(Number(limit));

        const total = await Subcategory.countDocuments(query);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: subcategories.length,
            total,
            page: Number(page),
            limit: Number(limit),
            data: subcategories,
        });
    } catch (err) {
        next(err);
    }
};

export const getSubcategoryById = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate(
            'category',
        );
        if (!subcategory || !subcategory.is_active) {
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
        const subcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        ).populate('category');
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
        const subcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { is_active: false },
            { new: true },
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
