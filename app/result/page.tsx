"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import ShareCard from "@/components/ShareCard";
import Button from "@/components/Button";
import RepoCard from "@/components/RepoCard";
import {
  Badge,
  BADGE_LABELS,
  CumulativeStats,
  DEFAULT_STATS,
  updateStats,
  isLanguageCorrect,
  isFrameworkCorrect,
} from "@/lib/badges";
import { getRank, getRankProgress, RankProgress } from "@/lib/ranks";
import { Snippet } from "@/lib/github";
import { Guesses } from "@/components/GuessPanel";
import {
  buildShareGrid,
  msUntilNextDaily,
  formatCountdown,
} from "@/lib/daily";
import { createChallenge, encodeChallenge } from "@/lib/challenge";
import { Difficulty } from "@/lib/difficulty";
import { buildShareImageUrl } from "@/lib/share";

interface ResultData {
  resultId: number;
  snippet: Snippet;
  guesses: Guesses;
  linesRevealed: number;
  roundBadges: Badge[];
  mode: "daily" | "practice";
  puzzle: number | null;
  dailyStreak: number | null;
  roundScore: number;
  hintUsed?: boolean;
  initialLines?: number;
  revealStep?: number;
  difficulty?: Difficulty;
  challengeMeta?: { challengerScore?: number } | null;
  elapsedMs?: number;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [rankProgress, setRankProgress] = useState<RankProgress | null>(null);
  const [rankUp, setRankUp] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);

  useEffect(() => {
    let data: ResultData | null = null;
    try {
      const raw = sessionStorage.getItem("repoguessr_result");
      if (!raw) {
        router.replace("/");
        return;
      }
      data = JSON.parse(raw);
    } catch {
      router.replace("/");
      return;
    }
    if (!data) {
      router.replace("/");
      return;
    }
    setResult(data);

    try {
      const lastProcessed = localStorage.getItem("repoguessr_last_result");
      if (String(data.resultId) !== lastProcessed) {
        const raw = localStorage.getItem("repoguessr_stats");
        const prev: CumulativeStats = raw
          ? { ...DEFAULT_STATS, ...JSON.parse(raw) }
          : { ...DEFAULT_STATS };
        const prevRank = getRank(prev.totalScore ?? 0);
        const next = updateStats(prev, {
          guesses: data.guesses,
          actual: {
            language: data.snippet.language,
            framework: data.snippet.framework,
          },
          linesRevealed: data.linesRevealed,
          initialLines: data.initialLines,
          revealStep: data.revealStep,
          roundScore: data.roundScore ?? 0,
        });
        const nextRank = getRank(next.totalScore ?? 0);
        localStorage.setItem("repoguessr_stats", JSON.stringify(next));
        localStorage.setItem("repoguessr_last_result", String(data.resultId));
        setRankProgress(getRankProgress(next.totalScore ?? 0));
        setRankUp(nextRank.id !== prevRank.id);
      } else {
        const raw = localStorage.getItem("repoguessr_stats");
        const stats: CumulativeStats = raw
          ? { ...DEFAULT_STATS, ...JSON.parse(raw) }
          : { ...DEFAULT_STATS };
        setRankProgress(getRankProgress(stats.totalScore ?? 0));
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    if (result?.mode !== "daily") return;
    const tick = () => setCountdown(formatCountdown(msUntilNextDaily()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [result?.mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Escape") router.push("/daily");
      if (e.key === "Enter" || e.key === "p" || e.key === "P") {
        const href = result?.mode === "daily" ? "/game?mode=daily" : "/game";
        router.push(href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, result?.mode]);

  if (!result) return null;

  const {
    snippet,
    guesses,
    linesRevealed,
    roundBadges,
    mode,
    dailyStreak,
    roundScore,
    challengeMeta,
  } = result;
  const isDaily = mode === "daily";
  const langCorrect = isLanguageCorrect(guesses.language, snippet.language);
  const fwCorrect = isFrameworkCorrect(guesses.framework, snippet.framework);

  const fwGuessDisplay = guesses.framework.trim() || "—";
  const fwActualDisplay = snippet.framework ?? "NONE";

  const dailyShareText =
    isDaily && result.puzzle
      ? buildShareGrid(
          {
            puzzle: result.puzzle,
            languageCorrect: langCorrect,
            frameworkCorrect:
              snippet.framework === null ? null : fwCorrect,
            linesRevealed,
            totalLines: snippet.lines.length,
            badges: roundBadges,
          },
          dailyStreak ?? 0
        ) + `\nSCORE ${roundScore}`
      : undefined;

  const shareImageUrl =
    typeof window !== "undefined"
      ? buildShareImageUrl(window.location.origin, {
          guess: guesses.language,
          actual: snippet.language,
          languageCorrect: langCorrect,
          linesRevealed,
          elapsedMs: result.elapsedMs ?? 0,
          roundBadges,
          rank: rankProgress?.rank.label,
          puzzle: result.puzzle,
          score: roundScore,
          streak: dailyStreak,
        })
      : "";

  async function handleChallenge() {
    if (challengeLoading) return;
    setChallengeLoading(true);
    try {
      const payload = { snippet, challengerScore: roundScore };
      const created = await createChallenge(payload);
      let url: string;
      if ("id" in created) {
        url = `${window.location.origin}/game?c=${created.id}`;
      } else {
        const encoded = encodeChallenge(payload);
        url = `${window.location.origin}/game?snippet=${encodeURIComponent(encoded)}`;
      }
      await navigator.clipboard.writeText(url);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 1500);
    } catch {
      const encoded = encodeChallenge({
        snippet,
        challengerScore: roundScore,
      });
      const url = `${window.location.origin}/game?snippet=${encodeURIComponent(encoded)}`;
      try {
        await navigator.clipboard.writeText(url);
        setChallengeCopied(true);
        setTimeout(() => setChallengeCopied(false), 1500);
      } catch {}
    } finally {
      setChallengeLoading(false);
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/daily"
            className="label text-[#9A9A9A] hover:text-white transition-colors"
          >
            RG
          </Link>
          <div className="w-px h-4 bg-[#1a1a1a]" />
          <span className="label text-[#9A9A9A]">RESULT</span>
        </div>
      </div>

      <main className="pt-14 pb-32 px-4 max-w-3xl mx-auto">
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

        {challengeMeta?.challengerScore != null && (
          <div className="pt-6 pb-2">
            <p className="label text-[#9A9A9A]">
              CHALLENGER SCORE{" "}
              <span className="text-white">{challengeMeta.challengerScore}</span>
              {" · "}YOUR SCORE{" "}
              <span className="text-white">{roundScore}</span>
            </p>
          </div>
        )}

        <div
          className={`${isDaily ? "pt-6" : "pt-12"} pb-8 border-b border-[#1a1a1a]`}
        >
          <p className="display-type leading-none tabular-nums">{roundScore}</p>
          <p className="label text-[#9A9A9A] mt-3">POINTS</p>
          <p className="label text-[#9A9A9A] mt-2">
            {linesRevealed} OF {snippet.lines.length} LINES REVEALED
          </p>
        </div>

        <div className="py-8 border-b border-[#1a1a1a]">
          <RepoCard
            repoName={snippet.repoName}
            repoUrl={snippet.repoUrl}
            description={snippet.repoDescription}
          />
        </div>

        <div className="py-8 border-b border-[#1a1a1a] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="label text-[#9A9A9A]">LANGUAGE</p>
            <span className="h1-type text-white">
              {snippet.language.toUpperCase()}
            </span>
            {langCorrect ? (
              <p className="body-type text-white">
                You guessed {guesses.language} — correct.
              </p>
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
              <span className="h1-type text-white">
                {fwActualDisplay.toUpperCase()}
              </span>
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

        {rankProgress && (
          <div className="py-8 border-b border-[#1a1a1a] flex flex-col gap-4">
            {rankUp && (
              <p className="label text-white border border-white rounded-lg px-4 py-3 inline-block w-fit">
                RANK UP — {rankProgress.rank.label}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="text-[2rem] leading-none text-white" aria-hidden>
                  {rankProgress.rank.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="label text-[#9A9A9A]">RANK</p>
                  <p className="body-type text-white">{rankProgress.rank.label}</p>
                </div>
              </div>
              <p className="body-type text-[#9A9A9A] tabular-nums">
                +{roundScore.toLocaleString()} pts this round
              </p>
            </div>
            {!rankProgress.isMaxRank && rankProgress.nextRank && (
              <>
                <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${rankProgress.percent}%` }}
                  />
                </div>
                <p className="label text-[#9A9A9A] tabular-nums">
                  {rankProgress.pointsToNext.toLocaleString()} pts to{" "}
                  {rankProgress.nextRank.label}
                </p>
              </>
            )}
            <Link
              href="/ranks"
              className="label text-[#9A9A9A] hover:text-white transition-colors inline-block"
            >
              VIEW ALL RANKS →
            </Link>
          </div>
        )}

        {roundBadges.length > 0 && (
          <div className="py-8 border-b border-[#1a1a1a]">
            <p className="label text-[#9A9A9A] mb-3">THIS ROUND</p>
            <div className="flex flex-wrap gap-2">
              {roundBadges.map((b) => (
                <span
                  key={b}
                  className="label inline-block px-3 py-2 border border-[#9A9A9A] rounded-lg text-white"
                >
                  {BADGE_LABELS[b]}
                </span>
              ))}
            </div>
          </div>
        )}

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

        {isDaily && (
          <div className="pb-4 flex flex-col items-center gap-2">
            <span className="label text-[#9A9A9A]">NEXT PUZZLE IN</span>
            <span className="h1-type text-white tabular-nums">{countdown}</span>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-3">
          <p className="label text-[#9A9A9A] text-center hidden md:block [@media(hover:none)]:hidden">
            ENTER PLAY AGAIN · ESC BACK
          </p>
          <div className="flex gap-3">
            {isDaily ? (
              <>
                <div className="flex-1">
                  <ShareCard
                    linesRevealed={linesRevealed}
                    language={snippet.language}
                    languageCorrect={langCorrect}
                    framework={snippet.framework}
                    frameworkGuess={guesses.framework}
                    frameworkCorrect={fwCorrect}
                    badges={roundBadges}
                    imageUrl={shareImageUrl}
                    overrideText={dailyShareText}
                    label="SHARE RESULT"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleChallenge}
                >
                  {challengeLoading
                    ? "…"
                    : challengeCopied
                    ? "COPIED"
                    : "CHALLENGE"}
                </Button>
                <Link href="/game" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    PRACTICE
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/game" className="flex-1">
                  <Button variant="primary" className="w-full">
                    PLAY AGAIN
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleChallenge}
                >
                  {challengeLoading
                    ? "…"
                    : challengeCopied
                    ? "COPIED"
                    : "CHALLENGE"}
                </Button>
                <div className="flex-1">
                  <ShareCard
                    linesRevealed={linesRevealed}
                    language={snippet.language}
                    languageCorrect={langCorrect}
                    framework={snippet.framework}
                    frameworkGuess={guesses.framework}
                    frameworkCorrect={fwCorrect}
                    badges={roundBadges}
                    imageUrl={shareImageUrl}
                    overrideText={`REPOGUESSR\nSCORE ${roundScore}\n${linesRevealed} LINES`}
                    label="SHARE"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
