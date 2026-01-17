const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/auth");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

const router = express.Router();

// ---------------- SIGNUP ----------------
router.post("/signup", [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").notEmpty(),
  body("role").isIn(["client", "freelancer"]),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { email, password, name, role } = req.body;

    // Check if email exists
    const userCheck = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const hashedPassword = await bcryptjs.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name, role, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())
       RETURNING id, email, name, role, is_verified`,
      [email, hashedPassword, name, role]
    );
    const user = result.rows[0];

    // Create profile based on role with safe defaults
    if (role === 'client') {
      await client.query(
        `INSERT INTO client_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, '', NOW(), NOW())`,
        [user.id]
      );
    } else if (role === 'freelancer') {
      await client.query(
        `INSERT INTO freelancer_profiles (user_id, bio, skills, hourly_rate, portfolio_url, created_at, updated_at)
         VALUES ($1, '', '[]', NULL, '', NOW(), NOW())`,
        [user.id]
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await client.query(
      "INSERT INTO email_verifications (user_id, token, expires_at, created_at) VALUES ($1,$2,$3,NOW())",
      [user.id, token, expires]
    );

    await client.query('COMMIT');

    // Send verification email
    try {
      await sendVerificationEmail(email, token, name);
      console.log(`[auth] Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error("[auth] Failed to send verification email:", emailErr.message);
      // Don't fail signup if email fails - user can request resend
    }

    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("[auth] Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  } finally {
    client.release();
  }
});

// ---------------- LOGIN ----------------
router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT id, email, password_hash, name, role, is_verified FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid email or password" });

    const user = result.rows[0];
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    if (!passwordMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (!user.is_verified) {
      return res.status(403).json({ error: "Email not verified", token });
    }


    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    console.error("[auth] Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------- GET CURRENT USER ----------------
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role, is_verified FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("[auth] Auth verify error:", err);
    res.status(403).json({ error: "Invalid token" });
  }
});

// ---------------- SEND VERIFICATION EMAIL ----------------
router.post("/send-verification", authenticateToken, async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [req.user.id, token, expires]
    );
    // Send verification email
    try {
      await sendVerificationEmail(req.user.email, token, req.user.name);
    } catch (emailErr) {
      console.error("[auth] Failed to send verification email:", emailErr.message);
    }

    res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("[auth] Send verification error:", err);
    res.status(500).json({ error: "Failed to send verification" });
  }
});

// ---------------- VERIFY EMAIL ----------------
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    const result = await pool.query(
      "SELECT * FROM email_verifications WHERE token=$1 AND expires_at > NOW()",
      [token]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

    await pool.query("UPDATE users SET is_verified=true WHERE id=$1", [result.rows[0].user_id]);
    await pool.query("DELETE FROM email_verifications WHERE id=$1", [result.rows[0].id]);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("[auth] Verify email error:", err);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// ---------------- REQUEST PASSWORD RESET ----------------
router.post("/request-reset", [body("email").isEmail()], async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[auth] Password reset requested for: ${email}`);

    const userResult = await pool.query("SELECT id, name FROM users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) {
      console.log(`[auth] No user found for email: ${email}`);
      return res.json({ message: "If this email exists, a reset link was sent" });
    }

    const user = userResult.rows[0];
    console.log(`[auth] Found user: ${user.name} (id: ${user.id})`);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour (was 15 min)

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [user.id, token, expires]
    );
    console.log(`[auth] Reset token created, sending email...`);

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, token, user.name);
      console.log(`[auth] Password reset email sent to ${email}`);
    } catch (emailErr) {
      console.error("[auth] Failed to send password reset email:", emailErr);
    }
    res.json({ message: "If this email exists, a reset link was sent" });
  } catch (err) {
    console.error("[auth] Request reset error:", err);
    res.status(500).json({ error: "Failed to request reset" });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, new_password } = req.body;
    const resetResult = await pool.query(
      "SELECT * FROM password_resets WHERE token=$1 AND expires_at > NOW()",
      [token]
    );
    if (resetResult.rows.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

    const hash = await bcryptjs.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      hash,
      resetResult.rows[0].user_id,
    ]);
    await pool.query("DELETE FROM password_resets WHERE id=$1", [resetResult.rows[0].id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("[auth] Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});


// Temporary dev route to force verification
router.post("/dev/force-verify", authenticateToken, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_verified=true WHERE id=$1", [req.user.id]);
    res.json({ message: "User verified (dev only)" });
  } catch (err) {
    console.error("[auth] Force verify error:", err);
    res.status(500).json({ error: "Failed to force verify" });
  }
});

// ---------------- CHANGE PASSWORD (logged in user) ----------------
router.post("/change-password", authenticateToken, [
  body("current_password").notEmpty().withMessage("Current password is required"),
  body("new_password").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { current_password, new_password } = req.body;

    // Get current password hash
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const passwordMatch = await bcryptjs.compare(current_password, userResult.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash and save new password
    const newHash = await bcryptjs.hash(new_password, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [newHash, req.user.id]
    );

    console.log(`[auth] Password changed for user ${req.user.id}`);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[auth] Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ---------------- DELETE ACCOUNT ----------------
router.delete("/delete-account", authenticateToken, [
  body("password").notEmpty().withMessage("Password is required to confirm deletion"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  try {
    const { password } = req.body;

    // Verify password
    const userResult = await client.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcryptjs.compare(password, userResult.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Password is incorrect" });
    }

    await client.query('BEGIN');

    // Delete user data (cascade will handle related tables, but let's be explicit)
    await client.query("DELETE FROM email_verifications WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM password_resets WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM notifications WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM freelancer_profiles WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM client_profiles WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM users WHERE id = $1", [req.user.id]);

    await client.query('COMMIT');

    console.log(`[auth] Account deleted for user ${req.user.id}`);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("[auth] Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  } finally {
    client.release();
  }
});



module.exports = router;
