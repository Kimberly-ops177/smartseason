require('dotenv').config();
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

const init = async () => {
  try {
    console.log('Connecting to database...');
    await pool.query('SELECT 1');
    console.log('Connected!');

    console.log('Creating tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        crop_type VARCHAR(100) NOT NULL,
        planting_date DATE NOT NULL,
        stage VARCHAR(20) NOT NULL DEFAULT 'planted' CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
        assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS field_updates (
        id SERIAL PRIMARY KEY,
        field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        agent_id INTEGER NOT NULL REFERENCES users(id),
        stage VARCHAR(20) NOT NULL CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables created!');

    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@smartseason.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPassword]);

    const agentPassword = await bcrypt.hash('agent123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Field Agent', 'agent@smartseason.com', $1, 'agent')
      ON CONFLICT (email) DO NOTHING;
    `, [agentPassword]);

    console.log('Seed users created!');
    console.log('Done! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

init();