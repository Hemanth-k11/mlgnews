"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { readerSignupAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function SignupForm({ next }) {
  const [state, formAction] = useFormState(readerSignupAction, {});
  const [requestAdmin, setRequestAdmin] = useState(false);

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

      <label className="check-row" style={{ marginTop: 14 }}>
        <input
          type="checkbox"
          name="requestAdmin"
          checked={requestAdmin}
          onChange={(e) => setRequestAdmin(e.target.checked)}
        />
        Request admin access
      </label>

      {requestAdmin && (
        <>
          <label htmlFor="adminRequestNote">Why do you need access? (optional)</label>
          <textarea
            id="adminRequestNote"
            name="adminRequestNote"
            rows={2}
            maxLength={500}
          />
        </>
      )}

      {state?.error && <div className="form-error">{state.error}</div>}

      <SubmitButton className="" pendingText="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
