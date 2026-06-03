"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import DailyResultCard from "@/components/DailyResultCard";
import HubPageShell from "@/components/HubPageShell";
import HubVisual from "@/components/HubVisual";
import {
  loadDailyState,
  saveDailyState,
  isPlayedToday,
  formatDailyDateParts,
  msUntilNextDaily,
  formatCountdown,
  buildShareGrid,
  applyStreakFreezeIfNeeded,
} from "@/lib/daily";
import { loadWeeklyState, weekNumber } from "@/lib/weekly";

export default function DailyPage() {
  const [playedToday, setPlayedToday] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [streak, setStreak] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const [weeklyScore, setWeeklyScore] = useState(0);
  const [weekLabel, setWeekLabel] = useState(0);
  const [lastResult, setLastResult] = useState<
    ReturnType<typeof loadDailyState>["lastResult"]
  >(null);
  const [dateLine, setDateLine] = useState("");

  useEffect(() => {
    const { weekday, headline } = formatDailyDateParts();
    setDateLine(`${weekday}, ${headline}`);

    let d = loadDailyState();
    d = applyStreakFreezeIfNeeded(d);
    saveDailyState(d);

    setPlayedToday(isPlayedToday(d));
    setStreak(d.currentStreak ?? 0);
    setFreezes(d.streakFreezes ?? 0);
    setLastResult(d.lastResult);

    const weekly = loadWeeklyState();
    const wk = weekNumber();
    if (weekly.weekNumber === wk) {
      setWeeklyScore(weekly.cumulativeScore);
      setWeekLabel(wk);
    } else {
      setWeeklyScore(0);
      setWeekLabel(wk);
    }
  }, []);

  useEffect(() => {
    if (!playedToday) return;
    const tick = () => setCountdown(formatCountdown(msUntilNextDaily()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [playedToday]);

  const shareText =
    playedToday && lastResult ? buildShareGrid(lastResult, streak) : undefined;

  async function handleShare() {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {}
  }

  if (playedToday) {
    return (
      <HubPageShell>
        <DailyResultCard countdown={countdown} onShare={handleShare} />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell>
      <HubVisual variant="daily" />

      <header className="flex flex-col items-center gap-4 w-full mb-8">
        <p className="label text-[#9A9A9A]">TODAY&apos;S CHALLENGE</p>
        <h1 className="hub-date-headline text-white">{dateLine || "\u00a0"}</h1>
        <p className="body-type text-[#9A9A9A] max-w-sm text-center">
          Guess the language from a real GitHub snippet.
        </p>
      </header>

      <div className="w-full flex flex-col items-center gap-6 mb-8">
        {(streak > 0 || freezes > 0) && (
          <div className="w-full bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-2 items-center">
            {streak > 0 && (
              <p className="body-type text-[#9A9A9A]">
                Streak{" "}
                <span className="text-white">
                  {streak} day{streak === 1 ? "" : "s"}
                </span>
              </p>
            )}
            {freezes > 0 && (
              <p className="label text-[#9A9A9A]">FREEZE ×{freezes}</p>
            )}
          </div>
        )}

        <div className="w-full bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-2 items-center">
          <p className="label text-[#9A9A9A]">WEEK {weekLabel}</p>
          <p className="stat-type text-white tabular-nums">{weeklyScore}</p>
          <p className="label text-[#9A9A9A]">WEEKLY SCORE</p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        <Link href="/game?mode=daily" className="w-full">
          <Button variant="primary" size="lg" className="w-full">
            START TODAY&apos;S CHALLENGE
          </Button>
        </Link>
        <Link href="/archive" className="label text-[#9A9A9A] hover:text-white transition-colors">
          BROWSE ARCHIVE →
        </Link>
      </div>
    </HubPageShell>
  );
}
