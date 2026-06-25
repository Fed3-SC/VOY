/**
 * Trips Service — Lógica de negocio de viajes
 *
 * Queries con JOINs a cities y companies para devolver datos enriquecidos.
 * Incluye CRUD para administración y endpoint de viajes featured aleatorios.
 */

import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';
import { getFeaturesForTrip, setFeaturesForTrip } from './features.service.js';

/**
 * Formatea un viaje crudo de la BD al formato que espera el frontend.
 */
function formatTrip(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    originCityId: row.origin_city_id,
    destinationCityId: row.destination_city_id,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    durationMinutes: row.duration_minutes,
    serviceType: row.service_type,
    price: row.price,
    totalSeats: row.total_seats,
    availableSeats: row.available_seats,
    active: row.active,
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
  };
}

/**
 * Base SELECT con JOINs para obtener viajes enriquecidos.
 */
const BASE_SELECT = `
  SELECT
    t.*,
    oc.name AS origin_name, oc.province AS origin_province, oc.terminal_name AS origin_terminal,
    dc.name AS dest_name,   dc.province AS dest_province,   dc.terminal_name AS dest_terminal,
    co.name AS company_name, co.rating AS company_rating, co.logo_url AS company_logo
  FROM trips t
  JOIN cities oc    ON t.origin_city_id = oc.id
  JOIN cities dc    ON t.destination_city_id = dc.id
  JOIN companies co ON t.company_id = co.id
`;

/**
 * Busca viajes por ruta y opcionalmente por fecha.
 * @param {{ origin, destination, date, passengers }} params
 * @returns {object[]} Viajes enriquecidos
 */
export async function search({ origin, destination, date, passengers = 1 }) {
  let sql = `${BASE_SELECT} WHERE t.active = TRUE AND t.origin_city_id = $1 AND t.destination_city_id = $2`;
  const params = [origin, destination];

  if (date) {
    sql += ` AND DATE(t.departure_time) = $3`;
    params.push(date);
  }

  // Solo viajes con suficientes asientos
  if (passengers > 1) {
    sql += ` AND t.available_seats >= $${params.length + 1}`;
    params.push(passengers);
  }

  sql += ` ORDER BY t.departure_time ASC`;

  const result = await query(sql, params);
  const trips = result.rows.map(formatTrip);
  // Cargar features para cada viaje en paralelo
  await Promise.all(trips.map(async (trip) => {
    trip.features = await getFeaturesForTrip(trip.id);
  }));
  return trips;
}

/**
 * Obtiene un viaje por su ID con datos enriquecidos.
 * @param {number} id
 * @returns {object} Viaje enriquecido
 */
export async function getById(id) {
  const result = await query(`${BASE_SELECT} WHERE t.id = $1`, [id]);

  if (result.rows.length === 0) {
    throw createError('Viaje no encontrado', 404);
  }

  const trip = formatTrip(result.rows[0]);
  trip.features = await getFeaturesForTrip(id);
  return trip;
}

/**
 * Lista todos los viajes activos (con paginación básica).
 * @param {number} limit
 * @param {number} offset
 * @returns {object[]}
 */
