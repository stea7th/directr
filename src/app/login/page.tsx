'use client';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendReset(email: string) {
  // IMPORTANT: point back to your confirm page
  const redirectTo =
    `${window.location.origin}/reset/confirm`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo, // <-- this makes .ConfirmationURL include /reset/confirm
  });

  if (error) {
    alert(error.message);
  } else {
    alert('Reset link sent. Check your email.');
  }
}

export default function ForgotForm() {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await sendReset(String(data.get('email') || '').trim());
  };

  return (
    <form onSubmit={onSubmit}>
      <input name="email" type="email" placeholder="you@email.com" required />
      <button type="submit">Send reset link</button>
    </form>
  );
}
