const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Get current client's own profile (must be BEFORE /:id to avoid catching "profile" as id)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can view their profile' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, c.company_name
       FROM users u
       LEFT JOIN client_profiles c ON u.id = c.user_id
       WHERE u.id = $1 AND u.role = 'client'`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[clients] Get own profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update client profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can update profile' });
    }

    const { company_name } = req.body;

    await pool.query(
      `INSERT INTO client_profiles (user_id, company_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET company_name = $2`,
      [req.user.id, company_name]
    );

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('[clients] Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get client by ID (must be LAST to avoid catching other routes)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, c.company_name
       FROM users u
       LEFT JOIN client_profiles c ON u.id = c.user_id
       WHERE u.id = $1 AND u.role = 'client'`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[clients] Get client by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

module.exports = router;