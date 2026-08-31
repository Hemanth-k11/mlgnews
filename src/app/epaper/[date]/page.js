import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import Placeholder from "@/components/Placeholder";
import PrintButton from "@/components/PrintButton";
import { getPublishedEdition, getPublishedEditionDates } from "@/lib/queries";
import { parseISODate, toISODate, formatLongDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const d = parseISODate(params.date);
  if (!d) return { title: "e-Paper" };
  return {
    title: `e-Paper — ${formatLongDate(d)}`,
    description: `The Chronicle digital edition for ${formatLongDate(d)}.`,
  };
}

function EpaperStory({ item }) {
  const a = item.article;
  const href = `/article/${a.slug}`;
  const cat = a.category?.name;
  const byline = `By ${a.author?.name || "Staff Reporter"}`;

  if (item.prominence === "brief") {
    return (
      <article className="ep-item ep-item--brief">
        <h3 className="ep-hl">
          <Link href={href}>{a.title}</Link>
        </h3>
        {a.summary && <p className="ep-deck">{a.summary}</p>}
      </article>
    );
  }

  if (item.prominence === "lead") {
    return (
      <article className="ep-item ep-item--lead">
        {cat && <span className="ep-kicker">{cat}</span>}
        <h2 className="ep-hl">
          <Link href={href}>{a.title}</Link>
        </h2>
        {a.summary && <p className="ep-deck">{a.summary}</p>}
        <p className="ep-byline">{byline}</p>
        {a.heroImage && (
          <Placeholder src={a.heroImage} alt={a.heroAlt} variant="4x3" />
        )}
        <div className="ep-body">
          <Markdown>{a.body || a.summary}</Markdown>
        </div>
      </article>
    );
  }

  return (
    <article className="ep-item">
      {cat && <span className="ep-kicker">{cat}</span>}
      <h3 className="ep-hl">
        <Link href={href}>{a.title}</Link>
      </h3>
      <p className="ep-byline">{byline}</p>
      <div className="ep-body">
        <Markdown>{a.body || a.summary}</Markdown>
      </div>
    </article>
  );
}

export default async function EpaperDatePage({ params, searchParams }) {
  const dateObj = parseISODate(params.date);
  if (!dateObj) notFound();

  const edition = await getPublishedEdition(dateObj);
  if (!edition) notFound();

  const iso = toISODate(dateObj);
  const allDates = (await getPublishedEditionDates()).map(toISODate); // newest first
  const pos = allDates.indexOf(iso);
  const newer = pos > 0 ? allDates[pos - 1] : null;
  const older = pos >= 0 && pos < allDates.length - 1 ? allDates[pos + 1] : null;
  const editionNo = pos >= 0 ? allDates.length - pos : 1;

  const pageNumbers = [...new Set(edition.items.map((i) => i.page))].sort(
    (x, y) => x - y
  );
  const totalPages = Math.max(1, pageNumbers.length);
  const current = Math.min(
    Math.max(1, parseInt(searchParams?.page || "1", 10) || 1),
    totalPages
  );
  const activePage = pageNumbers[current - 1] ?? 1;
  const items = edition.items.filter((i) => i.page === activePage);

  return (
    <div className="epaper">
      <div className="epaper-chrome">
        <Link href="/" className="ec-back">
          &larr; chronicle.com
        </Link>
        <div className="ec-dates">
          {older ? (
            <Link href={`/epaper/${older}`} aria-label="Previous edition">
              &lsaquo;
            </Link>
          ) : (
            <span className="disabled">&lsaquo;</span>
          )}
          <span className="ec-current">{formatLongDate(dateObj)}</span>
          {newer ? (
            <Link href={`/epaper/${newer}`} aria-label="Next edition">
              &rsaquo;
            </Link>
          ) : (
            <span className="disabled">&rsaquo;</span>
          )}
        </div>
        <div className="ec-pages">
          {pageNumbers.map((p, i) => (
            <Link
              key={p}
              href={`/epaper/${iso}?page=${i + 1}`}
              className={i + 1 === current ? "on" : ""}
            >
              Page {p}
            </Link>
          ))}
        </div>
        <div className="ec-actions">
          {edition.pdfUrl && (
            <a href={edition.pdfUrl} target="_blank" rel="noreferrer">
              PDF replica
            </a>
          )}
          <PrintButton />
        </div>
      </div>

      <div className="paper">
        <header className="paper__nameplate">
          <div className="pn-side pn-left">
            Vol. LXXII &middot; No. {editionNo}
          </div>
          <div className="pn-title">{edition.title}</div>
          <div className="pn-side pn-right">
            {edition.strapline || "Digital Edition"}
          </div>
        </header>

        <div className="paper__meta">
          <span>{formatLongDate(dateObj)}</span>
          <span>{edition.strapline || "Digital Edition"}</span>
          <span>
            Page {current} of {totalPages}
          </span>
        </div>

        {items.length === 0 ? (
          <p className="hint">This page has no stories yet.</p>
        ) : (
          <div className="paper__page">
            {items.map((it) => (
              <EpaperStory key={it.id} item={it} />
            ))}
          </div>
        )}

        <footer className="paper__foot">
          {edition.title} &middot; {formatLongDate(dateObj)} &middot; Page {current} of{" "}
          {totalPages} &middot; chronicle.com
        </footer>
      </div>
    </div>
  );
}
