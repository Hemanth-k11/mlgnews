import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { adminListAdminRequests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Admin", template: "%s — Admin" },
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isSuperAdmin = session.role === "super_admin";
  const pendingRequests = isSuperAdmin ? await adminListAdminRequests() : [];

  return (
    <div className="adm">
      <div className="app-bar">
        <Link href="/admin" className="brand">
          Miryalaguda Chronicle
        </Link>
        <Link href="/admin">Articles</Link>
        <Link href="/admin/editions">Editions</Link>
        <Link href="/admin/ads">Ads</Link>
        {isSuperAdmin && (
          <>
            <Link href="/admin/requests">
              Requests{pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}
            </Link>
            <Link href="/admin/staff">Staff</Link>
          </>
        )}
        <Link href="/admin/profile">Profile</Link>
        <Link href="/" target="_blank">
          View site &#8599;
        </Link>
        <span className="spacer" />
        <Link href="/admin/profile" className="who">
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
