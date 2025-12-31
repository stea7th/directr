import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <div className="card__head" style={{ marginBottom: 6 }}>
          <div>
            <div className="title">Sign in</div>
            <div className="subtitle">Access Directr.</div>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
