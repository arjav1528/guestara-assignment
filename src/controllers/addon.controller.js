import { Addon } from '../models/addon.model.js';
import { Constants } from '../config/constants.js';

export const createAddon = async (req, res, next) => {
    try {
        const addon = await Addon.create(req.body);
        await addon.populate('item', 'name description');
        res.status(Constants.HTTP_STATUS.CREATED).json({
            success: true,
            data: addon,
        });
    } catch (err) {
        next(err);
    }
};

export const getAddons = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, item, group } = req.query;
        const skip = (page - 1) * limit;

        const query = { is_active: true };
        if (item) {
            query.item = item;
        }
        if (group) {
            query.group = group;
        }

        const addons = await Addon.find(query)
            .populate('item', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Addon.countDocuments(query);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: addons.length,
            total,
            page: Number(page),
            limit: Number(limit),
            data: addons,
        });
    } catch (err) {
        next(err);
    }
};

export const getAddonById = async (req, res, next) => {
    try {
        const addon = await Addon.findById(req.params.id).populate(
            'item',
            'name description',
        );
        if (!addon || !addon.is_active) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Addon not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: addon,
        });
    } catch (err) {
        next(err);
    }
};

export const updateAddon = async (req, res, next) => {
    try {
        const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('item', 'name description');
        if (!addon) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Addon not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: addon,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteAddon = async (req, res, next) => {
    try {
        const addon = await Addon.findByIdAndUpdate(
            req.params.id,
            { is_active: false },
            { new: true },
        );
        if (!addon) {
            return res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Addon not found',
            });
        }
        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            message: 'Addon deactivated successfully',
            data: addon,
        });
    } catch (err) {
        next(err);
    }
};
