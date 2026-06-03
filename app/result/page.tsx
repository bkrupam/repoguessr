"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import BadgeGrid from "@/components/BadgeGrid";
import ShareCard from "@/components/ShareCard";
import Button from "@/components/Button";
import RepoCard from "@/components/RepoCard";
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
import { encodeChallenge } from "@/lib/challenge";
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
  newMilestones?: Milestone[];
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [countdown, setCountdown] = useState("");
  const [challengeCopied, setChallengeCopied] = useState(false);

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
        const unlocked = checkMilestones(prev, next);
        if (
          checkPerfectionist(data.roundBadges) &&
          !prev.unlockedMilestones.includes("PERFECTIONIST")
        ) {
          unlocked.push("PERFECTIONIST");
        }
        next.unlockedMilestones = Array.from(
          new Set([...prev.unlockedMilestones, ...unlocked])
        );
        localStorage.setItem("repoguessr_stats", JSON.stringify(next));
        localStorage.setItem("repoguessr_last_result", String(data.resultId));
        setNewMilestones(unlocked);
        data.newMilestones = unlocked;
        sessionStorage.setItem("repoguessr_result", JSON.stringify(data));
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
          newMilestones,
          puzzle: result.puzzle,
          score: roundScore,
          streak: dailyStreak,
        })
      : "";

  async function handleChallenge() {
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

        {(roundBadges.length > 0 || newMilestones.length > 0) && (
          <div className="py-8 border-b border-[#1a1a1a]">
            <BadgeGrid
              roundBadges={roundBadges}
              newMilestones={newMilestones}
              showAll={false}
            />
            {newMilestones.length > 0 && (
              <Link
                href="/milestones"
                className="label text-[#9A9A9A] hover:text-white transition-colors mt-4 inline-block"
              >
                VIEW ALL MILESTONES →
              </Link>
            )}
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
                  {challengeCopied ? "COPIED" : "CHALLENGE"}
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
                  {challengeCopied ? "COPIED" : "CHALLENGE"}
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
