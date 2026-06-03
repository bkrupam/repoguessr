"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/Button";
import HubPageShell from "@/components/HubPageShell";
import HubVisual from "@/components/HubVisual";
import DifficultyPicker from "@/components/DifficultyPicker";
import LanguageChips from "@/components/LanguageChips";

export default function PracticePage() {
  const [lang, setLang] = useState("");

  const gameHref = lang ? `/game?lang=${encodeURIComponent(lang)}` : "/game";

  return (
    <HubPageShell>
      <HubVisual variant="practice" />

      <header className="flex flex-col items-center gap-3 w-full mb-8">
        <p className="label text-[#9A9A9A]">NO LIMITS</p>
        <h1 className="h1-type text-white">Practice</h1>
        <p className="body-type text-[#9A9A9A] max-w-sm text-center">
          Random snippets anytime. Pick difficulty and language focus.
        </p>
      </header>

      <div className="w-full flex flex-col items-center gap-8 mb-8">
        <div className="w-full flex flex-col gap-3">
          <p className="label text-[#9A9A9A] text-center">DIFFICULTY</p>
          <DifficultyPicker />
        </div>

        <div className="w-full flex flex-col gap-3">
          <p className="label text-[#9A9A9A] text-center">LANGUAGE</p>
          <LanguageChips value={lang} onChange={setLang} />
        </div>
      </div>

      <Link href={gameHref} className="w-full">
        <Button variant="primary" size="lg" className="w-full">
          START PRACTICE ROUND
        </Button>
      </Link>
    </HubPageShell>
  );
}
