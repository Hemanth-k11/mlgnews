import { adminListAds } from "@/lib/queries";
import {
  setAdImageAction,
  setAdImageUrlAction,
  saveAdAction,
  clearAdImageAction,
} from "@/lib/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Advertisements" };

const LABELS = {
  "home-rail": "Homepage — right rail",
  "article-rail": "Article page — right rail",
  "section-rail": "Section page — right rail",
};

export default async function AdsPage({ searchParams }) {
  const ads = await adminListAds();

  return (
    <div className="adm-main">
      {searchParams?.saved && <div className="notice notice--ok">Saved.</div>}
      {searchParams?.imgerror && (
        <div className="notice">{searchParams.imgerror}</div>
      )}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">Advertisements</h1>
          <p className="hint">
            One banner per placement. Upload an image (or paste a URL), set a
            click-through link, and switch it on or off.
          </p>
        </div>
      </div>

      <div className="image-manager">
        {ads.map((ad) => (
          <section className="side-card" key={ad.id}>
            <h3>{LABELS[ad.placement] || ad.placement}</h3>

            {ad.imageUrl ? (
              <div className="img-preview">
                <img src={ad.imageUrl} alt={ad.alt} />
              </div>
            ) : (
              <div className="adslot__box" style={{ height: 120, marginTop: 0 }}>
                No image
              </div>
            )}

            <p className="hint" style={{ margin: "6px 0 10px" }}>
              Status:{" "}
              <b style={{ color: ad.active ? "var(--ok)" : "var(--muted)" }}>
                {ad.active && ad.imageUrl ? "live on the site" : "not showing"}
              </b>
            </p>

            <form action={setAdImageAction} className="mini-upload">
              <input type="hidden" name="id" value={ad.id} />
              <input type="file" name="file" accept="image/*" required />
              <button className="a-btn a-btn--primary" type="submit">
                Upload / replace
              </button>
            </form>

            <form action={setAdImageUrlAction} className="mini-upload">
              <input type="hidden" name="id" value={ad.id} />
              <input type="text" name="url" placeholder="…or paste an image URL" />
              <button className="a-btn" type="submit">
                Use this URL
              </button>
            </form>

            <form action={saveAdAction} className="mini-upload">
              <input type="hidden" name="id" value={ad.id} />
              <input
                type="text"
                name="name"
                defaultValue={ad.name}
                placeholder="Advertiser / internal label"
              />
              <input
                type="text"
                name="linkUrl"
                defaultValue={ad.linkUrl}
                placeholder="Click-through URL (https://…)"
              />
              <input
                type="text"
                name="alt"
                defaultValue={ad.alt}
                placeholder="Alt text"
              />
              <label className="check-row">
                <input type="checkbox" name="active" defaultChecked={ad.active} />
                Show this ad on the site
              </label>
              <button className="a-btn" type="submit">
                Save settings
              </button>
            </form>

            {ad.imageUrl && (
              <form action={clearAdImageAction}>
                <input type="hidden" name="id" value={ad.id} />
                <button className="a-btn a-btn--danger" type="submit">
                  Remove image
                </button>
              </form>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
