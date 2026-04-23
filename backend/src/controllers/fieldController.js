const pool = require('../config/db');

// Status logic:
// - Completed: stage is 'harvested'
// - At Risk: stage is 'planted' or 'growing' AND planting_date is > 90 days ago
// - Active: everything else
const computeStatus = (stage, plantingDate) => {
  if (stage === 'harvested') return 'completed';
  const daysSincePlanting = Math.floor((Date.now() - new Date(plantingDate)) / (1000 * 60 * 60 * 24));
  if ((stage === 'planted' || stage === 'growing') && daysSincePlanting > 90) return 'at_risk';
  return 'active';
};

const getAllFields = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, 
        u.name AS agent_name, u.email AS agent_email,
        (SELECT fu.notes FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1) AS latest_note,
        (SELECT fu.created_at FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1) AS last_updated
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      ORDER BY f.created_at DESC
    `);
    const fields = result.rows.map(f => ({
      ...f,
      status: computeStatus(f.stage, f.planting_date)
    }));
    res.json(fields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyFields = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*,
        (SELECT fu.notes FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1) AS latest_note,
        (SELECT fu.created_at FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1) AS last_updated
      FROM fields f
      WHERE f.assigned_agent_id = $1
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    const fields = result.rows.map(f => ({
      ...f,
      status: computeStatus(f.stage, f.planting_date)
    }));
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getField = async (req, res) => {
  const { id } = req.params;
  try {
    const fieldResult = await pool.query(`
      SELECT f.*, u.name AS agent_name
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      WHERE f.id = $1
    `, [id]);

    if (!fieldResult.rows.length) return res.status(404).json({ error: 'Field not found' });

    const field = fieldResult.rows[0];

    // Agents can only view their own fields
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatesResult = await pool.query(`
      SELECT fu.*, u.name AS agent_name
      FROM field_updates fu
      JOIN users u ON fu.agent_id = u.id
      WHERE fu.field_id = $1
      ORDER BY fu.created_at DESC
    `, [id]);

    res.json({
      ...field,
      status: computeStatus(field.stage, field.planting_date),
      updates: updatesResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createField = async (req, res) => {
  const { name, crop_type, planting_date, stage, assigned_agent_id } = req.body;
  if (!name || !crop_type || !planting_date) {
    return res.status(400).json({ error: 'Name, crop type, and planting date are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, stage, assigned_agent_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, crop_type, planting_date, stage || 'planted', assigned_agent_id || null, req.user.id]
    );
    res.status(201).json({ ...result.rows[0], status: computeStatus(result.rows[0].stage, result.rows[0].planting_date) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateField = async (req, res) => {
  const { id } = req.params;
  const { name, crop_type, planting_date, stage, assigned_agent_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE fields SET name=$1, crop_type=$2, planting_date=$3, stage=$4, assigned_agent_id=$5
       WHERE id=$6 RETURNING *`,
      [name, crop_type, planting_date, stage, assigned_agent_id || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Field not found' });
    res.json({ ...result.rows[0], status: computeStatus(result.rows[0].stage, result.rows[0].planting_date) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteField = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fields WHERE id = $1', [id]);
    res.json({ message: 'Field deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addUpdate = async (req, res) => {
  const { id } = req.params;
  const { stage, notes } = req.body;
  if (!stage) return res.status(400).json({ error: 'Stage is required' });

  try {
    // Check field exists and agent is assigned
    const fieldResult = await pool.query('SELECT * FROM fields WHERE id = $1', [id]);
    if (!fieldResult.rows.length) return res.status(404).json({ error: 'Field not found' });

    const field = fieldResult.rows[0];
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this field' });
    }

    // Insert update record
    const updateResult = await pool.query(
      `INSERT INTO field_updates (field_id, agent_id, stage, notes) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, req.user.id, stage, notes || null]
    );

    // Update field stage
    await pool.query('UPDATE fields SET stage = $1 WHERE id = $2', [stage, id]);

    res.status(201).json(updateResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let fields;
    if (req.user.role === 'admin') {
      const result = await pool.query('SELECT * FROM fields');
      fields = result.rows;
    } else {
      const result = await pool.query('SELECT * FROM fields WHERE assigned_agent_id = $1', [req.user.id]);
      fields = result.rows;
    }

    const withStatus = fields.map(f => ({ ...f, status: computeStatus(f.stage, f.planting_date) }));

    const stats = {
      total: withStatus.length,
      active: withStatus.filter(f => f.status === 'active').length,
      at_risk: withStatus.filter(f => f.status === 'at_risk').length,
      completed: withStatus.filter(f => f.status === 'completed').length,
      by_stage: {
        planted: withStatus.filter(f => f.stage === 'planted').length,
        growing: withStatus.filter(f => f.stage === 'growing').length,
        ready: withStatus.filter(f => f.stage === 'ready').length,
        harvested: withStatus.filter(f => f.stage === 'harvested').length,
      }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllFields, getMyFields, getField, createField, updateField, deleteField, addUpdate, getDashboardStats };
