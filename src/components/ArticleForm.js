"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { saveArticleAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";
import { slugify } from "@/lib/format";

export default function ArticleForm({ article, categories }) {
  const [state, formAction] = useFormState(saveArticleAction, {});

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [summary, setSummary] = useState(article?.summary || "");
  const [status, setStatus] = useState(article?.status || "draft");

  const effectiveSlug = slugTouched && slug ? slug : slugify(title);

  return (
    <form action={formAction} className="editor">
      <input type="hidden" name="id" value={article?.id || ""} />

      <div className="editor-main">
        <div className="field-card">
          <label htmlFor="title">Headline</label>
          <input
            id="title"
            name="title"
            type="text"
            className="title-input"
            placeholder="Type the headline…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="field-card">
          <label htmlFor="slug">URL slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={effectiveSlug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <p className="hint">
            The story will live at <code>/article/{effectiveSlug || "…"}</code>
          </p>
        </div>

        <div className="field-card">
          <label htmlFor="summary">Summary / standfirst</label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One or two sentences. Shown on cards and in search results."
          />
        </div>

        <div className="field-card">
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            name="body"
            className="body-input"
            defaultValue={article?.body || ""}
            placeholder="Write the story here. Markdown works: **bold**, ## Heading, > quote, - list."
          />
          <p className="hint">
            Markdown supported — headings, bold, italics, links, lists and block quotes.
          </p>
        </div>

        {state?.error && <div className="form-error">{state.error}</div>}

        <div className="adm-toprow" style={{ marginBottom: 0 }}>
          <a className="a-btn" href="/newsroom">
            Cancel
          </a>
          <SubmitButton pendingText="Saving…">
            {status === "published" ? "Save and publish" : "Save draft"}
          </SubmitButton>
        </div>
      </div>

      <aside className="editor-side">
        <div className="side-card">
          <h3>Status</h3>
          <div className="seg">
            <label>
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => setStatus("draft")}
              />
              <span>Draft</span>
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => setStatus("published")}
              />
              <span>Published</span>
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" name="featured" defaultChecked={article?.featured} />
            Feature on the homepage hero
          </label>
        </div>

        <div className="side-card">
          <h3>Category</h3>
          <select name="categoryId" defaultValue={article?.categoryId || categories[0]?.id}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="side-card">
          <h3>Images</h3>
          <p className="hint">
            Upload the main image and gallery pictures in the <b>Images</b> panel
            below (available after the first save).
          </p>
        </div>

        <div className="side-card">
          <h3>Tags</h3>
          <input
            type="text"
            name="tags"
            defaultValue={article?.tags || ""}
            placeholder="comma, separated, tags"
          />
        </div>

        <div className="side-card">
          <h3>Search preview</h3>
          <div className="preview-box">
            <div className="s-title">{title || "Your headline appears here"}</div>
            <div className="s-url">yoursite.com &rsaquo; article &rsaquo; {effectiveSlug || "slug"}</div>
            <div className="s-desc">
              {summary || "Your summary appears here as the search description."}
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
