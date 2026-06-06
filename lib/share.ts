import { Badge, BADGE_LABELS } from "./badges";

export function formatRoundDuration(ms: number): string {
  const totalSec = Math.max(1, Math.round(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export interface ShareImageParams {
  guess: string;
  actual: string;
  languageCorrect: boolean;
  linesRevealed: number;
  elapsedMs: number;
  roundBadges: Badge[];
  rank?: string;
  puzzle?: number | null;
  score?: number;
  streak?: number | null;
}

export function buildShareImageUrl(
  origin: string,
  params: ShareImageParams
): string {
  const q = new URLSearchParams({
    guess: params.guess,
    actual: params.actual,
    correct: params.languageCorrect ? "1" : "0",
    lines: String(params.linesRevealed),
    time: String(Math.max(1, Math.round(params.elapsedMs / 1000))),
  });
  if (params.puzzle) q.set("puzzle", String(params.puzzle));
  if (params.score != null) q.set("score", String(params.score));
  if (params.streak != null && params.streak > 0) {
    q.set("streak", String(params.streak));
  }
  const badges = params.roundBadges.map((b) => BADGE_LABELS[b]).join("|");
  if (badges) q.set("badges", badges);
  if (params.rank) q.set("rank", params.rank);
  return `${origin}/api/og?${q.toString()}`;
}
