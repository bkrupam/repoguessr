export type Badge =
  | "LINGUIST"
  | "ARCHITECT"
  | "MINIMALIST"
  | "SPEED_READER"
  | "COLD_CALL";

export type Milestone =
  | "EXPLORER"
  | "VETERAN"
  | "POLYGLOT"
  | "FRAMEWORK_MASTER"
  | "HAWK_EYE"
  | "PERFECTIONIST";

export interface RoundGuesses {
  language: string;
  framework: string; // empty string if skipped
}

export interface RoundActual {
  language: string;
  framework: string | null;
}

export interface CumulativeStats {
  gamesPlayed: number;
  languagesCorrect: string[]; // distinct languages correctly guessed
  frameworksCorrect: string[]; // distinct frameworks correctly guessed
  eightLineWins: number; // times language was correct with 0 reveals
  unlockedMilestones: Milestone[];
  totalScore: number;
  totalReveals: number;
  languageAttempts: Record<string, { correct: number; total: number }>;
}

export const DEFAULT_STATS: CumulativeStats = {
  gamesPlayed: 0,
  languagesCorrect: [],
  frameworksCorrect: [],
  eightLineWins: 0,
  unlockedMilestones: [],
  totalScore: 0,
  totalReveals: 0,
  languageAttempts: {},
};

// ─── Per-round ────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.trim().toLowerCase();
}

export function isLanguageCorrect(guess: string, actual: string): boolean {
  return normalise(guess) === normalise(actual);
}

export function isFrameworkCorrect(
  guess: string,
  actual: string | null
): boolean {
  const g = normalise(guess);
  // Blank guess + null actual = correct (player correctly identified no framework)
  if (g === "" && actual === null) return true;
  // Blank guess + non-null actual = wrong
  if (g === "" && actual !== null) return false;
  // Non-blank guess + null actual = wrong
  if (g !== "" && actual === null) return false;
  // Both present — exact or substring match
  const a = normalise(actual!);
  return a === g || a.includes(g) || g.includes(a);
}

export function calcRoundBadges(
  guesses: RoundGuesses,
  actual: RoundActual,
  linesRevealed: number, // total lines visible when submitted
  initialLines: number = 8,
  revealStep: number = 5
): Badge[] {
  const badges: Badge[] = [];

  const langOk = isLanguageCorrect(guesses.language, actual.language);
  const fwOk = isFrameworkCorrect(guesses.framework, actual.framework);
  const revealCount =
    linesRevealed <= initialLines
      ? 0
      : Math.ceil((linesRevealed - initialLines) / revealStep);

  if (langOk) badges.push("LINGUIST");

  // ARCHITECT: only awarded when repo has a detectable framework
  // (blank+null is still correct but we show the badge to reward it)
  if (fwOk) badges.push("ARCHITECT");

  if (revealCount === 0) badges.push("MINIMALIST");
  else if (revealCount === 1) badges.push("SPEED_READER");

  // COLD_CALL: LINGUIST + MINIMALIST combo — replaces/extends both
  if (langOk && revealCount === 0) {
    badges.push("COLD_CALL");
  }

  return badges;
}

// ─── Cumulative stats ─────────────────────────────────────────────────────────

export function updateStats(
  stats: CumulativeStats,
  round: {
    guesses: RoundGuesses;
    actual: RoundActual;
    linesRevealed: number;
    initialLines?: number;
    revealStep?: number;
    roundScore?: number;
  }
): CumulativeStats {
  const langOk = isLanguageCorrect(round.guesses.language, round.actual.language);
  const fwOk = isFrameworkCorrect(round.guesses.framework, round.actual.framework);
  const initial = round.initialLines ?? 8;
  const step = round.revealStep ?? 5;
  const revealCount =
    round.linesRevealed <= initial
      ? 0
      : Math.ceil((round.linesRevealed - initial) / step);

  const updatedLangs = langOk
    ? Array.from(new Set([...stats.languagesCorrect, round.actual.language]))
    : stats.languagesCorrect;

  const updatedFws =
    fwOk && round.actual.framework
      ? Array.from(new Set([...stats.frameworksCorrect, round.actual.framework]))
      : stats.frameworksCorrect;

  const lang = round.actual.language;
  const attempts = { ...(stats.languageAttempts ?? {}) };
  const prev = attempts[lang] ?? { correct: 0, total: 0 };
  attempts[lang] = {
    correct: prev.correct + (langOk ? 1 : 0),
    total: prev.total + 1,
  };

  return {
    gamesPlayed: stats.gamesPlayed + 1,
    languagesCorrect: updatedLangs,
    frameworksCorrect: updatedFws,
    eightLineWins: langOk && revealCount === 0 ? stats.eightLineWins + 1 : stats.eightLineWins,
    unlockedMilestones: stats.unlockedMilestones,
    totalScore: (stats.totalScore ?? 0) + (round.roundScore ?? 0),
    totalReveals: (stats.totalReveals ?? 0) + revealCount,
    languageAttempts: attempts,
  };
}

