const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// ---------------- GET ALL NOTIFICATIONS WITH PAGINATION ----------------
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // optional filter by type

    let countQuery = "SELECT COUNT(*) FROM notifications WHERE user_id = $1";
    let dataQuery = `
      SELECT n.id, n.type, n.message, n.is_read, n.created_at
      FROM notifications n
      WHERE n.user_id = $1
    `;
    const params = [req.user.id];

    if (type) {
      countQuery += " AND type = $2";
      dataQuery += " AND n.type = $2";
      params.push(type);
    }

    // Count total
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get notifications
    dataQuery += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const result = await pool.query(dataQuery, [...params, limit, offset]);

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
    console.error("[notifications] Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ---------------- MARK SINGLE NOTIFICATION AS READ ----------------
router.put("/:notification_id/read", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.notification_id, req.user.id]
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("[notifications] Mark notification read error:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// ---------------- MARK ALL NOTIFICATIONS AS READ ----------------
router.put("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("[notifications] Mark all read error:", err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// ---------------- GET UNREAD COUNT ----------------
router.get("/unread/count", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ unread_count: parseInt(result.rows[0].unread_count) });
  } catch (err) {
    console.error("[notifications] Get unread count error:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

module.exports = router;
