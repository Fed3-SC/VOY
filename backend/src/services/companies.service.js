/**
 * Companies Service — Lógica de negocio de empresas
 */

import { query } from '../config/database.js';

/**
 * Lista todas las empresas activas.
 */
export async function getAll() {
  const result = await query(
    `SELECT id, name, rating, logo_url, active
     FROM companies
     WHERE active = TRUE
     ORDER BY name ASC`,
    []
  );

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    rating: parseFloat(row.rating),
    logoUrl: row.logo_url,
  }));
}
