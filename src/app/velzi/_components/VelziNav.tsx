"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CommandPalette, { type Command } from "./CommandPalette";

const LINKS = [
  { href: "/velzi", label: "Store" },
  { href: "/velzi/dashboard", label: "Dashboard" },
];

export default function VelziNav({ adminUrl, storeUrl }: { adminUrl: string; storeUrl: string }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands: Command[] = [
    { id: "store", label: "Storefront", hint: "/velzi", href: "/velzi" },
    { id: "dash", label: "Dashboard overview", hint: "/velzi/dashboard", href: "/velzi/dashboard" },
    {
      id: "tools",
      label: "Open the tool bench",
      hint: "profit, ROAS, runway",
      href: "/velzi/dashboard#tools",
    },
    {
      id: "orders",
      label: "Recent orders",
      hint: "last 30 days",
      href: "/velzi/dashboard#orders",
    },
    {
      id: "admin",
      label: "Shopify admin",
      hint: "opens Shopify",
      run: () => window.open(adminUrl, "_blank", "noopener,noreferrer"),
    },
    {
      id: "live",
      label: "Live storefront",
      hint: storeUrl.replace(/^https?:\/\//, ""),
      run: () => window.open(storeUrl, "_blank", "noopener,noreferrer"),
    },
    { id: "top", label: "Back to top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  ];

  return (
    <>
      <header className="v-nav">
        <div className="v-wrap v-nav__inner">
          <Link href="/velzi" className="v-logo">
            <b>velzi</b>
          </Link>

          <nav className="v-nav__links" aria-label="velzi">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`v-nav__link ${pathname === link.href ? "is-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="v-kbd"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
            >
              <kbd>⌘K</kbd> Search
            </button>
          </nav>
        </div>
      </header>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </>
  );
}
