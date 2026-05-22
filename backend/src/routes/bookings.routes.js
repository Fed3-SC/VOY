import { Router } from 'express';
import { body } from 'express-validator';
import * as bookingsController from '../controllers/bookings.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = Router();

// Todas las rutas de bookings requieren autenticación
router.use(requireAuth);

router.post('/', validate([
  body('tripId').isInt().withMessage('TripId es obligatorio'),
  body('passengers').isInt({ min: 1 }).withMessage('Cantidad de pasajeros inválida'),
  body('totalPrice').isInt({ min: 1 }).withMessage('Precio total inválido'),
  body('passengerName').notEmpty().withMessage('Nombre del pasajero es obligatorio'),
  body('passengerEmail').isEmail().withMessage('Email del pasajero inválido'),
  body('passengerDni').notEmpty().withMessage('DNI del pasajero es obligatorio'),
  body('paymentMethod').notEmpty().withMessage('Método de pago es obligatorio'),
]), bookingsController.create);

router.get('/my-bookings', bookingsController.getMyBookings);
router.get('/:id', bookingsController.getById);

export default router;
