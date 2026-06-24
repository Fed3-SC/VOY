-- ============================================================
-- VOY — Migración 004: Sistema de Favoritos
-- PostgreSQL / Supabase
-- Ejecutar en: Supabase SQL Editor o psql
-- Idempotente (usa IF NOT EXISTS)
-- ============================================================

-- ──────────────────────────────────────────────
-- TABLA favorites
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         SERIAL       PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id    INTEGER      NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_trip UNIQUE (user_id, trip_id)
);

-- ──────────────────────────────────────────────
-- ÍNDICES DE PERFORMANCE
-- ──────────────────────────────────────────────

-- Buscar todos los favoritos de un usuario rápidamente
CREATE INDEX IF NOT EXISTS idx_favorites_user
  ON favorites (user_id);

-- Buscar si un viaje específico es favorito de alguien
CREATE INDEX IF NOT EXISTS idx_favorites_trip
  ON favorites (trip_id);

-- ──────────────────────────────────────────────
-- NOTA
-- ──────────────────────────────────────────────
-- La restricción UNIQUE (user_id, trip_id) evita duplicados a nivel BD.
-- El backend también valida esto antes de insertar.
