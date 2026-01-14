import { Item } from '../models/item.model.js';
import { Booking } from '../models/booking.model.js';

const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

const createDateFromTime = (date, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
};

export const getAvailableSlots = async (itemId, date = new Date()) => {
    const item = await Item.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    if (!item.isBookable()) {
        throw new Error('Item is not bookable');
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const dayName = getDayName(targetDate);

    if (!item.availability.availableDays.includes(dayName)) {
        return {
            date: targetDate.toISOString().split('T')[0],
            availableSlots: [],
            message: `Item is not available on ${dayName}`,
        };
    }

    const availableSlots = [];

    for (const slot of item.availability.timeSlots) {
        const slotStart = createDateFromTime(targetDate, slot.start);
        const slotEnd = createDateFromTime(targetDate, slot.end);

        if (slotEnd <= slotStart) {
            continue;
        }

        const existingBookings = await Booking.find({
            item: itemId,
            status: 'confirmed',
            $or: [
                {
                    startTime: { $lt: slotEnd },
                    endTime: { $gt: slotStart },
                },
            ],
        });

        const isBooked = existingBookings.some((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);

            return (
                (bookingStart >= slotStart && bookingStart < slotEnd) ||
                (bookingEnd > slotStart && bookingEnd <= slotEnd) ||
                (bookingStart <= slotStart && bookingEnd >= slotEnd)
            );
        });

        if (!isBooked) {
            availableSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                startTime: slot.start,
                endTime: slot.end,
            });
        }
    }

    return {
        date: targetDate.toISOString().split('T')[0],
        availableSlots,
        itemId: itemId.toString(),
        itemName: item.name,
    };
};

export const bookSlot = async (itemId, bookingData) => {
    const { startTime, endTime, customerName, customerEmail, customerPhone } = bookingData;

    const item = await Item.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    if (!item.isBookable()) {
        throw new Error('Item is not bookable');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
        throw new Error('End time must be after start time');
    }

    const dayName = getDayName(start);
    if (!item.availability.availableDays.includes(dayName)) {
        throw new Error(`Item is not available on ${dayName}`);
    }

    const startTimeString = formatTime(start.getHours() * 60 + start.getMinutes());
    const endTimeString = formatTime(end.getHours() * 60 + end.getMinutes());

    const isValidSlot = item.availability.timeSlots.some((slot) => {
        const slotStart = parseTime(slot.start);
        const slotEnd = parseTime(slot.end);
        const requestStart = parseTime(startTimeString);
        const requestEnd = parseTime(endTimeString);

        return requestStart >= slotStart && requestEnd <= slotEnd;
    });

    if (!isValidSlot) {
        throw new Error('Requested time slot is not within available time slots');
    }

    const overlappingBooking = await Booking.findOne({
        item: itemId,
        status: 'confirmed',
        $or: [
            {
                startTime: { $lte: start },
                endTime: { $gt: start },
            },
            {
                startTime: { $lt: end },
                endTime: { $gte: end },
            },
            {
                startTime: { $gte: start },
                endTime: { $lte: end },
            },
        ],
    });

    if (overlappingBooking) {
        throw new Error('Time slot is already booked');
    }

    const booking = await Booking.create({
        item: itemId,
        startTime: start,
        endTime: end,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        status: 'confirmed',
    });

    return await Booking.findById(booking._id).populate('item', 'name description');
};

export const getBookingsByItem = async (itemId, filters = {}) => {
    const { status, startDate, endDate } = filters;

    const query = { item: itemId };

    if (status) {
        query.status = status;
    }

    if (startDate || endDate) {
        query.startTime = {};
        if (startDate) {
            query.startTime.$gte = new Date(startDate);
        }
        if (endDate) {
            query.startTime.$lte = new Date(endDate);
        }
    }

    return await Booking.find(query)
        .populate('item', 'name description')
        .sort({ startTime: 1 });
};

export const cancelBooking = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
    }

    booking.status = 'cancelled';
    await booking.save();

    return await Booking.findById(bookingId).populate('item', 'name description');
};

export const bookingService = {
    getAvailableSlots,
    bookSlot,
    getBookingsByItem,
    cancelBooking,
};
