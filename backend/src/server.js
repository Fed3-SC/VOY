/**
 * VOY — Entry Point del Servidor
 *
 * Configura Express con middlewares, rutas y error handling.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Rutas
import authRoutes from './routes/auth.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import citiesRoutes from './routes/cities.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import companiesRoutes from './routes/companies.routes.js';
import usersRoutes from './routes/users.routes.js';
import featuresRoutes from './routes/features.routes.js';

// Middlewares
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

// Database
import { testConnection } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

/* ──────────────── MIDDLEWARES GLOBALES ──────────────── */

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

/* ──────────────── RUTAS ──────────────── */

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/features', featuresRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ──────────────── ERROR HANDLING ──────────────── */

app.use(notFoundHandler);
app.use(errorHandler);

/* ──────────────── INICIO ──────────────── */

async function start() {
  // Verificar conexión a la base de datos
  await testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚌 VOY Backend corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch((err) => {
  console.error('❌ Error al iniciar el servidor:', err.message);
  process.exit(1);
});
