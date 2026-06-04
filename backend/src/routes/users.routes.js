import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Todos los endpoints requieren autenticación + permisos de admin
router.use(requireAuth, requireAdmin);

// GET /api/users — lista de todos los usuarios
router.get('/', usersController.getAll);

// PATCH /api/users/:id/promote — promover a admin
router.patch('/:id/promote', usersController.promote);

// PATCH /api/users/:id/demote — quitar permisos de admin
router.patch('/:id/demote', usersController.demote);

export default router;
