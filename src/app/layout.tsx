import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { redirect } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import NavLink from "@/components/NavLink";
import NavMobile from "@/components/NavMobile";
import { createServerClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Directr — Know exactly what to film next", template: "%s | Directr" },
  description: "Your creative director, built around you. Directr learns your taste and tells you what to make, what to say, and exactly how to film it.",
  applicationName: "Directr",
  keywords: ["creative director for creators", "what to film", "content direction", "creator coach", "film-ready content plan", "creator strategy", "short-form creative direction"],
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Directr — Know exactly what to film next",
    description: "Your creative director, built around you. Stop deciding. Start filming.",
    url: "/",
    siteName: "Directr",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Directr — Know exactly what to film next" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Directr — Know exactly what to film next",
    description: "Your creative director, built around you.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const client = await createServerClient();
    await client.auth.signOut();
    redirect("/");
  }

  const analyticsId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {analyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
            <Script id="directr-google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analyticsId}',{page_path:window.location.pathname});`}</Script>
          </>
        )}
      </head>
      <body className="site">
        <header className="nav">
          <div className="nav__inner">
            <Link href={user ? "/today" : "/"} className="logo" aria-label="Directr home">directr<span className="dot">.</span></Link>
            {user ? (
              <>
                <nav className="desktop-product-nav" aria-label="Main navigation">
                  <NavLink href="/today">Today</NavLink>
                  <NavLink href="/create">Create</NavLink>
                  <NavLink href="/coach">Coach</NavLink>
                  <NavLink href="/library">Library</NavLink>
                </nav>
                <div className="nav-account">
                  <Link href="/dna" className="nav-account__dna">Creator DNA</Link>
                  <Link href="/pricing" className="nav-account__billing">Billing</Link>
                  <form action={signOut}><button type="submit">Sign out</button></form>
                </div>
              </>
            ) : (
              <nav className="public-nav" aria-label="Public navigation">
                <Link href="/pricing">Pricing</Link>
                <Link href="/login" className="public-nav__signin">Sign in</Link>
                <Link href="/login?mode=signup&next=%2Fonboarding" className="public-nav__cta">Get your direction <span aria-hidden="true">→</span></Link>
              </nav>
            )}
          </div>
        </header>
        <main className="page">{children}</main>
        <NavMobile isAuthed={Boolean(user)} />
      </body>
    </html>
  );
}
