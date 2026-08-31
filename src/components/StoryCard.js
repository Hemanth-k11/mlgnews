import Link from "next/link";
import Placeholder from "./Placeholder";
import { timeAgo } from "@/lib/format";

// One component, several shapes. `variant` picks the layout:
//   lead        - big hero story (home + section top)
//   strip       - one of the three cards under the lead
//   block-lead   - image-left story at the top of a section block
//   list        - a row on the section / search page
//   rel         - a small "related" card
export default function StoryCard({ article, variant = "strip" }) {
  const href = `/article/${article.slug}`;
  const cat = article.category?.name;
  const author = article.author?.name;
  const when = timeAgo(article.publishedAt);

  if (variant === "lead") {
    return (
      <article className="lead-story">
        <Placeholder src={article.heroImage} alt={article.heroAlt} variant="lead" />
        {cat && <span className="kicker">{cat}</span>}
        <h2 className="hl">
          <Link href={href}>{article.title}</Link>
        </h2>
        {article.summary && <p className="deck">{article.summary}</p>}
        <p className="byline">
          {author ? <>By <b>{author}</b> &middot; </> : null}
          {when}
        </p>
      </article>
    );
  }

  if (variant === "strip") {
    return (
      <div className="strip__item">
        <Placeholder src={article.heroImage} alt={article.heroAlt} variant="4x3" />
        {cat && <span className="kicker">{cat}</span>}
        <h3 className="hl">
          <Link href={href}>{article.title}</Link>
        </h3>
        <p className="byline">{when}</p>
      </div>
    );
  }

  if (variant === "block-lead") {
    return (
      <div className="block__lead">
        <Placeholder src={article.heroImage} alt={article.heroAlt} variant="4x3" />
        <div>
          <h3 className="hl">
            <Link href={href}>{article.title}</Link>
          </h3>
          {article.summary && <p className="deck">{article.summary}</p>}
          <p className="byline">
            {author ? <>By <b>{author}</b> &middot; </> : null}
            {when}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "rel") {
    return (
      <div>
        <Placeholder src={article.heroImage} alt={article.heroAlt} variant="4x3" />
        <h3 className="hl">
          <Link href={href}>{article.title}</Link>
        </h3>
      </div>
    );
  }

  // variant === "list"
  return (
    <li>
      <Placeholder src={article.heroImage} alt={article.heroAlt} variant="4x3" />
      <div>
        {cat && <span className="kicker">{cat}</span>}
        <h3 className="hl">
          <Link href={href}>{article.title}</Link>
        </h3>
        {article.summary && <p className="deck">{article.summary}</p>}
        <p className="byline">{when}</p>
      </div>
    </li>
  );
}
