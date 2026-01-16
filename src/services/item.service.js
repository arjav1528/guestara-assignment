import { Item } from '../models/item.model.js';
import { pricingService } from './pricing.service.js';
import { taxService } from './tax.service.js';

export const createItem = async (data) => {
    const item = await Item.create(data);
    await item.populate('category');
    await item.populate('subcategory');
    return item;
};

export const getItems = async (filters = {}) => {
    const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        category,
        subcategory,
        minPrice,
        maxPrice,
        activeOnly = 'true',
        taxApplicable,
        search,
    } = filters;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const query = {};
    if (activeOnly === 'true') {
        query.is_active = true;
    }
    if (category) {
        query.category = category;
    }
    if (subcategory) {
        query.subcategory = subcategory;
    }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    let items = await Item.find(query)
        .populate('category')
        .populate('subcategory')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(Number(limit));

    if (minPrice || maxPrice) {
        items = await Promise.all(
            items.map(async (item) => {
                try {
                    const priceInfo = await pricingService.calculateItemPrice(
                        item._id.toString(),
                    );
                    const basePrice = priceInfo.basePrice || 0;

                    if (minPrice && basePrice < Number(minPrice)) return null;
                    if (maxPrice && basePrice > Number(maxPrice)) return null;

                    item._doc.calculatedPrice = basePrice;
                    return item;
                } catch (err) {
                    return null;
                }
            }),
        );
        items = items.filter((item) => item !== null);
    }

    if (taxApplicable !== undefined) {
        items = await Promise.all(
            items.map(async (item) => {
                try {
                    const taxInfo = await taxService.getItemTaxInfo(
                        item._id.toString(),
                    );
                    if (taxApplicable === 'true' && !taxInfo.taxApplicable)
                        return null;
                    if (taxApplicable === 'false' && taxInfo.taxApplicable)
                        return null;
                    return item;
                } catch (err) {
                    return null;
                }
            }),
        );
        items = items.filter((item) => item !== null);
    }

    const total = await Item.countDocuments(query);

    return {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
    };
};

export const getItemById = async (id) => {
    const item = await Item.findById(id)
        .populate('category')
        .populate('subcategory');
    if (!item || !item.is_active) {
        return null;
    }
    return item;
};

export const updateItem = async (id, data) => {
    const item = await Item.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    })
        .populate('category')
        .populate('subcategory');
    return item;
};

export const deleteItem = async (id) => {
    const item = await Item.findByIdAndUpdate(
        id,
        { is_active: false },
        { new: true },
    );
    return item;
};

export const itemService = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
};
