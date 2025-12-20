const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ============== DASHBOARD STATS ==============

// GET /api/admin/dashboard - Get platform statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get user counts
        const userStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE role = 'client') as total_clients,
                COUNT(*) FILTER (WHERE role = 'freelancer') as total_freelancers,
                COUNT(*) as total_users
            FROM users
            WHERE role != 'admin'
        `);

        // Get project stats
        const projectStats = await pool.query(`
            SELECT 
                COUNT(*) as total_projects,
                COUNT(*) FILTER (WHERE status = 'open') as open_projects,
                COUNT(*) FILTER (WHERE status = 'in_progress') as active_projects,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_projects
            FROM projects
        `);

        // Get contract stats
        const contractStats = await pool.query(`
            SELECT 
                COUNT(*) as total_contracts,
                COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_contracts
            FROM contracts
        `);

        // Get escrow stats
        const escrowStats = await pool.query(`
            SELECT 
                COUNT(*) as total_escrows,
                COALESCE(SUM(amount) FILTER (WHERE status = 'funds_released'), 0) as total_released,
                COALESCE(SUM(amount) FILTER (WHERE status IN ('payment_received', 'work_completed')), 0) as total_in_escrow,
                COUNT(*) FILTER (WHERE status = 'disputed') as active_disputes
            FROM escrow_transactions
        `);

        // Get pending withdrawals count (500+ TND)
        const pendingWithdrawals = await pool.query(`
            SELECT COUNT(*) as pending_count, COALESCE(SUM(amount), 0) as pending_amount
            FROM withdrawal_requests
            WHERE status = 'pending'
        `);

        // Recent activity (last 7 days)
        const recentStats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days' AND role != 'admin') as new_users,
                (SELECT COUNT(*) FROM projects WHERE created_at > NOW() - INTERVAL '7 days') as new_projects,
                (SELECT COUNT(*) FROM contracts WHERE created_at > NOW() - INTERVAL '7 days') as new_contracts
        `);

        res.json({
            users: {
                total: parseInt(userStats.rows[0].total_users),
                clients: parseInt(userStats.rows[0].total_clients),
                freelancers: parseInt(userStats.rows[0].total_freelancers)
            },
            projects: {
                total: parseInt(projectStats.rows[0].total_projects),
                open: parseInt(projectStats.rows[0].open_projects),
                active: parseInt(projectStats.rows[0].active_projects),
                completed: parseInt(projectStats.rows[0].completed_projects)
            },
            contracts: {
                total: parseInt(contractStats.rows[0].total_contracts),
                active: parseInt(contractStats.rows[0].active_contracts),
                completed: parseInt(contractStats.rows[0].completed_contracts)
            },
            escrow: {
                total: parseInt(escrowStats.rows[0].total_escrows),
                totalReleased: parseFloat(escrowStats.rows[0].total_released),
                totalInEscrow: parseFloat(escrowStats.rows[0].total_in_escrow),
                activeDisputes: parseInt(escrowStats.rows[0].active_disputes)
            },
            withdrawals: {
                pendingCount: parseInt(pendingWithdrawals.rows[0].pending_count),
                pendingAmount: parseFloat(pendingWithdrawals.rows[0].pending_amount)
            },
            recent: {
                newUsers: parseInt(recentStats.rows[0].new_users),
                newProjects: parseInt(recentStats.rows[0].new_projects),
                newContracts: parseInt(recentStats.rows[0].new_contracts)
            }
        });
    } catch (err) {
        console.error('[admin] Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// ============== WITHDRAWAL MANAGEMENT ==============

// GET /api/admin/withdrawals - Get all withdrawal requests
router.get('/withdrawals', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const status = req.query.status || 'pending'; // pending, completed, rejected, all

        let query = `
            SELECT wr.*, w.user_id, u.name as user_name, u.email as user_email
            FROM withdrawal_requests wr
            JOIN wallets w ON wr.wallet_id = w.id
            JOIN users u ON w.user_id = u.id
        `;

        if (status !== 'all') {
            query += ` WHERE wr.status = $1`;
        }

        query += ` ORDER BY wr.created_at DESC`;

        const result = status !== 'all'
            ? await pool.query(query, [status])
            : await pool.query(query);

        res.json({ data: result.rows });
    } catch (err) {
        console.error('[admin] Get withdrawals error:', err);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

// PUT /api/admin/withdrawals/:id/approve - Approve withdrawal
router.put('/withdrawals/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const withdrawalId = parseInt(req.params.id);
        const { admin_notes } = req.body;

        // Get withdrawal
        const withdrawal = await pool.query(
            'SELECT * FROM withdrawal_requests WHERE id = $1',
            [withdrawalId]
        );

        if (withdrawal.rows.length === 0) {
            return res.status(404).json({ error: 'Withdrawal request not found' });
        }

        if (withdrawal.rows[0].status !== 'pending') {
            return res.status(400).json({ error: 'Withdrawal is not pending' });
        }

        // Update withdrawal status
        await pool.query(
            `UPDATE withdrawal_requests 
             SET status = 'completed', processed_at = NOW(), admin_notes = $1
             WHERE id = $2`,
            [admin_notes || 'Approved by admin', withdrawalId]
        );

        res.json({ message: 'Withdrawal approved successfully' });
    } catch (err) {
        console.error('[admin] Approve withdrawal error:', err);
        res.status(500).json({ error: 'Failed to approve withdrawal' });
    }
});

// PUT /api/admin/withdrawals/:id/reject - Reject withdrawal
router.put('/withdrawals/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const withdrawalId = parseInt(req.params.id);
        const { admin_notes } = req.body;

        if (!admin_notes) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        // Get withdrawal
        const withdrawal = await pool.query(
            'SELECT * FROM withdrawal_requests WHERE id = $1',
            [withdrawalId]
        );

        if (withdrawal.rows.length === 0) {
            return res.status(404).json({ error: 'Withdrawal request not found' });
        }

        if (withdrawal.rows[0].status !== 'pending') {
            return res.status(400).json({ error: 'Withdrawal is not pending' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update withdrawal status
            await client.query(
                `UPDATE withdrawal_requests 
                 SET status = 'rejected', processed_at = NOW(), admin_notes = $1
                 WHERE id = $2`,
                [admin_notes, withdrawalId]
            );

            // Refund the amount back to wallet
            await client.query(
                `UPDATE wallets 
                 SET available_balance = available_balance + $1, updated_at = NOW()
                 WHERE id = $2`,
                [withdrawal.rows[0].amount, withdrawal.rows[0].wallet_id]
            );

            // Record refund transaction
            const wallet = await client.query(
                'SELECT available_balance FROM wallets WHERE id = $1',
                [withdrawal.rows[0].wallet_id]
            );

            await client.query(
                `INSERT INTO wallet_transactions 
                 (wallet_id, type, amount, description, reference_type, reference_id, balance_after)
                 VALUES ($1, 'credit', $2, $3, 'withdrawal_refund', $4, $5)`,
                [
                    withdrawal.rows[0].wallet_id,
                    withdrawal.rows[0].amount,
                    `Withdrawal rejected: ${admin_notes}`,
                    withdrawalId,
                    wallet.rows[0].available_balance
                ]
            );

            await client.query('COMMIT');
            res.json({ message: 'Withdrawal rejected and amount refunded' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[admin] Reject withdrawal error:', err);
        res.status(500).json({ error: 'Failed to reject withdrawal' });
    }
});

// ============== USER MANAGEMENT ==============

// GET /api/admin/users - Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, name, email, role, is_verified, created_at,
                   (SELECT COUNT(*) FROM projects WHERE client_id = users.id) as project_count,
                   (SELECT COUNT(*) FROM contracts WHERE client_id = users.id OR freelancer_id = users.id) as contract_count
            FROM users
            WHERE role != 'admin'
        `;
        const params = [];

        if (role && ['client', 'freelancer'].includes(role)) {
            params.push(role);
            query += ` AND role = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
        }

        // Count total
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('[admin] Get users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await pool.query(
            `SELECT id, name, email, role, is_verified, created_at
             FROM users WHERE id = $1 AND role != 'admin'`,
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user stats
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM projects WHERE client_id = $1) as projects_created,
                (SELECT COUNT(*) FROM proposals WHERE freelancer_id = $1) as proposals_sent,
                (SELECT COUNT(*) FROM contracts WHERE client_id = $1 OR freelancer_id = $1) as contracts,
                (SELECT COALESCE(SUM(amount), 0) FROM escrow_transactions WHERE client_id = $1 AND status = 'funds_released') as total_spent,
                (SELECT COALESCE(SUM(amount), 0) FROM escrow_transactions WHERE freelancer_id = $1 AND status = 'funds_released') as total_earned
        `, [userId]);

        res.json({
            ...user.rows[0],
            stats: {
                projectsCreated: parseInt(stats.rows[0].projects_created),
                proposalsSent: parseInt(stats.rows[0].proposals_sent),
                contracts: parseInt(stats.rows[0].contracts),
                totalSpent: parseFloat(stats.rows[0].total_spent),
                totalEarned: parseFloat(stats.rows[0].total_earned)
            }
        });
    } catch (err) {
        console.error('[admin] Get user detail error:', err);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// ============== DISPUTE MANAGEMENT ==============

// GET /api/admin/disputes - Get all disputes
router.get('/disputes', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, 
                   c.id as contract_id,
                   uc.name as client_name, uc.email as client_email,
                   uf.name as freelancer_name, uf.email as freelancer_email,
                   p.title as project_title
            FROM escrow_transactions e
            JOIN contracts c ON e.contract_id = c.id
            JOIN projects p ON c.project_id = p.id
            JOIN users uc ON e.client_id = uc.id
            JOIN users uf ON e.freelancer_id = uf.id
            WHERE e.status = 'disputed'
            ORDER BY e.created_at DESC
        `);

        res.json({ data: result.rows });
    } catch (err) {
        console.error('[admin] Get disputes error:', err);
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
});