export function statsAccuracy(stats: CumulativeStats): number {
  if (stats.gamesPlayed === 0) return 0;
  const langs = stats.languageAttempts ?? {};
  let correct = 0;
  let total = 0;
  for (const v of Object.values(langs)) {
    correct += v.correct;
    total += v.total;
  }
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function avgReveals(stats: CumulativeStats): string {
  if (stats.gamesPlayed === 0) return "—";
  const avg = (stats.totalReveals ?? 0) / stats.gamesPlayed;
  return avg.toFixed(1);
}

export function checkMilestones(
  prev: CumulativeStats,
  next: CumulativeStats
): Milestone[] {
  const newlyUnlocked: Milestone[] = [];
  const already = new Set(prev.unlockedMilestones);

  function check(m: Milestone, condition: boolean) {
    if (!already.has(m) && condition) newlyUnlocked.push(m);
  }

  check("EXPLORER", next.gamesPlayed >= 5);
  check("VETERAN", next.gamesPlayed >= 25);
  check("POLYGLOT", next.languagesCorrect.length >= 5);
  check("FRAMEWORK_MASTER", next.frameworksCorrect.length >= 3);
  check("HAWK_EYE", next.eightLineWins >= 3);

  // PERFECTIONIST: LINGUIST + ARCHITECT + MINIMALIST in one round
  // Checked separately via the round badges passed to the result page
  return newlyUnlocked;
}

export function checkPerfectionist(badges: Badge[]): boolean {
  return (
    badges.includes("LINGUIST") &&
    badges.includes("ARCHITECT") &&
    badges.includes("MINIMALIST")
  );
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const BADGE_LABELS: Record<Badge, string> = {
  LINGUIST: "LINGUIST",
  ARCHITECT: "ARCHITECT",
  MINIMALIST: "MINIMALIST",
  SPEED_READER: "SPEED READER",
  COLD_CALL: "COLD CALL",
};

export const MILESTONE_LABELS: Record<Milestone, string> = {
  EXPLORER: "EXPLORER",
  VETERAN: "VETERAN",
  POLYGLOT: "POLYGLOT",
  FRAMEWORK_MASTER: "FRAMEWORK MASTER",
  HAWK_EYE: "HAWK EYE",
  PERFECTIONIST: "PERFECTIONIST",
};

export const MILESTONE_DESCRIPTIONS: Record<Milestone, string> = {
  EXPLORER: "5 games played",
  VETERAN: "25 games played",
  POLYGLOT: "5 distinct languages identified",
  FRAMEWORK_MASTER: "3 distinct frameworks identified",
  HAWK_EYE: "3× correct language in 8 lines",
  PERFECTIONIST: "Language + framework + no reveals in one round",
};

/** Canonical display order for all milestones */
export const ALL_MILESTONES: Milestone[] = [
  "EXPLORER",
  "POLYGLOT",
  "HAWK_EYE",
  "FRAMEWORK_MASTER",
  "PERFECTIONIST",
  "VETERAN",
];

export const MILESTONE_ICONS: Record<Milestone, string> = {
  EXPLORER: "◎",
  POLYGLOT: "∞",
  HAWK_EYE: "◉",
  FRAMEWORK_MASTER: "⬡",
  PERFECTIONIST: "◆",
  VETERAN: "△",
};
