'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash;
      // if a Supabase auth hash lands at "/", shove it to the reset page
      if (h && /type=recovery/.test(h)) {
        window.location.replace('/reset/confirm' + h);
      }
    }
  }, []);
  
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function send() {
    setMessage('');
    if (!email) {
      setMessage('Enter your email.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // IMPORTANT: this keeps the flow on /reset/confirm instead of homepage
        redirectTo: 'https://directr-beta.vercel.app/reset/confirm',
      });
      if (error) throw error;
      setMessage('Check your email for the reset link.');
    } catch (e: any) {
      setMessage(e?.message || 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          Forgot your password?
        </h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Enter your email and we’ll send a reset link.
        </p>

        <label style={label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <button onClick={send} disabled={busy} style={button(busy)}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>

        {message ? <div style={note}>{message}</div> : null}
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#0a0a0a',
  color: '#fff',
  padding: 24,
};

const card: React.CSSProperties = {
  maxWidth: 420,
  width: '100%',
  background: '#111214',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 12,
  padding: 20,
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  opacity: 0.8,
  marginTop: 12,
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #262b31',
  background: '#0f1115',
  color: '#fff',
} as const;

const button = (busy: boolean): React.CSSProperties => ({
  width: '100%',
  marginTop: 14,
  padding: '10px 12px',
  borderRadius: 10,
  fontWeight: 600,
  background: '#0ea5e9',
  border: '1px solid #096aa6',
  color: '#fff',
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.75 : 1,
});

const note: React.CSSProperties = {
  marginTop: 12,
  color: '#9ca3af',
};
