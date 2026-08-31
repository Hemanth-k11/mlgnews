import Link from "next/link";
import { adminListArticles, getSections } from "@/lib/queries";
import { newDraftAction, deleteArticleAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Articles" };

export default async function AdminArticlesPage({ searchParams }) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "";
  const categoryId = searchParams?.category || "";

  const [articles, sections] = await Promise.all([
    adminListArticles({ q, status, categoryId }),
    getSections(),
  ]);

  return (
    <div className="adm-main">
      {searchParams?.saved && (
        <div className="notice notice--ok">Article saved.</div>
      )}
      {searchParams?.deleted && (
        <div className="notice notice--ok">Article deleted.</div>
      )}

      <div className="adm-toprow">
        <h1 className="adm-h1">Articles</h1>
        <form action={newDraftAction}>
          <button className="a-btn a-btn--primary" type="submit">
            + New article
          </button>
        </form>
      </div>

      <form className="filters" action="/admin">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search headlines…"
        />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select name="category" defaultValue={categoryId}>
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="a-btn" type="submit">
          Filter
        </button>
      </form>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Section</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)" }}>
                  No articles match these filters.
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="t-title">
                  <Link href={`/admin/articles/${a.id}/edit`}>{a.title}</Link>
                </td>
                <td>
                  <span className={`pill pill--${a.status}`}>{a.status}</span>
                </td>
                <td>{a.category?.name}</td>
                <td>{formatDate(a.updatedAt)}</td>
                <td>
                  <div className="t-actions">
                    <Link className="a-btn" href={`/admin/articles/${a.id}/edit`}>
                      Edit
                    </Link>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <ConfirmButton message={`Delete "${a.title}"? This cannot be undone.`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