export async function getAll(limit = 50, offset = 0) {
  const result = await query(
    `${BASE_SELECT} WHERE t.active = TRUE ORDER BY t.departure_time ASC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const trips = result.rows.map(formatTrip);
  // Cargar features para cada viaje en paralelo
  await Promise.all(trips.map(async (trip) => {
    trip.features = await getFeaturesForTrip(trip.id);
  }));
  return trips;
}

/**
 * Obtiene el conteo total de viajes activos (para paginación).
 */
export async function getCount() {
  const result = await query('SELECT COUNT(*)::int AS count FROM trips WHERE active = TRUE', []);
  return result.rows[0].count;
}

/**
 * Obtiene ofertas calculadas dinámicamente.
 * Selecciona las 3 rutas más baratas desde Buenos Aires (id=1) para hoy.
 */
export async function getOffers() {
  const result = await query(`
    SELECT DISTINCT ON (t.destination_city_id)
      t.destination_city_id,
      dc.name AS dest_name,
      MIN(t.price) AS min_price,
      t.origin_city_id
    FROM trips t
    JOIN cities dc ON t.destination_city_id = dc.id
    WHERE t.active = TRUE
      AND t.origin_city_id = 1
      AND t.departure_time >= NOW()
    GROUP BY t.destination_city_id, dc.name, t.origin_city_id
    ORDER BY t.destination_city_id, min_price ASC
  `, []);

  // Mapeo de destinos a image keys e info de ofertas
  const offerMap = {
    2: { imageQuery: 'mar-del-plata', discount: 27 },
    3: { imageQuery: 'cordoba',       discount: 24 },
    6: { imageQuery: 'bariloche',     discount: 23 },
  };

  return result.rows
    .filter(row => offerMap[row.destination_city_id])
    .map(row => {
      const info = offerMap[row.destination_city_id];
      const price = row.min_price;
      const originalPrice = Math.round(price / (1 - info.discount / 100));
      return {
        id: row.destination_city_id,
        title: row.dest_name,
        subtitle: 'Desde Buenos Aires',
        price,
        originalPrice,
        discount: info.discount,
        imageQuery: info.imageQuery,
        originId: 1,
        destinationId: row.destination_city_id,
      };
    });
}

/**
 * Obtiene destinos populares con conteo de viajes para hoy.
 */
export async function getPopularDestinations() {
  const result = await query(`
    SELECT
      dc.id AS city_id,
      dc.name,
      COUNT(t.id) AS trips_count
    FROM trips t
    JOIN cities dc ON t.destination_city_id = dc.id
    WHERE t.active = TRUE
      AND t.origin_city_id = 1
      AND DATE(t.departure_time) = CURRENT_DATE
    GROUP BY dc.id, dc.name
    ORDER BY trips_count DESC
    LIMIT 8
  `, []);

  // Mapeo de cityId a imageKey
  const imageKeys = {
    2: 'mar-del-plata',
    3: 'cordoba',
    4: 'mendoza',
    5: 'rosario',
    6: 'bariloche',
    7: 'salta',
    8: 'neuquen',
    9: 'tucuman',
    10: 'santiago',
  };

  return result.rows.map((row, idx) => ({
    id: idx + 1,
    cityId: row.city_id,
    name: row.name,
    imageKey: imageKeys[row.city_id] || null,
    tripsCount: parseInt(row.trips_count),
  }));
}

export async function getFeatured(count = 10) {
  const result = await query(`
    SELECT
      t.*,
      oc.name AS origin_name, oc.province AS origin_province, oc.terminal_name AS origin_terminal,
      dc.name AS dest_name,   dc.province AS dest_province,   dc.terminal_name AS dest_terminal,
      co.name AS company_name, co.rating AS company_rating, co.logo_url AS company_logo
    FROM trips t
    JOIN cities oc    ON t.origin_city_id = oc.id
    JOIN cities dc    ON t.destination_city_id = dc.id
    JOIN companies co ON t.company_id = co.id
    WHERE t.active = TRUE
      AND t.available_seats > 0
    ORDER BY RANDOM()
    LIMIT $1
  `, [count]);

  const trips = result.rows.map(formatTrip);
  // Cargar features para cada viaje en paralelo
  await Promise.all(trips.map(async (trip) => {
    trip.features = await getFeaturesForTrip(trip.id);
  }));
  return trips;
}

/* ──────────────── CRUD ADMIN ──────────────── */

/**
 * Crea un nuevo viaje.
 */
export async function create(data) {
  const {
    companyId, originCityId, destinationCityId,
    departureTime, arrivalTime, durationMinutes,
    serviceType, price, totalSeats, availableSeats,
    featureIds = [],
  } = data;

  if (originCityId === destinationCityId) {
    throw createError('El origen y destino no pueden ser iguales', 400);
  }

  const result = await query(`
    INSERT INTO trips (
      company_id, origin_city_id, destination_city_id,
      departure_time, arrival_time, duration_minutes,
      service_type, price, total_seats, available_seats, active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
    RETURNING id
  `, [
    companyId, originCityId, destinationCityId,
    departureTime, arrivalTime, durationMinutes,
    serviceType, price, totalSeats, availableSeats ?? totalSeats,
  ]);

  const tripId = result.rows[0].id;

  // Asociar features si se proporcionaron
  if (featureIds.length > 0) {
    await setFeaturesForTrip(tripId, featureIds);
  }

  return getById(tripId);
}

/**
 * Actualiza un viaje existente (update parcial).
 */
export async function update(id, data) {
  // Verificar que existe
  await getById(id);

  const { featureIds, ...tripData } = data;

  const fields = [];
  const values = [];
  let paramIndex = 1;

  const fieldMap = {
    companyId: 'company_id',
    originCityId: 'origin_city_id',
    destinationCityId: 'destination_city_id',
    departureTime: 'departure_time',
    arrivalTime: 'arrival_time',
    durationMinutes: 'duration_minutes',
    serviceType: 'service_type',
    price: 'price',
    totalSeats: 'total_seats',
    availableSeats: 'available_seats',
  };

  for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
    if (tripData[jsKey] !== undefined) {
      fields.push(`${dbCol} = $${paramIndex}`);
      values.push(tripData[jsKey]);
      paramIndex++;
    }
  }

  if (fields.length > 0) {
    values.push(id);
    await query(
      `UPDATE trips SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  // Actualizar features si se proporcionaron
  if (featureIds !== undefined) {
    await setFeaturesForTrip(id, featureIds);
  }

  return getById(id);
}

/**
 * Elimina un viaje (soft delete — active = FALSE).
 */
export async function remove(id) {
  // Verificar que existe
  await getById(id);

  await query('UPDATE trips SET active = FALSE WHERE id = $1', [id]);
  return { deleted: true };
}
