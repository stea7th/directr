"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavMobile({ isAuthed = false }: { isAuthed?: boolean; showLockControls?: boolean }) {
  const pathname = usePathname();
  if (!isAuthed || pathname.startsWith("/film/") || pathname === "/onboarding") return null;

  const tabs = [
    { href: "/today", label: "Today" },
    { href: "/coach", label: "Coach" },
    { href: "/library", label: "Library" },
    { href: "/dna", label: "DNA" },
  ];

  return (
    <nav className="mnav" aria-label="Main navigation">
      <div className="mnav__inner">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return <Link key={tab.href} href={tab.href} className={`mnav__tab ${active ? "is-active" : ""}`}>{tab.label}</Link>;
        })}
      </div>
    </nav>
  );
}
