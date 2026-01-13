import mongoose from 'mongoose';
import { pricingSchema } from './pricing.schema.js';

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            default: null,
        },
        pricing: {
            type: pricingSchema,
            required: [true, 'Pricing configuration is required'],
        },
        availability: {
            availableDays: {
                type: [String],
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                default: [],
            },
            timeSlots: [
                {
                    start: {
                        type: String,
                        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
                    },
                    end: {
                        type: String,
                        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    },
);

itemSchema.pre('validate', function (next) {
    const hasCategory = this.category !== null && this.category !== undefined;
    const hasSubcategory = this.subcategory !== null && this.subcategory !== undefined;

    if (!hasCategory && !hasSubcategory) {
        return next(new Error('Item must belong to either a category or subcategory'));
    }

    if (hasCategory && hasSubcategory) {
        return next(new Error('Item cannot belong to both category and subcategory'));
    }

    next();
});

itemSchema.index({ name: 1, category: 1 }, {
    unique: true,
    partialFilterExpression: { category: { $ne: null } },
});

itemSchema.index({ name: 1, subcategory: 1 }, {
    unique: true,
    partialFilterExpression: { subcategory: { $ne: null } },
});

itemSchema.methods.isBookable = function () {
    return (
        this.availability &&
        this.availability.availableDays.length > 0 &&
        this.availability.timeSlots.length > 0
    );
};

export const Item = mongoose.model('Item', itemSchema);
