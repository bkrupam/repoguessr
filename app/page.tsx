import Link from "next/link";
import AppNav from "@/components/AppNav";
import LandingMatrixRain from "@/components/LandingMatrixRain";
import { buttonClassName } from "@/lib/buttonStyles";

const STEPS = [
  {
    num: "01",
    title: "Reveal",
    description: "Lines drop in, one by one.",
  },
  {
    num: "02",
    title: "Guess",
    description: "Pick the language (and framework).",
  },
  {
    num: "03",
    title: "Score",
    description: "Fewer reveals = higher score.",
  },
] as const;

function LandingSectionHeader({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <header className="mb-16 flex flex-col items-center gap-4 text-center lg:mb-20 lg:gap-6">
      <p className="label text-[#9A9A9A]">{label}</p>
      <h2 className="h1-type text-white">{title}</h2>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-black text-white hub-enter">
      <AppNav />

      <main>
        {/* Hero */}
        <section className="landing-hero relative overflow-hidden border-b border-[#1a1a1a]">
          <LandingMatrixRain />
          <div className="landing-wrap landing-hero-content flex flex-col items-center py-12 text-center sm:py-16 lg:py-20">
            <p className="label mb-6 text-[#9A9A9A] lg:mb-8">THE LANGUAGE GUESSING GAME</p>
            <h1 className="display-type mb-8 max-w-4xl text-white lg:mb-12">
              Can you read
              <br />
              the code?
            </h1>
            <p className="body-type mb-12 max-w-2xl text-[#9A9A9A] lg:mb-16">
              Reveal real GitHub snippets line by line. Guess the programming language — and score
              points for guessing with fewer clues.
            </p>

            <div className="flex w-full max-w-xl flex-col items-center gap-6">
              <Link
                href="/daily"
                className={buttonClassName("primary", "lg", "w-full")}
              >
                PLAY TODAY&apos;S PUZZLE
              </Link>
              <Link
                href="/archive"
                className="label text-[#9A9A9A] transition-colors hover:text-white"
              >
                BROWSE ARCHIVE →
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="landing-section border-t border-[#1a1a1a]">
          <div className="landing-wrap">
            <LandingSectionHeader label="HOW IT PLAYS" title="Three steps to score" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {STEPS.map((step) => (
                <article
                  key={step.num}
                  className="flex flex-col gap-5 rounded-lg border border-[#1a1a1a] bg-[#050505] p-8 lg:gap-6 lg:p-10"
                >
                  <p className="label text-[#9A9A9A]">{step.num}</p>
                  <h3 className="sheet-title text-white">{step.title}</h3>
                  <p className="body-type text-[#9A9A9A]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Game modes */}
        <section className="landing-section border-t border-[#1a1a1a]">
          <div className="landing-wrap">
            <LandingSectionHeader label="GAME MODES" title="Play your way" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <article className="flex flex-col gap-6 rounded-lg border border-[#1a1a1a] bg-[#050505] p-8 lg:gap-8 lg:p-10">
                <h3 className="sheet-title text-white">Daily Challenge</h3>
                <p className="body-type flex-1 text-[#9A9A9A]">
                  One new puzzle every day. Track your streak.
                </p>
                <Link
                  href="/daily"
                  className={buttonClassName("primary", "lg", "w-full")}
                >
                  PLAY TODAY →
                </Link>
              </article>
              <article className="flex flex-col gap-6 rounded-lg border border-[#1a1a1a] bg-[#050505] p-8 lg:gap-8 lg:p-10">
                <h3 className="sheet-title text-white">Practice</h3>
                <p className="body-type flex-1 text-[#9A9A9A]">
                  No limits. Filter by language. Sharpen your eye.
                </p>
                <Link
                  href="/practice"
                  className={buttonClassName("ghost", "lg", "w-full")}
                >
                  START PRACTICE →
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
