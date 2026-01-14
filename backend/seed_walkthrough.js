const pool = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {
    console.log("🌱 Starting Walkthrough Demo Seeding...");
    const client = await pool.connect();

    try {
        // 1. Clear existing data in correct order
        console.log("🗑️  Cleaning up old data...");
        await client.query("TRUNCATE TABLE notifications, messages, ratings, escrow_transactions, wallet_transactions, withdrawal_requests, wallets, contracts, proposals, projects, freelancer_profiles, client_profiles, users RESTART IDENTITY CASCADE");

        // 2. Hash Passwords
        const commonPassword = await bcrypt.hash("Password123!", 10);
        const adminPassword = await bcrypt.hash("Admin123!", 10);

        // 3. Create Admin
        console.log("👑 Creating Admin...");
        const adminRes = await client.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            ["Admin Connect", "admin@connect-platform.com", adminPassword, "admin", true]
        );

        // 4. Create Clients
        console.log("💼 Creating Clients...");
        const c1 = await client.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            ["Sami Ben Ali", "sami@tech.tn", commonPassword, "client", true]
        );
        const c2 = await client.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            ["Lina Mansour", "lina@startup.tn", commonPassword, "client", true]
        );

        await client.query("INSERT INTO client_profiles (user_id, company_name) VALUES ($1, $2), ($3, $4)",
            [c1.rows[0].id, "Tech Solutions TN", c2.rows[0].id, "Lina Startup Lab"]);

        // 5. Create Freelancers
        console.log("🛠️  Creating Freelancers...");
        const f1 = await client.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            ["Mehdi Dev", "mehdi@dev.tn", commonPassword, "freelancer", true]
        );
        const f2 = await client.query(
            "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            ["Yasmine Design", "yasmine@design.tn", commonPassword, "freelancer", true]
        );

        // 6. Create Freelancer Profiles
        await client.query(
            "INSERT INTO freelancer_profiles (user_id, bio, skills, hourly_rate, portfolio_url) VALUES ($1, $2, $3, $4, $5)",
            [f1.rows[0].id, "Expert Full Stack Developer with focus on Node.js and React.", JSON.stringify(["React", "Node.js", "PostgreSQL", "Docker"]), 60, "https://mehdi.dev"]
        );
        await client.query(
            "INSERT INTO freelancer_profiles (user_id, bio, skills, hourly_rate, portfolio_url) VALUES ($1, $2, $3, $4, $5)",
            [f2.rows[0].id, "Award winning UI/UX Designer specializing in SaaS products.", JSON.stringify(["Figma", "UI/UX", "Tailwind", "Motion Design"]), 50, "https://yasmine.design"]
        );

        // 7. Create Wallets (Triggers might handle this but let's be explicit if needed)
        // Note: The trigger trigger_create_wallet in migration 003 should handle this.
        // Let's assume they exist and update balances.
        await client.query("UPDATE wallets SET available_balance = 550.00, total_earned = 1200.00 WHERE user_id = $1", [f1.rows[0].id]);
        await client.query("UPDATE wallets SET available_balance = 150.00, total_earned = 800.00 WHERE user_id = $2", [f2.rows[0].id]);

        // 8. Create Projects
        console.log("🚀 Creating Projects...");
        const p1 = await client.query(
            "INSERT INTO projects (client_id, title, description, budget, category, status, required_skills) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [c1.rows[0].id, "E-commerce Platform for Jewelry", "We need a complete e-commerce solution with Tunisian payment gateway integration.", 3500, "Web Development", "in_progress", JSON.stringify(["React", "Node.js", "Konnect"])]
        );
        const p2 = await client.query(
            "INSERT INTO projects (client_id, title, description, budget, category, status, required_skills) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [c2.rows[0].id, "Mobile App UI/UX Design", "Design for a new food delivery app in Tunis.", 1200, "Design & Creative", "completed", JSON.stringify(["Figma", "Mobile Design"])]
        );
        const p3 = await client.query(
            "INSERT INTO projects (client_id, title, description, budget, category, status, required_skills) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [c2.rows[0].id, "Backend API Optimization", "Refactoring an existing Express API for better performance.", 800, "Web Development", "open", JSON.stringify(["Node.js", "Redis"])]
        );

        // 9. Create Proposals
        console.log("📄 Creating Proposals...");
        const prop1 = await client.query(
            "INSERT INTO proposals (project_id, freelancer_id, client_id, proposal_text, proposed_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [p1.rows[0].id, f1.rows[0].id, c1.rows[0].id, "I have extensive experience with Tunisian payment systems.", 3400, "accepted"]
        );
        const prop2 = await client.query(
            "INSERT INTO proposals (project_id, freelancer_id, client_id, proposal_text, proposed_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [p2.rows[0].id, f2.rows[0].id, c2.rows[0].id, "I can deliver a modern, high-converting design.", 1200, "accepted"]
        );

        // 10. Create Contracts
        console.log("📝 Creating Contracts...");
        const cont1 = await client.query(
            "INSERT INTO contracts (project_id, proposal_id, client_id, freelancer_id, amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [p1.rows[0].id, prop1.rows[0].id, c1.rows[0].id, f1.rows[0].id, 3400, "active"]
        );
        const cont2 = await client.query(
            "INSERT INTO contracts (project_id, proposal_id, client_id, freelancer_id, amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [p2.rows[0].id, prop2.rows[0].id, c2.rows[0].id, f2.rows[0].id, 1200, "completed"]
        );

        // Update projects with hired freelancer
        await client.query("UPDATE projects SET hired_freelancer_id = $1 WHERE id = $2", [f1.rows[0].id, p1.rows[0].id]);
        await client.query("UPDATE projects SET hired_freelancer_id = $1 WHERE id = $2", [f2.rows[0].id, p2.rows[0].id]);

        // 11. Create Escrow Transactions
        console.log("💰 Creating Escrow...");
        // Active escrow
        await client.query(
            "INSERT INTO escrow_transactions (project_id, contract_id, client_id, freelancer_id, amount, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [p1.rows[0].id, cont1.rows[0].id, c1.rows[0].id, f1.rows[0].id, 3400, "payment_received"]
        );
        // Completed escrow
        await client.query(
            "INSERT INTO escrow_transactions (project_id, contract_id, client_id, freelancer_id, amount, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [p2.rows[0].id, cont2.rows[0].id, c2.rows[0].id, f2.rows[0].id, 1200, "funds_released"]
        );
        // Disputed escrow (for demo)
        const pDispute = await client.query(
            "INSERT INTO projects (client_id, title, description, budget, category, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [c1.rows[0].id, "Fixing buggy Auth system", "Need someone to fix my login issues.", 500, "Web Development", "in_progress"]
        );
        await client.query(
            "INSERT INTO escrow_transactions (project_id, client_id, freelancer_id, amount, status) VALUES ($1, $2, $3, $4, $5)",
            [pDispute.rows[0].id, c1.rows[0].id, f2.rows[0].id, 500, "disputed"]
        );

        // 12. Create Withdrawals
        console.log("🏦 Creating Withdrawals...");
        const w1 = await client.query("SELECT id FROM wallets WHERE user_id = $1", [f1.rows[0].id]);
        const w2 = await client.query("SELECT id FROM wallets WHERE user_id = $2", [f2.rows[0].id]);

        // Pending large withdrawal (Needs Admin)
        await client.query(
            "INSERT INTO withdrawal_requests (wallet_id, amount, bank_name, account_number, account_holder_name, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [w1.rows[0].id, 600, "BIAT", "TN123456789012345678", "Mehdi Dev", "pending"]
        );
        // Completed small withdrawal
        await client.query(
            "INSERT INTO withdrawal_requests (wallet_id, amount, bank_name, account_number, account_holder_name, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [w2.rows[0].id, 50, "STB", "TN8877665544332211", "Yasmine Design", "completed"]
        );

        // 13. Create Ratings
        console.log("⭐ Creating Ratings...");
        await client.query(
            "INSERT INTO ratings (project_id, freelancer_id, client_id, rating, review_text) VALUES ($1, $2, $3, $4, $5)",
            [p2.rows[0].id, f2.rows[0].id, c2.rows[0].id, 5, "Amazing designer! Lina did a fantastic job on our mobile app UI. Highly recommended."]
        );

        // 14. Messages
        console.log("💬 Creating Messages...");
        await client.query(
            "INSERT INTO messages (sender_id, recipient_id, message_text, project_id) VALUES ($1, $2, $3, $4), ($2, $1, $5, $4)",
            [c1.rows[0].id, f1.rows[0].id, "Hello Mehdi, can we start on the payment integration?", p1.rows[0].id, "Sure! I am checking the documentation for Konnect."]
        );

        console.log("✅ SEEDING COMPLETE!");
        console.log("Credentials for Demo:");
        console.log("- Admin: admin@connect-platform.com / Admin123!");
        console.log("- Client: sami@tech.tn / Password123!");
        console.log("- Freelancer: mehdi@dev.tn / Password123!");

    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
