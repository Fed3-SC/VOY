/**
 * Favorites Service — Lógica de negocio de favoritos
 *
 * Maneja el CRUD de la tabla favorites con queries a PostgreSQL.
 * Devuelve los viajes favoritos con datos enriquecidos (JOIN).
 */

import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';

/**
 * Obtiene todos los favoritos de un usuario con datos completos del viaje.
 * @param {string} userId UUID del usuario
 */
export async function getFavoritesByUser(userId) {
  const result = await query(`
    SELECT
      f.id        AS favorite_id,
      f.created_at AS favorited_at,
      t.id,
      t.price,
      t.departure_time,
      t.arrival_time,
      t.duration_minutes,
      t.service_type,
      t.available_seats,
      t.total_seats,
      t.active,
      oc.name           AS origin_name,
      oc.province       AS origin_province,
      oc.terminal_name  AS origin_terminal,
      dc.name           AS dest_name,
      dc.province       AS dest_province,
      dc.terminal_name  AS dest_terminal,
      co.name           AS company_name,
      co.rating         AS company_rating,
      co.logo_url       AS company_logo,
      t.company_id,
      t.origin_city_id,
      t.destination_city_id
    FROM favorites f
    JOIN trips     t  ON f.trip_id = t.id
    JOIN cities    oc ON t.origin_city_id = oc.id
    JOIN cities    dc ON t.destination_city_id = dc.id
    JOIN companies co ON t.company_id = co.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
  `, [userId]);

  return result.rows.map(row => ({
    favoriteId: row.favorite_id,
    favoritedAt: row.favorited_at,
    id: row.id,
    price: row.price,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    durationMinutes: row.duration_minutes,
    serviceType: row.service_type,
    availableSeats: row.available_seats,
    totalSeats: row.total_seats,
    active: row.active,
    companyId: row.company_id,
    originCityId: row.origin_city_id,
    destinationCityId: row.destination_city_id,
    origin: {
      id: row.origin_city_id,
      name: row.origin_name,
      province: row.origin_province,
      terminalName: row.origin_terminal,
    },
    destination: {
      id: row.destination_city_id,
      name: row.dest_name,
      province: row.dest_province,
      terminalName: row.dest_terminal,
    },
    company: {
      id: row.company_id,
      name: row.company_name,
      rating: parseFloat(row.company_rating),
      logoUrl: row.company_logo,
    },
  }));
}

/**
 * Obtiene solo los IDs de los viajes favoritos de un usuario.
 * Útil para el contexto del frontend (carga inicial rápida).
 * @param {string} userId
 */
export async function getFavoriteIds(userId) {
  const result = await query(
    'SELECT trip_id FROM favorites WHERE user_id = $1',
    [userId]
  );
  return result.rows.map(row => row.trip_id);
}

/**
 * Agrega un viaje a los favoritos del usuario.
 * @param {string} userId
 * @param {number} tripId
 */
export async function addFavorite(userId, tripId) {
  // Verificar que el viaje existe
  const tripCheck = await query('SELECT id FROM trips WHERE id = $1 AND active = TRUE', [tripId]);
  if (tripCheck.rows.length === 0) {
    throw createError('Viaje no encontrado', 404);
  }

  // Insertar — la constraint UNIQUE maneja duplicados
  try {
    const result = await query(
      'INSERT INTO favorites (user_id, trip_id) VALUES ($1, $2) RETURNING id, created_at',
      [userId, tripId]
    );
    return { favoriteId: result.rows[0].id, createdAt: result.rows[0].created_at };
  } catch (err) {
    if (err.code === '23505') {
      // Ya es favorito — devolver éxito igualmente (idempotente)
      const existing = await query(
        'SELECT id, created_at FROM favorites WHERE user_id = $1 AND trip_id = $2',
        [userId, tripId]
      );
      return { favoriteId: existing.rows[0].id, createdAt: existing.rows[0].created_at };
    }
    throw err;
  }
}

/**
 * Elimina un viaje de los favoritos del usuario.
 * @param {string} userId
 * @param {number} tripId
 */
export async function removeFavorite(userId, tripId) {
  const result = await query(
    'DELETE FROM favorites WHERE user_id = $1 AND trip_id = $2 RETURNING id',
    [userId, tripId]
  );

  if (result.rows.length === 0) {
    throw createError('Favorito no encontrado', 404);
  }

  return { deleted: true };
}

/**
 * Verifica si un viaje es favorito de un usuario.
 * @param {string} userId
 * @param {number} tripId
 */
export async function isFavorite(userId, tripId) {
  const result = await query(
    'SELECT 1 FROM favorites WHERE user_id = $1 AND trip_id = $2',
    [userId, tripId]
  );
  return result.rows.length > 0;
}
