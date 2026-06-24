import { Router } from 'express';
import * as favoritesController from '../controllers/favorites.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Todos los endpoints de favoritos requieren autenticación JWT
router.get('/',          requireAuth, favoritesController.getFavorites);
router.get('/ids',       requireAuth, favoritesController.getFavoriteIds);
router.post('/',         requireAuth, favoritesController.addFavorite);
router.delete('/:tripId', requireAuth, favoritesController.removeFavorite);

export default router;
