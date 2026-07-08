/**
 * Recommendations Service — Sistema de Recomendaciones Inteligente
 *
 * Algoritmo de scoring personalizado inspirado en TikTok / YouTube / Netflix.
 * Calcula un puntaje compuesto para cada viaje combinando 7 factores:
 *
 *  1. Favoritos del usuario      (factor más importante)
 *  2. Historial de reservas
 *  3. Popularidad global
 *  4. Disponibilidad de asientos
 *  5. Afinidad de precio
 *  6. Recencia temporal
 *  7. Diversidad controlada
 *
 * Los pesos están centralizados en WEIGHTS para ajuste rápido.
 * Si el usuario no tiene historial ni favoritos, se usa un algoritmo
 * de "cold start" basado en popularidad + disponibilidad + recencia.
 */

import { query } from '../config/database.js';

/* ═══════════════════════════════════════════════════════════════
 *  CONSTANTES DE CONFIGURACIÓN
 *  Modificar estos valores para ajustar el comportamiento
 *  del algoritmo sin tocar la lógica.
 * ═══════════════════════════════════════════════════════════════ */

const WEIGHTS = {
  // ── Factor 1: Favoritos (máx ~30 pts) ──
  FAV_EXACT_DESTINATION: 14,   // Destino exacto marcado como favorito
  FAV_SAME_PROVINCE:     6,   // Misma provincia que un favorito
  FAV_SAME_COMPANY:      5,   // Misma empresa que un favorito
  FAV_SAME_SERVICE:      3,   // Mismo tipo de servicio que un favorito
  FAV_SAME_ORIGIN:       2,   // Mismo origen que un favorito

  // ── Factor 2: Historial de reservas (máx ~20 pts) ──
  HIST_EXACT_DESTINATION: 8,  // Destino ya comprado
  HIST_SAME_PROVINCE:     4,  // Provincia ya visitada
  HIST_SAME_COMPANY:      4,  // Empresa ya utilizada
  HIST_SAME_SERVICE:      2,  // Mismo tipo de servicio comprado
  HIST_SAME_ORIGIN:       2,  // Mismo origen desde donde viajó

  // ── Factor 3: Popularidad (máx pts) ──
  POPULARITY_MAX:        15,

  // ── Factor 4: Disponibilidad (máx pts) ──
  AVAILABILITY_MAX:      10,
  AVAILABILITY_MIN_PCT:  0.1, // < 10% disponible → penalizar

  // ── Factor 5: Precio (máx pts) ──
  PRICE_MAX:             10,

  // ── Factor 6: Recencia (máx pts) ──
  RECENCY_MAX:            8,
  RECENCY_WINDOW_DAYS:   30,  // Ventana de 30 días para bonus de recencia

  // ── Factor 7: Diversidad / Aleatoriedad (máx pts) ──
  DIVERSITY_MAX:          5,
  DIVERSITY_CYCLE_MIN:   10,  // Minutos entre cambios del "seed" aleatorio

  // ── Cold Start (usuario sin historial) ──
  COLD_POPULARITY_MAX:   30,
  COLD_AVAILABILITY_MAX: 15,
  COLD_RECENCY_MAX:      15,
  COLD_DIVERSITY_MAX:    10,

  // ── Diversidad de resultados ──
  MAX_SAME_DESTINATION:   2,  // No repetir más de N viajes al mismo destino
};

// Ventana de recencia en milisegundos
const RECENCY_WINDOW_MS = WEIGHTS.RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/* ═══════════════════════════════════════════════════════════════
 *  FUNCIÓN PRINCIPAL
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Obtiene recomendaciones personalizadas para un usuario.
 * Si no hay userId o el usuario no tiene historial, aplica cold-start.
 *
 * @param {string|null} userId - UUID del usuario (null si no autenticado)
 * @param {number} limit - Cantidad de recomendaciones (6-10)
 * @returns {object[]} Viajes recomendados ordenados por score
 */
