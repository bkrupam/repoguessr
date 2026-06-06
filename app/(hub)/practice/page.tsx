"use client";

import Link from "next/link";
import Button from "@/components/Button";
import HubPageShell from "@/components/HubPageShell";
import HubVisual from "@/components/HubVisual";
import PracticeOptions from "@/components/PracticeOptions";

export default function PracticePage() {
  return (
    <HubPageShell>
      <HubVisual variant="practice" />

      <header className="flex flex-col items-center gap-3 w-full mb-8">
        <p className="label text-[#9A9A9A]">NO LIMITS</p>
        <h1 className="h1-type text-white">Practice</h1>
        <p className="body-type text-[#9A9A9A] max-w-sm text-center">
          Random snippets anytime. Same reveals and guesses as daily — nothing
          counts toward your streak.
        </p>
      </header>

      <div className="w-full mb-8">
        <PracticeOptions />
      </div>

      <Link href="/game" className="w-full">
        <Button variant="primary" size="lg" className="w-full">
          START PRACTICE ROUND
        </Button>
      </Link>
    </HubPageShell>
  );
}
