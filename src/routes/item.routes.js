import { Router } from 'express';
import * as itemController from '../controllers/item.controller.js';
import { validate, validateQuery } from '../middlewares/validation.middleware.js';
import {
    createItemSchema,
    updateItemSchema,
} from '../validations/item.validation.js';
import { getItemPriceSchema } from '../validations/booking.validation.js';

const router = Router();

router.post('/', validate(createItemSchema), itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get(
    '/:id/price',
    validateQuery(getItemPriceSchema),
    itemController.getItemPrice,
);
router.patch('/:id', validate(updateItemSchema), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
