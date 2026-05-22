import { Router } from 'express';
import * as citiesController from '../controllers/cities.controller.js';

const router = Router();

router.get('/', citiesController.getAll);

export default router;
