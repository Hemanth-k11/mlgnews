"use client";

import { useFormState } from "react-dom";
import { readerSignupAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function SignupForm({ next }) {
  const [state, formAction] = useFormState(readerSignupAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next || "/account"} />

      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" autoComplete="name" required />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state?.error && <div className="form-error">{state.error}</div>}

      <SubmitButton className="" pendingText="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
