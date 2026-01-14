import mongoose from 'mongoose';

const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

export const pricingSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, 'Pricing type is required'],
            enum: {
                values: [
                    'static',
                    'tiered',
                    'complimentary',
                    'discounted',
                    'dynamic',
                ],
                message:
                    'Pricing type must be one of: static, tiered, complimentary, discounted, dynamic',
            },
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            validate: {
                validator: function (value) {
                    if (
                        this.type === 'static' &&
                        (value === null || value === undefined)
                    ) {
                        return false;
                    }
                    return true;
                },
                message: 'Price is required for static pricing',
            },
        },
        tiers: {
            type: [
                {
                    max: {
                        type: Number,
                        required: true,
                        min: [0, 'Tier max value cannot be negative'],
                    },
                    price: {
                        type: Number,
                        required: true,
                        min: [0, 'Tier price cannot be negative'],
                    },
                },
            ],
            validate: {
                validator: function (value) {
                    if (this.type === 'tiered') {
                        if (!value || value.length === 0) {
                            return false;
                        }
                        const sorted = [...value].sort((a, b) => a.max - b.max);
                        for (let i = 1; i < sorted.length; i++) {
                            if (sorted[i].max <= sorted[i - 1].max) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                message:
                    'Tiers are required for tiered pricing and must not overlap',
            },
        },
        basePrice: {
            type: Number,
            min: [0, 'Base price cannot be negative'],
            validate: {
                validator: function (value) {
                    if (
                        this.type === 'discounted' &&
                        (value === null || value === undefined)
                    ) {
                        return false;
                    }
                    return true;
                },
                message: 'Base price is required for discounted pricing',
            },
        },
        discountType: {
            type: String,
            enum: {
                values: ['flat', 'percentage'],
                message: 'Discount type must be either flat or percentage',
            },
            validate: {
                validator: function (value) {
                    if (this.type === 'discounted' && !value) {
                        return false;
                    }
                    return true;
                },
                message: 'Discount type is required for discounted pricing',
            },
        },
        discountValue: {
            type: Number,
            min: [0, 'Discount value cannot be negative'],
            validate: {
                validator: function (value) {
                    if (this.type === 'discounted') {
                        if (value === null || value === undefined) {
                            return false;
                        }
                        if (this.discountType === 'percentage' && value > 100) {
                            return false;
                        }
                        if (
                            this.discountType === 'flat' &&
                            value > this.basePrice
                        ) {
                            return false;
                        }
                    }
                    return true;
                },
                message:
                    'Valid discount value is required for discounted pricing',
            },
        },
        timeWindows: {
            type: [
                {
                    start: {
                        type: String,
                        required: true,
                        match: [
                            /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                            'Time must be in HH:MM format',
                        ],
                    },
                    end: {
                        type: String,
                        required: true,
                        match: [
                            /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                            'Time must be in HH:MM format',
                        ],
                    },
                    price: {
                        type: Number,
                        required: true,
                        min: [0, 'Price cannot be negative'],
                    },
                },
            ],
            validate: {
                validator: function (value) {
                    if (this.type === 'dynamic') {
                        if (!value || value.length === 0) {
                            return false;
                        }
                        for (const window of value) {
                            const start = parseTime(window.start);
                            const end = parseTime(window.end);
                            if (start >= end) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                message: 'Valid time windows are required for dynamic pricing',
            },
        },
    },
    {
        _id: false,
    },
);
