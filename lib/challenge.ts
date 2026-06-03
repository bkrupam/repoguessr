import { Snippet } from "./github";

export interface ChallengePayload {
  snippet: Snippet;
  challengerScore?: number;
  challengerName?: string;
}

export function encodeChallenge(payload: ChallengePayload): string {
  const json = JSON.stringify(payload);
  if (typeof btoa !== "undefined") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeChallenge(encoded: string): ChallengePayload | null {
  try {
    let json: string;
    if (typeof atob !== "undefined") {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, "base64url").toString("utf-8");
    }
    const data = JSON.parse(json) as ChallengePayload;
    if (!data?.snippet?.lines?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createChallenge(
  payload: ChallengePayload
): Promise<{ id: string } | { error: string }> {
  const res = await fetch("/api/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error:
        typeof data.error === "string"
          ? data.error
          : "Could not create challenge link",
    };
  }
  if (typeof data.id !== "string") {
    return { error: "Could not create challenge link" };
  }
  return { id: data.id };
}

export async function fetchChallenge(
  id: string
): Promise<ChallengePayload | null> {
  const res = await fetch(
    `/api/challenge?id=${encodeURIComponent(id)}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as ChallengePayload;
  if (!data?.snippet?.lines?.length) return null;
  return data;
}
