export type Difficulty = "easy" | "normal" | "hard";

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  initialLines: number;
  revealStep: number;
  languages: string[] | "all";
  showFramework: boolean;
  requireFramework: boolean;
  freeTextLanguage: boolean;
  scoreMultiplier: number;
}

export const EASY_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
];

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "EASY",
    initialLines: 12,
    revealStep: 5,
    languages: EASY_LANGUAGES,
    showFramework: false,
    requireFramework: false,
    freeTextLanguage: false,
    scoreMultiplier: 0.85,
  },
  normal: {
    id: "normal",
    label: "NORMAL",
    initialLines: 8,
    revealStep: 5,
    languages: "all",
    showFramework: true,
    requireFramework: false,
    freeTextLanguage: false,
    scoreMultiplier: 1,
  },
  hard: {
    id: "hard",
    label: "HARD",
    initialLines: 5,
    revealStep: 5,
    languages: "all",
    showFramework: true,
    requireFramework: true,
    freeTextLanguage: true,
    scoreMultiplier: 1.25,
  },
};

const STORAGE_KEY = "repoguessr_difficulty";

export function loadDifficulty(): Difficulty {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "easy" || raw === "hard" || raw === "normal") return raw;
  } catch {}
  return "normal";
}

export function saveDifficulty(d: Difficulty): void {
  try {
    localStorage.setItem(STORAGE_KEY, d);
  } catch {}
}

export function getDifficultyConfig(d: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIGS[d];
}
