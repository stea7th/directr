// src/app/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HomeRedirect() {
  redirect("/create");
}
