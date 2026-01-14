import { Item } from '../models/item.model.js';
import { pricingService } from '../services/index.js';
import { Constants } from '../config/constants.js';

export const createItem = async (req, res, next) => {
    try {
        const item = await Item.create(req.body);
        await item.populate('category');
        await item.populate('subcategory');
        res.status(Constants.HTTP_STATUS.CREATED).json({
            success: true,
            data: item,
        });
    } catch (err) {
        next(err);
    }
};

export const getItems = async (req, res, next) => {
    try {
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
        } = req.query;

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
                        const priceInfo =
                            await pricingService.calculateItemPrice(
                                item._id.toString(),
                            );
                        const basePrice = priceInfo.basePrice || 0;

                        if (minPrice && basePrice < Number(minPrice))
                            return null;
                        if (maxPrice && basePrice > Number(maxPrice))
                            return null;

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
            const { taxService } = await import('../services/index.js');
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

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: items.length,
            total,
            page: Number(page),
            limit: Number(limit),
            data: items,
        });
    } catch (err) {
        next(err);
    }
};

export const getItemById = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('category')
            .populate('subcategory');
        if (!item || !item.is_active) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Item not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: item,
        });
    } catch (err) {
        next(err);
    }
};

export const getItemPrice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { duration, requestTime } = req.query;

        const params = {};
        if (duration) params.duration = Number(duration);
        if (requestTime) params.requestTime = new Date(requestTime);

        const priceInfo = await pricingService.calculateItemPrice(id, params);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: priceInfo,
        });
    } catch (err) {
        next(err);
    }
};

export const updateItem = async (req, res, next) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate('category')
            .populate('subcategory');
        if (!item) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Item not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: item,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            { is_active: false },
            { new: true },
        );
        if (!item) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Item not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            message: 'Item deactivated successfully',
            data: item,
        });
    } catch (err) {
        next(err);
    }
};
