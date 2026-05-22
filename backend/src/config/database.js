/**
 * Configuración de conexión a PostgreSQL
 *
 * Usa un Pool de conexiones para manejar múltiples queries concurrentes.
 * Compatible con Supabase y PostgreSQL local.
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log de errores inesperados en el pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

/**
 * Ejecuta un query SQL parametrizado.
 * @param {string} text - Query SQL con placeholders $1, $2, etc.
 * @param {any[]} params - Valores para los placeholders.
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log('  📊 Query ejecutado', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
  }

  return result;
}

/**
 * Obtiene un cliente del pool para transacciones.
 * Uso: const client = await getClient(); try { ... } finally { client.release(); }
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Verifica la conexión a la base de datos al iniciar.
 */
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conectado a PostgreSQL:', result.rows[0].now);
  } catch (err) {
    console.error('❌ No se pudo conectar a PostgreSQL:', err.message);
    throw err;
  }
}

export default pool;
