import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo || !repo.includes("/")) {
    return NextResponse.json({ error: "Invalid repo" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ stars: null, language: null });
  }

  const [owner, name] = repo.split("/");
  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.get({ owner, repo: name });
    return NextResponse.json({
      stars: data.stargazers_count,
      language: data.language,
      description: data.description ?? "",
    });
  } catch {
    return NextResponse.json({ stars: null, language: null });
  }
}
