"use client";

import { useFormState } from "react-dom";
import { requestPasswordResetAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordResetAction, {});

  if (state?.ok) {
    return <p className="hint">{state.ok}</p>;
  }

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required />

      {state?.error && <div className="form-error">{state.error}</div>}

      <SubmitButton className="" pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
