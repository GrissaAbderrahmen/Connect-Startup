const pool = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {
    console.log("🌱 Starting FINAL seed...");
    const client = await pool.connect();
    console.log("Connected to DB.");

    try {
        // 1. Clear existing data
        console.log("🗑️  Cleaning up old data...");
        await client.query("TRUNCATE TABLE notifications, messages, proposals, projects, freelancer_profiles, client_profiles, users RESTART IDENTITY CASCADE");
        console.log("✅ Data cleared.");

        // 2. Create Users
        console.log("bust️  Creating users...");
        const passwordHash = await bcrypt.hash("Password123!", 10);

        const clients = [];
        const clientsData = [
            { name: "John Client", email: "client1@test.com", role: "client" },
            { name: "Sarah Startup", email: "sarah@startup.com", role: "client" },
            { name: "Tech Corp", email: "hiring@techcorp.com", role: "client" },
        ];

        for (const u of clientsData) {
            try {
                const res = await client.query(
                    "INSERT INTO users (name, email, password_hash, role, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, email",
                    [u.name, u.email, passwordHash, u.role, true]
                );
                clients.push(res.rows[0]);
                await client.query(
                    "INSERT INTO client_profiles (user_id, company_name, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())",
                    [res.rows[0].id, u.name + "'s Company"]
                );
            } catch (e) { console.error("Client Insert Error:", e); }
        }

        const freelancers = [];
        const freelancersData = [
            { name: "Alice Developer", email: "freelancer1@test.com", role: "freelancer" },
            { name: "Bob Designer", email: "bob@design.com", role: "freelancer" },
            { name: "Charlie Writer", email: "charlie@content.com", role: "freelancer" },
            { name: "David DevOps", email: "david@ops.com", role: "freelancer" },
            { name: "Eve Mobile", email: "eve@app.com", role: "freelancer" }
        ];

        for (const u of freelancersData) {
            try {
                const res = await client.query(
                    "INSERT INTO users (name, email, password_hash, role, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, email",
                    [u.name, u.email, passwordHash, u.role, true]
                );
                freelancers.push(res.rows[0]);
            } catch (e) { console.error("Freelancer Insert Error:", e); }
        }

        // 3. Create Freelancer Profiles
        console.log("👤 Creating freelancer profiles...");
        const profiles = [
            {
                user_id: freelancers[0].id,
                bio: "Full Stack Developer with 5 years experience in React and Node.js.",
                skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
                hourly_rate: 45,
                portfolio_url: "https://alice.dev"
            },
            {
                user_id: freelancers[1].id,
                bio: "Creative UI/UX Designer specializing in mobile-first applications.",
                skills: ["Figma", "UI/UX", "Adobe XD", "Brand Identity"],
                hourly_rate: 55,
                portfolio_url: "https://bob.design"
            },
            {
                user_id: freelancers[2].id, // Charlie
                bio: "SEO-focused content writer and copywriter.",
                skills: ["Copywriting", "SEO", "Blog Writing", "Content Strategy"],
                hourly_rate: 30,
                portfolio_url: "https://charliewrites.com"
            },
            {
                user_id: freelancers[3].id, // David
                bio: "DevOps Engineer expert in AWS, Docker, and Kubernetes.",
                skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
                hourly_rate: 70,
                portfolio_url: "https://davidops.cloud"
            },
            {
                user_id: freelancers[4].id, // Eve
                bio: "Mobile App Developer (iOS & Android).",
                skills: ["Flutter", "React Native", "iOS", "Android"],
                hourly_rate: 60,
                portfolio_url: "https://eveapps.dev"
            }
        ];

        for (const p of profiles) {
            try {
                await client.query(
                    "INSERT INTO freelancer_profiles (user_id, bio, skills, hourly_rate, portfolio_url, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), NOW())",
                    [p.user_id, p.bio, JSON.stringify(p.skills), p.hourly_rate, p.portfolio_url]
                );
            } catch (e) { console.error("Profile Insert Error:", e); }
        }

        // 4. Create Projects
        console.log("🚀 Creating projects...");
        const projectsData = [
            {
                client_id: clients[0].id,
                title: "E-commerce Website Redesign",
                description: "We need a complete redesign of our Shopify store.",
                budget: 2500,
                deadline: "2024-05-01",
                category: "Web Development",
                status: "open",
                skills: ["Shopify", "Liquid", "CSS", "UI/UX"]
            },
            {
                client_id: clients[0].id,
                title: "React Native Food Delivery App",
                description: "Building an UberEats clone for a local market.",
                budget: 5000,
                deadline: "2024-06-15",
                category: "Mobile Development",
                status: "open",
                skills: ["React Native", "Google Maps API", "Stripe"]
            },
            {
                client_id: clients[1].id,
                title: "SEO Content Strategy for SaaS",
                description: "Need a comprehensive content strategy.",
                budget: 1200,
                deadline: "2024-04-20",
                category: "Writing & Content",
                status: "open",
                skills: ["SEO", "Content Marketing", "B2B"]
            },
            {
                client_id: clients[2].id,
                title: "Server Migration to AWS",
                description: "Migrating our legacy infrastructure to AWS cloud.",
                budget: 3500,
                deadline: "2024-05-10",
                category: "DevOps & Cloud",
                status: "open",
                skills: ["AWS", "Linux", "Database Migration"]
            },
            {
                client_id: clients[1].id,
                title: "Logo & Brand Identity Pack",
                description: "New startup needs a logo.",
                budget: 800,
                deadline: "2024-04-01",
                category: "Design & Creative",
                status: "open",
                skills: ["Logo Design", "Branding", "Illustrator"]
            }
        ];

        const projects = [];
        for (const p of projectsData) {
            console.log(`Inserting project: ${p.title}`);
            try {
                const res = await client.query(
                    "INSERT INTO projects (client_id, title, description, budget, deadline, category, status, required_skills, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id, title",
                    [p.client_id, p.title, p.description, p.budget, p.deadline, p.category, p.status, JSON.stringify(p.skills)]
                );
                projects.push(res.rows[0]);
            } catch (e) { console.error("Project Insert Error:", e); }
        }

        // 5. Create Proposals
        console.log("📄 Creating proposals...");
        if (projects.length > 0 && freelancers.length > 0) {
            const proposalsData = [
                {
                    project_id: projects[0].id, // E-commerce
                    freelancer_id: freelancers[0].id, // Alice
                    cover_letter: "I have built over 20 Shopify stores.",
                    bid_amount: 2400,
                    status: "pending"
                },
                {
                    project_id: projects[0].id, // E-commerce
                    freelancer_id: freelancers[1].id,
                    cover_letter: "As a designer, I focus on UX.",
                    bid_amount: 2800,
                    status: "pending"
                },
                {
                    project_id: projects[2].id, // SEO
                    freelancer_id: freelancers[2].id, // Charlie
                    cover_letter: "I know the B2B SaaS space well.",
                    bid_amount: 1200,
                    status: "accepted"
                }
            ];

            for (const p of proposalsData) {
                try {
                    await client.query(
                        "INSERT INTO proposals (project_id, freelancer_id, cover_letter, bid_amount, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
                        [p.project_id, p.freelancer_id, p.cover_letter, p.bid_amount, p.status]
                    );
                } catch (e) { console.error("Proposal Insert Error:", e); }
            }
        }

        // 6. Create Messages (Simple conversation)
        console.log("💬 Creating messages...");
        if (clients.length > 0 && freelancers.length > 0) {
            const messages = [
                { sender_id: clients[0].id, receiver_id: freelancers[0].id, content: "Hi Alice, saw your proposal." },
                { sender_id: freelancers[0].id, receiver_id: clients[0].id, content: "Yes! I can build themes." },
                { sender_id: clients[0].id, receiver_id: freelancers[0].id, content: "Great." }
            ];

            for (const m of messages) {
                try {
                    await client.query(
                        "INSERT INTO messages (sender_id, receiver_id, content, sent_at, is_read) VALUES ($1, $2, $3, NOW(), $4)",
                        [m.sender_id, m.receiver_id, m.content, false]
                    );
                } catch (e) { console.error("Message Insert Error:", e); }
            }
        }

        // 7. Create Notifications
        console.log("🔔 Creating notifications...");
        if (clients.length > 0) {
            const notifications = [
                { user_id: clients[0].id, type: "proposal_received", message: "Alice Developer submitted a proposal for your project", is_read: false },
                { user_id: freelancers[0].id, type: "message_received", message: "You have a new message from John Client", is_read: true },
                { user_id: freelancers[2].id, type: "proposal_accepted", message: "Your proposal for SEO Content Strategy was accepted!", is_read: false }
            ];

            for (const n of notifications) {
                try {
                    await client.query(
                        "INSERT INTO notifications (user_id, type, message, is_read, created_at) VALUES ($1, $2, $3, $4, NOW())",
                        [n.user_id, n.type, n.message, n.is_read]
                    );
                } catch (e) { console.error("Notification Insert Error:", e); }
            }
        }

        console.log("✅ Database seeded successfully!");
    } catch (err) {
        console.error("❌ GLOBAL Seeding failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
