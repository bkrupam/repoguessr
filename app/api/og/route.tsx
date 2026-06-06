import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MONO = "JetBrains Mono";
const SANS = "Inter";
const FG = "#FFFFFF";
const MUTED = "#B3B3B3";
const SURFACE = "#050505";
const BORDER = "#333333";

async function loadFonts() {
  const root = process.cwd();
  const [interLight, interRegular, jetbrains] = await Promise.all([
    readFile(
      join(root, "node_modules/@fontsource/inter/files/inter-latin-300-normal.woff")
    ),
    readFile(
      join(root, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")
    ),
    readFile(join(root, "public/fonts/JetBrainsMono-Regular.ttf")),
  ]);
  return { interLight, interRegular, jetbrains };
}

function formatTime(seconds: number): string {
  const s = Math.max(1, seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${String(rem).padStart(2, "0")}s`;
}

function Label({ children, color = MUTED }: { children: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: MONO,
        fontSize: 15,
        letterSpacing: "0.1em",
        color,
      }}
    >
      {children}
    </div>
  );
}

function StatCell({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        minWidth: 120,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 44,
          fontWeight: 300,
          letterSpacing: "-0.03em",
          color: FG,
          fontFamily: SANS,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <Label>{label}</Label>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const guess = searchParams.get("guess") ?? "—";
  const actual = searchParams.get("actual") ?? guess;
  const correct = searchParams.get("correct") === "1";
  const lines = searchParams.get("lines") ?? "0";
  const timeSec = parseInt(searchParams.get("time") ?? "0", 10) || 0;
  const puzzle = searchParams.get("puzzle");
  const score = searchParams.get("score");
  const streak = searchParams.get("streak");
  const badgesRaw = searchParams.get("badges") ?? "";
  const rank = searchParams.get("rank") ?? "";

  const badges = badgesRaw ? badgesRaw.split("|").filter(Boolean).slice(0, 4) : [];

  const guessUp = guess.toUpperCase();
  const actualUp = actual.toUpperCase();
  const timeLabel = formatTime(timeSec);
  const puzzleLabel = puzzle ? `PUZZLE #${puzzle}` : "PRACTICE";
  const heroLang = correct ? guessUp : actualUp;

  let fonts: Awaited<ReturnType<typeof loadFonts>>;
  try {
    fonts = await loadFonts();
  } catch (err) {
    console.error("[api/og] font load", err);
    return new Response("Failed to load fonts", { status: 500 });
  }

  const accentBar = correct ? FG : MUTED;

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
            fontFamily: SANS,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 6,
              height: "100%",
              backgroundColor: accentBar,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "100%",
              padding: "44px 56px 40px 48px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 28,
              }}
            >
              <Label color={FG}>REPOGUESSR</Label>
              <Label>{puzzleLabel}</Label>
            </div>

            {/* Main surface */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: SURFACE,
                border: `1px solid ${BORDER}`,
                padding: "36px 40px",
                gap: 24,
              }}
            >
              <Label>{correct ? "GUESSED" : "MISSED"}</Label>

              <div
                style={{
                  display: "flex",
                  fontSize: 88,
                  fontWeight: 300,
                  letterSpacing: "-0.04em",
                  color: FG,
                  lineHeight: 1,
                  fontFamily: SANS,
                }}
              >
                {heroLang}
              </div>

              {!correct && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Label>YOUR GUESS</Label>
                  <div
                    style={{
                      display: "flex",
                      fontFamily: MONO,
                      fontSize: 22,
                      letterSpacing: "0.06em",
                      color: MUTED,
                    }}
                  >
                    {guessUp}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 1,
                  backgroundColor: BORDER,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 56,
                  }}
                >
                  <StatCell value={lines} label="LINES" />
                  <StatCell value={timeLabel} label="TIME" />
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: MONO,
                    fontSize: 15,
                    letterSpacing: "0.1em",
                    color: correct ? "#000000" : FG,
                    backgroundColor: correct ? FG : "transparent",
                    border: correct ? "none" : `1px solid ${FG}`,
                    padding: "14px 22px",
                  }}
                >
                  {correct ? "CORRECT" : "WRONG"}
                </div>
              </div>
            </div>

            {/* Badges + rank */}
            {(badges.length > 0 || rank) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: "100%",
                  marginTop: 20,
                }}
              >
                {badges.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {badges.map((b) => (
                      <div
                        key={b}
                        style={{
                          display: "flex",
                          fontFamily: MONO,
                          fontSize: 13,
                          letterSpacing: "0.1em",
                          color: FG,
                          border: `1px solid ${BORDER}`,
                          backgroundColor: SURFACE,
                          padding: "10px 16px",
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                )}

                {rank ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Label>RANK</Label>
                    <div
                      style={{
                        display: "flex",
                        fontFamily: MONO,
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        color: "#000000",
                        backgroundColor: FG,
                        padding: "10px 16px",
                      }}
                    >
                      {rank}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 20,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 36,
                }}
              >
                {score != null && score !== "" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 32,
                        fontWeight: 300,
                        color: FG,
                        fontFamily: SANS,
                        lineHeight: 1,
                      }}
                    >
                      {score}
                    </div>
                    <Label>POINTS</Label>
                  </div>
                ) : null}

                {streak ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 32,
                        fontWeight: 300,
                        color: FG,
                        fontFamily: SANS,
                        lineHeight: 1,
                      }}
                    >
                      {streak}
                    </div>
                    <Label>DAY STREAK</Label>
                  </div>
                ) : null}
              </div>

              <Label>repoguessr.app</Label>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fonts.interLight,
            weight: 300,
            style: "normal",
          },
          {
            name: "Inter",
            data: fonts.interRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "JetBrains Mono",
            data: fonts.jetbrains,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );
  } catch (err) {
    console.error("[api/og]", err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
