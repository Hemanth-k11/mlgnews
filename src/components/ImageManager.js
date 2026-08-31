import Placeholder from "./Placeholder";
import {
  setHeroImageAction,
  setHeroUrlAction,
  saveHeroMetaAction,
  clearHeroImageAction,
  addArticleImageAction,
  removeArticleImageAction,
} from "@/lib/actions";

// Server-rendered image panel. Each control is its own small form that posts to
// a server action and redirects back here — no client JavaScript needed.
export default function ImageManager({ article }) {
  const id = article.id;
  const images = article.images || [];

  return (
    <div className="image-manager">
      {/* ---- Main image ---- */}
      <section className="side-card">
        <h3>Main image</h3>

        {article.heroImage ? (
          <div className="img-preview">
            <img src={article.heroImage} alt={article.heroAlt || ""} />
          </div>
        ) : (
          <Placeholder variant="4x3" />
        )}

        <form action={setHeroImageAction} className="mini-upload">
          <input type="hidden" name="id" value={id} />
          <input type="file" name="file" accept="image/*" required />
          <button className="a-btn a-btn--primary" type="submit">
            Upload / replace
          </button>
        </form>

        <form action={setHeroUrlAction} className="mini-upload">
          <input type="hidden" name="id" value={id} />
          <input type="text" name="url" placeholder="…or paste an image URL" />
          <button className="a-btn" type="submit">
            Use this URL
          </button>
        </form>

        <form action={saveHeroMetaAction} className="mini-upload">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="heroAlt"
            defaultValue={article.heroAlt || ""}
            placeholder="Alt text (describe the image)"
          />
          <input
            type="text"
            name="heroCaption"
            defaultValue={article.heroCaption || ""}
            placeholder="Caption / credit"
          />
          <button className="a-btn" type="submit">
            Save alt &amp; caption
          </button>
        </form>

        {article.heroImage && (
          <form action={clearHeroImageAction}>
            <input type="hidden" name="id" value={id} />
            <button className="a-btn a-btn--danger" type="submit">
              Remove main image
            </button>
          </form>
        )}

        <p className="hint hint--req">
          Alt text is required to publish a story that has a main image.
        </p>
      </section>

      {/* ---- Gallery ---- */}
      <section className="side-card">
        <h3>More images ({images.length})</h3>

        {images.length > 0 && (
          <div className="thumb-list">
            {images.map((img) => (
              <div className="ti" key={img.id}>
                <img src={img.url} alt={img.alt || ""} />
                <div className="m">
                  {img.alt ? img.alt : <em>no alt text</em>}
                  {img.caption ? (
                    <>
                      <br />
                      {img.caption}
                    </>
                  ) : null}
                </div>
                <form action={removeArticleImageAction}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="articleId" value={id} />
                  <button
                    className="a-btn a-btn--danger"
                    type="submit"
                    aria-label="Remove image"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addArticleImageAction} className="mini-upload">
          <input type="hidden" name="articleId" value={id} />
          <input type="file" name="file" accept="image/*" required />
          <input type="text" name="alt" placeholder="Alt text" />
          <input type="text" name="caption" placeholder="Caption / credit" />
          <button className="a-btn a-btn--primary" type="submit">
            Add image
          </button>
        </form>
        <p className="hint">
          Gallery images show in an &ldquo;In pictures&rdquo; strip on the article page.
        </p>
      </section>
    </div>
  );
}
