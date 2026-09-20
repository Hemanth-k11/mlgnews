import Link from "next/link";
import { adminListEditions } from "@/lib/queries";
import { newEditionAction, deleteEditionAction } from "@/lib/actions";
import { toISODate, formatDate, formatLongDate } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editions" };

export default async function EditionsListPage({ searchParams }) {
  const editions = await adminListEditions();

  return (
    <div className="adm-main">
      {searchParams?.deleted && (
        <div className="notice notice--ok">Edition deleted.</div>
      )}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">e-Paper editions</h1>
          <p className="hint">
            A dated, page-by-page edition compiled from published stories.
          </p>
        </div>
        <form action={newEditionAction}>
          <button className="a-btn a-btn--primary" type="submit">
            + New edition (today)
          </button>
        </form>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Nameplate</th>
              <th>Status</th>
              <th>Stories</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {editions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  No editions yet. Click &ldquo;New edition&rdquo; to start one.
                </td>
              </tr>
            )}
            {editions.map((e) => {
              const iso = toISODate(e.date);
              return (
                <tr key={e.id}>
                  <td className="t-title">
                    <Link href={`/newsroom/editions/${e.id}/edit`}>
                      {formatLongDate(e.date)}
                    </Link>
                  </td>
                  <td>{e.title}</td>
                  <td>
                    <span
                      className={`pill pill--${
                        e.status === "published" ? "published" : "draft"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td>{e._count.items}</td>
                  <td>{formatDate(e.updatedAt)}</td>
                  <td>
                    <div className="t-actions">
                      <Link
                        className="a-btn"
                        href={`/newsroom/editions/${e.id}/edit`}
                      >
                        Edit
                      </Link>
                      {e.status === "published" && (
                        <a
                          className="a-btn"
                          href={`/epaper/${iso}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      )}
                      <form action={deleteEditionAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <ConfirmButton
                          message={`Delete the ${iso} edition? The stories themselves are not affected.`}
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
