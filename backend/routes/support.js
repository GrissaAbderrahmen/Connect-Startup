// routes/support.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const { sendFeedbackEmail } = require("../utils/email");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/support/feedback - Submit feedback (authenticated or anonymous)
router.post("/feedback", [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").notEmpty().withMessage("Subject is required"),
    body("message").isLength({ min: 10 }).withMessage("Message must be at least 10 characters"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, subject, message } = req.body;

        await sendFeedbackEmail(name, email, subject, message);

        console.log(`[support] Feedback received from ${email}: ${subject}`);
        res.json({ message: "Feedback submitted successfully. Thank you!" });
    } catch (err) {
        console.error("[support] Feedback submission error:", err);
        res.status(500).json({ error: "Failed to submit feedback. Please try again later." });
    }
});

module.exports = router;
