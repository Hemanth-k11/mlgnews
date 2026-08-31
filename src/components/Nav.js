"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ sections }) {
  const path = usePathname();
  const isActive = (href) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <nav className="nav">
      <div className="wrap nav__inner">
        <Link href="/" className={isActive("/") ? "is-active" : ""}>
          Home
        </Link>
        {sections.map((s) => {
          const href = `/section/${s.slug}`;
          return (
            <Link key={s.id} href={href} className={isActive(href) ? "is-active" : ""}>
              {s.name}
            </Link>
          );
        })}
        <Link
          href="/epaper"
          className={isActive("/epaper") ? "is-active" : ""}
        >
          e-Paper
        </Link>
        <Link href="/search" className="nav__search">
          Search
        </Link>
      </div>
    </nav>
  );
}
