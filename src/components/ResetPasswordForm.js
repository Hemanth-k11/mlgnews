"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function ResetPasswordForm({ token }) {
  const [state, formAction] = useFormState(resetPasswordAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />

      <label htmlFor="password">New password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <label htmlFor="confirm">Confirm password</label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state?.error && <div className="form-error">{state.error}</div>}

      <SubmitButton className="" pendingText="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
