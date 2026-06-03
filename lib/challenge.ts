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
