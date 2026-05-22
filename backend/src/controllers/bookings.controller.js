/**
 * Bookings Controller — Endpoints de reservas
 */

import * as bookingsService from '../services/bookings.service.js';

/**
 * POST /api/bookings
 */
export async function create(req, res, next) {
  try {
    const { tripId, passengers, totalPrice, passengerName, passengerEmail, passengerDni, paymentMethod } = req.body;

    const booking = await bookingsService.create({
      userId: req.user.id,
      tripId,
      passengers,
      totalPrice,
      passengerName,
      passengerEmail,
      passengerDni,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/my-bookings
 */
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingsService.getByUserId(req.user.id);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/:id
 */
export async function getById(req, res, next) {
  try {
    const booking = await bookingsService.getById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}
