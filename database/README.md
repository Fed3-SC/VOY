# VOY — Base de Datos

## Orden de ejecución

1. **`001_schema.sql`** — Crea las tablas, relaciones e índices
2. **`002_seed.sql`** — Inserta datos de prueba (ciudades, empresas, viajes)

## Cómo ejecutar en Supabase

1. Ir a [supabase.com](https://supabase.com) → Tu proyecto
2. Click en **SQL Editor** (menú lateral)
3. Pegar el contenido de `001_schema.sql` → Click **Run**
4. Pegar el contenido de `002_seed.sql` → Click **Run**

## Tablas

| Tabla       | Descripción                              |
|-------------|------------------------------------------|
| `users`     | Usuarios registrados                     |
| `cities`    | Ciudades con terminales                  |
| `companies` | Empresas de micro                        |
| `trips`     | Viajes programados                       |
| `bookings`  | Reservas de pasajes                      |
| `payments`  | Registros de pago (estructura inicial)   |
