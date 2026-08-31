// Shows a hero/thumbnail image if a URL is set, otherwise a styled placeholder
// block (same look as the mockups).
export default function Placeholder({ src, alt, variant = "4x3" }) {
  const cls = `ph ph--${variant}`;
  if (src) {
    return (
      <span className={cls}>
        {/* plain <img> keeps setup simple; lazy-loads below the fold */}
        <img src={src} alt={alt || ""} loading="lazy" />
      </span>
    );
  }
  return <span className={`${cls} ph--empty`} aria-hidden="true" />;
}
