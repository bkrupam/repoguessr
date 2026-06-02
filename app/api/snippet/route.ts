import { NextResponse } from "next/server";
import { fetchRandomSnippet } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snippet = await fetchRandomSnippet();
    return NextResponse.json(snippet);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
