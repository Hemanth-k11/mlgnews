import Link from "next/link";
import { notFound } from "next/navigation";
import EditionForm from "@/components/EditionForm";
import ConfirmButton from "@/components/ConfirmButton";
import { adminGetEdition, getArticlesNotInEdition } from "@/lib/queries";
import {
  addEditionItemAction,
  updateEditionItemAction,
  removeEditionItemAction,
  autofillEditionAction,
  deleteEditionAction,
} from "@/lib/actions";
import { toISODate, formatLongDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit edition" };

const PROMINENCE = ["lead", "standard", "brief"];

export default async function EditEditionPage({ params }) {
  const edition = await adminGetEdition(params.id);
  if (!edition) notFound();

  const available = await getArticlesNotInEdition(edition.id);
  const iso = toISODate(edition.date);

  return (
    <div className="adm-main">
      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">Edition &mdash; {formatLongDate(edition.date)}</h1>
          <p className="hint">
            {edition.items.length} stor{edition.items.length === 1 ? "y" : "ies"} placed
          </p>
        </div>
        <div className="t-actions">
          <Link className="a-btn" href="/newsroom/editions">
            All editions
          </Link>
          {edition.status === "published" && (
            <a
              className="a-btn"
              href={`/epaper/${iso}`}
              target="_blank"
              rel="noreferrer"
            >
              View e-Paper &#8599;
            </a>
          )}
        </div>
      </div>

      <div className="editor">
        <div className="editor-main">
          <div className="side-card">
            <h3 style={{ marginBottom: 10 }}>Stories in this edition</h3>

            {edition.items.length === 0 && (
              <p className="hint">
                None yet. Use <b>Auto-fill</b> below, or add stories one at a time.
              </p>
            )}

            {edition.items.length > 0 && (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Story</th>
                      <th>Page</th>
                      <th>Order</th>
                      <th>Prominence</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {edition.items.map((it) => (
                      <tr key={it.id}>
                        <td className="t-title">
                          {it.article.title}
                          <br />
                          <span className="hint">{it.article.category?.name}</span>
                        </td>
                        <td colSpan={3}>
                          <form
                            action={updateEditionItemAction}
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <input type="hidden" name="id" value={it.id} />
                            <input
                              type="hidden"
                              name="editionId"
                              value={edition.id}
                            />
                            <input
                              type="number"
                              name="page"
                              min="1"
                              defaultValue={it.page}
                              style={{ width: 58 }}
                              aria-label="Page"
                            />
                            <input
                              type="number"
                              name="order"
                              defaultValue={it.order}
                              style={{ width: 58 }}
                              aria-label="Order on page"
                            />
                            <select name="prominence" defaultValue={it.prominence}>
                              {PROMINENCE.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <button className="a-btn" type="submit">
                              Save row
                            </button>
                          </form>
                        </td>
                        <td>
                          <form action={removeEditionItemAction}>
                            <input type="hidden" name="id" value={it.id} />
                            <input
                              type="hidden"
                              name="editionId"
                              value={edition.id}
                            />
                            <button
                              className="a-btn a-btn--danger"
                              type="submit"
                            >
                              Remove
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form action={autofillEditionAction} style={{ marginTop: 12 }}>
              <input type="hidden" name="editionId" value={edition.id} />
              <button className="a-btn" type="submit">
                Auto-fill from this day&rsquo;s published stories
              </button>
            </form>

            <hr className="rule-soft" />

            <h3 style={{ margin: "4px 0 8px" }}>Add a story</h3>
            <form
              action={addEditionItemAction}
              style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}
            >
              <input type="hidden" name="editionId" value={edition.id} />
              <select
                name="articleId"
                required
                defaultValue=""
                style={{ flex: 1, minWidth: 220 }}
              >
                <option value="" disabled>
                  Choose a published story…
                </option>
                {available.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="page"
                min="1"
                defaultValue={1}
                style={{ width: 58 }}
                aria-label="Page"
              />
              <select name="prominence" defaultValue="standard">
                {PROMINENCE.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button className="a-btn a-btn--primary" type="submit">
                Add
              </button>
            </form>
            {available.length === 0 && (
              <p className="hint" style={{ marginTop: 8 }}>
                Every published story is already in this edition.
              </p>
            )}
          </div>
        </div>

        <aside className="editor-side">
          <EditionForm edition={edition} dateValue={iso} />

          <div className="side-card">
            <h3>Delete</h3>
            <p className="hint" style={{ marginBottom: 8 }}>
              Removes the edition only. The stories stay published.
            </p>
            <form action={deleteEditionAction}>
              <input type="hidden" name="id" value={edition.id} />
              <ConfirmButton message={`Delete the ${iso} edition?`}>
                Delete this edition
              </ConfirmButton>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
