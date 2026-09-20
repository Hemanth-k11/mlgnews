import Link from "next/link";
import { prisma } from "@/lib/db";
import StaffResetPasswordForm from "@/components/StaffResetPasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set a new password" };

export default async function AdminResetPasswordPage({ searchParams }) {
  const token = searchParams?.token || "";

  const record = token
    ? await prisma.passwordResetToken.findUnique({ where: { token } })
    : null;
  const valid = record && !record.usedAt && record.expiresAt > new Date();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">Miryalaguda Chronicle</div>
        <div className="sub">Newsroom Admin — set a new password</div>

        {valid ? (
          <StaffResetPasswordForm token={token} />
        ) : (
          <p className="hint">
            This reset link is invalid or has expired.{" "}
            <Link href="/newsroom/forgot-password">Request a new one</Link>.
          </p>
        )}

        <p className="demo">
          <Link href="/newsroom/login">&larr; Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