// PUT /api/admin/disputes/:id/resolve - Resolve dispute
router.put('/disputes/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        const { resolution, refund_to_client } = req.body;
        // resolution: 'release_to_freelancer' or 'refund_to_client'

        const escrow = await pool.query(
            'SELECT * FROM escrow_transactions WHERE id = $1 AND status = $2',
            [escrowId, 'disputed']
        );

        if (escrow.rows.length === 0) {
            return res.status(404).json({ error: 'Disputed escrow not found' });
        }

        const escrowData = escrow.rows[0];

        if (refund_to_client) {
            // Refund to client (would be implemented with payment gateway)
            await pool.query(
                `UPDATE escrow_transactions SET status = 'refunded' WHERE id = $1`,
                [escrowId]
            );
            res.json({ message: 'Dispute resolved: Refunded to client' });
        } else {
            // Release to freelancer
            const { creditWallet } = require('./wallet');
            await creditWallet(
                escrowData.freelancer_id,
                parseFloat(escrowData.amount),
                'Dispute resolved in your favor',
                'escrow',
                escrowData.id
            );

            await pool.query(
                `UPDATE escrow_transactions SET status = 'funds_released' WHERE id = $1`,
                [escrowId]
            );

            await pool.query(
                `UPDATE contracts SET status = 'completed' WHERE id = $1`,
                [escrowData.contract_id]
            );

            res.json({ message: 'Dispute resolved: Released to freelancer' });
        }
    } catch (err) {
        console.error('[admin] Resolve dispute error:', err);
        res.status(500).json({ error: 'Failed to resolve dispute' });
    }
});

module.exports = router;
