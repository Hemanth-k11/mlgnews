import Link from "next/link";
import { prisma } from "@/lib/db";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }) {
  const token = searchParams?.token || "";

  const record = token
    ? await prisma.passwordResetToken.findUnique({ where: { token } })
    : null;
  const valid = record && !record.usedAt && record.expiresAt > new Date();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">Miryalaguda Chronicle</div>
        <div className="sub">Set a new password</div>

        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="hint">
            This reset link is invalid or has expired.{" "}
            <Link href="/forgot-password">Request a new one</Link>.
          </p>
        )}

        <p className="demo">
          <Link href="/login">&larr; Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
