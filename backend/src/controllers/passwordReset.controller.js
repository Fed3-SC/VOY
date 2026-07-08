/**
 * Password Reset Controller — Endpoints de recuperación de contraseña
 */

import * as passwordResetService from '../services/passwordReset.service.js';

// Mensaje genérico anti-enumeración
const GENERIC_MESSAGE =
  'Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.';

/**
 * POST /api/auth/forgot-password
 * Solicita un email de recuperación de contraseña.
 * Siempre devuelve el mismo mensaje (anti-enumeración de usuarios).
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    // Ejecutar en background (no bloquear la respuesta)
    passwordResetService.requestPasswordReset(email).catch((err) => {
      console.error('Error en requestPasswordReset:', err.message);
    });

    // Responder inmediatamente con mensaje genérico
    res.json({
      success: true,
      data: { message: GENERIC_MESSAGE },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/validate-reset-token
 * Valida si un token de reset es válido (sin consumirlo).
 */
export async function validateResetToken(req, res, next) {
  try {
    const { token } = req.body;
    const result = await passwordResetService.validateResetToken(token);

    res.json({
      success: true,
      data: { valid: result.valid },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Restablece la contraseña usando un token válido.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const result = await passwordResetService.resetPassword(token, password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: { message: 'Tu contraseña fue restablecida correctamente.' },
    });
  } catch (err) {
    next(err);
  }
}
