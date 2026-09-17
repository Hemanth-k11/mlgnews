import { getSession } from "@/lib/auth";
import {
  updateStaffProfileAction,
  updateStaffAvatarAction,
  changeStaffPasswordAction,
} from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatDate, calcAge } from "@/lib/format";
import ProfileForm from "@/components/ProfileForm";
import AvatarUpload from "@/components/AvatarUpload";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My profile" };

export default async function StaffProfilePage({ searchParams }) {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const age = calcAge(user.dateOfBirth);

  return (
    <div className="adm-main">
      {searchParams?.imgerror && <div className="notice">{searchParams.imgerror}</div>}

      <div className="adm-toprow">
        <div>
          <h1 className="adm-h1">My profile</h1>
          <p className="hint">Your staff account details. Visible only in the admin panel.</p>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <section className="side-card">
            <h3>Profile photo</h3>
            <AvatarUpload
              action={updateStaffAvatarAction}
              avatarUrl={user.avatarUrl}
              name={user.name}
            />
            <p className="hint">
              {user.email} &middot; can&rsquo;t be changed
              {age !== null && ` · Age ${age}`}
              {" · Role "}
              {user.role}
              {" · Member since "}
              {formatDate(user.createdAt)}
            </p>
          </section>

          <section>
            <h2 className="section-title">Edit profile</h2>
            <ProfileForm action={updateStaffProfileAction} profile={user} />
          </section>

          <section>
            <h2 className="section-title">Change password</h2>
            <ChangePasswordForm action={changeStaffPasswordAction} />
          </section>
        </div>
      </div>
    </div>
  );
}
