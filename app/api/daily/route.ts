import { NextResponse } from "next/server";
import pool from "@/data/daily-snippets.json";
import { Snippet } from "@/lib/github";
import { dailyPoolIndex, puzzleNumber } from "@/lib/daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snippets = pool as Snippet[];
  if (!snippets || snippets.length === 0) {
    return NextResponse.json({ error: "Daily pool is empty" }, { status: 500 });
  }

  const index = dailyPoolIndex(snippets.length);
  const snippet = snippets[index];

  return NextResponse.json({
    ...snippet,
    puzzle: puzzleNumber(),
  });
}
