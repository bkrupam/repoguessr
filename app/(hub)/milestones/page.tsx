"use client";

import { useEffect, useState } from "react";
import HubPageShell from "@/components/HubPageShell";
import {
  ALL_MILESTONES,
  MILESTONE_LABELS,
  MILESTONE_DESCRIPTIONS,
  MILESTONE_ICONS,
  Milestone,
} from "@/lib/badges";

export default function MilestonesPage() {
  const [unlocked, setUnlocked] = useState<Set<Milestone>>(new Set());
  const [newOnes, setNewOnes] = useState<Set<Milestone>>(new Set());

  useEffect(() => {
    try {
      const stats = localStorage.getItem("repoguessr_stats");
      if (stats) {
        const parsed = JSON.parse(stats);
        setUnlocked(new Set(parsed.unlockedMilestones ?? []));
      }
      const result = sessionStorage.getItem("repoguessr_result");
      if (result) {
        const parsed = JSON.parse(result);
        if (parsed.newMilestones?.length) {
          setNewOnes(new Set(parsed.newMilestones));
        }
      }
    } catch {}
  }, []);

  const unlockedCount = unlocked.size;
  const total = ALL_MILESTONES.length;
  const progressPct = total > 0 ? (unlockedCount / total) * 100 : 0;

  return (
    <HubPageShell wide>
      <div className="w-full text-left">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-10">
          <div className="flex flex-col gap-3">
            <p className="label text-[#9A9A9A]">PROGRESS</p>
            <h1 className="h1-type text-white">Milestones</h1>
            <p className="body-type text-[#9A9A9A] max-w-md">
              Earn them by playing daily and practice.
            </p>
          </div>
          <p className="stat-type text-white tabular-nums shrink-0">
            {unlockedCount}
            <span className="text-[#9A9A9A]"> / {total}</span>
          </p>
        </header>

        <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="flex flex-col gap-4">
          {ALL_MILESTONES.map((m, index) => {
            const isUnlocked = unlocked.has(m);
            const isNew = newOnes.has(m);

            return (
              <li
                key={m}
                className={`relative flex items-start gap-6 p-6 rounded-lg border transition-colors hub-enter ${
                  isUnlocked
                    ? "border-[#9A9A9A] bg-[#050505]"
                    : "border-[#1a1a1a] bg-[#050505] opacity-40"
                }`}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {isNew && (
                  <span className="absolute top-4 right-4 label text-white border border-white rounded px-2 py-1">
                    NEW
                  </span>
                )}

                <span
                  className={`shrink-0 text-[2.5rem] leading-none ${
                    isUnlocked ? "text-white" : "text-[#9A9A9A]"
                  }`}
                  aria-hidden
                >
                  {MILESTONE_ICONS[m]}
                </span>

                <div className="flex flex-col gap-2 min-w-0 pr-12">
                  <p
                    className={`body-type uppercase tracking-wide ${
                      isUnlocked ? "text-white" : "text-[#9A9A9A]"
                    }`}
                  >
                    {MILESTONE_LABELS[m]}
                  </p>
                  <p className="body-type text-[#9A9A9A]">{MILESTONE_DESCRIPTIONS[m]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </HubPageShell>
  );
}
