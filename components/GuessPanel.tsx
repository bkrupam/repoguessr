"use client";

import { useState, FormEvent, useEffect } from "react";
import Button from "./Button";
import Select from "./Select";
import { FRAMEWORK_LABELS } from "@/lib/frameworks";

export const ALL_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Ruby",
  "Java",
  "C++",
  "C#",
];

export interface Guesses {
  language: string;
  framework: string;
}

interface GuessPanelProps {
  visible: boolean;
  showFramework: boolean;
  requireFramework?: boolean;
  languages?: string[];
  freeTextLanguage?: boolean;
  onSubmit: (guesses: Guesses) => void;
  onDismiss: () => void;
}

export default function GuessPanel({
  visible,
  showFramework,
  requireFramework = false,
  languages = ALL_LANGUAGES,
  freeTextLanguage = false,
  onSubmit,
  onDismiss,
}: GuessPanelProps) {
  const [language, setLanguage] = useState("");
  const [framework, setFramework] = useState("");

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onDismiss]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!language.trim()) return;
    if (requireFramework && !framework.trim()) return;
    onSubmit({ language: language.trim(), framework });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/80 transition-opacity duration-300 ${
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onDismiss}
        aria-hidden={!visible}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guess-panel-title"
        className={`fixed inset-x-0 bottom-0 z-50 flex justify-center transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div
          className="w-full max-w-3xl bg-[#050505] border border-[#1a1a1a] border-b-0 rounded-t-lg shadow-[0_-24px_48px_rgba(0,0,0,0.6)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-16 h-px bg-[#9A9A9A]" aria-hidden />
          </div>

          <div className="px-6 pb-10 pt-2 max-h-[min(85vh,640px)] overflow-y-auto overflow-x-hidden">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="flex flex-col gap-2">
                <p id="guess-panel-title" className="sheet-title text-white uppercase">
                  YOUR GUESS
                </p>
                <p className="body-type text-[#9A9A9A]">
                  Pick the language{showFramework ? " and framework" : ""} for this snippet.
                </p>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="label text-[#9A9A9A] hover:text-white transition-colors shrink-0 px-2 py-2"
                aria-label="Close"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="label text-[#9A9A9A]">LANGUAGE</label>
                {freeTextLanguage ? (
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    autoComplete="off"
                    placeholder="Type language name"
                    className="body-type w-full bg-transparent border border-[#9A9A9A] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-white transition-colors placeholder:text-[#9A9A9A]"
                  />
                ) : (
                  <Select
                    value={language}
                    onChange={setLanguage}
                    options={languages}
                    placeholder="Select language"
                  />
                )}
              </div>

              {showFramework && (
                <div className="flex flex-col gap-3">
                  <label className="label text-[#9A9A9A]">FRAMEWORK</label>
                  <input
                    type="text"
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    list="frameworks-list"
                    autoComplete="off"
                    placeholder="e.g. React, Django…"
                    className="body-type w-full bg-transparent border border-[#9A9A9A] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-white transition-colors placeholder:text-[#9A9A9A]"
                  />
                  <datalist id="frameworks-list">
                    {FRAMEWORK_LABELS.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={
                  !language.trim() ||
                  (requireFramework && !framework.trim())
                }
                className="w-full"
              >
                SUBMIT GUESS
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
