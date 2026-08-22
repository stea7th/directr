const http = require("http");

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "creator@example.com",
  email_confirmed_at: "2026-08-21T00:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: "2026-08-21T00:00:00.000Z",
};

function encode(value) { return Buffer.from(JSON.stringify(value)).toString("base64url"); }
function session(email = user.email) {
  const currentUser = { ...user, email };
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const accessToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", role: "authenticated", email, exp: expiresAt })}.smoke-test-signature`;
  return { access_token: accessToken, token_type: "bearer", expires_in: 3600, expires_at: expiresAt, refresh_token: "directr-smoke-refresh-token", user: currentUser };
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS" });
  response.end(JSON.stringify(value));
}

http.createServer((request, response) => {
  if (request.method === "OPTIONS") return json(response, 200, {});
  let raw = "";
  request.on("data", (chunk) => { raw += chunk; });
  request.on("end", () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { return json(response, 400, { message: "Invalid JSON" }); }
    const url = new URL(request.url, "http://127.0.0.1:54321");
    if (url.pathname === "/auth/v1/token") {
      if (url.searchParams.get("grant_type") === "password" && body.password !== "correct-password") {
        return json(response, 400, { error: "invalid_grant", error_description: "Invalid login credentials", msg: "Invalid login credentials" });
      }
      return json(response, 200, session(body.email || user.email));
    }
    if (url.pathname === "/auth/v1/signup") return json(response, 200, session(body.email || user.email));
    if (url.pathname === "/auth/v1/recover") return json(response, 200, {});
    if (url.pathname === "/auth/v1/user") {
      const bearer = request.headers.authorization || "";
      return bearer.includes("smoke-test-signature") ? json(response, 200, user) : json(response, 403, { message: "Auth session missing" });
    }
    if (url.pathname.startsWith("/rest/v1/creator_profiles")) {
      return json(response, 404, { code: "PGRST205", message: "Creator profile table not applied in smoke environment" });
    }
    if (url.pathname.startsWith("/rest/v1/")) return json(response, 200, []);
    return json(response, 404, { message: `Unhandled mock route ${url.pathname}` });
  });
}).listen(54321, "127.0.0.1", () => console.log("Directr Supabase smoke server ready"));
