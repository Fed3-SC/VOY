/**
 * Middleware global de manejo de errores
 *
 * Captura todos los errores no manejados y devuelve respuestas JSON limpias.
 */

/**
 * Handler para rutas no encontradas (404).
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Handler centralizado de errores.
 * Captura errores lanzados en cualquier middleware/controlador.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('❌ Error:', err.message);

  // Errores de validación de express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: err.errors,
    });
  }

  // Errores de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // UNIQUE violation
        return res.status(409).json({
          success: false,
          error: 'El registro ya existe.',
        });
      case '23503': // FK violation
        return res.status(400).json({
          success: false,
          error: 'Referencia inválida a un registro inexistente.',
        });
      case '23514': // CHECK violation
        return res.status(400).json({
          success: false,
          error: 'Los datos no cumplen con las restricciones.',
        });
      default:
        break;
    }
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
