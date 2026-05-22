/**
 * Bookings Service — Lógica de negocio de reservas
 *
 * Usa transacciones para asegurar atomicidad al crear reservas
 * y descontar asientos disponibles.
 */

import { query, getClient } from '../config/database.js';
import { generateBookingCode, createError } from '../utils/helpers.js';

/**
 * Formatea una reserva cruda de la BD al formato del frontend.
 */
function formatBooking(row) {
  const booking = {
    id: row.id,
    bookingCode: row.booking_code,
    userId: row.user_id,
    tripId: row.trip_id,
    passengers: row.passengers,
    totalPrice: row.total_price,
    status: row.status,
    passengerName: row.passenger_name,
    passengerEmail: row.passenger_email,
    passengerDni: row.passenger_dni,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };

  // Si vienen datos del viaje (JOIN), incluirlos
  if (row.departure_time) {
    booking.trip = {
      id: row.trip_id,
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      durationMinutes: row.duration_minutes,
      serviceType: row.service_type,
      price: row.trip_price,
      availableSeats: row.available_seats,
      origin: row.origin_name ? {
        id: row.origin_city_id,
        name: row.origin_name,
        province: row.origin_province,
        terminalName: row.origin_terminal,
      } : null,
      destination: row.dest_name ? {
        id: row.destination_city_id,
        name: row.dest_name,
        province: row.dest_province,
        terminalName: row.dest_terminal,
      } : null,
      company: row.company_name ? {
        id: row.company_id,
        name: row.company_name,
        rating: parseFloat(row.company_rating),
      } : null,
    };
  }

  return booking;
}

/**
 * Query base con JOINs para obtener bookings enriquecidos.
 */
const BOOKING_SELECT = `
  SELECT
    b.*,
    t.departure_time, t.arrival_time, t.duration_minutes, t.service_type,
    t.price AS trip_price, t.available_seats,
    t.origin_city_id, t.destination_city_id, t.company_id,
    oc.name AS origin_name, oc.province AS origin_province, oc.terminal_name AS origin_terminal,
    dc.name AS dest_name,   dc.province AS dest_province,   dc.terminal_name AS dest_terminal,
    co.name AS company_name, co.rating AS company_rating
  FROM bookings b
  JOIN trips t      ON b.trip_id = t.id
  JOIN cities oc    ON t.origin_city_id = oc.id
  JOIN cities dc    ON t.destination_city_id = dc.id
  JOIN companies co ON t.company_id = co.id
`;

/**
 * Crea una nueva reserva con transacción (atomicidad).
 * Descuenta asientos disponibles y crea el registro de pago.
 */
export async function create({ userId, tripId, passengers, totalPrice, passengerName, passengerEmail, passengerDni, paymentMethod }) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Verificar asientos disponibles (con lock)
    const tripResult = await client.query(
      'SELECT available_seats, price FROM trips WHERE id = $1 FOR UPDATE',
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      throw createError('Viaje no encontrado', 404);
    }

    const trip = tripResult.rows[0];

    if (trip.available_seats < passengers) {
      throw createError(
        `No hay suficientes asientos. Disponibles: ${trip.available_seats}`,
        400
      );
    }

    // Generar código de reserva único
    let bookingCode = generateBookingCode();

    // Verificar que no exista (muy improbable, pero seguro)
    const codeCheck = await client.query(
      'SELECT id FROM bookings WHERE booking_code = $1',
      [bookingCode]
    );
    if (codeCheck.rows.length > 0) {
      bookingCode = generateBookingCode(); // Segundo intento
    }

    // Crear reserva
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, trip_id, booking_code, passengers, total_price, status, passenger_name, passenger_email, passenger_dni, payment_method)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7, $8, $9)
       RETURNING *`,
      [userId, tripId, bookingCode, passengers, totalPrice, passengerName, passengerEmail, passengerDni, paymentMethod]
    );

    // Descontar asientos
    await client.query(
      'UPDATE trips SET available_seats = available_seats - $1 WHERE id = $2',
      [passengers, tripId]
    );

    // Crear registro de pago (simulado como aprobado)
    await client.query(
      `INSERT INTO payments (booking_id, method, status, amount)
       VALUES ($1, $2, 'approved', $3)`,
      [bookingResult.rows[0].id, paymentMethod, totalPrice]
    );

    await client.query('COMMIT');

    // Retornar booking completo con datos del viaje
    const fullBooking = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [bookingResult.rows[0].id]);
    return formatBooking(fullBooking.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Obtiene todas las reservas de un usuario.
 */
export async function getByUserId(userId) {
  const result = await query(
    `${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows.map(formatBooking);
}

/**
 * Obtiene una reserva por su ID (verificando que sea del usuario).
 */
export async function getById(bookingId, userId) {
  const result = await query(
    `${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`,
    [bookingId, userId]
  );

  if (result.rows.length === 0) {
    throw createError('Reserva no encontrada', 404);
  }

  return formatBooking(result.rows[0]);
}
