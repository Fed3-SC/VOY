import { Router } from 'express';
import * as tripsController from '../controllers/trips.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/featured', tripsController.getFeatured);
router.get('/offers', tripsController.getOffers);
router.get('/popular-destinations', tripsController.getPopularDestinations);
router.get('/search', tripsController.search);
router.get('/:id', tripsController.getById);
router.get('/', tripsController.getAll);

// Admin CRUD (protected)
router.post('/', requireAuth, tripsController.create);
router.put('/:id', requireAuth, tripsController.update);
router.delete('/:id', requireAuth, tripsController.remove);

export default router;
