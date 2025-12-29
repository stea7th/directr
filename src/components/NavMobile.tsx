"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`mnav__tab ${active ? "is-active" : ""}`}>
      <span className="mnav__label">{label}</span>
    </Link>
  );
}

export default function NavMobile({
  showLockControls,
  isAuthed,
}: {
  showLockControls: boolean;
  isAuthed: boolean;
}) {
  const pathname = usePathname();

  // If locked, you probably don’t want tabs visible (optional).
  // If you DO want them visible, delete this early return.
  if (pathname.startsWith("/lock")) return null;

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="mnav" aria-label="Mobile navigation">
      <div className="mnav__inner">
        <Tab href="/create" label="Create" active={active("/create")} />
        <Tab href="/clipper" label="Clipper" active={active("/clipper")} />
        <Tab href="/planner" label="Planner" active={active("/planner")} />
        <Tab href="/jobs" label="Jobs" active={active("/jobs")} />
      </div>
    </nav>
  );
}
