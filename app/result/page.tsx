"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import BadgeGrid from "@/components/BadgeGrid";
import ShareCard from "@/components/ShareCard";
import Button from "@/components/Button";
import {
  Badge,
  Milestone,
  CumulativeStats,
  DEFAULT_STATS,
  updateStats,
  checkMilestones,
  checkPerfectionist,
  isLanguageCorrect,
  isFrameworkCorrect,
} from "@/lib/badges";
import { Snippet } from "@/lib/github";
import { Guesses } from "@/components/GuessPanel";
import {
  buildShareGrid,
  msUntilNextDaily,
  formatCountdown,
} from "@/lib/daily";

interface ResultData {
  resultId: number;
  snippet: Snippet;
  guesses: Guesses;
  linesRevealed: number;
  roundBadges: Badge[];
  mode: "daily" | "practice";
  puzzle: number | null;
  dailyStreak: number | null;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    let data: ResultData | null = null;
    try {
      const raw = sessionStorage.getItem("repoguessr_result");
      if (!raw) { router.replace("/"); return; }
      data = JSON.parse(raw);
    } catch {
      router.replace("/");
      return;
    }
    if (!data) { router.replace("/"); return; }
    setResult(data);

    // Update cumulative stats — guarded so a page refresh doesn't double-count
    try {
      const lastProcessed = localStorage.getItem("repoguessr_last_result");
      if (String(data.resultId) !== lastProcessed) {
        const raw = localStorage.getItem("repoguessr_stats");
        const prev: CumulativeStats = raw ? JSON.parse(raw) : { ...DEFAULT_STATS };
        const next = updateStats(prev, {
          guesses: data.guesses,
          actual: { language: data.snippet.language, framework: data.snippet.framework },
          linesRevealed: data.linesRevealed,
        });
        const unlocked = checkMilestones(prev, next);
        if (checkPerfectionist(data.roundBadges) && !prev.unlockedMilestones.includes("PERFECTIONIST")) {
          unlocked.push("PERFECTIONIST");
        }
        next.unlockedMilestones = Array.from(new Set([...prev.unlockedMilestones, ...unlocked]));
        localStorage.setItem("repoguessr_stats", JSON.stringify(next));
        localStorage.setItem("repoguessr_last_result", String(data.resultId));
        setNewMilestones(unlocked);
      }
    } catch { /* localStorage unavailable */ }
  }, [router]);

  // Live countdown to next daily (only ticks in daily mode)
  useEffect(() => {
    if (result?.mode !== "daily") return;
    const tick = () => setCountdown(formatCountdown(msUntilNextDaily()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [result?.mode]);

  if (!result) return null;

  const { snippet, guesses, linesRevealed, roundBadges, mode, dailyStreak } = result;
  const isDaily = mode === "daily";
  const langCorrect = isLanguageCorrect(guesses.language, snippet.language);
  const fwCorrect = isFrameworkCorrect(guesses.framework, snippet.framework);

  const fwGuessDisplay = guesses.framework.trim() || "—";
  const fwActualDisplay = snippet.framework ?? "NONE";

  // Daily share grid text
  const dailyShareText =
    isDaily && result.puzzle
      ? buildShareGrid(
          {
            puzzle: result.puzzle,
            languageCorrect: langCorrect,
            frameworkCorrect: snippet.framework === null ? null : fwCorrect,
            linesRevealed,
            totalLines: snippet.lines.length,
            badges: roundBadges,
          },
          dailyStreak ?? 0
        )
      : undefined;

  return (
    <>
      {/* Top bar with home */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/daily" className="label text-[#9A9A9A] hover:text-white transition-colors">
            RG
          </Link>
          <div className="w-px h-4 bg-[#1a1a1a]" />
          <span className="label text-[#9A9A9A]">RESULT</span>
        </div>
      </div>

      <main className="pt-14 pb-28 px-4 max-w-3xl mx-auto">

        {/* ── DAILY BADGE ───────────────────────────────────────────────────── */}
        {isDaily && (
          <div className="pt-8 flex items-center justify-between">
            <span className="label text-[#9A9A9A]">DAILY #{result.puzzle}</span>
            {(dailyStreak ?? 0) > 0 && (
              <span className="body-type text-white">
                {dailyStreak} day{dailyStreak === 1 ? "" : "s"} streak
              </span>
            )}
          </div>
        )}

        {/* ── HEADLINE ──────────────────────────────────────────────────────── */}
        <div className={`${isDaily ? "pt-6" : "pt-12"} pb-8 border-b border-[#1a1a1a]`}>
          <p className="display-type leading-none">
            {linesRevealed}
            <span className="text-[#9A9A9A]"> LINES</span>
          </p>
          <p className="body-type text-[#9A9A9A] mt-3">
            Guessed in {linesRevealed} of {snippet.lines.length} lines
          </p>
        </div>

        {/* ── ANSWERS ─────────────────────────────────────────────────────────── */}
        <div className="py-8 border-b border-[#1a1a1a] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="label text-[#9A9A9A]">LANGUAGE</p>
            <span className="h1-type text-white">{snippet.language.toUpperCase()}</span>
            {langCorrect ? (
              <p className="body-type text-white">You guessed {guesses.language} — correct.</p>
            ) : (
              <p className="body-type text-[#9A9A9A]">
                You guessed{" "}
                <span className="text-white">{guesses.language}</span>
              </p>
            )}
          </div>

          {snippet.framework && (
            <div className="flex flex-col gap-3">
              <p className="label text-[#9A9A9A]">FRAMEWORK</p>
              <span className="h1-type text-white">{fwActualDisplay.toUpperCase()}</span>
              {fwCorrect ? (
                <p className="body-type text-white">
                  You guessed {fwGuessDisplay} — correct.
                </p>
              ) : (
                <p className="body-type text-[#9A9A9A]">
                  You guessed{" "}
                  <span className="text-white">{fwGuessDisplay}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── ROUND BADGES ─────────────────────────────────────────────────────── */}
        {(roundBadges.length > 0 || newMilestones.length > 0) && (
          <div className="py-8 border-b border-[#1a1a1a]">
            <BadgeGrid
              roundBadges={roundBadges}
              newMilestones={newMilestones}
              showAll={false}
            />
            {newMilestones.length > 0 && (
              <Link href="/milestones" className="label text-[#9A9A9A] hover:text-white transition-colors mt-4 inline-block">
                VIEW ALL MILESTONES →
              </Link>
            )}
          </div>
        )}

        {/* ── SNIPPET REFERENCE ────────────────────────────────────────────────── */}
        <div className="py-8">
          <div className="flex items-baseline justify-between mb-4">
            <p className="label text-[#9A9A9A]">SNIPPET</p>
            <p className="label text-[#2A2A2A]">{snippet.repoName}</p>
          </div>
          <div className="h-64 overflow-y-auto rounded-lg border border-[#1a1a1a]">
            <CodeBlock
              lines={snippet.lines}
              revealedCount={snippet.lines.length}
              language={snippet.language}
            />
          </div>
        </div>

        {/* ── DAILY: next puzzle countdown ─────────────────────────────────────── */}
        {isDaily && (
          <div className="pb-4 flex flex-col items-center gap-2">
            <span className="label text-[#9A9A9A]">NEXT PUZZLE IN</span>
            <span className="h1-type text-white tabular-nums">{countdown}</span>
          </div>
        )}
      </main>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3">
          {isDaily ? (
            <>
              {/* Daily: SHARE is the hero (single accent), PRACTICE secondary */}
              <div className="flex-1">
                <ShareCard
                  linesRevealed={linesRevealed}
                  language={snippet.language}
                  languageCorrect={langCorrect}
                  framework={snippet.framework}
                  frameworkGuess={guesses.framework}
                  frameworkCorrect={fwCorrect}
                  badges={roundBadges}
                  overrideText={dailyShareText}
                  label="SHARE RESULT"
                />
              </div>
              <Link href="/game" className="flex-1">
                <Button variant="ghost" className="w-full">PRACTICE MODE</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/game" className="flex-1">
                <Button variant="primary" className="w-full">PLAY AGAIN</Button>
              </Link>
              <div className="flex-1">
                <ShareCard
                  linesRevealed={linesRevealed}
                  language={snippet.language}
                  languageCorrect={langCorrect}
                  framework={snippet.framework}
                  frameworkGuess={guesses.framework}
                  frameworkCorrect={fwCorrect}
                  badges={roundBadges}
                />
              </div>
              <a href={snippet.repoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="ghost" className="w-full">VIEW REPO</Button>
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
