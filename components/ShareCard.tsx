"use client";

import { useState } from "react";
import Button from "./Button";
import { Badge, BADGE_LABELS } from "@/lib/badges";

interface ShareCardProps {
  linesRevealed: number;
  language: string;
  languageCorrect: boolean;
  framework: string | null;
  frameworkGuess: string;
  frameworkCorrect: boolean;
  badges: Badge[];
  /** If provided, this exact text is copied instead of the practice card. */
  overrideText?: string;
  label?: string; // button label, defaults to SHARE
}

function buildShareText(props: ShareCardProps): string {
  const {
    linesRevealed,
    language,
    languageCorrect,
    framework,
    frameworkGuess,
    frameworkCorrect,
    badges,
  } = props;

  const langLine = `LANG  ${language.toUpperCase()}  ${languageCorrect ? "✓" : "✗"}`;
  const fwActual = framework ?? "NONE";
  const fwGuessDisplay = frameworkGuess || "—";
  const fwLine =
    framework !== null || frameworkGuess
      ? `FW    ${fwActual.toUpperCase()}  ${frameworkCorrect ? "✓" : "✗"}  (GUESSED: ${fwGuessDisplay.toUpperCase()})`
      : null;

  const badgeLine =
    badges.length > 0
      ? badges.map((b) => `🏅 ${BADGE_LABELS[b]}`).join("  ")
      : "NO BADGES THIS ROUND";

  return [
    "REPOGUESSR",
    "──────────",
    `GUESSED IN ${linesRevealed} LINES`,
    langLine,
    fwLine,
    badgeLine,
    "",
    "repoguessr.vercel.app",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export default function ShareCard(props: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = props.overrideText ?? buildShareText(props);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available (http, old browser)
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={handleCopy} className="w-full">
        {copied ? "COPIED" : props.label ?? "SHARE"}
      </Button>

      {/* Toast */}
      {copied && (
        <div className="fixed top-6 right-6 z-[100] label text-white border border-white px-4 py-2 bg-black rounded-lg pointer-events-none">
          COPIED
        </div>
      )}
    </>
  );
}
