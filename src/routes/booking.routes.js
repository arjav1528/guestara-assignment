import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';

const router = Router();

router.get('/:id/availability', bookingController.getAvailableSlots);
router.post('/:id/book', bookingController.bookSlot);
router.get('/:id/bookings', bookingController.getItemBookings);
router.patch('/bookings/:bookingId/cancel', bookingController.cancelBooking);

export default router;
