"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HubPageShell from "@/components/HubPageShell";
import Button from "@/components/Button";
import {
  listPastPuzzles,
  loadArchive,
  puzzleNumber,
} from "@/lib/archive";
import { dailyPoolSize } from "@/lib/daily-pool";

export default function ArchivePage() {
  const [items, setItems] = useState<
    { puzzle: number; poolIndex: number; dateLabel: string }[]
  >([]);
  const [archive, setArchive] = useState<ReturnType<typeof loadArchive>>({});
  const today = puzzleNumber();

  useEffect(() => {
    const poolSize = dailyPoolSize();
    setItems(listPastPuzzles(poolSize));
    setArchive(loadArchive());
  }, []);

  return (
    <HubPageShell wide>
      <div className="w-full text-left">
        <header className="flex flex-col gap-3 pb-10">
          <p className="label text-[#9A9A9A]">HISTORY</p>
          <h1 className="h1-type text-white">Archive</h1>
          <p className="body-type text-[#9A9A9A] max-w-md">
            Replay past daily puzzles. Today is puzzle #{today}.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {items.map(({ puzzle, dateLabel }) => {
            const entry = archive[String(puzzle)];
            const played = !!entry;

            return (
              <li
                key={puzzle}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-lg border border-[#1a1a1a] bg-[#050505]"
              >
                <div className="flex flex-col gap-2">
                  <p className="label text-[#9A9A9A]">
                    PUZZLE #{puzzle} · {dateLabel}
                  </p>
                  {played ? (
                    <p className="stat-type text-white tabular-nums">
                      {entry.score}
                      <span className="label text-[#9A9A9A] ml-2">PTS</span>
                    </p>
                  ) : (
                    <p className="body-type text-[#9A9A9A]">Not played</p>
                  )}
                </div>
                {!played && puzzle < today && (
                  <Link href={`/game?mode=daily&puzzle=${puzzle}`} className="shrink-0">
                    <Button variant="ghost">PLAY</Button>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </HubPageShell>
  );
}
