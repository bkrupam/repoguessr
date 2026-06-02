import Link from "next/link";
import Button from "@/components/Button";
import HubPageShell from "@/components/HubPageShell";
import HubVisual from "@/components/HubVisual";

export default function PracticePage() {
  return (
    <HubPageShell>
      <HubVisual variant="practice" />

      <header className="flex flex-col items-center gap-3 w-full mb-10">
        <p className="label text-[#9A9A9A]">NO LIMITS</p>
        <h1 className="h1-type text-white">Practice</h1>
        <p className="body-type text-[#9A9A9A] max-w-sm">
          Random snippets anytime. Same reveals and guesses as daily — nothing counts toward your streak.
        </p>
      </header>

      <Link href="/game" className="w-full">
        <Button variant="primary" size="lg" className="w-full">
          START PRACTICE ROUND
        </Button>
      </Link>
    </HubPageShell>
  );
}
