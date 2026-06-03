import { isFrameworkCorrect, isLanguageCorrect } from "./badges";

export interface RoundScoreInput {
  languageGuess: string;
  frameworkGuess: string;
  actualLanguage: string;
  actualFramework: string | null;
  revealBatches: number;
  hintUsed: boolean;
  difficultyMultiplier: number;
  dailyStreak: number | null;
}

export function calcRevealBatches(
  linesRevealed: number,
  initialLines: number,
  revealStep: number
): number {
  if (linesRevealed <= initialLines) return 0;
  return Math.ceil((linesRevealed - initialLines) / revealStep);
}

export function calcRoundScore(input: RoundScoreInput): number {
  const langOk = isLanguageCorrect(input.languageGuess, input.actualLanguage);
  if (!langOk) return 0;

  let score = 1000;
  score -= input.revealBatches * 100;
  if (input.hintUsed) score -= 150;

  const fwOk = isFrameworkCorrect(
    input.frameworkGuess,
    input.actualFramework
  );
  if (fwOk && input.actualFramework) score += 200;

  score = Math.max(0, score);
  score = Math.round(score * input.difficultyMultiplier);

  if (input.dailyStreak != null && input.dailyStreak > 0) {
    const mult = Math.min(2, 1 + (input.dailyStreak - 1) * 0.1);
    score = Math.round(score * mult);
  }

  return score;
}

export function calcConfidencePercent(
  linesRevealed: number,
  totalLines: number
): number {
  if (totalLines <= 0) return 100;
  const used = Math.min(linesRevealed / totalLines, 1);
  return Math.max(0, Math.round((1 - used) * 100));
}
