import Link from "next/link";
import ReaderLoginForm from "@/components/ReaderLoginForm";

export const metadata = { title: "Sign in" };

export default function ReaderLoginPage({ searchParams }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">Miryalaguda Chronicle</div>
        <div className="sub">Sign in</div>

        <ReaderLoginForm next={searchParams?.next} />

        <p className="demo">
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
        <p className="demo">
          New here? <Link href="/signup">Create an account</Link>
        </p>
        <p className="demo">
          <Link href="/">&larr; Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
