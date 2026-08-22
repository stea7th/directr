const assert = require("assert/strict");
const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const signIn = await browser.newPage();
    await signIn.goto("http://127.0.0.1:3000/login?next=%2Ftoday", { waitUntil: "networkidle" });
    await signIn.getByLabel("Email address").fill("creator@example.com");
    await signIn.getByLabel("Password").fill("correct-password");
    await signIn.getByRole("button", { name: "Sign in" }).click();
    await signIn.waitForURL("**/onboarding", { timeout: 20000 });
    const me = await signIn.request.get("http://127.0.0.1:3000/api/me");
    assert.equal((await me.json()).user.email, "creator@example.com", "Server must recognize the browser session");
    assert.match(await signIn.locator("body").innerText(), /building an audience around/i);
    console.log("PASS: sign-in writes a server-readable session and opens the protected onboarding page");

    const invalidContext = await browser.newContext();
    const invalid = await invalidContext.newPage();
    await invalid.goto("http://127.0.0.1:3000/login");
    await invalid.getByLabel("Email address").fill("creator@example.com");
    await invalid.getByLabel("Password").fill("incorrect-password");
    await invalid.getByRole("button", { name: "Sign in" }).click();
    await invalid.getByRole("alert").waitFor({ timeout: 10000 });
    assert.match(await invalid.getByRole("alert").innerText(), /invalid login credentials/i);
    console.log("PASS: invalid credentials show a visible, accurate error");

    const signupContext = await browser.newContext();
    const signup = await signupContext.newPage();
    await signup.goto("http://127.0.0.1:3000/signup", { waitUntil: "networkidle" });
    await signup.getByLabel("Email address").fill("new-creator@example.com");
    await signup.getByLabel("Password").fill("correct-password");
    await signup.getByRole("button", { name: "Create my account" }).click();
    await signup.waitForURL("**/onboarding", { timeout: 20000 });
    console.log("PASS: signup establishes a session and reaches Creator DNA onboarding");

    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto("http://127.0.0.1:3000/");
    assert.match(await publicPage.locator("h1").innerText(), /what to film/i);
    assert.equal(await publicPage.locator("main section").count() <= 4, true, "Landing page must stay concise");
    await publicPage.goto("http://127.0.0.1:3000/pricing");
    assert.match(await publicPage.locator("body").innerText(), /Directr Pro/i);
    console.log("PASS: concise landing page and existing Stripe pricing render correctly");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
