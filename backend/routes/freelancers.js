const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// ---------------- BROWSE FREELANCERS WITH PAGINATION ----------------
router.get("/browse", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ error: "Only clients can browse freelancers" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sort || "rating"; // 'rating' or 'rate'

    // Count total
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'freelancer'"
    );
    const total = parseInt(countResult.rows[0].count);

    // Sort order
    const orderBy =
      sortBy === "rate"
        ? "f.hourly_rate ASC NULLS LAST"
        : "average_rating DESC NULLS LAST";

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, f.bio, f.skills, f.hourly_rate, f.portfolio_url,
              AVG(r.rating) AS average_rating, COUNT(r.id) AS total_reviews
       FROM users u
       LEFT JOIN freelancer_profiles f ON u.id = f.user_id
       LEFT JOIN ratings r ON u.id = r.freelancer_id
       WHERE u.role = 'freelancer'
       GROUP BY u.id, f.bio, f.skills, f.hourly_rate, f.portfolio_url
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
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
    console.error("[freelancers] Browse error:", err);
    res.status(500).json({ error: "Failed to browse freelancers" });
  }
});


// ---------------- SEARCH FREELANCERS WITH PAGINATION ----------------
router.get("/search", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ error: "Only clients can search freelancers" });
    }

    const { query, skills } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const conditions = ["u.role = 'freelancer'"];
    const params = [];
    let paramIndex = 1;

    if (query) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR f.bio ILIKE $${paramIndex})`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim().toLowerCase());
      conditions.push(`(
        SELECT COUNT(*) FROM jsonb_array_elements_text(f.skills) AS skill
        WHERE LOWER(skill) = ANY($${paramIndex}::text[])
      ) > 0`);
      params.push(skillsArray);
      paramIndex++;
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) FROM users u
      LEFT JOIN freelancer_profiles f ON u.id = f.user_id
      WHERE ${conditions.join(" AND ")}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get results
    params.push(limit, offset);
    const sqlQuery = `
      SELECT u.id, u.name, u.email, f.bio, f.skills, f.hourly_rate, f.portfolio_url,
             AVG(r.rating) AS average_rating, COUNT(r.id) AS total_reviews
      FROM users u
      LEFT JOIN freelancer_profiles f ON u.id = f.user_id
      LEFT JOIN ratings r ON u.id = r.freelancer_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY u.id, f.bio, f.skills, f.hourly_rate, f.portfolio_url
      ORDER BY average_rating DESC NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(sqlQuery, params);

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
    console.error("[freelancers] Search error:", err);
    res.status(500).json({ error: "Failed to search freelancers" });
  }
});


// Get freelancer profile by ID (must be last to avoid conflicts)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, f.bio, f.skills, f.portfolio_url, f.hourly_rate,
              AVG(r.rating) AS average_rating, COUNT(r.id) AS total_reviews
       FROM users u
       LEFT JOIN freelancer_profiles f ON u.id = f.user_id
       LEFT JOIN ratings r ON u.id = r.freelancer_id
       WHERE u.id = $1 AND u.role = 'freelancer'
       GROUP BY u.id, f.bio, f.skills, f.portfolio_url, f.hourly_rate`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[v0] Get freelancer error:", err);
    res.status(500).json({ error: "Failed to fetch freelancer" });
  }
});

// Update freelancer profile (freelancers only)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    let { bio, skills, hourly_rate, portfolio_url } = req.body;

    // Only freelancers can update their profile
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ error: "Only freelancers can update their profile" });
    }

    // Ensure skills is stored as JSON
    if (Array.isArray(skills)) {
      skills = JSON.stringify(skills);
    }

    const result = await pool.query(
      `INSERT INTO freelancer_profiles (user_id, bio, skills, hourly_rate, portfolio_url, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET bio = EXCLUDED.bio,
                     skills = EXCLUDED.skills,
                     hourly_rate = EXCLUDED.hourly_rate,
                     portfolio_url = EXCLUDED.portfolio_url,
                     updated_at = NOW()
       RETURNING user_id`,
      [req.user.id, bio, skills, hourly_rate, portfolio_url]
    );

    res.json({ message: "Profile updated successfully", user_id: result.rows[0].user_id });
  } catch (err) {
    console.error("[v0] Update freelancer profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


module.exports = router;
