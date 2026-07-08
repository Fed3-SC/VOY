import 'dotenv/config';
import fs from 'fs';
import { query } from './src/config/database.js';

const sql = fs.readFileSync('../database/006_password_reset.sql', 'utf8');

try {
  await query(sql, []);
  console.log('✅ Migration 006_password_reset.sql executed successfully');
  process.exit(0);
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
}
