"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#9A9A9A" }}>
          RepoGuessr failed to load.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "12px 20px",
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
