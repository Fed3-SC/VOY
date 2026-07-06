-- ============================================================
-- VOY — Migración 005: Sprint 4 — Recomendaciones y Residencia
-- PostgreSQL / Supabase
-- Ejecutar DESPUÉS de 004_favorites.sql
-- Idempotente (usa IF NOT EXISTS / DO $$ ... $$)
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. AGREGAR residence_city_id A TABLA users
-- Campo opcional para la ciudad de residencia del usuario.
-- Se usa en el algoritmo de recomendaciones.
-- ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS residence_city_id INTEGER REFERENCES cities(id);

-- ──────────────────────────────────────────────
-- 2. ÍNDICES DE PERFORMANCE PARA RECOMENDACIONES
-- ──────────────────────────────────────────────

-- Bookings por trip_id — para conteo de popularidad
CREATE INDEX IF NOT EXISTS idx_bookings_trip
  ON bookings (trip_id);

-- Bookings por status — para filtrar reservas confirmadas
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings (status);

-- Trips por disponibilidad — para filtrar viajes con asientos
CREATE INDEX IF NOT EXISTS idx_trips_available
  ON trips (available_seats) WHERE active = TRUE AND available_seats > 0;

-- Trips por fecha futura — para viajes próximos
CREATE INDEX IF NOT EXISTS idx_trips_future
  ON trips (departure_time) WHERE active = TRUE;

-- Favoritos compound index para recomendaciones
CREATE INDEX IF NOT EXISTS idx_favorites_user_trip
  ON favorites (user_id, trip_id);

-- ──────────────────────────────────────────────
-- NOTA
-- ──────────────────────────────────────────────
-- residence_city_id es opcional. Los usuarios pueden
-- configurarlo desde su perfil para mejorar las
-- recomendaciones personalizadas.
