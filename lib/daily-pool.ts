import { Snippet } from "./github";
import basePool from "@/data/daily-snippets.json";
import { extraDailySnippets } from "./daily-pool-extra";

/** Full curated daily pool (base JSON + extra entries). */
export function getDailyPool(): Snippet[] {
  return [...(basePool as Snippet[]), ...extraDailySnippets];
}

export function dailyPoolSize(): number {
  return getDailyPool().length;
}
