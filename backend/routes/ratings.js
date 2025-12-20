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

// GET /api/ratings/my-reviews - Get freelancer's own reviews
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can view their reviews' });
    }

    // Get all reviews
    const reviews = await pool.query(`
      SELECT r.id, r.rating, r.review_text, r.created_at,
             u.name as client_name,
             p.title as project_title
      FROM ratings r
      JOIN users u ON r.client_id = u.id
      JOIN projects p ON r.project_id = p.id
      WHERE r.freelancer_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    // Get stats
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM ratings
      WHERE freelancer_id = $1
    `, [req.user.id]);

    res.json({
      reviews: reviews.rows,
      stats: {
        totalReviews: parseInt(stats.rows[0].total_reviews),
        averageRating: parseFloat(stats.rows[0].average_rating).toFixed(1),
        breakdown: {
          5: parseInt(stats.rows[0].five_star),
          4: parseInt(stats.rows[0].four_star),
          3: parseInt(stats.rows[0].three_star),
          2: parseInt(stats.rows[0].two_star),
          1: parseInt(stats.rows[0].one_star),
        }
      }
    });
  } catch (err) {
    console.error('[ratings] Get my reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/ratings/:freelancerId - Get public freelancer reviews
router.get('/:freelancerId', async (req, res) => {
  try {
    const freelancerId = parseInt(req.params.freelancerId);

    const reviews = await pool.query(`
      SELECT r.id, r.rating, r.review_text, r.created_at,
             u.name as client_name,
             p.title as project_title
      FROM ratings r
      JOIN users u ON r.client_id = u.id
      JOIN projects p ON r.project_id = p.id
      WHERE r.freelancer_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [freelancerId]);

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM ratings
      WHERE freelancer_id = $1
    `, [freelancerId]);

    res.json({
      reviews: reviews.rows,
      stats: {
        totalReviews: parseInt(stats.rows[0].total_reviews),
        averageRating: parseFloat(stats.rows[0].average_rating).toFixed(1)
      }
    });
  } catch (err) {
    console.error('[ratings] Get freelancer reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;

