/**
 * Middleware de autenticación JWT
 *
 * Verifica el token Bearer del header Authorization.
 * Si el token es válido, inyecta req.user con los datos del usuario.
 */

import jwt from 'jsonwebtoken';

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
