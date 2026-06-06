"use client";

import { useEffect, useState } from "react";
import HubPageShell from "@/components/HubPageShell";
import {
  CumulativeStats,
  DEFAULT_STATS,
  statsAccuracy,
  avgReveals,
} from "@/lib/badges";
import { loadDailyState } from "@/lib/daily";
import { getRankProgress, RANK_TIERS } from "@/lib/ranks";

export default function RanksPage() {
  const [stats, setStats] = useState<CumulativeStats>({ ...DEFAULT_STATS });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("repoguessr_stats");
      if (raw) {
        const parsed = { ...DEFAULT_STATS, ...JSON.parse(raw) } as CumulativeStats;
        setStats(parsed);
      }
      const daily = loadDailyState();
      setStreak(daily.currentStreak ?? 0);
    } catch {}
  }, []);

  const totalScore = stats.totalScore ?? 0;
  const progress = getRankProgress(totalScore);
  const currentRankIndex = RANK_TIERS.findIndex((t) => t.id === progress.rank.id);
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
            <h1 className="h1-type text-white">Ranks</h1>
            <p className="body-type text-[#9A9A9A] max-w-md">
              Earn points from daily and practice rounds to climb the tiers.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[2.5rem] leading-none text-white" aria-hidden>
              {progress.rank.icon}
            </span>
            <p className="stat-type text-white">{progress.rank.label}</p>
          </div>
        </header>

        <section className="mb-10 bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex flex-col gap-2">
              <p className="label text-[#9A9A9A]">TOTAL SCORE</p>
              <p className="stat-type text-white tabular-nums">
                {totalScore.toLocaleString()}
              </p>
            </div>
            {!progress.isMaxRank && progress.nextRank && (
              <p className="body-type text-[#9A9A9A]">
                <span className="text-white tabular-nums">
                  {progress.pointsToNext.toLocaleString()}
                </span>{" "}
                pts to {progress.nextRank.label}
              </p>
            )}
            {progress.isMaxRank && (
              <p className="body-type text-[#9A9A9A]">Max rank reached</p>
            )}
          </div>

          {!progress.isMaxRank && (
            <>
              <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="label text-[#9A9A9A] tabular-nums">
                {progress.pointsInTier.toLocaleString()} /{" "}
                {progress.pointsForTier.toLocaleString()} pts in tier
              </p>
            </>
          )}
        </section>

        <section className="mb-10 bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {[
              { label: "ACCURACY", value: `${accuracy}%` },
              { label: "AVG REVEALS", value: avgReveals(stats) },
              { label: "GAMES PLAYED", value: String(stats.gamesPlayed) },
              { label: "STREAK", value: String(streak) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-2">
                <p className="label text-[#9A9A9A]">{label}</p>
                <p className="stat-type text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {langRows.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="label text-[#9A9A9A]">BY LANGUAGE</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {langRows.map(([lang, { correct, total: t }]) => {
                  const pct = t > 0 ? Math.round((correct / t) * 100) : 0;
                  return (
                    <li
                      key={lang}
                      className="flex items-baseline justify-between gap-4 body-type"
                    >
                      <span className="text-[#9A9A9A] uppercase">{lang}</span>
                      <span className="text-white tabular-nums shrink-0">
                        {correct}/{t}
                        <span className="text-[#9A9A9A] ml-2">{pct}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        <ul className="flex flex-col gap-4">
          {RANK_TIERS.map((tier, index) => {
            const isCurrent = tier.id === progress.rank.id;
            const isAchieved = index < currentRankIndex;
            const isLocked = index > currentRankIndex;

            return (
              <li
                key={tier.id}
                className={`relative flex items-start gap-6 p-6 rounded-lg border transition-colors hub-enter ${
                  isCurrent
                    ? "border-white bg-[#050505]"
                    : isAchieved
                    ? "border-[#9A9A9A] bg-[#050505]"
                    : "border-[#1a1a1a] bg-[#050505] opacity-40"
                }`}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 label text-white border border-white rounded px-2 py-1">
                    CURRENT
                  </span>
                )}

                <span
                  className={`shrink-0 text-[2.5rem] leading-none ${
                    isLocked ? "text-[#9A9A9A]" : "text-white"
                  }`}
                  aria-hidden
                >
                  {tier.icon}
                </span>

                <div className="flex flex-col gap-2 min-w-0 pr-12">
                  <p
                    className={`body-type uppercase tracking-wide ${
                      isLocked ? "text-[#9A9A9A]" : "text-white"
                    }`}
                  >
                    {tier.label}
                  </p>
                  <p className="body-type text-[#9A9A9A] tabular-nums">
                    {tier.minScore.toLocaleString()} pts
                    {isAchieved && " · achieved"}
                    {isLocked && ` · ${(tier.minScore - totalScore).toLocaleString()} pts away`}
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
