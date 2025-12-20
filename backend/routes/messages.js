const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// Get all conversations for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get distinct conversation partners with latest message
    const result = await pool.query(
      `WITH conversation_partners AS (
        SELECT DISTINCT 
          CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END AS partner_id
        FROM messages 
        WHERE sender_id = $1 OR recipient_id = $1
      ),
      latest_messages AS (
        SELECT DISTINCT ON (cp.partner_id)
          cp.partner_id,
          m.id,
          m.message_text,
          m.is_read,
          m.created_at,
          m.project_id
        FROM conversation_partners cp
        JOIN messages m ON (
          (m.sender_id = $1 AND m.recipient_id = cp.partner_id) OR
          (m.sender_id = cp.partner_id AND m.recipient_id = $1)
        )
        ORDER BY cp.partner_id, m.created_at DESC
      ),
      unread_counts AS (
        SELECT 
          sender_id AS partner_id,
          COUNT(*) AS unread_count
        FROM messages
        WHERE recipient_id = $1 AND is_read = FALSE
        GROUP BY sender_id
      )
      SELECT 
        lm.id,
        lm.partner_id,
        u.name AS partner_name,
        u.email AS partner_email,
        lm.message_text AS last_message,
        lm.created_at AS last_message_at,
        COALESCE(uc.unread_count, 0) AS unread_count,
        lm.project_id,
        p.title AS project_title
      FROM latest_messages lm
      JOIN users u ON lm.partner_id = u.id
      LEFT JOIN unread_counts uc ON lm.partner_id = uc.partner_id
      LEFT JOIN projects p ON lm.project_id = p.id
      ORDER BY lm.created_at DESC`,
      [userId]
    );

    // Transform to match frontend Conversation type
    const conversations = result.rows.map(row => ({
      id: row.id,
      user: {
        id: row.partner_id,
        name: row.partner_name,
        email: row.partner_email,
        isOnline: false
      },
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at,
      unreadCount: parseInt(row.unread_count) || 0,
      projectId: row.project_id,
      projectTitle: row.project_title
    }));

    res.json(conversations);
  } catch (err) {
    console.error("[messages] Get conversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

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
      const senderId = req.user.id;
      const senderRole = req.user.role;

      // Messaging rules:
      // - Clients can message any freelancer
      // - Freelancers can only message if:
      //   1. They have a contract with the client, OR
      //   2. The client has already messaged them first (existing conversation)

      if (senderRole === 'freelancer') {
        // Check for existing contract
        const contractCheck = await pool.query(
          `SELECT id FROM contracts 
           WHERE (client_id = $1 AND freelancer_id = $2) 
              OR (client_id = $2 AND freelancer_id = $1)
           LIMIT 1`,
          [senderId, recipient_id]
        );

        // Check if client has messaged this freelancer before
        const conversationCheck = await pool.query(
          `SELECT id FROM messages 
           WHERE sender_id = $1 AND recipient_id = $2
           LIMIT 1`,
          [recipient_id, senderId]
        );

        if (contractCheck.rows.length === 0 && conversationCheck.rows.length === 0) {
          return res.status(403).json({
            error: "You can only reply to clients who messaged you first, or clients you have a contract with."
          });
        }
      }

      // Insert the message
      const result = await pool.query(
        `INSERT INTO messages (sender_id, recipient_id, message_text, project_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, sender_id, recipient_id, message_text, project_id, is_read, created_at`,
        [senderId, recipient_id, message_text, project_id || null]
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

// ---------------- MARK CONVERSATION AS READ ----------------
router.put("/conversation/:user_id/read", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `UPDATE messages SET is_read = TRUE 
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE`,
      [req.user.id, req.params.user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[messages] Mark as read error:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// ---------------- GET UNREAD COUNT ----------------
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (err) {
    console.error("[messages] Unread count error:", err);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

module.exports = router;
