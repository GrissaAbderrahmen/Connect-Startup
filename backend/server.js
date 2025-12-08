const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const proposalRoutes = require("./routes/proposals");
const contractRoutes = require("./routes/contracts");
const escrowRoutes = require("./routes/escrow");
const messageRoutes = require("./routes/messages");
const freelancerRoutes = require("./routes/freelancers");
const ratingRoutes = require("./routes/ratings");
const notificationRoutes = require("./routes/notifications");
const clientRoutes = require("./routes/clients");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[v0] Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[v0] Server running on port ${PORT}`);
});

module.exports = app;
