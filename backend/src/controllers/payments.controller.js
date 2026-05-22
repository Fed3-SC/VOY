/**
 * Payments Controller — Endpoints de pagos
 */

import * as paymentsService from '../services/payments.service.js';

/**
 * GET /api/payments/:bookingId
 */
export async function getByBookingId(req, res, next) {
  try {
    const payment = await paymentsService.getByBookingId(req.params.bookingId, req.user.id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/payments/:id/status
 */
export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const payment = await paymentsService.updateStatus(req.params.id, status, req.user.id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
}
