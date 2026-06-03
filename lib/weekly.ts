import { daysSinceEpoch } from "./daily";
const STORAGE_KEY = "repoguessr_weekly";

export interface WeeklyState {
  weekNumber: number;
  cumulativeScore: number;
  daysPlayed: number;
}

export const DEFAULT_WEEKLY: WeeklyState = {
  weekNumber: 0,
  cumulativeScore: 0,
  daysPlayed: 0,
};

/** ISO week number since epoch (Monday-based weeks). */
export function weekNumber(now: Date = new Date()): number {
  const days = daysSinceEpoch(now);
  return Math.floor(days / 7);
}

export function loadWeeklyState(): WeeklyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_WEEKLY, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_WEEKLY };
}

export function saveWeeklyState(state: WeeklyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function recordWeeklyScore(
  state: WeeklyState,
  roundScore: number,
  now: Date = new Date()
): WeeklyState {
  const currentWeek = weekNumber(now);
  if (state.weekNumber !== currentWeek) {
    return {
      weekNumber: currentWeek,
      cumulativeScore: roundScore,
      daysPlayed: 1,
    };
  }
  return {
    weekNumber: currentWeek,
    cumulativeScore: state.cumulativeScore + roundScore,
    daysPlayed: state.daysPlayed + 1,
  };
}

/** Puzzle index for a given day within the week (0–6, Mon=0 in UTC week). */
export function dayInWeek(now: Date = new Date()): number {
  const days = daysSinceEpoch(now);
  return days % 7;
}
