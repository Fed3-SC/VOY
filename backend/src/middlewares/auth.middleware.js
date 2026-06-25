/**
 * Middleware de autenticación JWT
 *
 * Verifica el token Bearer del header Authorization.
 * Si el token es válido, inyecta req.user con los datos del usuario.
 */

import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

/**
 * Middleware obligatorio: rechaza la request si no hay token válido.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso denegado. Token no proporcionado.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Iniciá sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido.',
    });
  }
}

/**
 * Middleware opcional: si hay token válido, inyecta req.user, pero no rechaza.
 */
export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Token inválido — continuar sin usuario
    }
  }

  next();
}

/**
 * Middleware AdminGuard: solo permite el paso a usuarios con is_admin = true.
 * Debe usarse DESPUÉS de requireAuth.
 */
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }

  try {
    const result = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador.',
      });
    }
    
    // Actualizar req.user con el estado real
    req.user.is_admin = true;
    next();
  } catch (error) {
    next(error);
  }
}
