import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage({ searchParams }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="wordmark">The Chronicle</div>
        <div className="sub">Newsroom Admin</div>

        <LoginForm next={searchParams?.next} />

        <p className="demo">
          Demo account
          <br />
          <b>admin@example.com</b> &nbsp;/&nbsp; <b>admin1234</b>
        </p>
        <p className="demo">
          <Link href="/">&larr; Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
