import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function GlobalNotFound() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px" }}>
      <div className="empty">
        <b>Page not found</b>
        That address doesn&rsquo;t match anything on the site.{" "}
        <Link href="/">Go to the front page</Link>.
      </div>
    </div>
  );
}
