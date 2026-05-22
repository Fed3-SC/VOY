/**
 * Auth Service — Lógica de negocio de autenticación
 *
 * Maneja registro, login y consulta de usuarios con bcrypt y JWT.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { createError } from '../utils/helpers.js';

const SALT_ROUNDS = 10;

/**
 * Genera un JWT para el usuario.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Elimina campos sensibles del objeto usuario.
 */
function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return {
    id: safe.id,
    name: safe.name,
    lastName: safe.last_name,
    email: safe.email,
    phone: safe.phone,
    dni: safe.dni,
    createdAt: safe.created_at,
  };
}

/**
 * Registra un nuevo usuario.
 * @param {{ name, lastName, email, phone, dni, password }} data
 * @returns {{ user, token }}
 */
export async function register({ name, lastName, email, phone, dni, password }) {
  // Verificar email duplicado
  const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    throw createError('El email ya está registrado', 409);
  }

  // Verificar DNI duplicado
  const dniCheck = await query('SELECT id FROM users WHERE dni = $1', [dni]);
  if (dniCheck.rows.length > 0) {
    throw createError('El DNI ya está registrado', 409);
  }

  // Hashear contraseña
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insertar usuario
  const result = await query(
    `INSERT INTO users (name, last_name, email, phone, dni, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, lastName, email, phone, dni, passwordHash]
  );

  const user = sanitizeUser(result.rows[0]);
  const token = generateToken(result.rows[0]);

  return { user, token };
}

/**
 * Autentica un usuario con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {{ user, token }}
 */
export async function login(email, password) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    throw createError('Credenciales inválidas', 401);
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  const sanitized = sanitizeUser(user);
  const token = generateToken(user);

  return { user: sanitized, token };
}

/**
 * Obtiene un usuario por su ID (para /me).
 * @param {string} userId - UUID del usuario
 * @returns {object} Usuario sanitizado
 */
export async function getUserById(userId) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

  if (result.rows.length === 0) {
    throw createError('Usuario no encontrado', 404);
  }

  return sanitizeUser(result.rows[0]);
}
