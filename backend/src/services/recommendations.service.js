/**
 * Recommendations Service — Sistema de Recomendaciones Inteligente
 *
 * Algoritmo de scoring personalizado inspirado en plataformas modernas.
 * Calcula un puntaje para cada viaje basado en múltiples factores:
 *
 *  - Favoritos del usuario (+25 pts máx)
 *  - Historial de reservas (+20 pts máx)
 *  - Ciudad de residencia (+15 pts máx)
 *  - Popularidad global (+15 pts máx)
 *  - Disponibilidad de asientos (+10 pts máx)
 *  - Precio similar al habitual (+10 pts máx)
 *  - Recencia / proximidad temporal (+5 pts máx)
 *  - Diversidad / aleatoriedad controlada (0-5 pts)
 *
 * Total máximo teórico: ~105 pts
 */

import { query } from '../config/database.js';

/**
 * Obtiene recomendaciones personalizadas para un usuario.
 * Si no hay userId, devuelve recomendaciones generales.
 *
 * @param {string|null} userId - UUID del usuario (null si no autenticado)
 * @param {number} limit - Cantidad de recomendaciones (6-10)
 * @returns {object[]} Viajes recomendados ordenados por score
 */
export async function getRecommendations(userId = null, limit = 10) {
  // 1. Obtener todos los viajes activos futuros con datos enriquecidos
  const tripsResult = await query(`
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
      AND t.departure_time >= NOW()
    ORDER BY t.departure_time ASC
    LIMIT 200
  `, []);

  if (tripsResult.rows.length === 0) return [];

  // 2. Obtener datos de popularidad (conteo de reservas por viaje)
  const popularityResult = await query(`
    SELECT trip_id, COUNT(*)::int AS booking_count
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY trip_id
  `, []);
  const popularityMap = new Map(popularityResult.rows.map(r => [r.trip_id, r.booking_count]));
  const maxPopularity = Math.max(1, ...popularityResult.rows.map(r => r.booking_count));

  // 3. Obtener datos del usuario (si está autenticado)
  let userFavorites = [];
  let userBookings = [];
  let userResidenceCityId = null;
  let userAvgPrice = null;

  if (userId) {
    // Favoritos del usuario
    const favResult = await query(`
      SELECT t.destination_city_id, t.company_id, t.service_type, t.price,
             dc.province AS dest_province
      FROM favorites f
      JOIN trips t ON f.trip_id = t.id
      JOIN cities dc ON t.destination_city_id = dc.id
      WHERE f.user_id = $1
    `, [userId]);
    userFavorites = favResult.rows;

    // Historial de reservas
    const bookingsResult = await query(`
      SELECT t.destination_city_id, t.company_id, t.service_type, t.price,
             dc.province AS dest_province
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      JOIN cities dc ON t.destination_city_id = dc.id
      WHERE b.user_id = $1 AND b.status = 'confirmed'
    `, [userId]);
    userBookings = bookingsResult.rows;

    // Ciudad de residencia
    const userResult = await query(
      'SELECT residence_city_id FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length > 0) {
      userResidenceCityId = userResult.rows[0].residence_city_id;
    }

    // Precio promedio del usuario (favoritos + reservas)
    const allUserPrices = [...userFavorites, ...userBookings].map(r => r.price);
    if (allUserPrices.length > 0) {
      userAvgPrice = allUserPrices.reduce((a, b) => a + b, 0) / allUserPrices.length;
    }
  }

  // 4. Extraer conjuntos de datos del usuario para scoring rápido
  const favDestinations = new Set(userFavorites.map(f => f.destination_city_id));
  const favProvinces = new Set(userFavorites.map(f => f.dest_province));
  const favCompanies = new Set(userFavorites.map(f => f.company_id));
  const favServiceTypes = new Set(userFavorites.map(f => f.service_type));

  const bookingDestinations = new Set(userBookings.map(b => b.destination_city_id));
  const bookingProvinces = new Set(userBookings.map(b => b.dest_province));

  // 5. Calcular score para cada viaje
  const now = Date.now();
  const maxAvailableSeats = Math.max(1, ...tripsResult.rows.map(r => r.available_seats));
  // Ventana de tiempo: 30 días en ms
  const timeWindow = 30 * 24 * 60 * 60 * 1000;

  const scoredTrips = tripsResult.rows.map(trip => {
    let score = 0;

    // ── FAVORITOS (+25 máx) ──
    if (userFavorites.length > 0) {
      if (favDestinations.has(trip.destination_city_id)) score += 12;
      if (favProvinces.has(trip.dest_province)) score += 6;
      if (favCompanies.has(trip.company_id)) score += 4;
      if (favServiceTypes.has(trip.service_type)) score += 3;
    }

    // ── HISTORIAL (+20 máx) ──
    if (userBookings.length > 0) {
      if (bookingDestinations.has(trip.destination_city_id)) score += 12;
      if (bookingProvinces.has(trip.dest_province)) score += 8;
    }

    // ── RESIDENCIA (+15 máx) ──
    if (userResidenceCityId && trip.origin_city_id === userResidenceCityId) {
      score += 15;
    }

    // ── POPULARIDAD (+15 máx) ──
    const bookingCount = popularityMap.get(trip.id) || 0;
    score += (bookingCount / maxPopularity) * 15;

    // ── DISPONIBILIDAD (+10 máx) ──
    score += (trip.available_seats / maxAvailableSeats) * 10;

    // ── PRECIO SIMILAR (+10 máx) ──
    if (userAvgPrice !== null) {
      const priceDiff = Math.abs(trip.price - userAvgPrice);
      const priceRatio = 1 - Math.min(priceDiff / userAvgPrice, 1);
      score += priceRatio * 10;
    }

    // ── RECENCIA (+5 máx) ──
    const departureMs = new Date(trip.departure_time).getTime();
    const timeFromNow = departureMs - now;
    if (timeFromNow > 0 && timeFromNow <= timeWindow) {
      score += (1 - timeFromNow / timeWindow) * 5;
    }

    // ── DIVERSIDAD (0-5 pts aleatorios) ──
    score += Math.random() * 5;

    return { ...trip, _score: score };
  });

  // 6. Ordenar por score descendente
  scoredTrips.sort((a, b) => b._score - a._score);

  // 7. Aplicar diversidad de destinos: no repetir más de 2 veces el mismo destino
  const seen = new Map();
  const diverse = [];
  for (const trip of scoredTrips) {
    const destCount = seen.get(trip.destination_city_id) || 0;
    if (destCount < 2) {
      diverse.push(trip);
      seen.set(trip.destination_city_id, destCount + 1);
      if (diverse.length >= limit) break;
    }
  }

  // Si no alcanzamos el límite, rellenar con lo que quede
  if (diverse.length < limit) {
    for (const trip of scoredTrips) {
      if (!diverse.includes(trip)) {
        diverse.push(trip);
        if (diverse.length >= limit) break;
      }
    }
  }

  // 8. Formatear resultado
  return diverse.map(formatTrip);
}

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
