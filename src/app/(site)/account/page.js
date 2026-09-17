import Link from "next/link";
import { redirect } from "next/navigation";
import { getReaderSession } from "@/lib/auth";
import {
  readerLogoutAction,
  updateReaderProfileAction,
  updateReaderAvatarAction,
  changeReaderPasswordAction,
} from "@/lib/actions";
import { prisma } from "@/lib/db";
import { getReaderLikedArticles } from "@/lib/queries";
import { formatDate, calcAge } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";
import ProfileForm from "@/components/ProfileForm";
import AvatarUpload from "@/components/AvatarUpload";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }) {
  const session = await getReaderSession();
  if (!session) redirect("/login?next=/account");

  const reader = await prisma.reader.findUnique({ where: { id: session.id } });
  if (!reader) redirect("/login?next=/account");

  const liked = await getReaderLikedArticles(reader.id);
  const age = calcAge(reader.dateOfBirth);

  return (
    <div className="wrap">
      <div className="adm-main">
        {searchParams?.reset && <div className="notice notice--ok">Password updated.</div>}
        {searchParams?.imgerror && <div className="notice">{searchParams.imgerror}</div>}

        <div className="adm-toprow">
          <h1 className="adm-h1">My account</h1>
          <form action={readerLogoutAction}>
            <SubmitButton className="a-btn" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </div>

        <div className="dash-grid">
          <div className="dash-col">
            <section className="side-card">
              <h3>Profile photo</h3>
              <AvatarUpload
                action={updateReaderAvatarAction}
                avatarUrl={reader.avatarUrl}
                name={reader.name}
              />
              <p className="hint">
                {reader.email} &middot; can&rsquo;t be changed
                {age !== null && ` · Age ${age}`}
                {" · Member since "}
                {formatDate(reader.createdAt)}
              </p>
            </section>

            <section>
              <h2 className="section-title">Edit profile</h2>
              <ProfileForm action={updateReaderProfileAction} profile={reader} />
            </section>

            <section>
              <h2 className="section-title">Change password</h2>
              <ChangePasswordForm action={changeReaderPasswordAction} />
            </section>
          </div>

          <aside className="dash-col">
            <section className="side-card">
              <h3>Activity</h3>
              <div className="stat-row">
                <div className="stat">
                  <b>{liked.length}</b>
                  <span>Liked</span>
                </div>
              </div>
            </section>

            <section className="side-card">
              <h3>Liked articles</h3>
              {liked.length === 0 ? (
                <p className="hint">You haven&rsquo;t liked any stories yet.</p>
              ) : (
                <div className="liked-list">
                  {liked.map((a) => (
                    <div key={a.id}>
                      <span className="cat">{a.category.name}</span>
                      <Link href={`/article/${a.slug}`}>{a.title}</Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
