import { Router } from 'express';
import * as controller from '../controllers/vehicle.controller';
import {
  authenticate,
  requireAdmin,
  requireCustomer,
} from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/search', controller.search); // must stay above '/:id' routes
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.remove);
router.post('/:id/purchase', requireCustomer, controller.purchase);
router.post('/:id/restock', requireAdmin, controller.restock);

export default router;