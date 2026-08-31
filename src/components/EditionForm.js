"use client";

import { useFormState } from "react-dom";
import { saveEditionAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default function EditionForm({ edition, dateValue }) {
  const [state, formAction] = useFormState(saveEditionAction, {});

  return (
    <form action={formAction} className="side-card" style={{ display: "grid", gap: 12 }}>
      <h3>Edition details</h3>
      <input type="hidden" name="id" value={edition.id} />

      <div>
        <label htmlFor="ed-date">Edition date</label>
        <input id="ed-date" type="date" name="date" defaultValue={dateValue} required />
      </div>

      <div>
        <label htmlFor="ed-title">Nameplate title</label>
        <input id="ed-title" type="text" name="title" defaultValue={edition.title} />
      </div>

      <div>
        <label htmlFor="ed-strap">Strapline</label>
        <input
          id="ed-strap"
          type="text"
          name="strapline"
          defaultValue={edition.strapline || ""}
          placeholder="Digital Edition"
        />
      </div>

      <div>
        <label htmlFor="ed-pdf">PDF replica URL (optional)</label>
        <input
          id="ed-pdf"
          type="text"
          name="pdfUrl"
          defaultValue={edition.pdfUrl || ""}
          placeholder="https://…/edition.pdf"
        />
      </div>

      <div>
        <label>Status</label>
        <div className="seg">
          <label>
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={edition.status !== "published"}
            />
            <span>Draft</span>
          </label>
          <label>
            <input
              type="radio"
              name="status"
              value="published"
              defaultChecked={edition.status === "published"}
            />
            <span>Published</span>
          </label>
        </div>
      </div>

      {state?.error && <div className="form-error">{state.error}</div>}
      {state?.ok && (
        <div className="notice notice--ok" style={{ margin: 0 }}>
          {state.ok}
        </div>
      )}

      <SubmitButton pendingText="Saving…">Save edition details</SubmitButton>
    </form>
  );
}
