// src/app/layout.tsx
import "./globals.css";
import NavMobile from "@/components/NavMobile";
import Link from "next/link";
import Script from "next/script";
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

  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),

  title: {
    default: "Directr — Fix your hook before you post",
    template: "%s | Directr",
  },

  description:
    "Hooks that sound human. Directr gives you hooks, delivery notes, filming plan, and captions for TikTok, Reels, and Shorts.",

  applicationName: "Directr",

  keywords: [
    "viral hooks",
    "hook generator",
    "tiktok hooks",
    "instagram reels hooks",
    "youtube shorts hooks",
    "content hooks",
    "creator tools",
    "short form content",
    "content director",
    "filming plan",
  ],

  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  openGraph: {
    title: "Directr — Fix your hook before you post",
    description: "Hooks + delivery + filming plan for TikTok, Reels, and Shorts.",
    url: "/",
    siteName: "Directr",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Directr — Fix your hook before you post",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Directr — Fix your hook before you post",
    description: "Hooks + delivery + filming plan for TikTok, Reels, and Shorts.",
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

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* ✅ Google Analytics (only runs if NEXT_PUBLIC_GA_ID exists) */}
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        ) : null}
      </head>

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

              {/* Auth button */}
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

        {/* Mobile nav */}
        <NavMobile showLockControls={false} isAuthed={!!user} />
      </body>
    </html>
  );
}
