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
  /** Share image URL — copied to clipboard on share when supported. */
  imageUrl?: string;
  /** Fallback plain text if image copy fails. */
  overrideText?: string;
  label?: string;
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

async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  const res = await fetch(imageUrl);
  if (!res.ok) return false;
  const blob = await res.blob();
  const type = blob.type || "image/png";
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }
  await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
  return true;
}

export default function ShareCard(props: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMode, setCopiedMode] = useState<"image" | "text">("image");

  async function handleCopy() {
    const text = props.overrideText ?? buildShareText(props);

    if (props.imageUrl) {
      try {
        const ok = await copyImageToClipboard(props.imageUrl);
        if (ok) {
          setCopiedMode("image");
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          return;
        }
      } catch {
        /* fall through to text */
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedMode("text");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={handleCopy} className="w-full">
        {copied
          ? copiedMode === "image"
            ? "IMAGE COPIED"
            : "COPIED"
          : props.label ?? "SHARE"}
      </Button>

      {copied && (
        <div className="fixed top-6 right-6 z-[100] label text-white border border-white px-4 py-2 bg-black rounded-lg pointer-events-none">
          {copiedMode === "image" ? "IMAGE COPIED" : "COPIED"}
        </div>
      )}
    </>
  );
}
