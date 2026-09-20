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
  if (!session) redirect("/newsroom/login");

  const isSuperAdmin = session.role === "super_admin";

  return (
    <div className="adm">
      <div className="app-bar">
        <Link href="/newsroom" className="brand">
          Miryalaguda Chronicle
        </Link>
        <Link href="/newsroom">Articles</Link>
        <Link href="/newsroom/editions">Editions</Link>
        {isSuperAdmin && (
          <>
            <Link href="/newsroom/ads">Ads</Link>
            <Link href="/newsroom/staff">Staff</Link>
          </>
        )}
        <Link href="/newsroom/profile">Profile</Link>
        <Link href="/" target="_blank">
          View site &#8599;
        </Link>
        <span className="spacer" />
        <Link href="/newsroom/profile" className="who">
          {session.email}
        </Link>
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
