"use client";

import { useEffect, useState } from "react";
import {
  Difficulty,
  DIFFICULTY_CONFIGS,
  loadDifficulty,
  saveDifficulty,
} from "@/lib/difficulty";

export default function PracticeOptions() {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  useEffect(() => {
    setDifficulty(loadDifficulty());
  }, []);

  function pickDifficulty(d: Difficulty) {
    setDifficulty(d);
    saveDifficulty(d);
  }

  return (
    <div className="w-full bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 text-left flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-[#9A9A9A] shrink-0">DIFFICULTY</p>
        <div
          className="flex items-center gap-4 sm:justify-end"
          role="radiogroup"
          aria-label="Difficulty"
        >
          {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((d, i) => (
            <span key={d} className="flex items-center gap-4">
              {i > 0 && (
                <span className="text-[#1a1a1a] select-none" aria-hidden>
                  /
                </span>
              )}
              <button
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => pickDifficulty(d)}
                className={`label transition-colors ${
                  difficulty === d
                    ? "text-white"
                    : "text-[#9A9A9A] hover:text-white"
                }`}
              >
                {DIFFICULTY_CONFIGS[d].label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
