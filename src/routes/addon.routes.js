import { Router } from 'express';
import * as addonController from '../controllers/addon.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
    createAddonSchema,
    updateAddonSchema,
} from '../validations/addon.validation.js';

const router = Router();

router.post('/', validate(createAddonSchema), addonController.createAddon);
router.get('/', addonController.getAddons);
router.get('/:id', addonController.getAddonById);
router.patch('/:id', validate(updateAddonSchema), addonController.updateAddon);
router.delete('/:id', addonController.deleteAddon);

export default router;
