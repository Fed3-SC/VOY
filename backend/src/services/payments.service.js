/**
 * Payments Service — Lógica de negocio de pagos
 *
 * Estructura inicial para gestión de pagos.
 * Los pagos se crean automáticamente con las reservas.
 */

import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';

/**
 * Obtiene el pago asociado a una reserva.
 * @param {string} bookingId - UUID de la reserva
 * @param {string} userId - UUID del usuario (para verificar propiedad)
 */
export async function getByBookingId(bookingId, userId) {
  const result = await query(
    `SELECT p.*
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     WHERE p.booking_id = $1 AND b.user_id = $2`,
    [bookingId, userId]
  );

  if (result.rows.length === 0) {
    throw createError('Pago no encontrado', 404);
  }

  const row = result.rows[0];
  return {
    id: row.id,
    bookingId: row.booking_id,
    method: row.method,
    status: row.status,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

/**
 * Actualiza el estado de un pago (simulación).
 * @param {string} paymentId - UUID del pago
 * @param {string} status - Nuevo estado: 'pending', 'approved', 'rejected'
 * @param {string} userId - UUID del usuario (para verificar propiedad)
 */
export async function updateStatus(paymentId, status, userId) {
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw createError('Estado de pago inválido', 400);
  }

  // Verificar propiedad
  const check = await query(
    `SELECT p.id
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     WHERE p.id = $1 AND b.user_id = $2`,
    [paymentId, userId]
  );

  if (check.rows.length === 0) {
    throw createError('Pago no encontrado', 404);
  }

  const result = await query(
    `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
    [status, paymentId]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    bookingId: row.booking_id,
    method: row.method,
    status: row.status,
    amount: row.amount,
    createdAt: row.created_at,
  };
}
