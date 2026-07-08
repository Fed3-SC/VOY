-- ============================================================
-- VOY — Migración 006: Password Reset Tokens
-- PostgreSQL / Supabase
-- Ejecutar DESPUÉS de 005_sprint4.sql
-- Idempotente (usa IF NOT EXISTS / DO $$ ... $$)
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. TABLA password_reset_tokens
-- Almacena tokens hasheados (SHA-256) para
-- recuperación de contraseña con vencimiento.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 2. ÍNDICES
-- ──────────────────────────────────────────────

-- Búsqueda rápida por token_hash (lookup principal)
CREATE INDEX IF NOT EXISTS idx_prt_token_hash
  ON password_reset_tokens (token_hash)
  WHERE used = FALSE;

-- Limpieza de tokens expirados
CREATE INDEX IF NOT EXISTS idx_prt_expires
  ON password_reset_tokens (expires_at);

-- Tokens por usuario (para invalidar previos)
CREATE INDEX IF NOT EXISTS idx_prt_user
  ON password_reset_tokens (user_id)
  WHERE used = FALSE;
