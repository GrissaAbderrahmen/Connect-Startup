/**
 * GitHub Portfolio Verification Script
 * 
 * This script verifies a freelancer's GitHub profile by checking:
 * 1. Repository count (proof of activity)
 * 2. Language matching against claimed skills
 * 3. File extension fallback for missed languages
 * 4. Recent activity (not a dormant account)
 * 5. README presence (profile quality)
 * 
 * To integrate into Connect:
 * - Create /api/freelancers/verify-github endpoint
 * - Store results in freelancer_profiles
 * - Display verification badge on frontend
 */

const axios = require("axios");

// -------- CONFIG --------
const username = "GrissaAbderrahmen"; // your GitHub
const claimedSkills = ["Python", "Java", "Node.js"]; // skills to check
const GITHUB_TOKEN = ""; // optional, add your token here
// ------------------------

const axiosConfig = GITHUB_TOKEN ? { headers: { Authorization: `token ${GITHUB_TOKEN}` } } : {};

// Map skills to file extensions
const skillExtensions = {
    "Python": [".py"],
    "Java": [".java"],
    "Node.js": [".js", ".ts"],
    "React": [".jsx", ".tsx"],
    "TypeScript": [".ts", ".tsx"],
    "PHP": [".php"],
    "Ruby": [".rb"],
    "Go": [".go"],
    "Rust": [".rs"],
    "C++": [".cpp", ".hpp", ".cc"],
    "C#": [".cs"],
    "Swift": [".swift"],
    "Kotlin": [".kt"]
};

async function verifyGitHub() {
    try {
        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos`, axiosConfig);
        const repos = reposRes.data;

        if (repos.length === 0) {
            console.log("❌ No repositories found. Account may be inactive or fake.");
            return;
        }
        console.log(`✅ ${repos.length} repositories found.`);

        let languageMatches = {};
        for (let skill of claimedSkills) languageMatches[skill] = false;

        for (let repo of repos) {
            // 1️⃣ Check GitHub API languages
            const langRes = await axios.get(repo.languages_url, axiosConfig);
            const languages = Object.keys(langRes.data);
            for (let skill of claimedSkills) {
                if (languages.includes(skill)) languageMatches[skill] = true;
            }

            // 2️⃣ Check repo file extensions for skills not detected
            const contentsRes = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/contents`, axiosConfig);
            const files = contentsRes.data;
            for (let skill of claimedSkills) {
                if (!languageMatches[skill]) {
                    for (let file of files) {
                        for (let ext of skillExtensions[skill] || []) {
                            if (file.name.endsWith(ext)) languageMatches[skill] = true;
                        }
                    }
                }
            }
        }

        console.log("🔹 Skill match results:");
        console.table(languageMatches);

        // 3️⃣ Recent activity
        const eventsRes = await axios.get(`https://api.github.com/users/${username}/events/public`, axiosConfig);
        if (eventsRes.data.length === 0) {
            console.log("❌ No recent activity found.");
        } else {
            console.log(`✅ Recent activity found. Last ${eventsRes.data.length} events loaded.`);
        }

        // 4️⃣ README check
        let hasReadme = repos.some(repo => repo.name.toLowerCase().includes("readme"));
        console.log("🔹 README present:", hasReadme ? "✅ Yes" : "❌ No");

        console.log("\nPortfolio verification complete!");
    } catch (error) {
        console.error("Error fetching GitHub data:", error.message);
    }
}

// Run if executed directly
if (require.main === module) {
    verifyGitHub();
}

module.exports = { verifyGitHub, skillExtensions };
