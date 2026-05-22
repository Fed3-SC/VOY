import { Router } from 'express';
import { body } from 'express-validator';
import * as paymentsController from '../controllers/payments.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = Router();

// Todas las rutas de pagos requieren autenticación
router.use(requireAuth);

router.get('/:bookingId', paymentsController.getByBookingId);

router.patch('/:id/status', validate([
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Estado inválido')
]), paymentsController.updateStatus);

export default router;
