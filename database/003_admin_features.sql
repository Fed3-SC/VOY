-- ============================================================
-- VOY — Migración 003: Administración y Características
-- PostgreSQL / Supabase
-- Ejecutar en: Supabase SQL Editor o psql
-- Es idempotente (usa IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. AGREGAR is_admin A TABLA users
-- ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ──────────────────────────────────────────────
-- 2. TABLA features
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS features (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  icon       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 3. TABLA RELACIONAL trip_features (N:M)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_features (
  trip_id    INTEGER NOT NULL REFERENCES trips(id)    ON DELETE CASCADE,
  feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (trip_id, feature_id)
);

-- ──────────────────────────────────────────────
-- 4. ÍNDICES DE PERFORMANCE
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trip_features_trip
  ON trip_features (trip_id);

CREATE INDEX IF NOT EXISTS idx_trip_features_feature
  ON trip_features (feature_id);

-- ──────────────────────────────────────────────
-- 5. SEED INICIAL DE CARACTERÍSTICAS
-- ──────────────────────────────────────────────
INSERT INTO features (name, icon) VALUES
  ('WiFi',                '📶'),
  ('Aire acondicionado',  '❄️'),
  ('Asientos reclinables','💺'),
  ('USB / Carga',         '🔌'),
  ('Baño a bordo',        '🚽'),
  ('Servicio cama',       '🛏️'),
  ('Comida incluida',     '🍽️'),
  ('Películas a bordo',   '🎬')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- NOTA PARA EL ADMINISTRADOR
-- ──────────────────────────────────────────────
-- Para designar el primer administrador, ejecutar:
-- UPDATE users SET is_admin = TRUE WHERE email = 'tu@email.com';
-- ──────────────────────────────────────────────
