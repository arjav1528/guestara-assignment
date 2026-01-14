import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { validate, validateQuery } from '../middlewares/validation.middleware.js';
import {
    bookSlotSchema,
    getAvailabilitySchema,
} from '../validations/booking.validation.js';

const router = Router();

router.get(
    '/:id/availability',
    validateQuery(getAvailabilitySchema),
    bookingController.getAvailableSlots,
);
router.post('/:id/book', validate(bookSlotSchema), bookingController.bookSlot);
router.get('/:id/bookings', bookingController.getItemBookings);
router.patch('/bookings/:bookingId/cancel', bookingController.cancelBooking);

export default router;
