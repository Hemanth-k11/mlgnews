"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { addCommentAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function CommentForm({ articleId, slug }) {
  const [state, formAction] = useFormState(addCommentAction, {});
  // Remounting the form after a successful post clears the textarea.
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state?.ok) setKey((k) => k + 1);
  }, [state]);

  return (
    <form key={key} action={formAction} className="cbox">
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="slug" value={slug} />
      <textarea
        name="body"
        className="c-fld"
        rows={3}
        maxLength={2000}
        placeholder="Join the discussion…"
        required
      />
      {state?.error && <div className="form-error">{state.error}</div>}
      <SubmitButton className="a-btn a-btn--primary" pendingText="Posting…">
        Post comment
      </SubmitButton>
    </form>
  );
}
