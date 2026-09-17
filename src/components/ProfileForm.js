"use client";

import { useFormState } from "react-dom";
import SubmitButton from "./SubmitButton";

export default function ProfileForm({ action, profile }) {
  const [state, formAction] = useFormState(action, {});

  const dobValue = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="field-card">
      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" defaultValue={profile.name} required />

      <label htmlFor="username" style={{ marginTop: 12 }}>
        Username
      </label>
      <input
        id="username"
        name="username"
        type="text"
        defaultValue={profile.username || ""}
        placeholder="lowercase letters, numbers, underscores"
      />

      <label htmlFor="profession" style={{ marginTop: 12 }}>
        Current profession
      </label>
      <input id="profession" name="profession" type="text" defaultValue={profile.profession} />

      <div className="two-col" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={dobValue} />
        </div>
        <div>
          <label htmlFor="city">City</label>
          <input id="city" name="city" type="text" defaultValue={profile.city} />
        </div>
      </div>

      <label htmlFor="address" style={{ marginTop: 12 }}>
        Full address
      </label>
      <textarea id="address" name="address" rows={2} defaultValue={profile.address} />

      <label htmlFor="bio" style={{ marginTop: 12 }}>
        Bio
      </label>
      <textarea id="bio" name="bio" rows={3} maxLength={1000} defaultValue={profile.bio} />

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
        <SubmitButton className="a-btn a-btn--primary" pendingText="Saving…">
          Save profile
        </SubmitButton>
      </div>
    </form>
  );
}
