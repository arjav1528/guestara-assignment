import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: [true, 'Item reference is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Addon name is required'],
            trim: true,
        },
        description: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            required: [true, 'Addon price is required'],
            min: [0, 'Addon price cannot be negative'],
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },
        // Optional: Addon groups (e.g., "Choose 1 of 3 sauces")
        group: {
            type: String,
            default: null,
            index: true,
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index to ensure unique addon name per item (unless in a group)
addonSchema.index({ name: 1, item: 1 }, { unique: true });

export const Addon = mongoose.model('Addon', addonSchema);
