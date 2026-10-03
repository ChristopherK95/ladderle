import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DAILY_PAR, DIFFICULTY_PAR, generatePuzzle, sharesPosition, type Difficulty } from "./generator.ts";
import { parseWordList, WordGraph } from "./ladder.ts";
import { seededRng } from "./rng.ts";

const valid = parseWordList(readFileSync("src/data/valid-words.txt", "utf8"));
const common = parseWordList(readFileSync("src/data/common-words.txt", "utf8"));
const commonSet = new Set(common);
const graph = new WordGraph(valid);

describe("generatePuzzle", () => {
  it.each(Object.keys(DIFFICULTY_PAR) as Difficulty[])("generates %s puzzles within the par range", (difficulty) => {
    const range = DIFFICULTY_PAR[difficulty];
    const rng = seededRng(42);
    for (let i = 0; i < 5; i++) {
      const puzzle = generatePuzzle(graph, common, range, rng)!;
      expect(puzzle).not.toBeNull();
      const par = graph.par(puzzle.origin, puzzle.target)!;
      expect(par).toBeGreaterThanOrEqual(range.min);
      expect(par).toBeLessThanOrEqual(range.max);
      expect(sharesPosition(puzzle.origin, puzzle.target)).toBe(false);
      // A par-length ladder exists through common words only.
      expect(graph.shortestPath(puzzle.origin, puzzle.target, commonSet)).toHaveLength(par + 1);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = generatePuzzle(graph, common, DAILY_PAR, seededRng(7));
    const b = generatePuzzle(graph, common, DAILY_PAR, seededRng(7));
    expect(a).toEqual(b);
  });

  it("respects excluded targets", () => {
    const first = generatePuzzle(graph, common, DAILY_PAR, seededRng(7))!;
    const second = generatePuzzle(graph, common, DAILY_PAR, seededRng(7), new Set([first.target]))!;
    expect(second.target).not.toBe(first.target);
  });
});
