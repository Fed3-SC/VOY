import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    await testConnection();
    const sqlPath = path.resolve(__dirname, '../database/005_sprint4.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration: 005_sprint4.sql...');
    await query(sql);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
