import { adminListAdminRequests } from "@/lib/queries";
import { approveAdminRequestAction, rejectAdminRequestAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Access requests" };

export default async function AdminRequestsPage({ searchParams }) {
  const requests = await adminListAdminRequests();

  return (
    <div className="adm-main">
      {searchParams?.approved && (
        <div className="notice notice--ok">Request approved — a staff account was created.</div>
      )}
      {searchParams?.rejected && <div className="notice notice--ok">Request rejected.</div>}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">Access requests</h1>
          <p className="hint">
            Readers who checked &ldquo;request admin access&rdquo; when signing up. Approving
            creates a staff account (role: editor) they can use to sign into /admin.
          </p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Note</th>
              <th>Requested</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)" }}>
                  No pending requests.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="t-title">{r.name}</td>
                <td>{r.email}</td>
                <td>{r.adminRequestNote || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td>{formatDateTime(r.createdAt)}</td>
                <td>
                  <div className="t-actions">
                    <form action={approveAdminRequestAction}>
                      <input type="hidden" name="readerId" value={r.id} />
                      <button className="a-btn a-btn--primary" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={rejectAdminRequestAction}>
                      <input type="hidden" name="readerId" value={r.id} />
                      <ConfirmButton message={`Reject ${r.name}'s request for admin access?`}>
                        Reject
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
