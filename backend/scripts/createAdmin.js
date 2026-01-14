// scripts/createAdmin.js - Run with: node scripts/createAdmin.js (from backend folder)
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});
try {
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
            INSERT INTO users (name, email, password_hash, role, email_verified, created_at, updated_at)
            VALUES ($1, $2, $3, 'admin', true, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
                role = 'admin',
                password_hash = $3,
                email_verified = true,
                updated_at = NOW()
            RETURNING id, name, email, role
        `, ['Platform Admin', 'admin@connect-platform.com', hashedPassword]);

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@connect-platform.com');
    console.log('   Password: Admin123!');
    console.log('   User:', result.rows[0]);

    process.exit(0);
} catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
}


createAdmin();
