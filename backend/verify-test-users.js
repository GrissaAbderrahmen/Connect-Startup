// verify-test-users.js - Temporary script to verify test users
const pool = require('./config/db');

async function verifyTestUsers() {
    try {
        const result = await pool.query(
            `UPDATE users SET is_verified = true 
       WHERE email IN ('freelancer1@test.com', 'client1@test.com', 'ahmed.client@test.com', 'sami.freelancer@test.com')
       RETURNING id, email, name, role, is_verified`
        );

        console.log('Verified users:');
        result.rows.forEach(user => {
            console.log(`  - ${user.email} (${user.role}): verified = ${user.is_verified}`);
        });

        if (result.rows.length === 0) {
            console.log('No test users found to verify');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error verifying users:', err);
        process.exit(1);
    }
}

verifyTestUsers();
