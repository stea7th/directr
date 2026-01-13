// src/app/layout.tsx
import "./globals.css";
import NavMobile from "@/components/NavMobile";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  // safe fallback for local
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Directr — Generate Scroll-Stopping Hooks",
    template: "%s | Directr",
  },
  description:
    "Directr helps creators generate scroll-stopping hooks, captions, and posting frameworks for TikTok, Reels, and Shorts in seconds.",
  applicationName: "Directr",
  keywords: [
    "viral hooks",
    "hook generator",
    "tiktok hooks",
    "reels hooks",
    "youtube shorts hooks",
    "content hooks",
    "creator tools",
    "short form content",
  ],
  openGraph: {
    title: "Directr — Generate Scroll-Stopping Hooks",
    description:
      "Generate scroll-stopping hooks, captions, and posting frameworks for TikTok, Reels, and Shorts in seconds.",
    url: "/",
    siteName: "Directr",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Directr — Viral Hook Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Directr — Generate Scroll-Stopping Hooks",
    description:
      "Generate scroll-stopping hooks, captions, and posting frameworks for TikTok, Reels, and Shorts in seconds.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = await createServerClient();
    await s.auth.signOut();
  }

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="site">
        <nav className="nav">
          <div className="nav__inner">
            <Link href="/" className="logo">
              directr<span className="dot">.</span>
            </Link>

            {/* Desktop menu: ONLY Create + Pricing */}
            <div className="menu">
              <Link href="/create">Create</Link>
              <Link href="/pricing">Pricing</Link>

              {/* keep auth button (not part of “menu links”) */}
              {user ? (
                <form action={signOut}>
                  <button className="btn btn--ghost" type="submit">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link href="/login" className="btn btn--primary">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="page">{children}</main>

        {/* Mobile nav still renders separately */}
        <NavMobile showLockControls={false} isAuthed={!!user} />
      </body>
    </html>
  );
}
