import { bookingService } from '../services/booking.service.js';
import { Constants } from '../config/constants.js';

export const getAvailableSlots = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const targetDate = date ? new Date(date) : new Date();

        const result = await bookingService.getAvailableSlots(id, targetDate);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const bookSlot = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, customerName, customerEmail, customerPhone } = req.body;

        if (!startTime || !endTime) {
            return res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Start time and end time are required',
            });
        }

        const booking = await bookingService.bookSlot(id, {
            startTime,
            endTime,
            customerName,
            customerEmail,
            customerPhone,
        });

        res.status(Constants.HTTP_STATUS.CREATED).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

export const getItemBookings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, startDate, endDate } = req.query;

        const bookings = await bookingService.getBookingsByItem(id, {
            status,
            startDate,
            endDate,
        });

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (err) {
        next(err);
    }
};

export const cancelBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await bookingService.cancelBooking(bookingId);

        res.status(Constants.HTTP_STATUS.OK).json({
            success: true,
            data: booking,
            message: 'Booking cancelled successfully',
        });
    } catch (err) {
        next(err);
    }
};
