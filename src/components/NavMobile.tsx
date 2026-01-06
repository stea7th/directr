"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  showLockControls?: boolean;
  isAuthed?: boolean;
};

export default function NavMobile(_props: Props) {
  const pathname = usePathname();

  // Mobile nav: ONLY Create + Pricing
  const tabs = [
    { href: "/create", label: "Create" },
    { href: "/pricing", label: "Pricing" },
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
