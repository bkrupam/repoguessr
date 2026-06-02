import {
  Badge,
  Milestone,
  BADGE_LABELS,
  MILESTONE_LABELS,
  MILESTONE_DESCRIPTIONS,
  ALL_MILESTONES,
} from "@/lib/badges";

// ─── Per-round badge chips ────────────────────────────────────────────────────

interface RoundBadgeChipProps {
  label: string;
  isNew?: boolean;
}

function RoundBadgeChip({ label, isNew }: RoundBadgeChipProps) {
  return (
    <span className={`label inline-block px-3 py-2 border rounded-lg text-white ${
      isNew ? "border-white" : "border-[#9A9A9A]"
    }`}>
      {label}
    </span>
  );
}

// ─── Milestone row ────────────────────────────────────────────────────────────

interface MilestoneRowProps {
  milestone: Milestone;
  unlocked: boolean;
  isNew?: boolean;
}

function MilestoneRow({ milestone, unlocked, isNew }: MilestoneRowProps) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 border-b border-[#1a1a1a] last:border-0 ${
      unlocked ? "" : "opacity-40"
    }`}>
      <div className="flex flex-col gap-1">
        <span className={`label ${unlocked ? "text-white" : "text-[#9A9A9A]"}`}>
          {unlocked ? "✓ " : "○ "}
          {MILESTONE_LABELS[milestone]}
          {isNew && <span className="ml-2 text-white border border-white rounded px-1">NEW</span>}
        </span>
        <span className="body-type text-[#9A9A9A]">
          {MILESTONE_DESCRIPTIONS[milestone]}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BadgeGridProps {
  /** Per-round badges earned this game */
  roundBadges?: Badge[];
  /** Milestones newly unlocked this session (highlighted) */
  newMilestones?: Milestone[];
  /** Full set of unlocked milestones (for landing + result) */
  unlockedMilestones?: Milestone[];
  /** Show all milestones including locked ones (default true) */
  showAll?: boolean;
}

export default function BadgeGrid({
  roundBadges,
  newMilestones = [],
  unlockedMilestones = [],
  showAll = true,
}: BadgeGridProps) {
  const unlockedSet = new Set(unlockedMilestones);
  const newSet = new Set(newMilestones);

  return (
    <div className="flex flex-col gap-6">

      {/* Per-round badges */}
      {roundBadges && roundBadges.length > 0 && (
        <div>
          <p className="label text-[#9A9A9A] mb-3">THIS ROUND</p>
          <div className="flex flex-wrap gap-2">
            {roundBadges.map((b) => (
              <RoundBadgeChip key={b} label={BADGE_LABELS[b]} />
            ))}
          </div>
        </div>
      )}

      {/* Milestone list — always show all, locked ones dimmed */}
      {showAll && (
        <div>
          <p className="label text-[#9A9A9A] mb-1">
            MILESTONES{" "}
            <span className="text-[#2A2A2A]">
              {unlockedSet.size}/{ALL_MILESTONES.length}
            </span>
          </p>
          <div className="flex flex-col">
            {ALL_MILESTONES.map((m) => (
              <MilestoneRow
                key={m}
                milestone={m}
                unlocked={unlockedSet.has(m)}
                isNew={newSet.has(m)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
