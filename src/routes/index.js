import express from 'express';
import bookingRoutes from './booking.routes.js';
import categoryRoutes from './category.routes.js';
import subcategoryRoutes from './subcategory.routes.js';
import itemRoutes from './item.routes.js';
import addonRoutes from './addon.routes.js';

const router = express.Router();

router.get('/health', (_req, res) =>
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    }),
);

router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/items', itemRoutes);
router.use('/items', bookingRoutes);
router.use('/addons', addonRoutes);

export default router;
