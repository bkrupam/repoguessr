"use client";

import {
  Difficulty,
  DIFFICULTY_CONFIGS,
  loadDifficulty,
  saveDifficulty,
} from "@/lib/difficulty";
import { useEffect, useState } from "react";

interface DifficultyPickerProps {
  onChange?: (d: Difficulty) => void;
}

export default function DifficultyPicker({ onChange }: DifficultyPickerProps) {
  const [selected, setSelected] = useState<Difficulty>("normal");

  useEffect(() => {
    const d = loadDifficulty();
    setSelected(d);
    onChange?.(d);
  }, [onChange]);

  function pick(d: Difficulty) {
    setSelected(d);
    saveDifficulty(d);
    onChange?.(d);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center w-full">
      {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => pick(d)}
          className={`label px-4 py-2.5 rounded-lg border transition-colors ${
            selected === d
              ? "text-white border-white"
              : "text-[#9A9A9A] border-[#9A9A9A] hover:text-white hover:border-white"
          }`}
        >
          {DIFFICULTY_CONFIGS[d].label}
        </button>
      ))}
    </div>
  );
}
