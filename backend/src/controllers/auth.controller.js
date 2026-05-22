/**
 * Auth Controller — Endpoints de autenticación
 */

import * as authService from '../services/auth.service.js';

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, lastName, email, phone, dni, password } = req.body;
    const result = await authService.register({ name, lastName, email, phone, dni, password });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
