/**
 * Features Service — Gestión de características de viajes
 *
 * CRUD de features + asociación N:M con trips vía trip_features.
 */

import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';

/**
 * Formatea una feature de la BD.
 */
function formatFeature(row) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    createdAt: row.created_at,
  };
}

/* ──────────────── CRUD DE FEATURES ──────────────── */

/**
 * Obtiene todas las características disponibles.
 */
export async function getAll() {
  const result = await query(
    'SELECT * FROM features ORDER BY name ASC',
    []
  );
  return result.rows.map(formatFeature);
}

/**
 * Crea una nueva característica.
 * @param {{ name, icon }} data
 */
export async function create({ name, icon }) {
  if (!name || !icon) {
    throw createError('Nombre e ícono son obligatorios', 400);
  }

  const result = await query(
    'INSERT INTO features (name, icon) VALUES ($1, $2) RETURNING *',
    [name, icon]
  );
  return formatFeature(result.rows[0]);
}

/**
 * Actualiza una característica existente.
 * @param {number} id
 * @param {{ name, icon }} data
 */
export async function update(id, { name, icon }) {
  const check = await query('SELECT id FROM features WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw createError('Característica no encontrada', 404);
  }

  const result = await query(
    'UPDATE features SET name = COALESCE($1, name), icon = COALESCE($2, icon) WHERE id = $3 RETURNING *',
    [name || null, icon || null, id]
  );
  return formatFeature(result.rows[0]);
}

/**
 * Elimina una característica (también elimina las relaciones en trip_features via CASCADE).
 * @param {number} id
 */
export async function remove(id) {
  const check = await query('SELECT id FROM features WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw createError('Característica no encontrada', 404);
  }

  await query('DELETE FROM features WHERE id = $1', [id]);
  return { deleted: true };
}

/* ──────────────── RELACIÓN TRIP_FEATURES ──────────────── */

/**
 * Obtiene las features asociadas a un viaje.
 * @param {number} tripId
 * @returns {object[]} features
 */
export async function getFeaturesForTrip(tripId) {
  const result = await query(
    `SELECT f.* FROM features f
     JOIN trip_features tf ON tf.feature_id = f.id
     WHERE tf.trip_id = $1
     ORDER BY f.name ASC`,
    [tripId]
  );
  return result.rows.map(formatFeature);
}

/**
 * Reemplaza las features de un viaje (delete + insert bulk).
 * @param {number} tripId
 * @param {number[]} featureIds - array de IDs de features (puede ser vacío)
 */
export async function setFeaturesForTrip(tripId, featureIds = []) {
  // Eliminar relaciones existentes
  await query('DELETE FROM trip_features WHERE trip_id = $1', [tripId]);

  if (featureIds.length === 0) return;

  // Insertar nuevas relaciones en bulk
  const values = featureIds.map((fid, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
  const params = featureIds.flatMap(fid => [tripId, fid]);

  await query(
    `INSERT INTO trip_features (trip_id, feature_id) VALUES ${values} ON CONFLICT DO NOTHING`,
    params
  );
}
