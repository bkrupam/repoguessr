"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/daily", label: "DAILY" },
  { href: "/practice", label: "PRACTICE" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/milestones", label: "MILESTONES" },
] as const;

export default function AppNav() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#1a1a1a]">
      <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/daily" className="label text-white hover:opacity-80 transition-opacity shrink-0">
          REPOGUESSR
        </Link>

        <nav className="flex items-center gap-2" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`label px-4 py-2.5 rounded-lg border transition-colors ${
                  active
                    ? "text-white border-white bg-[#050505]"
                    : "text-[#9A9A9A] border-transparent hover:text-white hover:border-[#9A9A9A]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
