import Link from "next/link";
import { notFound } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import { RankModule, AdSlot, Signup } from "@/components/RailBits";
import { getCategoryPage, getMostRead } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const data = await getCategoryPage(params.slug, 1);
  if (!data) return { title: "Section not found" };
  return {
    title: data.category.name,
    description: data.category.blurb || `${data.category.name} news from The Chronicle.`,
  };
}

export default async function SectionPage({ params, searchParams }) {
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const data = await getCategoryPage(params.slug, page);
  if (!data) notFound();

  const mostRead = await getMostRead(5);
  const { category, items, pages } = data;
  const [lead, ...rest] = items;

  return (
    <div className="wrap">
      <div className="layout">
        <div>
          <div className="sec-head">
            <h1>{category.name}</h1>
            {category.blurb && <p>{category.blurb}</p>}
          </div>

          {items.length === 0 && (
            <div className="empty">
              <b>Nothing here yet</b>
              No published stories in {category.name}. Check back soon.
            </div>
          )}

          {lead && page === 1 && (
            <StoryCard article={lead} variant="lead" />
          )}

          <ul className="sec-list">
            {(page === 1 ? rest : items).map((a) => (
              <StoryCard key={a.id} article={a} variant="list" />
            ))}
          </ul>

          {pages > 1 && (
            <nav className="pager">
              {page > 1 ? (
                <Link href={`/section/${category.slug}?page=${page - 1}`}>
                  &lsaquo; Prev
                </Link>
              ) : (
                <span className="disabled">&lsaquo; Prev</span>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/section/${category.slug}?page=${n}`}
                  className={n === page ? "on" : ""}
                >
                  {n}
                </Link>
              ))}
              {page < pages ? (
                <Link href={`/section/${category.slug}?page=${page + 1}`}>
                  Next &rsaquo;
                </Link>
              ) : (
                <span className="disabled">Next &rsaquo;</span>
              )}
            </nav>
          )}
        </div>

        <aside className="rail">
          <RankModule title={`Most Read`} items={mostRead} />
          <AdSlot placement="section-rail" size="300 x 250" />
          <Signup heading="Money & Markets" blurb="A weekly read on the economy, every Friday." />
        </aside>
      </div>
    </div>
  );
}
