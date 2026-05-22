import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate([
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('lastName').notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('El celular es obligatorio'),
  body('dni').notEmpty().withMessage('El DNI es obligatorio'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
]), authController.register);

router.post('/login', validate([
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
]), authController.login);

router.get('/me', requireAuth, authController.me);

export default router;
