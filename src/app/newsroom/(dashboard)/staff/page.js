import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminListStaff } from "@/lib/queries";
import { addStaffAction, updateStaffRoleAction, deleteStaffAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff" };

export default async function AdminStaffPage({ searchParams }) {
  const session = await getSession();
  if (session.role !== "super_admin") redirect("/newsroom?error=forbidden");

  const staff = await adminListStaff();

  return (
    <div className="adm-main">
      {searchParams?.saved && <div className="notice notice--ok">Saved.</div>}
      {searchParams?.added && (
        <div className="notice notice--ok">
          Staff account added for {searchParams.added}. They can sign in at /newsroom with the
          password you set. Share it with them privately and ask them to change it on their
          Profile page.
        </div>
      )}
      {searchParams?.deleted && <div className="notice notice--ok">Staff account deleted.</div>}
      {searchParams?.error && <div className="notice">{searchParams.error}</div>}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">Staff</h1>
          <p className="hint">
            Every account that can sign into /newsroom. Only a super admin can add people,
            change roles or remove accounts here.
          </p>
        </div>
      </div>

      <form
        action={addStaffAction}
        className="t-actions"
        style={{ flexWrap: "wrap", gap: 8, marginBottom: 20 }}
      >
        <input name="name" type="text" placeholder="Full name" autoComplete="off" required />
        <input name="email" type="email" placeholder="Email address" autoComplete="off" required />
        <select name="role" defaultValue="editor" aria-label="Role">
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
        </select>
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton className="a-btn" pendingText="Adding…">
          Add staff
        </SubmitButton>
      </form>
      <p className="hint" style={{ marginTop: -10, marginBottom: 20 }}>
        You set the password for a new staff member. They sign in at /newsroom with their email and
        this password — share it with them privately.
      </p>

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
