import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: [true, 'Item reference is required'],
            index: true,
        },
        startTime: {
            type: Date,
            required: [true, 'Start time is required'],
            index: true,
        },
        endTime: {
            type: Date,
            required: [true, 'End time is required'],
            validate: {
                validator: function (value) {
                    return value > this.startTime;
                },
                message: 'End time must be after start time',
            },
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'completed'],
            default: 'confirmed',
            index: true,
        },
        // Optional: customer information
        customerName: {
            type: String,
            default: null,
        },
        customerEmail: {
            type: String,
            default: null,
        },
        customerPhone: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Compound index to prevent double booking (check for overlapping time slots)
bookingSchema.index(
    { item: 1, startTime: 1, endTime: 1 },
    {
        partialFilterExpression: { status: 'confirmed' },
    },
);

// Validation: Prevent overlapping bookings for the same item
bookingSchema.pre('save', async function (next) {
    if (this.status === 'confirmed') {
        const overlappingBooking = await mongoose.model('Booking').findOne({
            item: this.item,
            status: 'confirmed',
            _id: { $ne: this._id }, // Exclude current booking if updating
            $or: [
                // New booking starts during existing booking
                {
                    startTime: { $lte: this.startTime },
                    endTime: { $gt: this.startTime },
                },
                // New booking ends during existing booking
                {
                    startTime: { $lt: this.endTime },
                    endTime: { $gte: this.endTime },
                },
                // New booking completely contains existing booking
                {
                    startTime: { $gte: this.startTime },
                    endTime: { $lte: this.endTime },
                },
            ],
        });

        if (overlappingBooking) {
            return next(new Error('Time slot is already booked'));
        }
    }
    next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
