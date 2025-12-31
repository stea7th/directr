"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/create", label: "Create" },
  { href: "/clipper", label: "Clipper" },
  { href: "/planner", label: "Planner" },
  { href: "/jobs", label: "Jobs" },
];

export default function NavMobile() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="mnav" aria-label="Mobile navigation">
      <div className="mnav__inner">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`mnav__tab ${isActive(t.href) ? "is-active" : ""}`}
          >
            <div className="mnav__label">{t.label}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
