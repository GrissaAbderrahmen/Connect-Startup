const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Submit a rating
router.post('/', authenticateToken, [
  body('freelancer_id').isInt(),
  body('project_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review_text').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can submit ratings' });
    }

    const { freelancer_id, project_id, rating, review_text } = req.body;

    await pool.query(
      `INSERT INTO ratings (project_id, freelancer_id, client_id, rating, review_text, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [project_id, freelancer_id, req.user.id, rating, review_text]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'rating', $2, FALSE, NOW())`,
      [freelancer_id, `You received a new rating (${rating}/5) from ${req.user.name}`]
    );

    res.status(201).json({ message: 'Rating submitted' });
  } catch (err) {
    console.error('[v0] Rating submission error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

module.exports = router;
