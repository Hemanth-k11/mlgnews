import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Create account" };

export default function SignupPage({ searchParams }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">The Chronicle</div>
        <div className="sub">Create your account</div>

        <SignupForm next={searchParams?.next} />

        <p className="demo">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        <p className="demo">
          <Link href="/">&larr; Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
