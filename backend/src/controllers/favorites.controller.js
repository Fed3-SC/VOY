/**
 * Favorites Controller — Handlers HTTP para favoritos
 */

import * as favoritesService from '../services/favorites.service.js';

/**
 * GET /api/favorites
 * Devuelve todos los viajes favoritos del usuario autenticado.
 */
export async function getFavorites(req, res, next) {
  try {
    const favorites = await favoritesService.getFavoritesByUser(req.user.id);
    res.json({ success: true, data: favorites });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/favorites/ids
 * Devuelve solo los IDs de los favoritos del usuario (para carga rápida del contexto).
 */
export async function getFavoriteIds(req, res, next) {
  try {
    const ids = await favoritesService.getFavoriteIds(req.user.id);
    res.json({ success: true, data: ids });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/favorites
 * Body: { tripId }
 * Agrega un viaje a favoritos del usuario autenticado.
 */
export async function addFavorite(req, res, next) {
  try {
    const { tripId } = req.body;

    if (!tripId || isNaN(parseInt(tripId))) {
      return res.status(400).json({ success: false, error: 'tripId es requerido y debe ser un número.' });
    }

    const result = await favoritesService.addFavorite(req.user.id, parseInt(tripId));
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/favorites/:tripId
 * Elimina un viaje de los favoritos del usuario autenticado.
 */
export async function removeFavorite(req, res, next) {
  try {
    const tripId = parseInt(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ success: false, error: 'tripId inválido.' });
    }

    const result = await favoritesService.removeFavorite(req.user.id, tripId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
