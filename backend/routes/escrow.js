const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Get escrow status for a contract
router.get('/contract/:contract_id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, contract_id, client_id, freelancer_id, amount, status, created_at
       FROM escrow_transactions
       WHERE contract_id = $1`,
      [req.params.contract_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No escrow found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[v0] Get escrow error:', err);
    res.status(500).json({ error: 'Failed to fetch escrow' });
  }
});


// Mark escrow as payment received (mock - client payment confirmed)
router.put('/:escrow_id/payment-confirmed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT client_id FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (result.rows[0].client_id !== req.user.id) {
      return res.status(403).json({ error: 'Only client can confirm payment' });
    }

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['payment_received', req.params.escrow_id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [result.rows[0].freelancer_id, `Client confirmed payment for escrow #${req.params.escrow_id}`]
    );


    res.json({ message: 'Payment confirmed' });
  } catch (err) {
    console.error('[v0] Payment confirmation error:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Mark work as completed (freelancer completes)
router.put('/:escrow_id/work-completed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT freelancer_id FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (result.rows[0].freelancer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only freelancer can mark as complete' });
    }

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['work_completed', req.params.escrow_id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [result.rows[0].client_id, `Freelancer marked work as completed for escrow #${req.params.escrow_id}`]
    );


    res.json({ message: 'Work marked as completed' });
  } catch (err) {
    console.error('[v0] Work completion error:', err);
    res.status(500).json({ error: 'Failed to mark work complete' });
  }
});

// Release funds (client approves and releases to freelancer)
router.put('/:escrow_id/release-funds', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT client_id, status FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (result.rows[0].client_id !== req.user.id) {
      return res.status(403).json({ error: 'Only client can release funds' });
    }

    if (result.rows[0].status !== 'work_completed') {
      return res.status(400).json({ error: 'Can only release funds after work is completed' });
    }

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['funds_released', req.params.escrow_id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [result.rows[0].freelancer_id, `Client released funds for escrow #${req.params.escrow_id}`]
    );


    res.json({ message: 'Funds released to freelancer' });
  } catch (err) {
    console.error('[v0] Release funds error:', err);
    res.status(500).json({ error: 'Failed to release funds' });
  }
});

// Deposit escrow (client funds escrow)
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { contract_id, amount } = req.body;

    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can deposit escrow' });
    }

    const contractCheck = await pool.query(
      `SELECT id, project_id, client_id, freelancer_id
       FROM contracts WHERE id = $1`,
      [contract_id]
    );
    if (contractCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    const contract = contractCheck.rows[0];

    const result = await pool.query(
      `INSERT INTO escrow_transactions (contract_id, project_id, client_id, freelancer_id, amount, status, created_at)
      VALUES ($1,$2,$3,$4,$5,'pending_payment',NOW())
      RETURNING id`,
      [
        contract.id,
        contract.project_id,   // ✅ pass project_id here
        contract.client_id,
        contract.freelancer_id,
        amount,
      ]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [contract.freelancer_id, `Client deposited escrow for contract #${contract.id}`]
    );


    res.json({ message: 'Escrow deposited', escrow_id: result.rows[0].id });
  } catch (err) {
    console.error('[v0] Escrow deposit error:', err);
    res.status(500).json({ error: 'Failed to deposit escrow' });
  }
});

// Get escrow transactions by contract
router.get('/contract/:contract_id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, contract_id, client_id, freelancer_id, amount, status, created_at, updated_at
       FROM escrow_transactions
       WHERE contract_id = $1
       ORDER BY created_at DESC`,
      [req.params.contract_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No escrow found for this contract' });
    }

    res.json({ data: result.rows });
  } catch (err) {
    console.error('[v0] Get escrow by contract error:', err);
    res.status(500).json({ error: 'Failed to fetch escrow transactions' });
  }
});

// Raise a dispute
router.put('/:escrow_id/dispute', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT client_id, freelancer_id, status 
       FROM escrow_transactions 
       WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrow = result.rows[0];

    // Only client or freelancer can raise dispute
    if (![escrow.client_id, escrow.freelancer_id].includes(req.user.id)) {
      return res.status(403).json({ error: 'Only client or freelancer can raise dispute' });
    }

    // Prevent disputes if funds already released or refunded
    if (['funds_released', 'refunded'].includes(escrow.status)) {
      return res.status(400).json({ error: 'Cannot dispute after funds have been released or refunded' });
    }

    // Update status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['disputed', req.params.escrow_id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [escrow.client_id, `Dispute raised on escrow #${req.params.escrow_id}`]
    );
    
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [escrow.freelancer_id, `Dispute raised on escrow #${req.params.escrow_id}`]
    );


    res.json({ message: 'Dispute raised' });
  } catch (err) {
    console.error('[v0] Dispute error:', err);
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
});

// Refund escrow
router.put('/:escrow_id/refund', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT client_id, status 
       FROM escrow_transactions 
       WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrow = result.rows[0];

    // Only client or admin can refund
    if (req.user.id !== escrow.client_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only client or admin can refund' });
    }

    // Refund allowed only if payment was received but not released, or disputed
    if (!['payment_received', 'disputed'].includes(escrow.status)) {
      return res.status(400).json({ 
        error: 'Refund only allowed if payment was received but not released, or if disputed' 
      });
    }

    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['refunded', req.params.escrow_id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [escrow.client_id, `Refund processed for escrow #${req.params.escrow_id}`]
    );


    res.json({ message: 'Escrow refunded to client' });
  } catch (err) {
    console.error('[v0] Refund error:', err);
    res.status(500).json({ error: 'Failed to refund escrow' });
  }
});


module.exports = router;
