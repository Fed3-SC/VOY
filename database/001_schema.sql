-- ============================================================
-- VOY — Schema de Base de Datos
-- PostgreSQL / Supabase
-- Ejecutar este script primero para crear las tablas.
-- ============================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  phone         VARCHAR(20),
  dni           VARCHAR(10)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- CITIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  province      VARCHAR(100) NOT NULL,
  terminal_name VARCHAR(150) NOT NULL,
  active        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ──────────────────────────────────────────────
-- COMPANIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  rating    NUMERIC(2,1) NOT NULL DEFAULT 4.0,
  logo_url  TEXT,
  active    BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ──────────────────────────────────────────────
-- TRIPS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id                  SERIAL PRIMARY KEY,
  company_id          INTEGER      NOT NULL REFERENCES companies(id),
  origin_city_id      INTEGER      NOT NULL REFERENCES cities(id),
  destination_city_id INTEGER      NOT NULL REFERENCES cities(id),
  departure_time      TIMESTAMPTZ  NOT NULL,
  arrival_time        TIMESTAMPTZ  NOT NULL,
  duration_minutes    INTEGER      NOT NULL,
  service_type        VARCHAR(20)  NOT NULL CHECK (service_type IN ('comun', 'semicama', 'cama')),
  price               INTEGER      NOT NULL CHECK (price > 0),
  total_seats         INTEGER      NOT NULL,
  available_seats     INTEGER      NOT NULL CHECK (available_seats >= 0),
  active              BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_seats CHECK (available_seats <= total_seats),
  CONSTRAINT chk_cities CHECK (origin_city_id <> destination_city_id)
);

-- ──────────────────────────────────────────────
-- BOOKINGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id),
  trip_id         INTEGER      NOT NULL REFERENCES trips(id),
  booking_code    VARCHAR(20)  NOT NULL UNIQUE,
  passengers      INTEGER      NOT NULL DEFAULT 1 CHECK (passengers > 0),
  total_price     INTEGER      NOT NULL CHECK (total_price > 0),
  status          VARCHAR(20)  NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  passenger_name  VARCHAR(200),
  passenger_email VARCHAR(255),
  passenger_dni   VARCHAR(10),
  payment_method  VARCHAR(50),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- PAYMENTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID         NOT NULL REFERENCES bookings(id),
  method      VARCHAR(50)  NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  amount      INTEGER      NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- ÍNDICES DE PERFORMANCE
-- ──────────────────────────────────────────────

-- Búsqueda rápida de viajes por ruta y fecha
CREATE INDEX IF NOT EXISTS idx_trips_route_date
  ON trips (origin_city_id, destination_city_id, departure_time);

-- Viajes activos
CREATE INDEX IF NOT EXISTS idx_trips_active
  ON trips (active) WHERE active = TRUE;

-- Reservas por usuario
CREATE INDEX IF NOT EXISTS idx_bookings_user
  ON bookings (user_id);

-- Búsqueda de reserva por código
CREATE INDEX IF NOT EXISTS idx_bookings_code
  ON bookings (booking_code);

-- Pagos por booking
CREATE INDEX IF NOT EXISTS idx_payments_booking
  ON payments (booking_id);

-- Usuarios por email (login rápido)
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users (email);
