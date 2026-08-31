// The e-Paper reader has its own minimal shell — no site header/footer —
// so it reads (and prints) like a newspaper page.
export default function EpaperLayout({ children }) {
  return <div className="epaper-shell">{children}</div>;
}
