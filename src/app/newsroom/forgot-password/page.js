import Link from "next/link";
import StaffForgotPasswordForm from "@/components/StaffForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function AdminForgotPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">Miryalaguda Chronicle</div>
        <div className="sub">Newsroom Admin — reset your password</div>

        <StaffForgotPasswordForm />

        <p className="demo">
          <Link href="/newsroom/login">&larr; Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
