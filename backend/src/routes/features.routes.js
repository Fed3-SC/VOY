import { Router } from 'express';
import { body } from 'express-validator';
import * as featuresController from '../controllers/features.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = Router();

// GET /api/features — público (para mostrar en el frontend)
router.get('/', featuresController.getAll);

// Los siguientes endpoints requieren admin
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate([
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('icon').notEmpty().withMessage('El ícono es obligatorio'),
  ]),
  featuresController.create
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  featuresController.update
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  featuresController.remove
);

export default router;
