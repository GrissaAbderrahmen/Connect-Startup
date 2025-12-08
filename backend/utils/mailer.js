const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Connect" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

function verificationEmailTemplate(link) {
  return `
    <h2>Verify your email</h2>
    <p>Click below to verify:</p>
    <a href="${link}">${link}</a>
  `;
}

function resetEmailTemplate(link) {
  return `
    <h2>Reset your password</h2>
    <p>Click below to reset:</p>
    <a href="${link}">${link}</a>
  `;
}

module.exports = { sendMail, verificationEmailTemplate, resetEmailTemplate };
