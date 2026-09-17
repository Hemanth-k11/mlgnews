import Link from "next/link";
import { getSections } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { getReaderSession } from "@/lib/auth";
import Nav from "./Nav";

export default async function SiteHeader() {
  const sections = await getSections();
  const reader = await getReaderSession();

  return (
    <>
      <div className="util">
        <div className="wrap util__inner">
          <span>{formatDate(new Date())}</span>
          <span className="util__links">
            <Link href="/epaper">e-Paper</Link>
            <a href="#">Subscribe</a>
            {reader ? (
              <Link href="/account">{reader.name}</Link>
            ) : (
              <>
                <Link href="/login">Sign In</Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </span>
        </div>
      </div>

      <header className="mast">
        <div className="wrap mast__row">
          <span className="mast__edition">INDIA</span>
          <div>
            <Link href="/" className="wordmark">
              The Chronicle
            </Link>
            <div className="mast__tagline">Independent &middot; Since 1953</div>
          </div>
        </div>
      </header>

      <Nav sections={sections} />
    </>
  );
}
