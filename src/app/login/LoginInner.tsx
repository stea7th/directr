"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function LoginInner() {
  const params = useSearchParams();
  const error = params.get("error");

  const [email, setEmail] = useState("");

  async function handleMagicLink() {
    console.log("Send magic link:", email);
    // Your existing auth logic goes here
  }

  return (
    <main className="login-root">
      <h1>Sign in</h1>

      {error && (
        <p className="login-error">Error: {error}</p>
      )}

      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleMagicLink}>Send Magic Link</button>
    </main>
  );
}
