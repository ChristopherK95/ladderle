import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dailyPuzzle, dayNumber, decodePuzzle } from "./daily.ts";
import { DAILY_PAR } from "./generator.ts";
import { parseWordList, WordGraph } from "./ladder.ts";

describe("dayNumber", () => {
  it("is 1 on the launch date and counts local calendar days", () => {
    expect(dayNumber(new Date(2026, 9, 3, 0, 0), "2026-10-03")).toBe(1);
    expect(dayNumber(new Date(2026, 9, 3, 23, 59), "2026-10-03")).toBe(1);
    expect(dayNumber(new Date(2026, 9, 4, 0, 1), "2026-10-03")).toBe(2);
    expect(dayNumber(new Date(2027, 9, 3, 12, 0), "2026-10-03")).toBe(366);
  });

  it("is unaffected by DST transitions", () => {
    expect(dayNumber(new Date(2027, 2, 29, 0, 30), "2027-03-27")).toBe(3);
    expect(dayNumber(new Date(2027, 10, 1, 0, 30), "2027-10-30")).toBe(3);
  });
});

describe("dailyPuzzle", () => {
  const list = ["aaaaa-bbbbb", "ccccc-ddddd"];

  it("picks by day number and cycles when exhausted", () => {
    expect(dailyPuzzle(list, 1)).toEqual({ origin: "aaaaa", target: "bbbbb" });
    expect(dailyPuzzle(list, 2).origin).toBe("ccccc");
    expect(dailyPuzzle(list, 3).origin).toBe("aaaaa");
  });
});

describe("bundled daily list", () => {
  const daily: string[] = JSON.parse(readFileSync("src/data/daily.json", "utf8"));
  const common = new Set(parseWordList(readFileSync("src/data/common-words.txt", "utf8")));
  const graph = new WordGraph(parseWordList(readFileSync("src/data/valid-words.txt", "utf8")));

  it("covers about three years", () => {
    expect(daily.length).toBeGreaterThanOrEqual(365 * 3);
  });

  it("only contains solvable common-word puzzles within daily par", () => {
    for (const entry of daily.slice(0, 50)) {
      const { origin, target } = decodePuzzle(entry);
      expect(common.has(origin) && common.has(target)).toBe(true);
      const par = graph.par(origin, target)!;
      expect(par).toBeGreaterThanOrEqual(DAILY_PAR.min);
      expect(par).toBeLessThanOrEqual(DAILY_PAR.max);
    }
  });
});
