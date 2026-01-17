/**
 * Email utility using Brevo HTTP API (not SMTP)
 * SMTP is blocked on Render free tier, so we use HTTP API instead
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const EMAIL_FROM = process.env.EMAIL_FROM || '"Connect" <noreply@connect-platform.com>';

/**
 * Send email using Brevo HTTP API
 */
async function sendEmail(to, subject, htmlContent) {
  if (!BREVO_API_KEY) {
    console.error('[email] BREVO_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Connect',
        email: EMAIL_FROM.match(/<(.+)>/)?.[1] || 'noreply@connect-platform.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[email] Brevo API error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  const result = await response.json();
  console.log('[email] Email sent successfully, messageId:', result.messageId);
  return result;
}

/**
 * Send email verification link to new user
 */
async function sendVerificationEmail(to, token, userName) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const htmlContent = `
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
  `;

  return sendEmail(to, "Verify your Connect account", htmlContent);
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(to, token, userName) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const htmlContent = `
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
  `;

  return sendEmail(to, "Reset your Connect password", htmlContent);
}

/**
 * Send feedback email to admin
 */
async function sendFeedbackEmail(fromName, fromEmail, subject, message) {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@connect-platform.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%); padding: 25px 30px; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">📬 New Feedback Received</h1>
        </div>
        <div style="padding: 30px;">
          <div style="background: #f0fdf4; border-left: 4px solid #14b8a6; padding: 15px; margin-bottom: 20px;">
            <strong>From:</strong> ${fromName}<br>
            <strong>Email:</strong> ${fromEmail}<br>
            <strong>Subject:</strong> ${subject}
          </div>
          <h3 style="margin-top: 0;">Message:</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
${message}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This feedback was submitted through the Connect platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(ADMIN_EMAIL, `[Connect Feedback] ${subject}`, htmlContent);
}

/**
 * Test the email configuration
 */
async function testEmailConnection() {
  if (!BREVO_API_KEY) {
    console.error("[email] BREVO_API_KEY not configured");
    return false;
  }
  console.log("[email] Brevo API configured ✓");
  return true;
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendFeedbackEmail,
  testEmailConnection
};
