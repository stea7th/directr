"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  showLockControls?: boolean;
  isAuthed?: boolean;
};

export default function NavMobile(_props: Props) {
  const pathname = usePathname();

  const tabs = [
    { href: "/create", label: "Create" },
    { href: "/jobs", label: "Jobs" },
    { href: "/pricing", label: "Pricing" },
    { href: "/lock", label: "Lock" },
  ];

  return (
    <div className="mnav">
      <div className="mnav__inner">
        {tabs.map((t) => {
          const active =
            pathname === t.href || (t.href !== "/" && pathname?.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`mnav__tab ${active ? "is-active" : ""}`}
            >
              <div className="mnav__label">{t.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
