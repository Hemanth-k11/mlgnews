import Link from "next/link";
import StoryCard from "@/components/StoryCard";
import { search } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const { items, total, pages } = await search(q, page);

  return (
    <div className="wrap">
      <div className="layout">
        <div>
          <div className="sec-head">
            <h1>Search</h1>
          </div>

          <form className="searchbar" action="/search">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search stories…"
              aria-label="Search stories"
              autoFocus
            />
            <button type="submit">Search</button>
          </form>

          {q && (
            <p className="byline" style={{ marginBottom: 12 }}>
              {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
            </p>
          )}

          {q && items.length === 0 && (
            <div className="empty">
              <b>No matches</b>
              Try a different spelling, or browse a section from the menu above.
            </div>
          )}

          {!q && (
            <div className="empty">
              <b>What are you looking for?</b>
              Type a word or phrase above to search headlines and article text.
            </div>
          )}

          <ul className="sec-list">
            {items.map((a) => (
              <StoryCard key={a.id} article={a} variant="list" />
            ))}
          </ul>

          {pages > 1 && (
            <nav className="pager">
              {page > 1 ? (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>
                  &lsaquo; Prev
                </Link>
              ) : (
                <span className="disabled">&lsaquo; Prev</span>
              )}
              <span className="on">{page}</span>
              {page < pages ? (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}>
                  Next &rsaquo;
                </Link>
              ) : (
                <span className="disabled">Next &rsaquo;</span>
              )}
            </nav>
          )}
        </div>

        <aside className="rail">
          <div>
            <h2 className="mod__head">Browse</h2>
            <p className="hint" style={{ marginTop: 10 }}>
              Use the navigation bar to open any section, or search by keyword.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
