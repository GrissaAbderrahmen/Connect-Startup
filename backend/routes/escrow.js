const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Feature flag check middleware
const paymentsEnabled = (req, res, next) => {
  if (process.env.ENABLE_PAYMENTS !== 'true') {
    return res.status(503).json({
      error: 'Payment features are currently disabled',
      message: 'This feature will be available soon'
    });
  }
  next();
};

// Apply to all escrow routes
router.use(paymentsEnabled);

// Get all escrows for current user (client or freelancer)
router.get('/my-escrows', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'client') {
      query = `
        SELECT e.id, e.contract_id, e.client_id, e.freelancer_id, e.amount, e.status, e.created_at,
               c.project_id, p.title as project_title, u.name as freelancer_name
        FROM escrow_transactions e
        JOIN contracts c ON e.contract_id = c.id
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN users u ON e.freelancer_id = u.id
        WHERE e.client_id = $1
        ORDER BY e.created_at DESC
      `;
    } else {
      query = `
        SELECT e.id, e.contract_id, e.client_id, e.freelancer_id, e.amount, e.status, e.created_at,
               c.project_id, p.title as project_title, u.name as client_name
        FROM escrow_transactions e
        JOIN contracts c ON e.contract_id = c.id
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN users u ON e.client_id = u.id
        WHERE e.freelancer_id = $1
        ORDER BY e.created_at DESC
      `;
    }

    const result = await pool.query(query, [userId]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('[escrow] Get my escrows error:', err);
    res.status(500).json({ error: 'Failed to fetch escrows' });
  }
});

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
      `SELECT client_id, freelancer_id FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrow = result.rows[0];

    if (escrow.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Only client can confirm payment' });
    }

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['payment_received', req.params.escrow_id]
    );

    // Notify freelancer
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [escrow.freelancer_id, `Client confirmed payment for escrow #${req.params.escrow_id}`]
    );

    res.json({ message: 'Payment confirmed' });
  } catch (err) {
    console.error('[escrow] Payment confirmation error:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Mark work as completed (freelancer completes)
router.put('/:escrow_id/work-completed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT client_id, freelancer_id FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrow = result.rows[0];

    if (escrow.freelancer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only freelancer can mark as complete' });
    }

    // Update escrow status
    await pool.query(
      `UPDATE escrow_transactions SET status = $1 WHERE id = $2`,
      ['work_completed', req.params.escrow_id]
    );

    // Notify client
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, 'escrow', $2, FALSE, NOW())`,
      [escrow.client_id, `Freelancer marked work as completed for escrow #${req.params.escrow_id}`]
    );

    res.json({ message: 'Work marked as completed' });
  } catch (err) {
    console.error('[escrow] Work completion error:', err);
    res.status(500).json({ error: 'Failed to mark work complete' });
  }
});

// Release funds (client approves and releases to freelancer)
router.put('/:escrow_id/release-funds', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, client_id, freelancer_id, amount, status, contract_id FROM escrow_transactions WHERE id = $1`,
      [req.params.escrow_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrow = result.rows[0];

    if (escrow.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Only client can release funds' });
    }

    if (escrow.status !== 'work_completed') {
      return res.status(400).json({ error: 'Can only release funds after work is completed' });
    }

    // Start transaction to update escrow and credit wallet
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update escrow status
      await client.query(
        `UPDATE escrow_transactions SET status = 'funds_released' WHERE id = $1`,
        [escrow.id]
      );

      // Mark contract as completed
      await client.query(
        `UPDATE contracts SET status = 'completed', updated_at = NOW() WHERE id = $1`,
        [escrow.contract_id]
      );

      // Credit freelancer wallet
      // Get or create wallet
      let wallet = await client.query(
        'SELECT id, available_balance, total_earned FROM wallets WHERE user_id = $1',
        [escrow.freelancer_id]
      );

      if (wallet.rows.length === 0) {
        wallet = await client.query(
          'INSERT INTO wallets (user_id) VALUES ($1) RETURNING id, available_balance, total_earned',
          [escrow.freelancer_id]
        );
      }

      const walletData = wallet.rows[0];
      const amount = parseFloat(escrow.amount);
      const newBalance = parseFloat(walletData.available_balance) + amount;
      const newTotalEarned = parseFloat(walletData.total_earned) + amount;

      // Update wallet balance
      await client.query(
        `UPDATE wallets 
         SET available_balance = $1, total_earned = $2, updated_at = NOW() 
         WHERE id = $3`,
        [newBalance, newTotalEarned, walletData.id]
      );

      // Record wallet transaction
      await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, description, reference_type, reference_id, balance_after)
         VALUES ($1, 'credit', $2, $3, 'escrow', $4, $5)`,
        [walletData.id, amount, `Payment for contract #${escrow.contract_id}`, escrow.id, newBalance]
      );

      // Notify freelancer
      await client.query(
        `INSERT INTO notifications (user_id, type, message, is_read, created_at)
         VALUES ($1, 'wallet', $2, FALSE, NOW())`,
        [escrow.freelancer_id, `${amount.toFixed(2)} TND has been added to your wallet!`]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Funds released to freelancer wallet',
        amount_credited: amount
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[escrow] Release funds error:', err);
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
