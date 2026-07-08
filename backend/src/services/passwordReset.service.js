/**
 * Password Reset Service — Lógica de recuperación de contraseña
 *
 * Flujo seguro:
 *  1. Usuario solicita reset → se genera token crypto, se almacena SHA-256
 *  2. Se envía email con link que contiene el token en texto plano
 *  3. Usuario hace clic → frontend envía token al backend
 *  4. Backend hashea el token recibido, lo busca en DB, valida expiración
 *  5. Si válido → actualiza contraseña y marca token como usado
 *
 * Seguridad:
 *  - Token: crypto.randomBytes(32) → 256 bits de entropía
 *  - Almacenamiento: SHA-256 del token (nunca plaintext en DB)
 *  - Vencimiento: 1 hora
 *  - Anti-enumeración: misma respuesta si email existe o no
 *  - Uso único: token marcado used=true tras uso exitoso
 *  - Limpieza: tokens previos invalidados al solicitar nuevo
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { sendPasswordResetEmail } from './email.service.js';

const TOKEN_EXPIRY_HOURS = 1;
const SALT_ROUNDS = 10;

/**
 * Hashea un token con SHA-256 para almacenamiento seguro.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Solicita un restablecimiento de contraseña.
 * Siempre retorna el mismo mensaje, exista o no el email (anti-enumeración).
 *
 * @param {string} email - Email del usuario
 */
export async function requestPasswordReset(email) {
  // Buscar usuario por email
  const userResult = await query(
    'SELECT id, email FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  // Si no existe el usuario, retornar silenciosamente (anti-enumeración)
  if (userResult.rows.length === 0) {
    return;
  }

  const user = userResult.rows[0];

  // Invalidar tokens previos de este usuario
  await query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [user.id]
  );

  // Generar token criptográficamente seguro
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);

  // Calcular expiración
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Almacenar hash del token en DB
  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  // Construir URL de reset
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/restablecer?token=${token}`;

  // Enviar email (o imprimir en consola en dev)
  await sendPasswordResetEmail(user.email, resetUrl);
}

/**
 * Valida un token de reset sin consumirlo.
 * Útil para verificar antes de mostrar el formulario.
 *
 * @param {string} token - Token en texto plano (de la URL)
 * @returns {{ valid: boolean, userId?: string }}
 */
export async function validateResetToken(token) {
  const tokenHash = hashToken(token);

  const result = await query(
    `SELECT user_id FROM password_reset_tokens
     WHERE token_hash = $1
       AND used = FALSE
       AND expires_at > NOW()`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return { valid: false };
  }

  return { valid: true, userId: result.rows[0].user_id };
}

/**
 * Restablece la contraseña del usuario usando un token válido.
 *
 * @param {string} token - Token en texto plano (de la URL)
 * @param {string} newPassword - Nueva contraseña
 * @returns {{ success: boolean, error?: string }}
 */
export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);

  // Buscar token válido
  const tokenResult = await query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1
       AND used = FALSE
       AND expires_at > NOW()`,
    [tokenHash]
  );

  if (tokenResult.rows.length === 0) {
    return {
      success: false,
      error: 'El enlace de restablecimiento es inválido o ya expiró. Solicitá uno nuevo.',
    };
  }

  const { id: tokenId, user_id: userId } = tokenResult.rows[0];

  // Hashear nueva contraseña con bcrypt
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Actualizar contraseña del usuario
  await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );

  // Marcar este token como usado
  await query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
    [tokenId]
  );

  // Invalidar todos los demás tokens del usuario (seguridad extra)
  await query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [userId]
  );

  return { success: true };
}
