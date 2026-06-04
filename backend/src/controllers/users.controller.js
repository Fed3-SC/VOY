/**
 * Users Controller — Endpoints de gestión de usuarios (admin)
 */

import * as usersService from '../services/users.service.js';

/**
 * GET /api/users
 * Lista todos los usuarios registrados.
 */
export async function getAll(req, res, next) {
  try {
    const users = await usersService.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/promote
 * Convierte al usuario en administrador.
 */
export async function promote(req, res, next) {
  try {
    const { id } = req.params;

    // Evitar que el admin se quite permisos a sí mismo accidentalmente via promote
    const user = await usersService.promoteToAdmin(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/demote
 * Retira los permisos de administrador.
 */
export async function demote(req, res, next) {
  try {
    const { id } = req.params;

    // Seguridad: no permitir que el admin se quite permisos a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'No podés quitarte los permisos de administrador a vos mismo.',
      });
    }

    const user = await usersService.demoteFromAdmin(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
