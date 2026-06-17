import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  console.log('==================================================');
  console.log('  InternSphere Database Setup & Migration');
  console.log('==================================================');
  console.log(`Connecting to: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
  console.log(`User: ${process.env.DB_USER || 'root'}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      multipleStatements: true
    });
    console.log('✔ Connected to MySQL server.');
  } catch (error) {
    console.error('\n✖ Connection Failed!');
    console.error('Error Details:', error.message);
    console.log('\nPlease check:');
    console.log('1. Is your local MySQL server running?');
    console.log('2. Does your MySQL password match the password in backend/.env?');
    console.log('   (Current password in .env: "' + (process.env.DB_PASSWORD || '') + '")');
    console.log('\nIf you have a different root password, please edit the backend/.env file and rerun this script.');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log(`Reading schema script: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema queries...');
    await connection.query(schemaSql);
    console.log('✔ Database and tables created successfully.');

    const seedsPath = path.join(__dirname, '../../database/seeds.sql');
    console.log(`Reading seed script: ${seedsPath}`);
    const seedsSql = fs.readFileSync(seedsPath, 'utf8');

    console.log('Executing seed queries...');
    await connection.query(seedsSql);
    console.log('✔ Seed data populated successfully.');

    console.log('\n✔ Automation Complete! InternSphere is fully configured.');
  } catch (err) {
    console.error('\n✖ Execution Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
