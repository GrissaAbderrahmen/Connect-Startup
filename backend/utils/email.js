const nodemailer = require("nodemailer");

// Create SMTP transporter using Brevo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email verification link to new user
 */
async function sendVerificationEmail(to, token, userName) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Connect" <noreply@connect-platform.com>',
    to: to,
    subject: "Verify your Connect account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #14b8a6, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Connect</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Tunisia's Trusted Freelance Platform</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Welcome${userName ? ', ' + userName : ''}! 🎉</h2>
            <p style="color: #555; line-height: 1.6;">
              Thanks for joining Connect! Please verify your email address to activate your account and start connecting with clients or freelancers.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #14b8a6; color: white; padding: 14px 32px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ✓ Verify My Email
              </a>
            </div>
            <p style="color: #888; font-size: 13px; line-height: 1.5;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #14b8a6; word-break: break-all;">${verificationUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(to, token, userName) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Connect" <noreply@connect-platform.com>',
    to: to,
    subject: "Reset your Connect password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #14b8a6, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Connect</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #555; line-height: 1.6;">
              Hi${userName ? ' ' + userName : ''},<br><br>
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #14b8a6; color: white; padding: 14px 32px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 13px; line-height: 1.5;">
              Or copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #14b8a6; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="color: #888; font-size: 13px;">
              This link expires in 1 hour.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Test the email configuration
 */
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("[email] SMTP connection verified ✓");
    return true;
  } catch (error) {
    console.error("[email] SMTP connection failed:", error.message);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConnection
};
