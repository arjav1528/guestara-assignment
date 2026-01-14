import { Router } from 'express';
import * as subcategoryController from '../controllers/subcategory.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
    createSubcategorySchema,
    updateSubcategorySchema,
} from '../validations/subcategory.validation.js';

const router = Router();

router.post(
    '/',
    validate(createSubcategorySchema),
    subcategoryController.createSubcategory,
);
router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.patch(
    '/:id',
    validate(updateSubcategorySchema),
    subcategoryController.updateSubcategory,
);
router.delete('/:id', subcategoryController.deleteSubcategory);

export default router;
