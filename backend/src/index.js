require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const fieldRoutes = require('./routes/fields');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT 1'); // test DB connection
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
};

start();
