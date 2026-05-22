/**
 * Cities Controller — Endpoints de ciudades
 */

import { query } from '../config/database.js';

/**
 * GET /api/cities
 */
export async function getAll(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, province, terminal_name AS "terminalName", active FROM cities WHERE active = TRUE ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}
