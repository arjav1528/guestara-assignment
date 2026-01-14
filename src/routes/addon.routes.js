import { Router } from 'express';
import * as addonController from '../controllers/addon.controller.js';

const router = Router();

router.post('/', addonController.createAddon);
router.get('/', addonController.getAddons);
router.get('/:id', addonController.getAddonById);
router.patch('/:id', addonController.updateAddon);
router.delete('/:id', addonController.deleteAddon);

export default router;
