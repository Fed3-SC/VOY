import { Router } from 'express';
import * as tripsController from '../controllers/trips.controller.js';

const router = Router();

router.get('/offers', tripsController.getOffers);
router.get('/popular-destinations', tripsController.getPopularDestinations);
router.get('/search', tripsController.search);
router.get('/:id', tripsController.getById);
router.get('/', tripsController.getAll);

export default router;
