import { Router } from 'express';
import * as subcategoryController from '../controllers/subcategory.controller.js';

const router = Router();

router.post('/', subcategoryController.createSubcategory);
router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.patch('/:id', subcategoryController.updateSubcategory);
router.delete('/:id', subcategoryController.deleteSubcategory);

export default router;
