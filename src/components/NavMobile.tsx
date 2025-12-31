"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavMobileProps = {
  showLockControls?: boolean;
  isAuthed?: boolean;
};

const tabs = [
  { href: "/create", label: "Create" },
  { href: "/clipper", label: "Clipper" },
  { href: "/planner", label: "Planner" },
  { href: "/jobs", label: "Jobs" },
];

export default function NavMobile({ showLockControls, isAuthed }: NavMobileProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

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

        {/* Optional: lock controls if you want them on mobile */}
        {showLockControls && (
          <Link href="/lock" className={`mnav__tab ${isActive("/lock") ? "is-active" : ""}`}>
            <div className="mnav__label">Lock</div>
          </Link>
        )}

        {/* Optional: login shortcut if not authed */}
        {!isAuthed && (
          <Link href="/login" className={`mnav__tab ${isActive("/login") ? "is-active" : ""}`}>
            <div className="mnav__label">Login</div>
          </Link>
        )}
      </div>
    </nav>
  );
}
