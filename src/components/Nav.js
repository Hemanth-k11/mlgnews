"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ sections }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => (href === "/" ? path === "/" : path.startsWith(href));
  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <div className="wrap nav__bar">
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-label="Toggle sections menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav__inner${open ? " is-open" : ""}`}>
          <Link href="/" className={isActive("/") ? "is-active" : ""} onClick={close}>
            Home
          </Link>
          {sections.map((s) => {
            const href = `/section/${s.slug}`;
            return (
              <Link key={s.id} href={href} className={isActive(href) ? "is-active" : ""} onClick={close}>
                {s.name}
              </Link>
            );
          })}
          <Link href="/epaper" className={isActive("/epaper") ? "is-active" : ""} onClick={close}>
            e-Paper
          </Link>
          <Link href="/search" className="nav__search" onClick={close}>
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
