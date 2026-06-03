import { NextRequest, NextResponse } from "next/server";
import { dailyPoolIndex, puzzleNumber, EPOCH_UTC, DAY_MS } from "@/lib/daily";
import { getDailyPool } from "@/lib/daily-pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const snippets = getDailyPool();
  if (!snippets || snippets.length === 0) {
    return NextResponse.json({ error: "Daily pool is empty" }, { status: 500 });
  }

  const puzzleParam = request.nextUrl.searchParams.get("puzzle");
  let puzzle = puzzleNumber();
  if (puzzleParam) {
    const n = parseInt(puzzleParam, 10);
    if (!Number.isNaN(n) && n >= 1) puzzle = n;
  }

  const dayOffset = puzzle - 1;
  const d = new Date(EPOCH_UTC + dayOffset * DAY_MS);
  const index = dailyPoolIndex(snippets.length, d);
  const snippet = snippets[index];

  return NextResponse.json({
    ...snippet,
    puzzle,
  });
}
