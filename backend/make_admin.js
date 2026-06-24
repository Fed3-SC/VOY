import 'dotenv/config';
import { query } from './src/config/database.js';

const email = process.argv[2] || 'colombolasuti@gmail.com';

async function run() {
  try {
    const res = await query('UPDATE users SET is_admin = TRUE WHERE email = $1 RETURNING id, email, is_admin', [email]);
    if (res.rowCount === 0) {
      console.log(`❌ No se encontró ningún usuario con el email: ${email}`);
      console.log('\nUsuarios registrados actualmente:');
      const allUsers = await query('SELECT id, email, is_admin FROM users');
      console.table(allUsers.rows);
    } else {
      console.log(`\n✅ ¡Éxito! El usuario ahora es administrador:`);
      console.table(res.rows);
    }
  } catch (error) {
    console.error('❌ Error al ejecutar la actualización:', error);
  } finally {
    process.exit();
  }
}

run();
