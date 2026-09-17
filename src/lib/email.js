import { Resend } from "resend";

export async function sendWelcomeEmail(to, name) {
  // Created lazily so a missing key only fails this call (the caller
  // already catches it), instead of crashing every page that imports
  // this module.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Miryalaguda Chronicle <onboarding@resend.dev>",
    to,
    subject: "Welcome to Miryalaguda Chronicle",
    html: `
      <p>Hi ${name},</p>
      <p>You created an account on Miryalaguda Chronicle. Thank you for signing up!</p>
    `,
  });
}

export async function sendAdminSignupNotification(adminEmails, reader) {
  if (!adminEmails || adminEmails.length === 0) return;
  // Created lazily so a missing key only fails this call (the caller
  // already catches it), instead of crashing every page that imports
  // this module.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Miryalaguda Chronicle <onboarding@resend.dev>",
    to: adminEmails,
    subject: "New reader account created",
    html: `
      <p>A new reader account was just created on Miryalaguda Chronicle.</p>
      <p><b>Name:</b> ${reader.name}<br />
      <b>Email:</b> ${reader.email}</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  // Created lazily so a missing key only fails this call (the caller
  // already catches it), instead of crashing every page that imports
  // this module.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Miryalaguda Chronicle <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <p>Someone asked to reset the password for this account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link works once and expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
