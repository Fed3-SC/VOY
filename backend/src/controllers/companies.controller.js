/**
 * Companies Controller — Endpoints de empresas
 */

import * as companiesService from '../services/companies.service.js';

/**
 * GET /api/companies
 */
export async function getAll(req, res, next) {
  try {
    const companies = await companiesService.getAll();
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
}
