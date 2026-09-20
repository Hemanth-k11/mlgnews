import Link from "next/link";
import { notFound } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import Markdown from "@/components/Markdown";
import Placeholder from "@/components/Placeholder";
import { RankModule, AdSlot } from "@/components/RailBits";
import LikeButton from "@/components/LikeButton";
import ShareBar from "@/components/ShareBar";
import {
  getArticleBySlug,
  getRelated,
  getMostRead,
  incrementViews,
  getArticleEngagement,
} from "@/lib/queries";
import { getVisitorId } from "@/lib/visitor";
import { formatDateTime, splitTags } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Story not found" };
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      images: article.heroImage ? [article.heroImage] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // best-effort view count for "Most Read"
  await incrementViews(article.id);

  const [related, mostRead, engagement] = await Promise.all([
    getRelated(article, 3),
    getMostRead(5),
    getArticleEngagement(article.id, getVisitorId()),
  ]);

  const tags = splitTags(article.tags);

  return (
    <div className="wrap">
      <div className="layout">
        <article className="article">
          <div className="article__wrap">
            <p className="crumb">
              <Link href="/">Home</Link> &rsaquo;{" "}
              <Link href={`/section/${article.category.slug}`}>
                {article.category.name}
              </Link>
            </p>

            <span className="kicker">{article.category.name}</span>
            <h1 className="hl">{article.title}</h1>
            {article.summary && <p className="deck">{article.summary}</p>}

            <div className="a-byline">
              <span className="avatar" aria-hidden="true" />
              <div className="info">
                <b>By {article.author?.name || "Staff Reporter"}</b>
                <br />
                {formatDateTime(article.publishedAt)}
              </div>
              <LikeButton
                articleId={article.id}
                slug={article.slug}
                likeCount={engagement.likeCount}
                liked={engagement.liked}
              />
              <ShareBar title={article.title} />
            </div>

            {article.heroImage && (
              <>
                <Placeholder
                  src={article.heroImage}
                  alt={article.heroAlt}
                  variant="hero"
                />
                {article.heroCaption && (
                  <p className="caption">{article.heroCaption}</p>
                )}
              </>
            )}

            <Markdown>{article.body}</Markdown>

            {article.images?.length > 0 && (
              <section className="gallery">
                <h2 className="section-title">In pictures</h2>
                <div className="gallery-grid">
                  {article.images.map((img) => (
                    <figure key={img.id}>
                      <Placeholder src={img.url} alt={img.alt} variant="4x3" />
                      {img.caption && (
                        <figcaption className="caption">{img.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {tags.length > 0 && (
              <div className="tag-row">
                {tags.map((t) => (
                  <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}>
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <section>
                <h2 className="section-title">More in {article.category.name}</h2>
                <div className="rel-grid">
                  {related.map((a) => (
                    <StoryCard key={a.id} article={a} variant="rel" />
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>

        <aside className="rail">
          <RankModule title="Most Read" items={mostRead} />
          <AdSlot placement="article-rail" size="300 x 600" />
        </aside>
      </div>
    </div>
  );
}
