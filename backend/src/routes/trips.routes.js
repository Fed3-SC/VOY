import { Router } from 'express';
import * as tripsController from '../controllers/trips.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/featured', tripsController.getFeatured);
router.get('/offers', tripsController.getOffers);
router.get('/popular-destinations', tripsController.getPopularDestinations);
router.get('/search', tripsController.search);
router.get('/:id', tripsController.getById);
router.get('/', tripsController.getAll);

// Admin CRUD (protected — requiere autenticación + permisos de admin)
router.post('/', requireAuth, requireAdmin, tripsController.create);
router.put('/:id', requireAuth, requireAdmin, tripsController.update);
router.delete('/:id', requireAuth, requireAdmin, tripsController.remove);

export default router;

