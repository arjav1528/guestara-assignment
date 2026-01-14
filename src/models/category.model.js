import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            index: true,
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
            default: false,
        },
        tax_percentage: {
            type: Number,
            min: [0, 'Tax percentage cannot be negative'],
            max: [100, 'Tax percentage cannot exceed 100'],
            validate: {
                validator: function (value) {
                    if (
                        this.tax_applicable &&
                        (value === null || value === undefined)
                    ) {
                        return false;
                    }
                    return true;
                },
                message:
                    'Tax percentage is required when tax_applicable is true',
            },
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
        restaurant_id: {
            type: String,
            required: [true, 'Restaurant ID is required'],
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

categorySchema.index({ name: 1, restaurant_id: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);
