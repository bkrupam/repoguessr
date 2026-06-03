import { NextRequest, NextResponse } from "next/server";
import { fetchRandomSnippet } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const lang = request.nextUrl.searchParams.get("lang") ?? undefined;
    const snippet = await fetchRandomSnippet(lang);
    return NextResponse.json(snippet);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
