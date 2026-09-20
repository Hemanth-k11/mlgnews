import nodemailer from "nodemailer";

// Mail goes out over SMTP (Gmail by default). Set these in .env / Vercel:
//   SMTP_USER   the sending Gmail address
//   SMTP_PASS   a Google "app password" (not the normal account password)
//   EMAIL_FROM  optional, e.g. "Miryalaguda Chronicle <you@gmail.com>"
//   SMTP_HOST / SMTP_PORT / SMTP_SECURE  optional, default smtp.gmail.com:465 (TLS)
function createTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("Email is not configured: set SMTP_USER and SMTP_PASS.");
  }
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user, pass },
  });
}

function fromAddress() {
  return process.env.EMAIL_FROM || `Miryalaguda Chronicle <${process.env.SMTP_USER}>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Throws unless we can log in to the mail server right now. Called before a
// reset / invitation flow starts, so a mail problem is reported up front
// instead of the message silently never arriving.
export async function assertEmailReady() {
  await createTransport().verify();
}

async function send({ to, subject, html, text }) {
  const transport = createTransport();
  const info = await transport.sendMail({ from: fromAddress(), to, subject, html, text });
  if (!info.accepted || info.accepted.length === 0) {
    throw new Error(`Mail server did not accept the message for ${to}.`);
  }
}

// Sent when a staff member asks to reset their password.
export async function sendPasswordResetEmail(to, resetUrl) {
  await send({
    to,
    subject: "Reset your password",
    text:
      `Someone asked to reset the password for this account.\n\n` +
      `Set a new password: ${resetUrl}\n\n` +
      `This link works once and expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <p>Someone asked to reset the password for this account.</p>
      <p><a href="${esc(resetUrl)}">Click here to set a new password</a>. This link works once and expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
