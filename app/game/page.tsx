"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import GuessPanel, { Guesses } from "@/components/GuessPanel";
import Button from "@/components/Button";
import MatrixLoader from "@/components/MatrixLoader";
import { Snippet } from "@/lib/github";
import { calcRoundBadges, isLanguageCorrect, isFrameworkCorrect } from "@/lib/badges";
import {
  loadDailyState,
  recordDailyCompletion,
  DailyResult,
} from "@/lib/daily";

const INITIAL_LINES = 8;
const REVEAL_STEP = 5;

type DailySnippet = Snippet & { puzzle?: number };

export default function GamePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"daily" | "practice">("practice");
  const [snippet, setSnippet] = useState<DailySnippet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedCount, setRevealedCount] = useState(INITIAL_LINES);
  const [revealUses, setRevealUses] = useState(0);
  const [showGuessPanel, setShowGuessPanel] = useState(false);

  const loadSnippet = useCallback(async (gameMode: "daily" | "practice") => {
    setLoading(true);
    setError(null);
    setRevealedCount(INITIAL_LINES);
    setRevealUses(0);
    setShowGuessPanel(false);
    setSnippet(null);

    try {
      const endpoint = gameMode === "daily" ? "/api/daily" : "/api/snippet";
      const res = await fetch(endpoint);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data: DailySnippet = await res.json();
      setSnippet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode") === "daily" ? "daily" : "practice";
    setMode(m);
    loadSnippet(m);
  }, [loadSnippet]);

  function handleReveal() {
    if (!snippet) return;
    const next = Math.min(revealedCount + REVEAL_STEP, snippet.lines.length);
    setRevealedCount(next);
    setRevealUses((u) => u + 1);
  }

  function handleSubmit(guesses: Guesses) {
    if (!snippet) return;

    const actual = { language: snippet.language, framework: snippet.framework };
    const badges = calcRoundBadges(guesses, actual, revealedCount);

    let dailyStreak: number | null = null;

    if (mode === "daily" && snippet.puzzle) {
      const langCorrect = isLanguageCorrect(guesses.language, snippet.language);
      const fwCorrect =
        snippet.framework === null
          ? null
          : isFrameworkCorrect(guesses.framework, snippet.framework);

      const dailyResult: DailyResult = {
        puzzle: snippet.puzzle,
        languageCorrect: langCorrect,
        frameworkCorrect: fwCorrect,
        linesRevealed: revealedCount,
        totalLines: snippet.lines.length,
        badges,
      };

      const prev = loadDailyState();
      const next = recordDailyCompletion(prev, dailyResult);
      try {
        localStorage.setItem("repoguessr_daily", JSON.stringify(next));
      } catch {}
      dailyStreak = next.currentStreak;
    }

    try {
      sessionStorage.setItem(
        "repoguessr_result",
        JSON.stringify({
          resultId: Date.now(),
          snippet,
          guesses,
          linesRevealed: revealedCount,
          roundBadges: badges,
          mode,
          puzzle: snippet.puzzle ?? null,
          dailyStreak,
        })
      );
    } catch {}

    router.push("/result");
  }

  const totalLines = snippet?.lines.length ?? 40;
  const remaining = totalLines - revealedCount;
  const progressPct = Math.min(100, (revealedCount / totalLines) * 100);
  const revealLabel =
    remaining <= 0
      ? "ALL LINES REVEALED"
      : remaining < REVEAL_STEP
      ? `REVEAL ${remaining} MORE`
      : "REVEAL 5 MORE";

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <MatrixLoader />
      </main>
    );
  }

  if (error || !snippet) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
        <p className="body-type text-[#9A9A9A]">Could not fetch snippet.</p>
        <Button variant="ghost" size="lg" onClick={() => loadSnippet(mode)}>
          RETRY
        </Button>
      </main>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/daily"
              className="label text-[#9A9A9A] hover:text-white transition-colors shrink-0"
            >
              ← DAILY
            </Link>
            {mode === "daily" && snippet.puzzle != null && (
              <span className="label text-white border border-[#9A9A9A] rounded-lg px-3 py-1.5 shrink-0">
                DAILY #{snippet.puzzle}
              </span>
            )}
            {mode === "practice" && (
              <span className="label text-[#9A9A9A] shrink-0">PRACTICE</span>
            )}
            <div className="flex-1" />
            <p className="body-type text-[#9A9A9A] shrink-0 tabular-nums">
              Reveals{" "}
              <span className="text-white">{revealUses}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <p className="body-type text-[#9A9A9A]">
                Lines revealed
              </p>
              <p className="body-type tabular-nums">
                <span className="stat-type text-white">{revealedCount}</span>
                <span className="text-[#9A9A9A]"> / {totalLines}</span>
              </p>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9A9A9A] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[8.5rem] pb-36 px-6 max-w-3xl mx-auto">
        <CodeBlock
          lines={snippet.lines}
          revealedCount={revealedCount}
          language={snippet.language}
        />
      </main>

      {!showGuessPanel && (
        <footer className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-3xl mx-auto px-6 pb-6">
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleReveal}
                disabled={remaining <= 0}
                className="flex-1"
              >
                {revealLabel}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowGuessPanel(true)}
                className="flex-1"
              >
                READY TO GUESS
              </Button>
            </div>
          </div>
        </footer>
      )}

      <GuessPanel
        visible={showGuessPanel}
        showFramework={!!snippet.framework}
        onSubmit={handleSubmit}
        onDismiss={() => setShowGuessPanel(false)}
      />
    </>
  );
}
