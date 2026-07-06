/**
 * Recommendations Controller — Endpoint de recomendaciones inteligentes
 */

import { getRecommendations } from '../services/recommendations.service.js';

/**
 * GET /api/trips/recommendations
 * Devuelve recomendaciones personalizadas si el usuario está autenticado,
 * o recomendaciones generales si no lo está.
 */
export async function get(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const limit = parseInt(req.query.limit) || 10;
    const clampedLimit = Math.max(6, Math.min(limit, 10));

    const recommendations = await getRecommendations(userId, clampedLimit);

    res.json({
      success: true,
      data: recommendations,
      meta: {
        personalized: !!userId,
        count: recommendations.length,
      },
    });
  } catch (err) {
    next(err);
  }
}
