import { itemService, pricingService } from '../services/index.js';
import { Constants } from '../config/constants.js';

export const createItem = async (req, res, next) => {
    try {
        const item = await itemService.createItem(req.body);
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
        const result = await itemService.getItems(req.query);
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: result.items.length,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: result.items,
        });
    } catch (err) {
        next(err);
    }
};

export const getItemById = async (req, res, next) => {
    try {
        const item = await itemService.getItemById(req.params.id);
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
        const item = await itemService.updateItem(req.params.id, req.body);
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
        const item = await itemService.deleteItem(req.params.id);
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
