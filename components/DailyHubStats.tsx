interface DailyHubStatsProps {
  streak: number;
  freezes: number;
  weeklyScore: number;
  weekLabel: number;
}

export default function DailyHubStats({
  streak,
  freezes,
  weeklyScore,
  weekLabel,
}: DailyHubStatsProps) {
  const showStreak = streak > 0 || freezes > 0;

  return (
    <div className="w-full bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 text-left flex flex-col gap-6">
      {showStreak && (
        <>
          <div className="flex items-start justify-between gap-4">
            <p className="label text-[#9A9A9A] shrink-0 pt-1">STREAK</p>
            <div className="flex flex-col items-end gap-2 min-w-0">
              {streak > 0 && (
                <p className="stat-type text-white tabular-nums leading-none">
                  {streak}
                  <span className="body-type text-[#9A9A9A] font-normal ml-2">
                    day{streak === 1 ? "" : "s"}
                  </span>
                </p>
              )}
              {freezes > 0 && (
                <p className="label text-[#9A9A9A]">FREEZE ×{freezes}</p>
              )}
            </div>
          </div>
          <div className="h-px bg-[#1a1a1a]" aria-hidden />
        </>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="label text-[#9A9A9A]">WEEKLY SCORE</p>
          <p className="body-type text-[#9A9A9A]">Week {weekLabel}</p>
        </div>
        <p className="stat-type text-white tabular-nums shrink-0 leading-none">
          {weeklyScore.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
