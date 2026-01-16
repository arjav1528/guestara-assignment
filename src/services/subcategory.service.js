import { Subcategory } from '../models/subcategory.model.js';

export const createSubcategory = async (data) => {
    const subcategory = await Subcategory.create(data);
    await subcategory.populate('category');
    return subcategory;
};

export const getSubcategories = async (filters = {}) => {
    const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        category,
    } = filters;

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

    return {
        subcategories,
        total,
        page: Number(page),
        limit: Number(limit),
    };
};

export const getSubcategoryById = async (id) => {
    const subcategory = await Subcategory.findById(id).populate('category');
    if (!subcategory || !subcategory.is_active) {
        return null;
    }
    return subcategory;
};

export const updateSubcategory = async (id, data) => {
    const subcategory = await Subcategory.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate('category');
    return subcategory;
};

export const deleteSubcategory = async (id) => {
    const subcategory = await Subcategory.findByIdAndUpdate(
        id,
        { is_active: false },
        { new: true },
    );
    return subcategory;
};

export const subcategoryService = {
    createSubcategory,
    getSubcategories,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
};
