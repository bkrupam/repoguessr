"use client";

import { useRef } from "react";
import hljs from "highlight.js";

interface CodeBlockProps {
  lines: string[];
  revealedCount: number;
  language?: string;
}

export default function CodeBlock({ lines, revealedCount, language }: CodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function toHljsLang(lang?: string): string {
    const map: Record<string, string> = {
      JavaScript: "javascript",
      TypeScript: "typescript",
      Python: "python",
      Rust: "rust",
      Go: "go",
      Ruby: "ruby",
      Java: "java",
      "C++": "cpp",
      "C#": "csharp",
    };
    return map[lang ?? ""] ?? "plaintext";
  }

  const hljsLang = toHljsLang(language);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-lg overflow-hidden"
    >
      <div className="code-type px-2 py-4 sm:px-4 sm:py-6">
        {lines.map((line, i) => {
          const visible = i < revealedCount;
          let html = "";
          try {
            html = hljs.highlight(line || " ", { language: hljsLang, ignoreIllegals: true }).value;
          } catch {
            html = line || " ";
          }

          return (
            <div
              key={i}
              className={`flex group ${visible ? "" : "select-none pointer-events-none"}`}
              style={{
                filter: visible ? "none" : "blur(6px)",
                opacity: visible ? 1 : 0.35,
                transition: "filter 0.3s ease, opacity 0.3s ease",
              }}
            >
              <span
                className={`label shrink-0 w-12 sm:w-14 text-right pr-4 py-0.5 select-none ${
                  visible ? "text-[#9A9A9A]" : "text-[#2A2A2A]"
                }`}
              >
                {i + 1}
              </span>
              <span
                className="py-0.5 pr-2 sm:pr-4 flex-1 whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
