"use client";

import { useFormState } from "react-dom";
import { requestStaffPasswordResetAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function StaffForgotPasswordForm() {
  const [state, formAction] = useFormState(requestStaffPasswordResetAction, {});

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