export async function getRecommendations(userId = null, limit = 10) {
  // ─── 1. Obtener viajes activos futuros con datos enriquecidos ───
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
    ORDER BY t.departure_time ASC
    LIMIT 200
  `, []);

  if (tripsResult.rows.length === 0) return [];

  // ─── 2. Obtener popularidad (una sola query) ───
  const popularityResult = await query(`
    SELECT trip_id, COUNT(*)::int AS booking_count
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY trip_id
  `, []);
  const popularityMap = new Map(popularityResult.rows.map(r => [r.trip_id, r.booking_count]));
  const maxPopularity = Math.max(1, ...popularityResult.rows.map(r => r.booking_count));

  // ─── 3. Obtener datos del usuario (si autenticado) ───
  const userProfile = userId ? await getUserProfile(userId) : null;
  const hasPersonalData = userProfile &&
    (userProfile.favorites.length > 0 || userProfile.bookings.length > 0);

  // ─── 4. Pre-computar conjuntos para O(1) lookups ───
  const userSets = hasPersonalData ? buildUserSets(userProfile) : null;

  // ─── 5. Calcular scores ───
  const now = Date.now();
  const maxSeats = Math.max(1, ...tripsResult.rows.map(r => r.total_seats));
  const diversitySeed = getDiversitySeed();

  const scoredTrips = tripsResult.rows.map((trip, index) => {
    const score = hasPersonalData
      ? calcPersonalizedScore(trip, userSets, userProfile, popularityMap, maxPopularity, maxSeats, now, diversitySeed, index)
      : calcColdStartScore(trip, popularityMap, maxPopularity, maxSeats, now, diversitySeed, index);

    return { ...trip, _score: score };
  });

  // ─── 6. Ordenar por score descendente ───
  scoredTrips.sort((a, b) => b._score - a._score);

  // ─── 7. Aplicar diversidad de destinos ───
  const diverse = applyDestinationDiversity(scoredTrips, limit);

  // ─── 8. Formatear y devolver ───
  return diverse.map(formatTrip);
}

/* ═══════════════════════════════════════════════════════════════
 *  CONSULTA DE PERFIL DEL USUARIO
 *  Una sola función que agrupa favoritos, bookings y residencia.
 * ═══════════════════════════════════════════════════════════════ */

async function getUserProfile(userId) {
  // Ejecutar las 3 queries en paralelo para minimizar latencia
  const [favResult, bookingsResult, userResult] = await Promise.all([
    query(`
      SELECT t.origin_city_id, t.destination_city_id, t.company_id,
             t.service_type, t.price,
             dc.province AS dest_province
      FROM favorites f
      JOIN trips t ON f.trip_id = t.id
      JOIN cities dc ON t.destination_city_id = dc.id
      WHERE f.user_id = $1
    `, [userId]),

    query(`
      SELECT t.origin_city_id, t.destination_city_id, t.company_id,
             t.service_type, t.price,
             dc.province AS dest_province
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      JOIN cities dc ON t.destination_city_id = dc.id
      WHERE b.user_id = $1 AND b.status = 'confirmed'
    `, [userId]),

    query(
      'SELECT residence_city_id FROM users WHERE id = $1',
      [userId]
    ),
  ]);

  const favorites = favResult.rows;
  const bookings = bookingsResult.rows;
  const residenceCityId = userResult.rows[0]?.residence_city_id || null;

  // Calcular precio promedio del usuario (de reservas reales, no solo favoritos)
  const purchasedPrices = bookings.map(b => parseFloat(b.price));
  const favPrices = favorites.map(f => parseFloat(f.price));
  const allPrices = [...purchasedPrices, ...favPrices];

  let avgPrice = null;
  let priceStdDev = null;

  if (allPrices.length > 0) {
    avgPrice = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;
    // Desviación estándar para saber cuán flexible es el usuario con precios
    const variance = allPrices.reduce((sum, p) => sum + (p - avgPrice) ** 2, 0) / allPrices.length;
    priceStdDev = Math.sqrt(variance) || avgPrice * 0.3; // Fallback: ±30%
  }

  return { favorites, bookings, residenceCityId, avgPrice, priceStdDev };
}

/* ═══════════════════════════════════════════════════════════════
 *  PRE-COMPUTAR SETS PARA SCORING O(1)
 * ═══════════════════════════════════════════════════════════════ */

function buildUserSets(profile) {
  const { favorites, bookings } = profile;

  return {
    // Favoritos
    favDestinations:  new Set(favorites.map(f => f.destination_city_id)),
    favOrigins:       new Set(favorites.map(f => f.origin_city_id)),
    favProvinces:     new Set(favorites.map(f => f.dest_province)),
    favCompanies:     new Set(favorites.map(f => f.company_id)),
    favServiceTypes:  new Set(favorites.map(f => f.service_type)),

    // Historial de reservas
    bookDestinations: new Set(bookings.map(b => b.destination_city_id)),
    bookOrigins:      new Set(bookings.map(b => b.origin_city_id)),
    bookProvinces:    new Set(bookings.map(b => b.dest_province)),
    bookCompanies:    new Set(bookings.map(b => b.company_id)),
    bookServiceTypes: new Set(bookings.map(b => b.service_type)),
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  CÁLCULO DE SCORE — USUARIO CON HISTORIAL
 * ═══════════════════════════════════════════════════════════════ */

function calcPersonalizedScore(trip, sets, profile, popularityMap, maxPop, maxSeats, now, seed, index) {
  let score = 0;

  // ── 1. FAVORITOS (máx ~30 pts) ──
  if (profile.favorites.length > 0) {
    if (sets.favDestinations.has(trip.destination_city_id)) score += WEIGHTS.FAV_EXACT_DESTINATION;
    if (sets.favProvinces.has(trip.dest_province))          score += WEIGHTS.FAV_SAME_PROVINCE;
    if (sets.favCompanies.has(trip.company_id))             score += WEIGHTS.FAV_SAME_COMPANY;
    if (sets.favServiceTypes.has(trip.service_type))        score += WEIGHTS.FAV_SAME_SERVICE;
    if (sets.favOrigins.has(trip.origin_city_id))           score += WEIGHTS.FAV_SAME_ORIGIN;
  }

  // ── 2. HISTORIAL DE RESERVAS (máx ~20 pts) ──
  if (profile.bookings.length > 0) {
    if (sets.bookDestinations.has(trip.destination_city_id)) score += WEIGHTS.HIST_EXACT_DESTINATION;
    if (sets.bookProvinces.has(trip.dest_province))          score += WEIGHTS.HIST_SAME_PROVINCE;
    if (sets.bookCompanies.has(trip.company_id))             score += WEIGHTS.HIST_SAME_COMPANY;
    if (sets.bookServiceTypes.has(trip.service_type))        score += WEIGHTS.HIST_SAME_SERVICE;
    if (sets.bookOrigins.has(trip.origin_city_id))           score += WEIGHTS.HIST_SAME_ORIGIN;
  }

  // ── 3. POPULARIDAD (máx POPULARITY_MAX pts) ──
  score += calcPopularityScore(trip.id, popularityMap, maxPop, WEIGHTS.POPULARITY_MAX);

  // ── 4. DISPONIBILIDAD (máx AVAILABILITY_MAX pts) ──
  score += calcAvailabilityScore(trip, maxSeats, WEIGHTS.AVAILABILITY_MAX);

  // ── 5. PRECIO (máx PRICE_MAX pts) ──
  score += calcPriceScore(trip.price, profile.avgPrice, profile.priceStdDev, WEIGHTS.PRICE_MAX);

  // ── 6. RECENCIA (máx RECENCY_MAX pts) ──
  score += calcRecencyScore(trip.departure_time, now, WEIGHTS.RECENCY_MAX);

  // ── 7. DIVERSIDAD (máx DIVERSITY_MAX pts) ──
  score += calcDiversityScore(seed, index, trip.id, WEIGHTS.DIVERSITY_MAX);

  return score;
}

/* ═══════════════════════════════════════════════════════════════
 *  CÁLCULO DE SCORE — COLD START (sin historial)
 *  Para usuarios nuevos o no autenticados.
 *  Se basa en señales generales: popularidad, disponibilidad,
 *  recencia y una dosis mayor de aleatoriedad.
 * ═══════════════════════════════════════════════════════════════ */

function calcColdStartScore(trip, popularityMap, maxPop, maxSeats, now, seed, index) {
  let score = 0;

  // Popularidad pesa más en cold start
  score += calcPopularityScore(trip.id, popularityMap, maxPop, WEIGHTS.COLD_POPULARITY_MAX);

  // Disponibilidad
  score += calcAvailabilityScore(trip, maxSeats, WEIGHTS.COLD_AVAILABILITY_MAX);

  // Recencia
  score += calcRecencyScore(trip.departure_time, now, WEIGHTS.COLD_RECENCY_MAX);

  // Mayor aleatoriedad para usuarios sin perfil → descubrimiento
  score += calcDiversityScore(seed, index, trip.id, WEIGHTS.COLD_DIVERSITY_MAX);

  return score;
}

/* ═══════════════════════════════════════════════════════════════
 *  FUNCIONES DE SCORING INDIVIDUALES
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Popularidad: más reservas confirmadas → mayor puntaje.
 * Escala logarítmica para evitar que un viaje "viral" aplaste a todos.
 */
function calcPopularityScore(tripId, popularityMap, maxPop, maxScore) {
  const count = popularityMap.get(tripId) || 0;
  if (count === 0) return 0;
  // log(1 + count) / log(1 + maxPop) → normaliza entre 0 y 1
  return (Math.log(1 + count) / Math.log(1 + maxPop)) * maxScore;
}

/**
 * Disponibilidad: viajes con buena disponibilidad reciben bonus.
 * Viajes casi completos (< AVAILABILITY_MIN_PCT) → penalización.
 */
function calcAvailabilityScore(trip, maxSeats, maxScore) {
  const pct = trip.available_seats / trip.total_seats;

  // Si está casi completo, no recomendar activamente
  if (pct < WEIGHTS.AVAILABILITY_MIN_PCT) return 0;

  // Curva suave: sqrt para no sobre-premiar viajes vacíos
  return Math.sqrt(pct) * maxScore;
}

/**
 * Precio: afinidad con el rango de precios habitual del usuario.
 * Usa desviación estándar para ser más preciso que una simple diferencia.
 */
function calcPriceScore(tripPrice, avgPrice, stdDev, maxScore) {
  if (avgPrice === null) return 0;

  const price = parseFloat(tripPrice);
  const diff = Math.abs(price - avgPrice);

  // Dentro de 1 stddev → score alto, fuera de 2 stddev → ~0
  const zScore = diff / (stdDev || avgPrice * 0.3);
  const affinity = Math.max(0, 1 - zScore / 2);

  return affinity * maxScore;
}

/**
 * Recencia: priorizar viajes próximos (dentro de la ventana configurada).
 * Viajes más cercanos en el tiempo reciben mayor puntaje.
 */
function calcRecencyScore(departureTime, now, maxScore) {
  const departureMs = new Date(departureTime).getTime();
  const timeFromNow = departureMs - now;

  if (timeFromNow <= 0 || timeFromNow > RECENCY_WINDOW_MS) return 0;

  // Más cercano → mayor score (decaimiento lineal)
  return (1 - timeFromNow / RECENCY_WINDOW_MS) * maxScore;
}

/**
 * Diversidad: variación controlada pseudo-aleatoria.
 * Usa un "seed" que cambia cada DIVERSITY_CYCLE_MIN minutos,
 * combinado con el ID del viaje para que el orden varíe periódicamente
 * sin cambiar en cada request (se siente "vivo" como TikTok/YouTube).
 */
function calcDiversityScore(seed, index, tripId, maxScore) {
  // Hash simple del tripId para distribución uniforme
  const hash = simpleHash(tripId.toString());
  // Combinar seed + hash + index para pseudo-aleatoriedad determinista
  const mixed = ((hash ^ seed) + index * 2654435761) >>> 0;
  // Normalizar a [0, 1]
  const normalized = (mixed % 10000) / 10000;
  return normalized * maxScore;
}

/**
 * Genera un seed que cambia cada N minutos.
 * Así las recomendaciones varían periódicamente pero no en cada refresh.
 */
function getDiversitySeed() {
  const cycleMs = WEIGHTS.DIVERSITY_CYCLE_MIN * 60 * 1000;
  return Math.floor(Date.now() / cycleMs);
}

/**
 * Hash simple (FNV-1a) para strings.
 */
function simpleHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/* ═══════════════════════════════════════════════════════════════
 *  DIVERSIDAD DE RESULTADOS
 *  No repetir más de N viajes al mismo destino.
 * ═══════════════════════════════════════════════════════════════ */

function applyDestinationDiversity(sortedTrips, limit) {
  const seen = new Map();
  const diverse = [];

  for (const trip of sortedTrips) {
    const destCount = seen.get(trip.destination_city_id) || 0;
    if (destCount < WEIGHTS.MAX_SAME_DESTINATION) {
      diverse.push(trip);
      seen.set(trip.destination_city_id, destCount + 1);
      if (diverse.length >= limit) break;
    }
  }

  // Si no alcanzamos el límite, rellenar con el resto
  if (diverse.length < limit) {
    for (const trip of sortedTrips) {
      if (!diverse.includes(trip)) {
        diverse.push(trip);
        if (diverse.length >= limit) break;
      }
    }
  }

  return diverse;
}

/* ═══════════════════════════════════════════════════════════════
 *  FORMATEADOR DE RESULTADOS
 * ═══════════════════════════════════════════════════════════════ */

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
