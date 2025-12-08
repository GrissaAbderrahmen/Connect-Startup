const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// Send a message
router.post(
  "/",
  authenticateToken,
  [
    body("recipient_id").isInt(),
    body("message_text").notEmpty(),
    body("project_id").optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { recipient_id, message_text, project_id } = req.body;

      // Insert the message
      const result = await pool.query(
        `INSERT INTO messages (sender_id, recipient_id, message_text, project_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, message_text, created_at`,
        [req.user.id, recipient_id, message_text, project_id || null]
      );

      // Insert a notification for the recipient
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, is_read, created_at)
         VALUES ($1, 'message', $2, FALSE, NOW())`,
        [recipient_id, `New message from ${req.user.name}`]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("[v0] Message send error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  }
);


// ---------------- GET CONVERSATION WITH PAGINATION ----------------
router.get("/conversation/:user_id", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Count total messages
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM messages
       WHERE (sender_id = $1 AND recipient_id = $2) OR
             (sender_id = $2 AND recipient_id = $1)`,
      [req.user.id, req.params.user_id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get messages oldest first
    const result = await pool.query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.message_text, m.project_id, m.is_read, m.created_at,
              u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR
             (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC
       LIMIT $3 OFFSET $4`,
      [req.user.id, req.params.user_id, limit, offset]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages SET is_read = TRUE 
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE`,
      [req.user.id, req.params.user_id]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[messages] Get conversation error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


// ---------------- GET PROJECT MESSAGES WITH PAGINATION ----------------
router.get("/project/:project_id", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Count total
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE project_id = $1",
      [req.params.project_id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get messages oldest first
    const result = await pool.query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.message_text, m.is_read, m.created_at,
              u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [req.params.project_id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[messages] Get project messages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


module.exports = router;
