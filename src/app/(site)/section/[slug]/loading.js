export default function SectionLoading() {
  return (
    <div className="wrap">
      <div className="layout">
        <div>
          <div className="sec-head">
            <span className="skel skel-line--title" style={{ width: 220, height: 30 }} />
          </div>

          <div className="lead-story">
            <span className="ph ph--lead skel skel-photo" />
            <span className="skel skel-line skel-line--title skel-line--lg" />
          </div>

          <ul className="sec-list">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <span
                  className="ph skel skel-photo"
                  style={{ width: 140, aspectRatio: "4 / 3", flex: "none" }}
                />
                <div style={{ flex: 1 }}>
                  <span className="skel skel-line skel-line--lg" />
                  <span className="skel skel-line skel-line--sm" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rail">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="skel skel-line" />
          ))}
        </aside>
      </div>
    </div>
  );
}
