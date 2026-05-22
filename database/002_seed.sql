-- ============================================================
-- VOY — Datos de Prueba (Seed)
-- Ejecutar DESPUÉS de 001_schema.sql
-- ============================================================

-- ──────────────── CITIES ────────────────
INSERT INTO cities (id, name, province, terminal_name, active) VALUES
  (1,  'Buenos Aires',      'CABA',           'Terminal Retiro',                  TRUE),
  (2,  'Mar del Plata',     'Buenos Aires',    'Terminal de Ómnibus MDQ',          TRUE),
  (3,  'Córdoba',           'Córdoba',         'Terminal de Ómnibus Córdoba',      TRUE),
  (4,  'Mendoza',           'Mendoza',         'Terminal de Ómnibus Mendoza',      TRUE),
  (5,  'Rosario',           'Santa Fe',        'Terminal Mariano Moreno',          TRUE),
  (6,  'Bariloche',         'Río Negro',       'Terminal de Ómnibus Bariloche',    TRUE),
  (7,  'Salta',             'Salta',           'Terminal de Ómnibus Salta',        TRUE),
  (8,  'Neuquén',           'Neuquén',         'Terminal ETON',                    TRUE),
  (9,  'Tucumán',           'Tucumán',         'Terminal de Ómnibus Tucumán',      TRUE),
  (10, 'Santiago (Chile)',   'Internacional',   'Terminal San Borja',               TRUE)
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencia de cities
SELECT setval('cities_id_seq', 10);

-- ──────────────── COMPANIES ────────────────
INSERT INTO companies (id, name, rating, logo_url, active) VALUES
  (1, 'Chevallier',         4.5, NULL, TRUE),
  (2, 'Vía Bariloche',      4.3, NULL, TRUE),
  (3, 'Andesmar',           4.6, NULL, TRUE),
  (4, 'Flecha Bus',         4.2, NULL, TRUE),
  (5, 'CATA Internacional', 4.4, NULL, TRUE),
  (6, 'Plusmar',             4.1, NULL, TRUE),
  (7, 'El Rápido',          4.0, NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencia de companies
SELECT setval('companies_id_seq', 7);

-- ──────────────── TRIPS ────────────────
-- Generamos viajes para los próximos 30 días usando PL/pgSQL
-- Replica exactamente la lógica de generateTrips() de mockData.js

DO $$
DECLARE
  -- Variables de iteración
  v_day_offset   INTEGER;
  v_date         DATE;
  v_route        RECORD;
  v_num_trips    INTEGER;
  v_time_idx     INTEGER;
  v_time_val     TIME;
  v_service      VARCHAR(20);
  v_company_id   INTEGER;
  v_departure    TIMESTAMPTZ;
  v_arrival      TIMESTAMPTZ;
  v_price        INTEGER;
  v_base_price   INTEGER;
  v_total_seats  INTEGER;
  v_avail_seats  INTEGER;
  v_services     VARCHAR(20)[] := ARRAY['comun', 'semicama', 'cama'];
  v_times        TIME[] := ARRAY['06:00'::TIME, '08:30'::TIME, '10:00'::TIME, '14:00'::TIME, '18:00'::TIME, '21:00'::TIME, '23:30'::TIME];
  v_shuffled     TIME[];
  v_temp         TIME;
  v_rand_idx     INTEGER;
BEGIN
  -- Tabla temporal con las rutas (replicando mockData.js exacto)
  CREATE TEMP TABLE tmp_routes (
    origin     INTEGER,
    dest       INTEGER,
    duration   INTEGER,
    price_comun    INTEGER,
    price_semicama INTEGER,
    price_cama     INTEGER
  ) ON COMMIT DROP;

  INSERT INTO tmp_routes VALUES
    (1, 2,  330,  18500, 25500, 35000),
    (2, 1,  330,  18500, 25500, 35000),
    (1, 3,  600,  32000, 42000, 58000),
    (3, 1,  600,  32000, 42000, 58000),
    (1, 4,  780,  38000, 48000, 65000),
    (4, 1,  780,  38000, 48000, 65000),
    (1, 5,  240,  15000, 21000, 29000),
    (5, 1,  240,  15000, 21000, 29000),
    (1, 6,  1260, 52000, 68000, 89000),
    (6, 1,  1260, 52000, 68000, 89000),
    (1, 7,  1140, 45000, 58000, 76000),
    (7, 1,  1140, 45000, 58000, 76000),
    (3, 4,  540,  28000, 36000, 48000),
    (4, 3,  540,  28000, 36000, 48000),
    (1, 8,  720,  35000, 45000, 62000),
    (8, 1,  720,  35000, 45000, 62000),
    (4, 10, 420,  42000, 55000, 72000),
    (10, 4, 420,  42000, 55000, 72000),
    (1, 9,  1080, 42000, 55000, 72000),
    (9, 1,  1080, 42000, 55000, 72000),
    (1, 10, 1320, 55000, 72000, 95000),
    (10, 1, 1320, 55000, 72000, 95000);

  -- Generar viajes para 30 días
  FOR v_day_offset IN 0..29 LOOP
    v_date := CURRENT_DATE + v_day_offset;

    FOR v_route IN SELECT * FROM tmp_routes LOOP
      -- 4-7 viajes por ruta por día
      v_num_trips := 4 + floor(random() * 4)::INTEGER;

      -- Shuffle de horarios (Fisher-Yates)
      v_shuffled := v_times;
      FOR v_time_idx IN REVERSE 7..2 LOOP
        v_rand_idx := 1 + floor(random() * v_time_idx)::INTEGER;
        v_temp := v_shuffled[v_time_idx];
        v_shuffled[v_time_idx] := v_shuffled[v_rand_idx];
        v_shuffled[v_rand_idx] := v_temp;
      END LOOP;

      FOR v_time_idx IN 1..v_num_trips LOOP
        v_time_val := v_shuffled[v_time_idx];
        v_service := v_services[1 + floor(random() * 3)::INTEGER];
        v_company_id := 1 + floor(random() * 7)::INTEGER;

        v_departure := v_date + v_time_val;
        v_arrival := v_departure + (v_route.duration || ' minutes')::INTERVAL;

        -- Precio base según servicio
        IF v_service = 'comun' THEN
          v_base_price := v_route.price_comun;
          v_total_seats := 52;
        ELSIF v_service = 'semicama' THEN
          v_base_price := v_route.price_semicama;
          v_total_seats := 40;
        ELSE
          v_base_price := v_route.price_cama;
          v_total_seats := 24;
        END IF;

        -- Variación de precio (±10%)
        v_price := round(v_base_price * (0.9 + random() * 0.2))::INTEGER;
        v_avail_seats := 5 + floor(random() * 30)::INTEGER;

        IF v_avail_seats > v_total_seats THEN
          v_avail_seats := v_total_seats;
        END IF;

        INSERT INTO trips (
          company_id, origin_city_id, destination_city_id,
          departure_time, arrival_time, duration_minutes,
          service_type, price, total_seats, available_seats, active
        ) VALUES (
          v_company_id, v_route.origin, v_route.dest,
          v_departure, v_arrival, v_route.duration,
          v_service, v_price, v_total_seats, v_avail_seats, TRUE
        );
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seed completado: % viajes generados.', (SELECT COUNT(*) FROM trips);
END $$;
