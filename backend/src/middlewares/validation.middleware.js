/**
 * Middleware de validación con express-validator
 *
 * Wrapper que ejecuta las validaciones y devuelve errores formateados.
 */

import { validationResult } from 'express-validator';

/**
 * Ejecuta un array de validaciones y, si hay errores, responde con 400.
 * Uso: router.post('/ruta', validate([ body('email').isEmail() ]), controller);
 */
export function validate(validations) {
  return async (req, res, next) => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Formatear errores para el frontend
    const formattedErrors = {};
    errors.array().forEach((err) => {
      if (err.path && !formattedErrors[err.path]) {
        formattedErrors[err.path] = err.msg;
      }
    });

    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: formattedErrors,
    });
  };
}
