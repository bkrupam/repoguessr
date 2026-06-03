"use client";

export const PRACTICE_LANG_FILTERS = [
  { id: "", label: "ALL" },
  { id: "Python", label: "PYTHON" },
  { id: "JavaScript", label: "JS" },
  { id: "TypeScript", label: "TS" },
  { id: "Rust", label: "RUST" },
  { id: "Go", label: "GO" },
  { id: "Ruby", label: "RUBY" },
  { id: "Java", label: "JAVA" },
] as const;

interface LanguageChipsProps {
  value: string;
  onChange: (lang: string) => void;
}

export default function LanguageChips({ value, onChange }: LanguageChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center w-full">
      {PRACTICE_LANG_FILTERS.map(({ id, label }) => (
        <button
          key={id || "all"}
          type="button"
          onClick={() => onChange(id)}
          className={`label px-3 py-2 rounded-lg border transition-colors ${
            value === id
              ? "text-white border-white"
              : "text-[#9A9A9A] border-[#9A9A9A] hover:text-white hover:border-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
