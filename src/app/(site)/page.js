import Link from "next/link";
import StoryCard from "@/components/StoryCard";
import { RankModule, AdSlot, Signup } from "@/components/RailBits";
import {
  getFeatured,
  getLatest,
  getSectionBlocks,
  getMostRead,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, latest, blocks, mostRead] = await Promise.all([
    getFeatured(),
    getLatest(8),
    getSectionBlocks(4, 2),
    getMostRead(5),
  ]);

  const lead = featured ?? latest[0];
  const secondary = latest.filter((a) => a.id !== lead?.id).slice(0, 3);
  const topPicks = latest.filter((a) => a.id !== lead?.id).slice(3, 8);

  if (!lead) {
    return (
      <div className="wrap" style={{ padding: "40px 20px" }}>
        <div className="empty">
          <b>No stories yet</b>
          Publish an article from the{" "}
          <Link href="/newsroom">admin panel</Link> and it will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="layout">
        <div>
          <StoryCard article={lead} variant="lead" />

          {secondary.length > 0 && (
            <div className="strip">
              {secondary.map((a) => (
                <StoryCard key={a.id} article={a} variant="strip" />
              ))}
            </div>
          )}

          {blocks.map(({ category, items }) => (
            <section className="block" key={category.id}>
              <div className="block__head">
                <h2>{category.name}</h2>
                <Link href={`/section/${category.slug}`}>
                  More in {category.name} &rsaquo;
                </Link>
              </div>
              {items[0] && <StoryCard article={items[0]} variant="block-lead" />}
              {items.length > 1 && (
                <ul className="mini-list">
                  {items.slice(1).map((a) => (
                    <li key={a.id}>
                      <Link href={`/article/${a.slug}`}>{a.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="rail">
          <RankModule title="Top Picks" items={topPicks} />
          <AdSlot placement="home-rail" size="300 x 250" />
          <RankModule title="Most Read" items={mostRead} />
          <Signup />
        </aside>
      </div>
    </div>
  );
}
