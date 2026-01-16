import { Category } from '../models/category.model.js';

export const createCategory = async (data) => {
    return await Category.create(data);
};

export const getCategories = async (filters = {}) => {
    const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        restaurant_id,
    } = filters;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const query = { is_active: true };
    if (restaurant_id) {
        query.restaurant_id = restaurant_id;
    }

    const categories = await Category.find(query)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return {
        categories,
        total,
        page: Number(page),
        limit: Number(limit),
    };
};

export const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category || !category.is_active) {
        return null;
    }
    return category;
};

export const updateCategory = async (id, data) => {
    const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    return category;
};

export const deleteCategory = async (id) => {
    const category = await Category.findByIdAndUpdate(
        id,
        { is_active: false },
        { new: true },
    );
    return category;
};

export const categoryService = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
