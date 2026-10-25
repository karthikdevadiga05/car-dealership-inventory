import { Router } from 'express';
import * as controller from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/search', controller.search); // must stay above '/:id' routes
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', requireAdmin, controller.remove);

export default router;