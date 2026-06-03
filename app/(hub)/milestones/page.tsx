"use client";

import { useEffect, useState } from "react";
import HubPageShell from "@/components/HubPageShell";
import {
  ALL_MILESTONES,
  MILESTONE_LABELS,
  MILESTONE_DESCRIPTIONS,
  MILESTONE_ICONS,
  Milestone,
  CumulativeStats,
  DEFAULT_STATS,
  statsAccuracy,
  avgReveals,
} from "@/lib/badges";
import { loadDailyState } from "@/lib/daily";

export default function MilestonesPage() {
  const [unlocked, setUnlocked] = useState<Set<Milestone>>(new Set());
  const [newOnes, setNewOnes] = useState<Set<Milestone>>(new Set());
  const [stats, setStats] = useState<CumulativeStats>({ ...DEFAULT_STATS });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("repoguessr_stats");
      if (raw) {
        const parsed = { ...DEFAULT_STATS, ...JSON.parse(raw) } as CumulativeStats;
        setStats(parsed);
        setUnlocked(new Set(parsed.unlockedMilestones ?? []));
      }
      const result = sessionStorage.getItem("repoguessr_result");
      if (result) {
        const parsed = JSON.parse(result);
        if (parsed.newMilestones?.length) {
          setNewOnes(new Set(parsed.newMilestones));
        }
      }
      const daily = loadDailyState();
      setStreak(daily.currentStreak ?? 0);
    } catch {}
  }, []);

  const unlockedCount = unlocked.size;
  const total = ALL_MILESTONES.length;
  const progressPct = total > 0 ? (unlockedCount / total) * 100 : 0;
  const accuracy = statsAccuracy(stats);

  const langRows = Object.entries(stats.languageAttempts ?? {})
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

  return (
    <HubPageShell wide>
      <div className="w-full text-left">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-10">
          <div className="flex flex-col gap-3">
            <p className="label text-[#9A9A9A]">PROGRESS</p>
            <h1 className="h1-type text-white">Milestones</h1>
            <p className="body-type text-[#9A9A9A] max-w-md">
              Stats and achievements from daily and practice.
            </p>
          </div>
          <p className="stat-type text-white tabular-nums shrink-0">
            {unlockedCount}
            <span className="text-[#9A9A9A]"> / {total}</span>
          </p>
        </header>

        <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "ACCURACY", value: `${accuracy}%` },
            { label: "AVG REVEALS", value: avgReveals(stats) },
            { label: "TOTAL SCORE", value: (stats.totalScore ?? 0).toLocaleString() },
            { label: "STREAK", value: String(streak) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-2"
            >
              <p className="label text-[#9A9A9A]">{label}</p>
              <p className="stat-type text-white tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        {langRows.length > 0 && (
          <section className="mb-10">
            <p className="label text-[#9A9A9A] mb-4">BY LANGUAGE</p>
            <ul className="flex flex-col gap-4">
              {langRows.map(([lang, { correct, total: t }]) => {
                const pct = t > 0 ? Math.round((correct / t) * 100) : 0;
                return (
                  <li key={lang} className="flex flex-col gap-2">
                    <div className="flex justify-between gap-4">
                      <span className="label text-[#9A9A9A]">{lang.toUpperCase()}</span>
                      <span className="label text-white tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-px w-full bg-[#1a1a1a] overflow-hidden">
                      <div
                        className="h-full bg-[#9A9A9A] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="h-px w-full bg-[#1a1a1a] mb-8" />

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
                  <p className="body-type text-[#9A9A9A]">
                    {MILESTONE_DESCRIPTIONS[m]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </HubPageShell>
  );
}
