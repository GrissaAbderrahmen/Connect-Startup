const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// ============== WALLET BALANCE ==============

// GET /api/wallet - Get current user's wallet
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ error: 'Only freelancers have wallets' });
        }

        // Get or create wallet
        let wallet = await pool.query(
            'SELECT * FROM wallets WHERE user_id = $1',
            [req.user.id]
        );

        if (wallet.rows.length === 0) {
            // Create wallet if doesn't exist
            wallet = await pool.query(
                'INSERT INTO wallets (user_id) VALUES ($1) RETURNING *',
                [req.user.id]
            );
        }

        res.json(wallet.rows[0]);
    } catch (err) {
        console.error('[wallet] Get wallet error:', err);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

// GET /api/wallet/transactions - Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ error: 'Only freelancers have wallets' });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get wallet
        const wallet = await pool.query(
            'SELECT id FROM wallets WHERE user_id = $1',
            [req.user.id]
        );

        if (wallet.rows.length === 0) {
            return res.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
        }

        const walletId = wallet.rows[0].id;

        // Count total
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = $1',
            [walletId]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get transactions
        const result = await pool.query(
            `SELECT id, type, amount, description, reference_type, reference_id, balance_after, created_at
       FROM wallet_transactions
       WHERE wallet_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [walletId, limit, offset]
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
        console.error('[wallet] Get transactions error:', err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// ============== WITHDRAWAL REQUESTS ==============

// Threshold for auto-approval (under this amount = instant)
const AUTO_APPROVE_THRESHOLD = 500;

// POST /api/wallet/withdraw - Request withdrawal
router.post('/withdraw', authenticateToken, [
    body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is 10 TND'),
    body('bank_name').notEmpty().withMessage('Bank name is required'),
    body('account_number').notEmpty().withMessage('Account number is required'),
    body('account_holder_name').notEmpty().withMessage('Account holder name is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ error: 'Only freelancers can withdraw' });
        }

        const { amount, bank_name, account_number, account_holder_name } = req.body;
        const amountNum = parseFloat(amount);
        const isAutoApprove = amountNum < AUTO_APPROVE_THRESHOLD;

        console.log(`[wallet] Withdrawal request: ${amountNum} TND, auto-approve: ${isAutoApprove}`);

        // Get wallet
        const wallet = await pool.query(
            'SELECT id, available_balance FROM wallets WHERE user_id = $1',
            [req.user.id]
        );

        if (wallet.rows.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const walletData = wallet.rows[0];

        // Check sufficient balance
        if (parseFloat(walletData.available_balance) < amount) {
            return res.status(400).json({
                error: `Insufficient balance. Available: ${walletData.available_balance} TND`
            });
        }

        // For large amounts (500+ TND), check for pending withdrawal
        // For small amounts (< 500 TND), allow multiple withdrawals
        if (!isAutoApprove) {
            const pendingCheck = await pool.query(
                `SELECT id FROM withdrawal_requests 
         WHERE wallet_id = $1 AND status IN ('pending', 'processing')`,
                [walletData.id]
            );

            if (pendingCheck.rows.length > 0) {
                return res.status(400).json({
                    error: 'You already have a pending withdrawal request for 500+ TND. Please wait for admin approval.'
                });
            }
        }

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create withdrawal request with appropriate status
            const withdrawalStatus = isAutoApprove ? 'completed' : 'pending';
            const processedAt = isAutoApprove ? 'NOW()' : 'NULL';

            const withdrawalResult = await client.query(
                `INSERT INTO withdrawal_requests 
         (wallet_id, amount, bank_name, account_number, account_holder_name, status, processed_at)
         VALUES ($1, $2, $3, $4, $5, $6, ${isAutoApprove ? 'NOW()' : 'NULL'})
         RETURNING id`,
                [walletData.id, amount, bank_name, account_number, account_holder_name, withdrawalStatus]
            );

            // Deduct from available balance
            const newBalance = parseFloat(walletData.available_balance) - amount;
            await client.query(
                `UPDATE wallets SET available_balance = $1, updated_at = NOW() WHERE id = $2`,
                [newBalance, walletData.id]
            );

            // Record transaction
            const description = isAutoApprove
                ? `Withdrawal completed to ${bank_name}`
                : `Withdrawal request to ${bank_name} (pending approval)`;

            await client.query(
                `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, description, reference_type, reference_id, balance_after)
         VALUES ($1, 'withdrawal', $2, $3, 'withdrawal', $4, $5)`,
                [walletData.id, -amount, description, withdrawalResult.rows[0].id, newBalance]
            );

            await client.query('COMMIT');

            // Different response based on auto-approve or not
            if (isAutoApprove) {
                res.status(201).json({
                    message: `Withdrawal of ${amount} TND completed successfully!`,
                    withdrawal_id: withdrawalResult.rows[0].id,
                    status: 'completed',
                    auto_approved: true
                });
            } else {
                res.status(201).json({
                    message: `Withdrawal request submitted. Amounts of ${AUTO_APPROVE_THRESHOLD}+ TND require admin approval.`,
                    withdrawal_id: withdrawalResult.rows[0].id,
                    status: 'pending',
                    auto_approved: false
                });
            }
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[wallet] Withdrawal request error:', err);
        res.status(500).json({ error: 'Failed to submit withdrawal request' });
    }
});

// GET /api/wallet/withdrawals - Get withdrawal history
router.get('/withdrawals', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ error: 'Only freelancers have wallets' });
        }

        // Get wallet
        const wallet = await pool.query(
            'SELECT id FROM wallets WHERE user_id = $1',
            [req.user.id]
        );

        if (wallet.rows.length === 0) {
            return res.json({ data: [] });
        }

        const result = await pool.query(
            `SELECT id, amount, bank_name, account_number, account_holder_name, status, admin_notes, processed_at, created_at
       FROM withdrawal_requests
       WHERE wallet_id = $1
       ORDER BY created_at DESC`,
            [wallet.rows[0].id]
        );

        res.json({ data: result.rows });
    } catch (err) {
        console.error('[wallet] Get withdrawals error:', err);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

// ============== INTERNAL: Credit wallet (called when escrow released) ==============

// This function is exported for use by escrow routes
const creditWallet = async (freelancerId, amount, description, referenceType, referenceId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get or create wallet
        let wallet = await client.query(
            'SELECT id, available_balance, total_earned FROM wallets WHERE user_id = $1',
            [freelancerId]
        );

        if (wallet.rows.length === 0) {
            wallet = await client.query(
                'INSERT INTO wallets (user_id) VALUES ($1) RETURNING id, available_balance, total_earned',
                [freelancerId]
            );
        }

        const walletData = wallet.rows[0];
        const newBalance = parseFloat(walletData.available_balance) + amount;
        const newTotalEarned = parseFloat(walletData.total_earned) + amount;

        // Update wallet
        await client.query(
            `UPDATE wallets 
       SET available_balance = $1, total_earned = $2, updated_at = NOW() 
       WHERE id = $3`,
            [newBalance, newTotalEarned, walletData.id]
        );

        // Record transaction
        await client.query(
            `INSERT INTO wallet_transactions 
       (wallet_id, type, amount, description, reference_type, reference_id, balance_after)
       VALUES ($1, 'credit', $2, $3, $4, $5, $6)`,
            [walletData.id, amount, description, referenceType, referenceId, newBalance]
        );

        await client.query('COMMIT');
        return { success: true, newBalance };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = router;
module.exports.creditWallet = creditWallet;
