"use client";

import { useFormStatus } from "react-dom";

// A submit button that disables itself and shows pending text while the
// server action runs.
export default function SubmitButton({
  children,
  pendingText = "Working…",
  className = "a-btn a-btn--primary",
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
