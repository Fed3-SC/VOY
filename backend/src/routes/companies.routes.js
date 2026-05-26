import { Router } from 'express';
import * as companiesController from '../controllers/companies.controller.js';

const router = Router();

router.get('/', companiesController.getAll);

export default router;
