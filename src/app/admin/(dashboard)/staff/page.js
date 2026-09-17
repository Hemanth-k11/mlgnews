import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminListStaff } from "@/lib/queries";
import { updateStaffRoleAction, deleteStaffAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff" };

export default async function AdminStaffPage({ searchParams }) {
  const session = await getSession();
  if (session.role !== "super_admin") redirect("/admin?error=forbidden");

  const staff = await adminListStaff();

  return (
    <div className="adm-main">
      {searchParams?.saved && <div className="notice notice--ok">Saved.</div>}
      {searchParams?.deleted && <div className="notice notice--ok">Staff account deleted.</div>}
      {searchParams?.error && <div className="notice">{searchParams.error}</div>}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">Staff</h1>
          <p className="hint">
            Every account that can sign into /admin. Only a super admin can change roles or
            remove accounts here.
          </p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Articles</th>
              <th>Joined</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="t-title">
                  {s.name}
                  {s.id === session.id && (
                    <span className="pill" style={{ marginLeft: 6 }}>
                      You
                    </span>
                  )}
                </td>
                <td>{s.email}</td>
                <td>
                  <form action={updateStaffRoleAction} className="t-actions">
                    <input type="hidden" name="userId" value={s.id} />
                    <select name="role" defaultValue={s.role}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="author">Author</option>
                    </select>
                    <button className="a-btn" type="submit">
                      Save
                    </button>
                  </form>
                </td>
                <td>{s.articleCount}</td>
                <td>{formatDateTime(s.createdAt)}</td>
                <td>
                  {s.id !== session.id && (
                    <form action={deleteStaffAction}>
                      <input type="hidden" name="userId" value={s.id} />
                      <ConfirmButton
                        message={`Delete ${s.name}'s staff account? This cannot be undone.`}
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
