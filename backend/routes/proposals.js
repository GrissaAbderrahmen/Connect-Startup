const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// ---------------- PUBLIC PROPOSALS ----------------
router.post(
  "/public",
  authenticateToken,
  [
    body("project_id").isInt(),
    body("proposal_text").notEmpty(),
    body("proposed_price").isFloat({ min: 0.1 }),
    body("delivery_time").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.user.role !== "freelancer") {
        return res.status(403).json({ error: "Only freelancers can submit proposals" });
      }

      const { project_id, proposal_text, proposed_price, delivery_time } = req.body;

      // Check if project exists and is open
      const projectCheck = await pool.query(
        "SELECT id, status, client_id FROM projects WHERE id = $1",
        [project_id]
      );
      if (projectCheck.rows.length === 0 || projectCheck.rows[0].status !== "open") {
        return res.status(400).json({ error: "Project not available" });
      }

      // Check for duplicate proposal
      const duplicateCheck = await pool.query(
        "SELECT id FROM proposals WHERE project_id = $1 AND freelancer_id = $2",
        [project_id, req.user.id]
      );
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ error: "You already submitted a proposal to this project" });
      }

      // Insert proposal
      const result = await pool.query(
        `INSERT INTO proposals (project_id, freelancer_id, client_id, proposal_type, proposal_text, proposed_price, delivery_time, status, created_at, updated_at)
         VALUES ($1, $2, $3, 'public', $4, $5, $6, 'pending', NOW(), NOW())
         RETURNING id, proposed_price, status, created_at`,
        [project_id, req.user.id, projectCheck.rows[0].client_id, proposal_text, proposed_price, delivery_time || null]
      );

      // Notify client
      await pool.query(
        `INSERT INTO notifications (user_id, proposal_id, type, message, is_read, created_at)
         VALUES ($1, $2, 'public_proposal', $3, FALSE, NOW())`,
        [projectCheck.rows[0].client_id, result.rows[0].id, `${req.user.name} submitted a proposal to your project`]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      console.error("[proposals] Public proposal error:", err);
      res.status(500).json({ error: "Failed to submit proposal" });
    }
  }
);

