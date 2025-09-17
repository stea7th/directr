"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavLink({ href, children }:{ href:string, children:React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== "/" && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={"text-sm transition " + (active ? "text-white" : "text-gray-400 hover:text-white")}
    >
      {children}
    </Link>
  )
}
