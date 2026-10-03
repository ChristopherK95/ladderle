import type { Puzzle } from "./generator.ts";
import { validateStep, type StepError } from "./ladder.ts";

export type GameStatus = "playing" | "won" | "gave-up";

export interface GameState extends Puzzle {
  /** Accepted words after the origin, in order. Revisiting words is allowed. */
  steps: string[];
  status: GameStatus;
}

export function newGame(puzzle: Puzzle): GameState {
  return { origin: puzzle.origin, target: puzzle.target, steps: [], status: "playing" };
}

export function currentWord(game: GameState): string {
  return game.steps.at(-1) ?? game.origin;
}

export type SubmitResult = { ok: true; game: GameState } | { ok: false; error: StepError };

export function submitStep(game: GameState, word: string, valid: ReadonlySet<string>): SubmitResult {
  const error = validateStep(currentWord(game), word, valid);
  if (error) return { ok: false, error };
  const steps = [...game.steps, word];
  return { ok: true, game: { ...game, steps, status: word === game.target ? "won" : "playing" } };
}

export function giveUp(game: GameState): GameState {
  return { ...game, status: "gave-up" };
}
