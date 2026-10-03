// Generates src/data/daily.json: a dated list of daily puzzles, starting at LAUNCH_DATE.
//
// Usage: node scripts/generate-daily.ts [days] [seed]
import { readFileSync, writeFileSync } from "node:fs";
import { DAILY_PAR, generatePuzzle } from "../src/core/generator.ts";
import { parseWordList, WordGraph } from "../src/core/ladder.ts";
import { seededRng } from "../src/core/rng.ts";

const days = Number(process.argv[2] ?? 1096);
const seed = Number(process.argv[3] ?? 20261003);

const valid = parseWordList(readFileSync("src/data/valid-words.txt", "utf8"));
const common = parseWordList(readFileSync("src/data/common-words.txt", "utf8"));
const graph = new WordGraph(valid);
const rng = seededRng(seed);

// A target is not reused within this many days (the pool of qualifying targets is ~1100).
const TARGET_COOLDOWN = 365;

const targets: string[] = [];
const puzzles: string[] = [];
while (puzzles.length < days) {
  const recent = new Set(targets.slice(-TARGET_COOLDOWN));
  const puzzle = generatePuzzle(graph, common, DAILY_PAR, rng, recent);
  if (!puzzle) throw new Error(`Could not generate puzzle ${puzzles.length + 1}`);
  targets.push(puzzle.target);
  puzzles.push(`${puzzle.origin}-${puzzle.target}`);
}

writeFileSync("src/data/daily.json", JSON.stringify(puzzles, null, 0) + "\n");
console.log(`Wrote ${puzzles.length} daily puzzles`);
