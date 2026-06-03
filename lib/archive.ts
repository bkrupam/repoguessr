import { dailyPoolIndex, puzzleNumber, EPOCH_UTC } from "./daily";

const DAY_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_KEY = "repoguessr_archive";

export interface ArchiveEntry {
  puzzle: number;
  score: number;
  playedAt: string;
}

export type ArchiveMap = Record<string, ArchiveEntry>;

export function loadArchive(): ArchiveMap {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveArchive(map: ArchiveMap): void {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(map));
  } catch {}
}

export function recordArchiveEntry(
  map: ArchiveMap,
  puzzle: number,
  score: number
): ArchiveMap {
  return {
    ...map,
    [String(puzzle)]: {
      puzzle,
      score,
      playedAt: new Date().toISOString(),
    },
  };
}

export function puzzleDateLabel(puzzle: number): string {
  const dayOffset = puzzle - 1;
  const ms = EPOCH_UTC + dayOffset * DAY_MS;
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function listPastPuzzles(
  poolSize: number,
  now: Date = new Date()
): { puzzle: number; poolIndex: number; dateLabel: string }[] {
  const today = puzzleNumber(now);
  const items: { puzzle: number; poolIndex: number; dateLabel: string }[] = [];
  for (let p = today - 1; p >= 1 && items.length < 30; p--) {
    const dayOffset = p - 1;
    const d = new Date(EPOCH_UTC + dayOffset * DAY_MS);
    items.push({
      puzzle: p,
      poolIndex: dailyPoolIndex(poolSize, d),
      dateLabel: puzzleDateLabel(p),
    });
  }
  return items;
}

export { puzzleNumber, dailyPoolIndex };
