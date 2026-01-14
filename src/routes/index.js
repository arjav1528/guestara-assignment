import express from 'express';
import bookingRoutes from './booking.routes.js';

const router = express.Router();

router.get('/health', (_req, res) =>
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    }),
);

router.use('/items', bookingRoutes);

export default router;
