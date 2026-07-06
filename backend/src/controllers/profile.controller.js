/**
 * Profile Controller — Gestión de datos de usuario autenticado
 */

import { query } from '../config/database.js';
import { getUserById } from '../services/auth.service.js';

/**
 * PATCH /api/auth/profile
 * Actualiza los datos del usuario autenticado (actualmente solo ciudad de residencia).
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { residenceCityId } = req.body;

    if (residenceCityId !== undefined) {
      await query(
        'UPDATE users SET residence_city_id = $1 WHERE id = $2',
        [residenceCityId, userId]
      );
    }

    const updatedUser = await getUserById(userId);

    res.json({
      success: true,
      data: updatedUser,
      message: 'Perfil actualizado correctamente'
    });
  } catch (err) {
    next(err);
  }
}
