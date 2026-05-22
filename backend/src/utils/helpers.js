/**
 * Utilidades generales del backend
 */

import crypto from 'crypto';

/**
 * Genera un código de reserva único estilo VOY-XXXXXX.
 * @returns {string} Código alfanumérico en mayúsculas.
 */
export function generateBookingCode() {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
  return `VOY-${random}`;
}

/**
 * Crea un error con código de estado HTTP.
 * @param {string} message - Mensaje de error.
 * @param {number} statusCode - Código HTTP (400, 401, 404, etc.).
 * @returns {Error}
 */
export function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
