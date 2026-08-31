import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Admin", template: "%s — Admin" },
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="adm">
      <div className="app-bar">
        <Link href="/admin" className="brand">
          The Chronicle
        </Link>
        <Link href="/admin">Articles</Link>
        <Link href="/admin/editions">Editions</Link>
        <Link href="/admin/ads">Ads</Link>
        <Link href="/" target="_blank">
          View site &#8599;
        </Link>
        <span className="spacer" />
        <span className="who">{session.email}</span>
        <form action={logoutAction}>
          <button className="a-btn" type="submit">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
