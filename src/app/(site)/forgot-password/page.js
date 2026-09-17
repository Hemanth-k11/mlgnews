import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">The Chronicle</div>
        <div className="sub">Reset your password</div>

        <ForgotPasswordForm />

        <p className="demo">
          <Link href="/login">&larr; Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
