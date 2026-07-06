/**
 * Users Service — Gestión de usuarios (solo para administradores)
 */

import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';

/**
 * Formatea un usuario de la BD al formato del frontend.
 */
function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dni: row.dni,
    isAdmin: row.is_admin || false,
    residenceCityId: row.residence_city_id || null,
    createdAt: row.created_at,
  };
}

/**
 * Retorna todos los usuarios registrados (sin password_hash).
 */
export async function getAll() {
  const result = await query(
    `SELECT id, name, last_name, email, phone, dni, is_admin, residence_city_id, created_at
     FROM users
     ORDER BY created_at DESC`,
    []
  );
  return result.rows.map(formatUser);
}

/**
 * Promueve un usuario a administrador.
 * @param {string} userId - UUID del usuario
 */
export async function promoteToAdmin(userId) {
  const check = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (check.rows.length === 0) {
    throw createError('Usuario no encontrado', 404);
  }

  await query('UPDATE users SET is_admin = TRUE WHERE id = $1', [userId]);

  const result = await query(
    `SELECT id, name, last_name, email, phone, dni, is_admin, residence_city_id, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return formatUser(result.rows[0]);
}

/**
 * Retira los permisos de administrador a un usuario.
 * @param {string} userId - UUID del usuario
 */
export async function demoteFromAdmin(userId) {
  const check = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (check.rows.length === 0) {
    throw createError('Usuario no encontrado', 404);
  }

  await query('UPDATE users SET is_admin = FALSE WHERE id = $1', [userId]);

  const result = await query(
    `SELECT id, name, last_name, email, phone, dni, is_admin, residence_city_id, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return formatUser(result.rows[0]);
}
