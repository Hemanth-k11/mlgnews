"use client";

import { useFormState } from "react-dom";
import SubmitButton from "./SubmitButton";

export default function ChangePasswordForm({ action }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="field-card">
      <label htmlFor="currentPassword">Current password</label>
      <input
        id="currentPassword"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />

      <label htmlFor="newPassword" style={{ marginTop: 12 }}>
        New password
      </label>
      <input
        id="newPassword"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <label htmlFor="confirm" style={{ marginTop: 12 }}>
        Confirm new password
      </label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state?.error && (
        <div className="form-error" style={{ marginTop: 10 }}>
          {state.error}
        </div>
      )}
      {state?.ok && (
        <p className="hint" style={{ color: "var(--ok)", marginTop: 10 }}>
          {state.ok}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <SubmitButton className="a-btn" pendingText="Saving…">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}