// ---------------- DIRECT PROPOSALS ----------------
router.post(
  "/direct",
  authenticateToken,
  [
    body("freelancer_id").isInt(),
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("proposed_price").isFloat({ min: 0.1 }),
    body("start_date").isISO8601(),
    body("end_date").isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.user.role !== "client") {
        return res.status(403).json({ error: "Only clients can send direct proposals" });
      }

      const { freelancer_id, title, description, proposed_price, start_date, end_date } = req.body;

      const freelancerCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'freelancer'",
        [freelancer_id]
      );
      if (freelancerCheck.rows.length === 0) {
        return res.status(404).json({ error: "Freelancer not found" });
      }

      const result = await pool.query(
        `INSERT INTO proposals (freelancer_id, client_id, proposal_type, proposal_text, proposed_price, start_date, end_date, status, created_at)
         VALUES ($1, $2, 'direct', $3, $4, $5, $6, 'pending', NOW())
         RETURNING id, proposed_price, status, created_at`,
        [freelancer_id, req.user.id, `${title}\n${description}`, proposed_price, start_date, end_date]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, proposal_id, type, message, is_read, created_at)
         VALUES ($1, $2, 'direct_proposal', $3, FALSE, NOW())`,
        [freelancer_id, result.rows[0].id, `${req.user.name} sent you a direct job proposal`]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      console.error("[v0] Direct proposal error:", err);
      res.status(500).json({ error: "Failed to send proposal" });
    }
  }
);

// ---------------- FREELANCER VIEW WITH PAGINATION ----------------
router.get("/my-proposals", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ error: "Only freelancers can view their proposals" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Count total
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM proposals WHERE freelancer_id = $1",
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get proposals
    const result = await pool.query(
      `SELECT p.id, p.project_id, p.proposal_type, p.proposal_text, p.proposed_price, p.start_date, p.end_date, p.status, p.created_at,
              u.name AS client_name, u.email AS client_email,
              pr.title AS project_title
       FROM proposals p
       JOIN users u ON p.client_id = u.id
       LEFT JOIN projects pr ON p.project_id = pr.id
       WHERE p.freelancer_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ 
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("[proposals] Get my proposals error:", err);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// ---------------- CLIENT VIEW WITH PAGINATION ----------------
router.get("/my-projects", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ error: "Only clients can view their projects" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Count total
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE client_id = $1",
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get projects with proposal count
    const result = await pool.query(
      `SELECT pr.id, pr.title, pr.description, pr.budget, pr.status, pr.deadline, pr.created_at,
              COUNT(p.id) AS proposal_count
       FROM projects pr
       LEFT JOIN proposals p ON pr.id = p.project_id
       WHERE pr.client_id = $1
       GROUP BY pr.id, pr.title, pr.description, pr.budget, pr.status, pr.deadline, pr.created_at
       ORDER BY pr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ 
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("[proposals] Get my projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ---------------- PROJECT PROPOSALS ----------------
router.get("/project/:project_id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.freelancer_id, p.proposal_text, p.proposed_price, p.delivery_time, p.status, p.created_at,
              u.name AS freelancer_name, u.email
       FROM proposals p
       JOIN users u ON p.freelancer_id = u.id
       WHERE p.project_id = $1 AND p.proposal_type = 'public'
       ORDER BY p.created_at DESC`,
      [req.params.project_id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error("[v0] Get project proposals error:", err);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// ---------------- ACCEPT / REJECT (transaction-safe) ----------------
router.put("/:proposal_id/:action", authenticateToken, async (req, res) => {
  const { proposal_id, action } = req.params;
  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the proposal row to avoid concurrent updates
    const { rows } = await client.query(
      `SELECT p.id, p.project_id, p.freelancer_id, p.client_id, p.proposed_price, p.proposal_type,
              p.start_date, p.end_date, p.status
       FROM proposals p
       WHERE p.id = $1
       FOR UPDATE`,
      [proposal_id]
    );
    if (rows.length === 0) {
      throw new Error("Proposal not found");
    }
    const proposal = rows[0];

    // Must be pending to process
    if (proposal.status !== "pending") {
      throw new Error("Proposal already processed");
    }

    // Role checks
    if (proposal.proposal_type === "direct" && req.user.id !== proposal.freelancer_id) {
      throw new Error("Only the freelancer can respond to direct proposals");
    }
    if (proposal.proposal_type === "public" && req.user.id !== proposal.client_id) {
      throw new Error("Only the client can accept/reject public proposals");
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    if (action === "accept") {
      // 1) Create contract
      const contractResult = await client.query(
        `INSERT INTO contracts (proposal_id, project_id, client_id, freelancer_id, amount, start_date, end_date, status, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'active',NOW())
        RETURNING id, project_id`,
        [
          proposal_id,
          proposal.project_id,   // ✅ include project_id here
          proposal.client_id,
          proposal.freelancer_id,
          proposal.proposed_price,
          proposal.start_date || null,
          proposal.end_date || null,
        ]
      );
      const contractId = contractResult.rows[0].id;

      // 2) Create escrow
      await client.query(
        `INSERT INTO escrow_transactions (contract_id, project_id, client_id, freelancer_id, amount, status, created_at)
         VALUES ($1,$2,$3,$4,$5,'pending_payment',NOW())`,
        [
          contractId,
          proposal.project_id || null,
          proposal.client_id,
          proposal.freelancer_id,
          proposal.proposed_price,
        ]
      );

      // 3) Update project (if public proposal)
      if (proposal.project_id) {
        await client.query(
          `UPDATE projects
             SET status = 'in_progress',
                 hired_freelancer_id = $1,
                 updated_at = NOW()
           WHERE id = $2`,
          [proposal.freelancer_id, proposal.project_id]
        );
      }
    }

    // 4) Only after all inserts succeed, update proposal status
    await client.query(
      "UPDATE proposals SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, proposal_id]
    );

    // Notify freelancer (inside the same transaction)
    await client.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'proposal', $2, FALSE, NOW())`,
      [proposal.freelancer_id, `Your proposal was ${newStatus}!`]
    );

    // Notify client if a direct proposal was accepted or rejected
    if (proposal.proposal_type === "direct") {
      const clientMessage =
        newStatus === "accepted"
          ? "Freelancer accepted your direct proposal"
          : "Freelancer rejected your direct proposal";

      await client.query(
        `INSERT INTO notifications (user_id, type, message, is_read, created_at)
        VALUES ($1, 'proposal', $2, FALSE, NOW())`,
        [proposal.client_id, clientMessage]
      );
    }

    await client.query("COMMIT");
    return res.json({ message: `Proposal ${newStatus}` });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[v1] Accept/reject proposal error:", err.message || err);
    return res.status(500).json({ error: "Failed to process proposal" });
  } finally {
    client.release();
  }
});


module.exports = router;
