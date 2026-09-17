export default function HomeLoading() {
  return (
    <div className="wrap">
      <div className="layout">
        <div>
          <div className="lead-story">
            <span className="ph ph--lead skel skel-photo" />
            <span className="skel skel-line skel-line--title skel-line--lg" />
            <span className="skel skel-line" />
          </div>

          <div className="strip">
            {[0, 1, 2].map((i) => (
              <div className="strip__item" key={i}>
                <span className="ph skel skel-photo" style={{ aspectRatio: "4 / 3" }} />
                <span className="skel skel-line skel-line--sm" />
              </div>
            ))}
          </div>

          {[0, 1].map((b) => (
            <section className="block" key={b}>
              <div className="block__head">
                <span className="skel skel-line--title" style={{ width: 140 }} />
              </div>
              <span className="ph skel skel-photo" style={{ aspectRatio: "16 / 9" }} />
              <span className="skel skel-line skel-line--lg" style={{ marginTop: 10 }} />
              <span className="skel skel-line skel-line--sm" />
              <span className="skel skel-line skel-line--sm" />
            </section>
          ))}
        </div>

        <aside className="rail">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="skel skel-line" />
          ))}
          <span className="skel skel-photo" style={{ height: 250, marginTop: 10 }} />
        </aside>
      </div>
    </div>
  );
}
