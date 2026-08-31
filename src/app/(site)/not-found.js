import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "48px 20px" }}>
      <div className="empty">
        <b>Page not found</b>
        The story or section you asked for doesn&rsquo;t exist or has been moved.{" "}
        <Link href="/">Go to the front page</Link>.
      </div>
    </div>
  );
}
