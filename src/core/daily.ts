import type { Puzzle } from "./generator.ts";

/** Puzzle #1 is played on this (local) date. */
export const LAUNCH_DATE = "2026-10-03";

const DAY_MS = 86_400_000;

/** 1-based puzzle number for the given moment, using the player's local calendar date. */
export function dayNumber(now: Date, launch = LAUNCH_DATE): number {
  const [y, m, d] = launch.split("-").map(Number);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - Date.UTC(y, m - 1, d)) / DAY_MS) + 1;
}

/** Encoded as "origin-target" to keep the bundled list compact. */
export function decodePuzzle(entry: string): Puzzle {
  const [origin, target] = entry.split("-");
  return { origin, target };
}

export function dailyPuzzle(list: readonly string[], day: number): Puzzle {
  if (day > list.length) console.warn(`Ladderle: daily list exhausted, reusing puzzles (day ${day})`);
  const index = (((day - 1) % list.length) + list.length) % list.length;
  return decodePuzzle(list[index]);
}
