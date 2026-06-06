"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_STATS } from "@/lib/badges";
import { getRank } from "@/lib/ranks";

const NAV = [
  { href: "/daily", label: "DAILY" },
  { href: "/practice", label: "PRACTICE" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/ranks", label: "RANKS" },
] as const;

export default function AppNav() {
  const pathname = usePathname() ?? "";
  const [rankLabel, setRankLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("repoguessr_stats");
      const totalScore = raw
        ? ({ ...DEFAULT_STATS, ...JSON.parse(raw) }.totalScore ?? 0)
        : 0;
      setRankLabel(getRank(totalScore).label);
    } catch {
      setRankLabel(getRank(0).label);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#1a1a1a]">
      <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/daily" className="label text-white hover:opacity-80 transition-opacity shrink-0">
          REPOGUESSR
        </Link>

        <nav className="flex items-center gap-2" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const isRank = href === "/ranks";
            const displayLabel = isRank ? (rankLabel ?? label) : label;

            if (isRank) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="label px-3 py-1.5 rounded-lg bg-white text-black transition-opacity hover:opacity-90"
                >
                  {displayLabel}
                </Link>
              );
            }

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
                {displayLabel}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
