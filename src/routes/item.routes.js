import { Router } from 'express';
import * as itemController from '../controllers/item.controller.js';

const router = Router();

router.post('/', itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/price', itemController.getItemPrice);
router.patch('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
