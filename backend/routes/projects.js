const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// Post a new project (clients only)
router.post(
  "/",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("budget").isFloat({ min: 0.1 }).withMessage("Budget must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("required_skills").isArray().withMessage("Required skills must be an array"),
    body("deadline").optional().isISO8601().withMessage("Deadline must be a valid date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (req.user.role !== "client") {
        return res.status(403).json({ error: "Only clients can post projects" });
      }

      const { title, description, budget, category, required_skills, deadline } = req.body;

      const result = await pool.query(
        `INSERT INTO projects (client_id, title, description, budget, category, required_skills, deadline, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', NOW())
         RETURNING id, title, budget, category, created_at`,
        [req.user.id, title, description, budget, category, JSON.stringify(required_skills), deadline || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("[v0] Project creation error:", err);
      res.status(500).json({ error: "Failed to create project" });
    }
  }
);

// ---------------- GET ALL OPEN PROJECTS WITH PAGINATION ----------------
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1); // guard against 0/negative
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE status = 'open'"
    );
    const totalProjects = parseInt(countResult.rows[0].count);

    // Get paginated projects
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.budget, p.category, p.required_skills, p.status, p.deadline, p.created_at,
              u.id AS client_id, u.name AS client_name
       FROM projects p
       JOIN users u ON p.client_id = u.id
       WHERE p.status = 'open'
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ 
      data: result.rows,
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit)
      }
    });
  } catch (err) {
    console.error("[projects] Get projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});


// ---------------- SEARCH PROJECTS WITH FILTERS ----------------
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { category, min_budget, max_budget, skills, query } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const conditions = ["p.status = 'open'"];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (min_budget) {
      conditions.push(`p.budget >= $${paramIndex}`);
      params.push(parseFloat(min_budget));
      paramIndex++;
    }

    if (max_budget) {
      conditions.push(`p.budget <= $${paramIndex}`);
      params.push(parseFloat(max_budget));
      paramIndex++;
    }

    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim().toLowerCase());
      conditions.push(`(
        SELECT COUNT(*) FROM jsonb_array_elements_text(p.required_skills) AS skill
        WHERE LOWER(skill) = ANY($${paramIndex}::text[])
      ) > 0`);
      params.push(skillsArray);
      paramIndex++;
    }

    if (query) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    // Count total
    const countQuery = `SELECT COUNT(*) FROM projects p WHERE ${conditions.join(" AND ")}`;
    const countResult = await pool.query(countQuery, params);
    const totalProjects = parseInt(countResult.rows[0].count);

    // Get results
    params.push(limit, offset);
    const searchQuery = `
      SELECT p.id, p.title, p.description, p.budget, p.category, p.required_skills, p.status, p.deadline, p.created_at,
             u.id AS client_id, u.name AS client_name
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(searchQuery, params);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit)
      }
    });
  } catch (err) {
    console.error("[projects] Search projects error:", err);
    res.status(500).json({ error: "Failed to search projects" });
  }
});


// Get single project by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.budget, p.category, p.required_skills, p.status, p.created_at,
              u.name AS client_name, u.id AS client_id
       FROM projects p
       JOIN users u ON p.client_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("[v0] Get project error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

module.exports = router;
