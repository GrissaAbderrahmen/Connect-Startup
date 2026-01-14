-- ============================================
-- Wallet System Migration for Connect
-- Adds freelancer wallet and withdrawal support
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Wallets table (one per freelancer)
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet transactions (credits, debits, withdrawals)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'withdrawal', 'fee')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),  -- 'escrow', 'withdrawal', etc
    reference_id INTEGER,        -- escrow_id, withdrawal_id, etc
    balance_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    admin_notes TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups (IF NOT EXISTS is PostgreSQL 9.5+)
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_wallet_id ON withdrawal_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Create wallets for existing freelancers (safe - uses ON CONFLICT)
INSERT INTO wallets (user_id)
SELECT id FROM users WHERE role = 'freelancer'
ON CONFLICT (user_id) DO NOTHING;

-- Optional: Function to auto-create wallet for new freelancers
-- (Only creates if it doesn't already exist)
CREATE OR REPLACE FUNCTION create_wallet_for_freelancer()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'freelancer' THEN
        INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create wallet on freelancer signup
DROP TRIGGER IF EXISTS trigger_create_wallet ON users;
CREATE TRIGGER trigger_create_wallet
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_freelancer();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Wallet system tables created successfully!';
END $$;
