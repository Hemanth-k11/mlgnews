import Link from "next/link";
import { getAd } from "@/lib/queries";

export function RankModule({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="mod__head">{title}</h2>
      <ol className="rank">
        {items.map((a) => (
          <li key={a.id}>
            <Link className="t" href={`/article/${a.slug}`}>
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Server component. Looks up the ad for this placement; falls back to the
// grey placeholder box when nothing is set or the ad is switched off.
export async function AdSlot({ placement, size = "300 x 250" }) {
  const ad = placement ? await getAd(placement) : null;

  if (ad?.imageUrl) {
    const img = (
      <img className="adslot__img" src={ad.imageUrl} alt={ad.alt || "Advertisement"} />
    );
    return (
      <div className="adslot adslot--live">
        <div className="adslot__lab">Advertisement</div>
        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noreferrer sponsored">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  }

  return (
    <div className="adslot">
      <div className="adslot__lab">Advertisement</div>
      <div className="adslot__box">{size}</div>
    </div>
  );
}

export function Signup({
  heading = "The Morning Wrap",
  blurb = "The day's essential stories, in your inbox by 7 a.m.",
}) {
  return (
    <div className="signup">
      <h3>{heading}</h3>
      <p>{blurb}</p>
      {/* Visual only for v1 — subscriptions get a backend in a later phase. */}
      <form action="/search">
        <input type="email" placeholder="name@email.com" aria-label="Email address" />
        <button type="submit">Subscribe free</button>
      </form>
    </div>
  );
}
