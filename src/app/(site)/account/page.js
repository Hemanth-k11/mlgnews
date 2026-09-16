import { redirect } from "next/navigation";
import { getReaderSession } from "@/lib/auth";
import { readerLogoutAction } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const session = await getReaderSession();
  if (!session) redirect("/login?next=/account");

  const reader = await prisma.reader.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, createdAt: true },
  });
  if (!reader) redirect("/login?next=/account");

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">The Chronicle</div>
        <div className="sub">My account</div>

        <label>Name</label>
        <input value={reader.name} readOnly />

        <label>Email</label>
        <input value={reader.email} readOnly />

        <p className="demo">Member since {formatDate(reader.createdAt)}</p>

        <form action={readerLogoutAction}>
          <SubmitButton className="" pendingText="Signing out…">
            Sign out
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
