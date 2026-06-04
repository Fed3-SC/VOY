/**
 * Features Controller — CRUD de características de viajes
 */

import * as featuresService from '../services/features.service.js';

/**
 * GET /api/features
 */
export async function getAll(req, res, next) {
  try {
    const features = await featuresService.getAll();
    res.json({ success: true, data: features });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/features
 */
export async function create(req, res, next) {
  try {
    const { name, icon } = req.body;
    const feature = await featuresService.create({ name, icon });
    res.status(201).json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/features/:id
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const feature = await featuresService.update(parseInt(id), { name, icon });
    res.json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/features/:id
 */
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await featuresService.remove(parseInt(id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
