import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = searchParams.get("score") ?? "0";
  const puzzle = searchParams.get("puzzle");
  const reveals = searchParams.get("reveals") ?? "0";
  const badges = searchParams.get("badges") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9A9A9A",
            fontFamily: "monospace",
          }}
        >
          REPOGUESSR{puzzle ? ` · PUZZLE #${puzzle}` : ""}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 96, fontWeight: 300, letterSpacing: "-0.04em" }}>
            {score}
          </div>
          <div style={{ fontSize: 20, color: "#9A9A9A" }}>POINTS</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#9A9A9A",
            fontFamily: "monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span>{reveals} LINES REVEALED</span>
          {badges ? <span>{badges}</span> : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
