"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import GuessPanel, { Guesses, ALL_LANGUAGES } from "@/components/GuessPanel";
import Button from "@/components/Button";
import MatrixLoader from "@/components/MatrixLoader";
import { Snippet } from "@/lib/github";
import { calcRoundBadges, isLanguageCorrect, isFrameworkCorrect } from "@/lib/badges";
import {
  loadDailyState,
  recordDailyCompletion,
  DailyResult,
  saveDailyState,
} from "@/lib/daily";
import {
  loadDifficulty,
  getDifficultyConfig,
  Difficulty,
} from "@/lib/difficulty";
import { getRoundHint } from "@/lib/hints";
import {
  calcRoundScore,
  calcRevealBatches,
  calcConfidencePercent,
} from "@/lib/score";
import { decodeChallenge, fetchChallenge } from "@/lib/challenge";
import { recordArchiveEntry, loadArchive, saveArchive } from "@/lib/archive";
import { recordWeeklyScore, loadWeeklyState, saveWeeklyState } from "@/lib/weekly";

type DailySnippet = Snippet & { puzzle?: number };

export default function GamePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"daily" | "practice">("practice");
  const [snippet, setSnippet] = useState<DailySnippet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [initialLines, setInitialLines] = useState(8);
  const [revealStep, setRevealStep] = useState(5);
  const [revealedCount, setRevealedCount] = useState(8);
  const [revealUses, setRevealUses] = useState(0);
  const [showGuessPanel, setShowGuessPanel] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [challengeMeta, setChallengeMeta] = useState<{
    challengerScore?: number;
  } | null>(null);
  const hintIndicesRef = useRef<number[]>([]);
  const loadIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const roundStartedAtRef = useRef<number | null>(null);

  const loadSnippet = useCallback(
    async (
      gameMode: "daily" | "practice",
      opts?: {
        puzzle?: number;
        lang?: string;
        encoded?: string;
        challengeId?: string;
        resetRound?: boolean;
      }
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const loadId = ++loadIdRef.current;

      const resetRound = opts?.resetRound !== false;
      setLoading(true);
      setError(null);
      if (resetRound) {
        setShowGuessPanel(false);
        setHintText(null);
        setHintUsed(false);
        hintIndicesRef.current = [];
        setSnippet(null);
        roundStartedAtRef.current = null;
      }

      const diff = loadDifficulty();
      const cfg = getDifficultyConfig(diff);
      setDifficulty(diff);
      setInitialLines(cfg.initialLines);
      setRevealStep(cfg.revealStep);
      setRevealedCount(cfg.initialLines);
      setRevealUses(0);

      try {
        if (opts?.challengeId) {
          const payload = await fetchChallenge(opts.challengeId);
          if (!payload) throw new Error("Invalid or expired challenge link");
          if (loadId !== loadIdRef.current) return;
          setSnippet(payload.snippet);
          roundStartedAtRef.current = Date.now();
          setChallengeMeta({ challengerScore: payload.challengerScore });
          setMode("practice");
          return;
        }

        if (opts?.encoded) {
          const payload = decodeChallenge(opts.encoded);
          if (!payload) throw new Error("Invalid challenge link");
          if (loadId !== loadIdRef.current) return;
          setSnippet(payload.snippet);
          roundStartedAtRef.current = Date.now();
          setChallengeMeta({ challengerScore: payload.challengerScore });
          setMode("practice");
          return;
        }

        if (gameMode === "daily") {
          const q = opts?.puzzle ? `?puzzle=${opts.puzzle}` : "";
          const res = await fetch(`/api/daily${q}`, {
            signal: controller.signal,
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? `HTTP ${res.status}`);
          }
          const data: DailySnippet = await res.json();
          if (loadId !== loadIdRef.current) return;
          setSnippet(data);
          roundStartedAtRef.current = Date.now();
          if (typeof caches !== "undefined") {
            caches.open("repoguessr-daily-v1").then((cache) => {
              cache.put("/api/daily-today", new Response(JSON.stringify(data)));
            });
          }
        } else {
          const params = new URLSearchParams();
          if (opts?.lang) params.set("lang", opts.lang);
          const res = await fetch(
            `/api/snippet${params.toString() ? `?${params}` : ""}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? `HTTP ${res.status}`);
          }
          const data: DailySnippet = await res.json();
          if (loadId !== loadIdRef.current) return;
          setSnippet(data);
          roundStartedAtRef.current = Date.now();
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (loadId !== loadIdRef.current) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (loadId === loadIdRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get("c");
    if (challengeId) {
      loadSnippet("practice", { challengeId });
      return;
    }
    const encoded = params.get("snippet");
    if (encoded) {
      loadSnippet("practice", { encoded });
      return;
    }
    const m = params.get("mode") === "daily" ? "daily" : "practice";
    const puzzleParam = params.get("puzzle");
    const puzzle = puzzleParam ? parseInt(puzzleParam, 10) : undefined;
    const lang = params.get("lang") ?? "";
    setLangFilter(lang);
    setMode(m);
    loadSnippet(m, { puzzle, lang: lang || undefined });
  }, [loadSnippet]);

  const cfg = getDifficultyConfig(difficulty);
  const langOptions =
    cfg.languages === "all" ? ALL_LANGUAGES : [...cfg.languages];

  function handleReveal() {
    if (!snippet) return;
    const next = Math.min(revealedCount + revealStep, snippet.lines.length);
    setRevealedCount(next);
    setRevealUses((u) => u + 1);
  }

  function handleHint() {
    if (!snippet || hintUsed) return;
    const hint = getRoundHint(hintIndicesRef.current);
    hintIndicesRef.current = [...hintIndicesRef.current, hintIndicesRef.current.length];
    setHintText(hint);
    setHintUsed(true);
  }

  function handleSubmit(guesses: Guesses) {
    if (!snippet) return;

    const actual = { language: snippet.language, framework: snippet.framework };
    const badges = calcRoundBadges(
      guesses,
      actual,
      revealedCount,
      initialLines,
      revealStep
    );

    const revealBatches = calcRevealBatches(
      revealedCount,
      initialLines,
      revealStep
    );
    const diffCfg = getDifficultyConfig(difficulty);

    let dailyStreak: number | null = null;
    let roundScore = 0;

    if (mode === "daily" && snippet.puzzle) {
      const langCorrect = isLanguageCorrect(guesses.language, snippet.language);
      const fwCorrect =
        snippet.framework === null
          ? null
          : isFrameworkCorrect(guesses.framework, snippet.framework);

      const prev = loadDailyState();
      const today = snippet.puzzle;
      const projectedStreak =
        prev.lastPlayedPuzzle === today
          ? prev.currentStreak
          : prev.lastPlayedPuzzle === today - 1
          ? prev.currentStreak + 1
          : 1;

      roundScore = calcRoundScore({
        languageGuess: guesses.language,
        frameworkGuess: guesses.framework,
        actualLanguage: snippet.language,
        actualFramework: snippet.framework,
        revealBatches,
        hintUsed,
        difficultyMultiplier: diffCfg.scoreMultiplier,
        dailyStreak: projectedStreak,
      });

      const dailyResult: DailyResult = {
        puzzle: snippet.puzzle,
        languageCorrect: langCorrect,
        frameworkCorrect: fwCorrect,
        linesRevealed: revealedCount,
        totalLines: snippet.lines.length,
        badges,
      };

      const next = recordDailyCompletion(prev, dailyResult);
      saveDailyState(next);
      dailyStreak = next.currentStreak;

      const archive = recordArchiveEntry(
        loadArchive(),
        snippet.puzzle,
        roundScore
      );
      saveArchive(archive);

      const weekly = recordWeeklyScore(loadWeeklyState(), roundScore);
      saveWeeklyState(weekly);
    } else {
      roundScore = calcRoundScore({
        languageGuess: guesses.language,
        frameworkGuess: guesses.framework,
        actualLanguage: snippet.language,
        actualFramework: snippet.framework,
        revealBatches,
        hintUsed,
        difficultyMultiplier: diffCfg.scoreMultiplier,
        dailyStreak: null,
      });
    }

    const elapsedMs = roundStartedAtRef.current
      ? Date.now() - roundStartedAtRef.current
      : 0;

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
          roundScore,
          hintUsed,
          initialLines,
          revealStep,
          difficulty,
          challengeMeta,
          elapsedMs,
          newMilestones: [],
        })
      );
    } catch {}

    router.push("/result");
  }

  useEffect(() => {
    if (loading || showGuessPanel || !snippet) return;
    const total = snippet.lines.length;
    const step = revealStep;

    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setRevealedCount((prev) => {
          const rem = total - prev;
          if (rem <= 0) return prev;
          const next = Math.min(prev + step, total);
          if (next > prev) setRevealUses((u) => u + 1);
          return next;
        });
      } else if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        setShowGuessPanel(true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, showGuessPanel, snippet, revealStep]);

  const totalLines = snippet?.lines.length ?? 40;
  const remaining = totalLines - revealedCount;
  const confidence = calcConfidencePercent(revealedCount, totalLines);
  const revealLabel =
    remaining <= 0
      ? "ALL LINES REVEALED"
      : remaining < revealStep
      ? `REVEAL ${remaining} MORE`
      : "REVEAL 5 MORE";

  const showFrameworkField =
    !!snippet?.framework && cfg.showFramework;

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
        <Button variant="ghost" size="lg" onClick={() => loadSnippet(mode, { lang: langFilter || undefined })}>
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
            <p className="label text-[#9A9A9A] shrink-0 tabular-nums">
              {confidence}% CONFIDENCE
            </p>
          </div>

          {hintText && (
            <p className="body-type text-[#9A9A9A] mb-3 border-l border-[#9A9A9A] pl-4">
              {hintText}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <div className="h-px bg-[#1a1a1a] w-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="label text-[#9A9A9A]">
                {revealedCount} / {totalLines} LINES
              </p>
              <p className="label text-[#9A9A9A] tabular-nums">
                REVEALS <span className="text-white">{revealUses}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main
        className={`pb-40 px-6 max-w-3xl mx-auto transition-[padding] ${
          hintText ? "pt-[12rem]" : "pt-[9.5rem]"
        }`}
      >
        <CodeBlock
          lines={snippet.lines}
          revealedCount={revealedCount}
        />
      </main>

      {!showGuessPanel && (
        <footer className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-3xl mx-auto px-6 pb-6">
            <p className="label text-[#9A9A9A] text-center mb-2 hidden md:block [@media(hover:none)]:hidden">
              SPACE REVEAL · G GUESS
            </p>
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-4 flex flex-col sm:flex-row gap-3">
              {!hintUsed && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleHint}
                  className="sm:w-auto"
                >
                  HINT
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={handleReveal}
                disabled={remaining <= 0}
                className="flex-1"
              >
                {revealLabel}
              </Button>
              <Button
                type="button"
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
        showFramework={showFrameworkField}
        requireFramework={cfg.requireFramework && showFrameworkField}
        languages={langOptions}
        freeTextLanguage={cfg.freeTextLanguage}
        onSubmit={handleSubmit}
        onDismiss={() => setShowGuessPanel(false)}
      />
    </>
  );
}
