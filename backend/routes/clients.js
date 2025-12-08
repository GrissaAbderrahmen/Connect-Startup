const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Get client profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, c.company_name
       FROM users u
       LEFT JOIN client_profiles c ON u.id = c.user_id
       WHERE u.id = $1 AND u.role = 'client'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[v0] Get client error:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
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
    console.error('[v0] Update client profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;