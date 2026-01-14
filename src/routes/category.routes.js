import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
    createCategorySchema,
    updateCategorySchema,
} from '../validations/category.validation.js';

const router = Router();

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
