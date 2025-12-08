const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/db");

const router = express.Router();

// ---------------- GET ALL CONTRACTS WITH PAGINATION ----------------
router.get("/my-contracts", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let countQuery, dataQuery, params;

    if (req.user.role === "client") {
      countQuery = "SELECT COUNT(*) FROM contracts WHERE client_id = $1";
      dataQuery = `
        SELECT c.id, c.proposal_id, c.amount, c.start_date, c.end_date, c.milestones::json AS milestones, c.status, c.created_at,
               u.id AS other_user_id, u.name AS other_user_name, u.email AS other_user_email,
               p.proposal_text AS job_description,
               pr.title AS project_title
        FROM contracts c
        JOIN proposals p ON c.proposal_id = p.id
        JOIN projects pr ON c.project_id = pr.id
        JOIN users u ON c.freelancer_id = u.id
        WHERE c.client_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [req.user.id];
    } else {
      countQuery = "SELECT COUNT(*) FROM contracts WHERE freelancer_id = $1";
      dataQuery = `
        SELECT c.id, c.proposal_id, c.amount, c.start_date, c.end_date, c.milestones::json AS milestones, c.status, c.created_at,
               u.id AS other_user_id, u.name AS other_user_name, u.email AS other_user_email,
               p.proposal_text AS job_description,
               pr.title AS project_title
        FROM contracts c
        JOIN proposals p ON c.proposal_id = p.id
        JOIN projects pr ON c.project_id = pr.id
        JOIN users u ON c.client_id = u.id
        WHERE c.freelancer_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [req.user.id];
    }

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(dataQuery, [...params, limit, offset]);

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
    console.error("[contracts] Get contracts error:", err);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
});

// Get details of a specific contract
router.get("/:contract_id", authenticateToken, async (req, res) => {
  try {
    const contractId = parseInt(req.params.contract_id, 10);
    const userId = req.user.id;

    if (isNaN(contractId)) {
      return res.status(400).json({ error: "Invalid contract ID" });
    }

    const contractResult = await pool.query(
      `SELECT c.*, p.proposal_text,
              CASE
                WHEN c.client_id = $1 THEN u_f.id
                ELSE u_c.id
              END AS other_user_id,
              CASE
                WHEN c.client_id = $1 THEN u_f.name
                ELSE u_c.name
              END AS other_user_name,
              CASE
                WHEN c.client_id = $1 THEN u_f.email
                ELSE u_c.email
              END AS other_user_email
       FROM contracts c
       JOIN proposals p ON c.proposal_id = p.id
       JOIN users u_c ON c.client_id = u_c.id
       JOIN users u_f ON c.freelancer_id = u_f.id
       WHERE c.id = $2 AND (c.client_id = $1 OR c.freelancer_id = $1)`,
      [userId, contractId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(contractResult.rows[0]);
  } catch (err) {
    console.error("[v0] Get contract detail error:", err);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
});

// ---------------- MARK CONTRACT AS COMPLETED ----------------
router.put("/:contract_id/complete", authenticateToken, async (req, res) => {
  try {
    const contractId = parseInt(req.params.contract_id, 10);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "Invalid contract ID" });
    }

    const contractCheck = await pool.query(
      "SELECT id, client_id, freelancer_id, status FROM contracts WHERE id = $1",
      [contractId]
    );

    if (contractCheck.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const contract = contractCheck.rows[0];

    if (req.user.id !== contract.client_id) {
      return res.status(403).json({ error: "Only the client can mark contract as completed" });
    }

    if (contract.status === "completed") {
      return res.status(400).json({ error: "Contract already completed" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({ error: "Can only complete active contracts" });
    }

    await client.query("BEGIN");

    await pool.query(
      "UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2",
      ["completed", contractId]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
       VALUES ($1, 'contract', $2, FALSE, NOW())`,
      [contract.client_id, `You marked contract #${contractId} as completed`]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
       VALUES ($1, 'contract', $2, FALSE, NOW())`,
      [contract.freelancer_id, `Client marked contract #${contractId} as completed`]
    );

    await client.query("COMMIT");

    res.json({ message: "Contract marked as completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[contracts] Complete contract error:", err);
    res.status(500).json({ error: "Failed to complete contract" });
  }
});

module.exports = router;
