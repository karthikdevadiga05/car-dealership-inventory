import { Router } from 'express';
import * as controller from '../controllers/vehicle.controller';
import {
  authenticate,
  requireAdmin,
  requireCustomer,
} from '../middleware/auth.middleware';
import { imageUpload } from '../middleware/upload.middleware';

const router = Router();

// Public on purpose: <img> tags cannot send an Authorization header.
router.get('/:id/image', controller.image);

router.use(authenticate);

router.get('/', controller.list);
router.get('/search', controller.search); // must stay above '/:id' routes
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.remove);
router.post('/:id/purchase', requireCustomer, controller.purchase);
router.post('/:id/restock', requireAdmin, controller.restock);
router.put('/:id/image', requireAdmin, imageUpload, controller.uploadImage);
router.delete('/:id/image', requireAdmin, controller.deleteImage);

export default router;