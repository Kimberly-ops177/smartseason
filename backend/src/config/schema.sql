-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fields
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

-- Field Updates (stage changes + notes)
CREATE TABLE IF NOT EXISTS field_updates (
  id SERIAL PRIMARY KEY,
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES users(id),
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User',
  'admin@smartseason.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Seed agent user (password: agent123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Field Agent',
  'agent@smartseason.com',
  '$2a$10$TKh8H1.PfuAy3GlbcCjPUewAUQnFfRPSrN1YMRfCf4F0bN5Q.N5Sq',
  'agent'
) ON CONFLICT (email) DO NOTHING;
