import type { WordGraph } from "./ladder.ts";
import { pick, type Rng } from "./rng.ts";

export interface Puzzle {
  origin: string;
  target: string;
}

export interface ParRange {
  min: number;
  max: number;
}

export type Difficulty = "easy" | "medium" | "hard";

// Origin and target never share a letter position, so every letter must change: par is at least 5.
export const DIFFICULTY_PAR: Record<Difficulty, ParRange> = {
  easy: { min: 5, max: 5 },
  medium: { min: 6, max: 6 },
  hard: { min: 7, max: 8 },
};

export const DAILY_PAR: ParRange = { min: 5, max: 6 };

export function sharesPosition(a: string, b: string): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) return true;
  return false;
}

/**
 * Picks a random common origin and a common target whose par is within `range`,
 * such that no letter position starts out matching and at least one par-length
 * ladder uses only common words.
 */
export function generatePuzzle(
  graph: WordGraph,
  common: readonly string[],
  range: ParRange,
  rng: Rng,
  exclude: ReadonlySet<string> = new Set(),
  maxAttempts = 200,
): Puzzle | null {
  const commonSet = new Set(common);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const origin = pick(common, rng);
    const all = graph.distances(origin);
    const viaCommon = graph.distances(origin, commonSet);
    const candidates = common.filter((target) => {
      const par = all.get(target);
      return (
        par !== undefined &&
        par >= range.min &&
        par <= range.max &&
        viaCommon.get(target) === par &&
        !sharesPosition(origin, target) &&
        !exclude.has(target)
      );
    });
    if (candidates.length > 0) return { origin, target: pick(candidates, rng) };
  }
  return null;
}
