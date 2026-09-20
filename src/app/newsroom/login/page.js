import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage({ searchParams }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">Miryalaguda Chronicle</div>
        <div className="sub">Newsroom Admin</div>

        {searchParams?.reset && (
          <p className="hint">Password updated. Sign in with your new password.</p>
        )}

        <LoginForm next={searchParams?.next} />

        <p className="demo">
          <Link href="/newsroom/forgot-password">Forgot your password?</Link>
        </p>
        <p className="demo">
          <Link href="/">&larr; Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
