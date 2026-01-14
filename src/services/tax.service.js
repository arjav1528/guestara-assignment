import { Category } from '../models/category.model.js';
import { Subcategory } from '../models/subcategory.model.js';
import { Item } from '../models/item.model.js';

export const getSubcategoryTaxInfo = async (subcategoryId) => {
    let subcategory;

    if (typeof subcategoryId === 'object' && subcategoryId._id) {
        subcategory = subcategoryId;
    } else {
        subcategory = await Subcategory.findById(subcategoryId).populate('category');
    }

    if (!subcategory) {
        throw new Error('Subcategory not found');
    }

    if (
        subcategory.tax_applicable !== null &&
        subcategory.tax_applicable !== undefined
    ) {
        return {
            taxApplicable: subcategory.tax_applicable,
            taxPercentage:
                subcategory.tax_percentage !== null &&
                subcategory.tax_percentage !== undefined
                    ? subcategory.tax_percentage
                    : 0,
        };
    }

    const category = await Category.findById(subcategory.category);
    if (!category) {
        throw new Error('Category not found for subcategory');
    }

    return {
        taxApplicable: category.tax_applicable || false,
        taxPercentage: category.tax_percentage || 0,
    };
};

export const getItemTaxInfo = async (itemId) => {
    let item;

    if (typeof itemId === 'object' && itemId._id) {
        item = itemId;
    } else {
        item = await Item.findById(itemId)
            .populate('category')
            .populate({
                path: 'subcategory',
                populate: { path: 'category' },
            });
    }

    if (!item) {
        throw new Error('Item not found');
    }

    if (item.subcategory) {
        return await getSubcategoryTaxInfo(item.subcategory);
    }

    if (item.category) {
        const category =
            typeof item.category === 'object' && item.category._id
                ? item.category
                : await Category.findById(item.category);

        if (!category) {
            throw new Error('Category not found for item');
        }

        return {
            taxApplicable: category.tax_applicable || false,
            taxPercentage: category.tax_percentage || 0,
        };
    }

    return {
        taxApplicable: false,
        taxPercentage: 0,
    };
};

export const calculateTaxAmount = (price, taxPercentage) => {
    if (!taxPercentage || taxPercentage <= 0) {
        return 0;
    }
    return (price * taxPercentage) / 100;
};

export const calculatePriceWithTax = (basePrice, taxPercentage) => {
    const taxAmount = calculateTaxAmount(basePrice, taxPercentage);
    return basePrice + taxAmount;
};

export const getItemTaxBreakdown = async (itemId, basePrice) => {
    const taxInfo = await getItemTaxInfo(itemId);
    const taxAmount = calculateTaxAmount(basePrice, taxInfo.taxPercentage);
    const finalPrice = basePrice + taxAmount;

    return {
        taxApplicable: taxInfo.taxApplicable,
        taxPercentage: taxInfo.taxPercentage,
        taxAmount,
        finalPrice,
    };
};

export const taxService = {
    getSubcategoryTaxInfo,
    getItemTaxInfo,
    calculateTaxAmount,
    calculatePriceWithTax,
    getItemTaxBreakdown,
};
