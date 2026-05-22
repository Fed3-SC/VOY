/**
 * Trips Controller — Endpoints de viajes
 */

import * as tripsService from '../services/trips.service.js';

/**
 * GET /api/trips
 */
export async function getAll(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const trips = await tripsService.getAll(limit, offset);

    res.json({
      success: true,
      data: trips,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/search
 */
export async function search(req, res, next) {
  try {
    const { origin, destination, date, passengers } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Los parámetros origin y destination son obligatorios.',
      });
    }

    const trips = await tripsService.search({
      origin: parseInt(origin),
      destination: parseInt(destination),
      date: date || null,
      passengers: parseInt(passengers) || 1,
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/:id
 */
export async function getById(req, res, next) {
  try {
    const trip = await tripsService.getById(parseInt(req.params.id));

    res.json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/offers
 */
export async function getOffers(req, res, next) {
  try {
    const offers = await tripsService.getOffers();

    res.json({
      success: true,
      data: offers,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/popular-destinations
 */
export async function getPopularDestinations(req, res, next) {
  try {
    const destinations = await tripsService.getPopularDestinations();

    res.json({
      success: true,
      data: destinations,
    });
  } catch (err) {
    next(err);
  }
}
