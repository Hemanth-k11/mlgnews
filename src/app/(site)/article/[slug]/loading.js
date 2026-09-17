export default function ArticleLoading() {
  return (
    <div className="wrap">
      <div className="layout">
        <article className="article">
          <div className="article__wrap">
            <span className="skel skel-line skel-line--sm" style={{ width: 100 }} />
            <span className="skel skel-line--title skel-line--lg" style={{ height: 34, marginTop: 12 }} />
            <span className="skel skel-line skel-line--lg" />

            <div className="a-byline">
              <span className="avatar skel" />
              <div className="info">
                <span className="skel skel-line skel-line--sm" style={{ width: 120 }} />
              </div>
            </div>

            <span className="ph ph--hero skel skel-photo" />

            <span className="skel skel-line skel-line--lg" style={{ marginTop: 18 }} />
            <span className="skel skel-line skel-line--lg" />
            <span className="skel skel-line skel-line--lg" />
            <span className="skel skel-line skel-line--sm" />
          </div>
        </article>

        <aside className="rail">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="skel skel-line" />
          ))}
        </aside>
      </div>
    </div>
  );
}
