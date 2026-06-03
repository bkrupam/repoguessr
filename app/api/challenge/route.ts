import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { ChallengePayload } from "@/lib/challenge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHALLENGE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const KEY_PREFIX = "challenge:";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isValidPayload(body: unknown): body is ChallengePayload {
  const data = body as ChallengePayload;
  return Boolean(data?.snippet?.lines?.length);
}

export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Challenge storage is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid challenge payload" }, { status: 400 });
    }

    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const key = `${KEY_PREFIX}${id}`;
    await redis.set(key, body, { ex: CHALLENGE_TTL_SECONDS });

    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Challenge storage is not configured" },
      { status: 503 }
    );
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9]{8,32}$/.test(id)) {
    return NextResponse.json({ error: "Invalid challenge id" }, { status: 400 });
  }

  try {
    const key = `${KEY_PREFIX}${id}`;
    const data = await redis.get<ChallengePayload>(key);
    if (!data || !isValidPayload(data)) {
      return NextResponse.json({ error: "Challenge not found or expired" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
