import { Badge } from "./badges";

// Launch epoch — puzzle #1 is this day (UTC). Adjust if you want a different start.
export const EPOCH_UTC = Date.UTC(2026, 0, 1); // 2026-01-01
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days elapsed since the epoch, in UTC. */
export function daysSinceEpoch(now: Date = new Date()): number {
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return Math.floor((todayUtc - EPOCH_UTC) / DAY_MS);
}

/** Human-facing puzzle number (1-based). */
export function puzzleNumber(now: Date = new Date()): number {
  return daysSinceEpoch(now) + 1;
}

/** Local calendar date for daily hub display (e.g. "Monday, June 2, 2026"). */
export function formatDailyDisplayDate(now: Date = new Date()): string {
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Split date for hub layout — short headline stays on one line. */
export function formatDailyDateParts(now: Date = new Date()): {
  weekday: string;
  headline: string;
} {
  return {
    weekday: now.toLocaleDateString(undefined, { weekday: "long" }),
    headline: now.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

/** Index into the daily pool for today. */
export function dailyPoolIndex(poolSize: number, now: Date = new Date()): number {
  if (poolSize <= 0) return 0;
  return ((daysSinceEpoch(now) % poolSize) + poolSize) % poolSize;
}

/** Milliseconds until the next UTC midnight (for the countdown). */
export function msUntilNextDaily(now: Date = new Date()): number {
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return nextUtcMidnight - now.getTime();
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ─── Daily streak state (localStorage) ──────────────────────────────────────────

export interface DailyResult {
  puzzle: number;
  languageCorrect: boolean;
  frameworkCorrect: boolean | null; // null = framework wasn't asked
  linesRevealed: number;
  totalLines: number;
  badges: Badge[];
}

export interface DailyState {
  lastPlayedPuzzle: number; // puzzle number of the most recent completion
  currentStreak: number;
  maxStreak: number;
  lastResult: DailyResult | null;
  streakFreezes: number;
  lastFreezeEarnedStreak: number;
}

export const DEFAULT_DAILY_STATE: DailyState = {
  lastPlayedPuzzle: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastResult: null,
  streakFreezes: 0,
  lastFreezeEarnedStreak: 0,
};

const STORAGE_KEY = "repoguessr_daily";

export function loadDailyState(): DailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_DAILY_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_DAILY_STATE };
}

export function saveDailyState(state: DailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/** Has today's puzzle already been completed? */
export function isPlayedToday(state: DailyState, now: Date = new Date()): boolean {
  return state.lastPlayedPuzzle === puzzleNumber(now);
}

/**
 * Record a daily completion. Idempotent for the same puzzle — calling twice
 * for today won't double-count the streak.
 * Streak rule: continues if the previous completion was the immediately
 * preceding puzzle; otherwise resets to 1.
 */
export function recordDailyCompletion(
  state: DailyState,
  result: DailyResult,
  now: Date = new Date()
): DailyState {
  const today = puzzleNumber(now);

  // Already recorded today — no-op (return state unchanged but ensure result stored)
  if (state.lastPlayedPuzzle === today) {
    return { ...state, lastResult: result };
  }

  const continues = state.lastPlayedPuzzle === today - 1;
  const currentStreak = continues ? state.currentStreak + 1 : 1;
  const maxStreak = Math.max(state.maxStreak, currentStreak);

  let streakFreezes = state.streakFreezes ?? 0;
  let lastFreezeEarnedStreak = state.lastFreezeEarnedStreak ?? 0;
  if (
    currentStreak >= 7 &&
    currentStreak > lastFreezeEarnedStreak &&
    currentStreak % 7 === 0
  ) {
    streakFreezes += 1;
    lastFreezeEarnedStreak = currentStreak;
  }

  return {
    lastPlayedPuzzle: today,
    currentStreak,
    maxStreak,
    lastResult: result,
    streakFreezes,
    lastFreezeEarnedStreak,
  };
}

/** Apply streak freeze if user missed exactly one day. Call on daily hub load. */
export function applyStreakFreezeIfNeeded(
  state: DailyState,
  now: Date = new Date()
): DailyState {
  const today = puzzleNumber(now);
  const missedOne =
    state.lastPlayedPuzzle > 0 &&
    state.lastPlayedPuzzle < today - 1 &&
    state.lastPlayedPuzzle === today - 2;
  const freezes = state.streakFreezes ?? 0;
  if (missedOne && freezes > 0) {
    return {
      ...state,
      lastPlayedPuzzle: today - 1,
      streakFreezes: freezes - 1,
    };
  }
  return state;
}

// ─── Share grid ─────────────────────────────────────────────────────────────────

export function buildShareGrid(result: DailyResult, streak: number): string {
  const lang = result.languageCorrect ? "🟩" : "🟥";
  const fw =
    result.frameworkCorrect === null
      ? null
      : result.frameworkCorrect
      ? "🟩"
      : "🟥";

  // Efficiency bar — how few lines used out of total, in 5 blocks
  const ratio = result.linesRevealed / result.totalLines;
  const filled = Math.max(1, Math.round(ratio * 5));
  const bar = "▰".repeat(filled) + "▱".repeat(5 - filled);

  const lines = [
    `RepoGuessr #${result.puzzle}`,
    fw ? `LANG ${lang}  FW ${fw}` : `LANG ${lang}`,
    `⚡ ${result.linesRevealed} lines  ${bar}`,
    `🔥 ${streak} day streak`,
  ];
  return lines.join("\n");
}
