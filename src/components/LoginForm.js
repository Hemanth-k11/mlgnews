"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function LoginForm({ next }) {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next || "/admin"} />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state?.error && <div className="form-error">{state.error}</div>}

      <SubmitButton className="" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
