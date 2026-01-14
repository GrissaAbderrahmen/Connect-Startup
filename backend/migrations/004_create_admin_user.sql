-- Create Admin User for Connect Platform
-- Run this SQL in your PostgreSQL database to create the admin account

-- Password: Admin123! (hashed with bcrypt)
-- You can generate a new hash using: npx bcrypt-cli "YourPassword" 10

INSERT INTO users (name, email, password_hash, role, email_verified, created_at, updated_at)
VALUES (
  'Platform Admin',
  'admin@connect-platform.com',
  '$2b$10$N7HxJGnKVELQqt8JfMzQh.7w3cKq5JnH8F0xKxB/M0c6dX4ZM5hWi',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  email_verified = true,
  updated_at = NOW();

-- Verify the admin user was created
SELECT id, name, email, role, email_verified FROM users WHERE email = 'admin@connect-platform.com';
