import { Resend } from "resend";

export async function sendWelcomeEmail(to, name) {
  // Created lazily so a missing key only fails this call (the caller
  // already catches it), instead of crashing every page that imports
  // this module.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "The Chronicle <onboarding@resend.dev>",
    to,
    subject: "Welcome to The Chronicle",
    html: `
      <p>Hi ${name},</p>
      <p>You created an account on The Chronicle. Thank you for signing up!</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  // Created lazily so a missing key only fails this call (the caller
  // already catches it), instead of crashing every page that imports
  // this module.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "The Chronicle <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <p>Someone asked to reset the password for this account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link works once and expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
