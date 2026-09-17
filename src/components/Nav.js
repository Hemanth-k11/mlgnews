"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "nav-style";

export default function Nav({ sections }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  // Classic (the original scrolling row) is the default for everyone,
  // including mobile. Visitors can opt into the compact hamburger style,
  // and their choice is remembered per browser.
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "compact") setCompact(true);
    } catch {
      /* localStorage unavailable — just stay on the classic style */
    }
  }, []);

  const isActive = (href) => (href === "/" ? path === "/" : path.startsWith(href));
  const close = () => setOpen(false);

  function toggleStyle() {
    setCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "compact" : "classic");
      } catch {
        /* fine — the choice just won't be remembered */
      }
      return next;
    });
    setOpen(false);
  }

  return (
    <nav className={`nav${compact ? " nav--compact" : ""}`}>
      <div className="wrap nav__bar">
        {compact && (
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
        )}

        <div className={`nav__inner${compact && open ? " is-open" : ""}`}>
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

        <button
          type="button"
          className="nav__style-switch"
          onClick={toggleStyle}
          title={compact ? "Switch to the classic menu" : "Switch to the compact menu"}
        >
          {compact ? "Classic view" : "Compact view"}
        </button>
      </div>
    </nav>
  );
}
