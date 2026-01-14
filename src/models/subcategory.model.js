import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category reference is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Subcategory name is required'],
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
        tax_applicable: {
            type: Boolean,
            default: null,
        },
        tax_percentage: {
            type: Number,
            min: [0, 'Tax percentage cannot be negative'],
            max: [100, 'Tax percentage cannot exceed 100'],
            default: null,
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

subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export const Subcategory = mongoose.model('Subcategory', subcategorySchema);
