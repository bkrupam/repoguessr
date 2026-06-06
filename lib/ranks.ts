export type RankId =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "legendary";

export interface RankTier {
  id: RankId;
  label: string;
  minScore: number;
  icon: string;
}

export const RANK_TIERS: RankTier[] = [
  { id: "bronze", label: "BRONZE", minScore: 0, icon: "○" },
  { id: "silver", label: "SILVER", minScore: 3_000, icon: "◇" },
  { id: "gold", label: "GOLD", minScore: 10_000, icon: "★" },
  { id: "platinum", label: "PLATINUM", minScore: 25_000, icon: "◆" },
  { id: "diamond", label: "DIAMOND", minScore: 60_000, icon: "◈" },
  { id: "legendary", label: "LEGENDARY", minScore: 150_000, icon: "◎" },
];

export function getRank(totalScore: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (totalScore >= tier.minScore) current = tier;
    else break;
  }
  return current;
}

export interface RankProgress {
  rank: RankTier;
  nextRank: RankTier | null;
  pointsInTier: number;
  pointsForTier: number;
  pointsToNext: number;
  percent: number;
  isMaxRank: boolean;
}

export function getRankProgress(totalScore: number): RankProgress {
  const rank = getRank(totalScore);
  const rankIndex = RANK_TIERS.findIndex((t) => t.id === rank.id);
  const nextRank =
    rankIndex < RANK_TIERS.length - 1 ? RANK_TIERS[rankIndex + 1] : null;

  if (!nextRank) {
    return {
      rank,
      nextRank: null,
      pointsInTier: totalScore - rank.minScore,
      pointsForTier: 0,
      pointsToNext: 0,
      percent: 100,
      isMaxRank: true,
    };
  }

  const pointsInTier = totalScore - rank.minScore;
  const pointsForTier = nextRank.minScore - rank.minScore;
  const pointsToNext = nextRank.minScore - totalScore;
  const percent = Math.min(
    100,
    Math.round((pointsInTier / pointsForTier) * 100)
  );

  return {
    rank,
    nextRank,
    pointsInTier,
    pointsForTier,
    pointsToNext,
    percent,
    isMaxRank: false,
  };
}
