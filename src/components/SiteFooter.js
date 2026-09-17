import Link from "next/link";
import { getSections } from "@/lib/queries";

export default async function SiteFooter() {
  const sections = await getSections();
  const half = Math.ceil(sections.length / 2);

  return (
    <footer className="foot">
      <div className="foot__inner">
        <div className="foot__cols">
          <div>
            <h4>Sections</h4>
            {sections.slice(0, half).map((s) => (
              <Link key={s.id} href={`/section/${s.slug}`}>
                {s.name}
              </Link>
            ))}
          </div>
          <div>
            <h4>More</h4>
            {sections.slice(half).map((s) => (
              <Link key={s.id} href={`/section/${s.slug}`}>
                {s.name}
              </Link>
            ))}
          </div>
          <div>
            <h4>Miryalaguda Chronicle</h4>
            <a href="#">About Us</a>
            <a href="#">Code of Ethics</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
          <div>
            <h4>Account</h4>
            <Link href="/epaper">e-Paper</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/admin">Admin panel</Link>
            <a href="#">Newsletters</a>
          </div>
        </div>
        <div className="foot__bar">
          <span>&copy; {new Date().getFullYear()} Miryalaguda Chronicle. Demo project.</span>
          <span>Terms &middot; Privacy &middot; Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
