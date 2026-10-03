import { describe, expect, it } from "vitest";
import { changedIndex, diffCount, validateStep, WordGraph } from "./ladder.ts";

const words = ["cold", "cord", "card", "ward", "warm", "word", "worm", "wild"];
const valid = new Set(words);

describe("diffCount / changedIndex", () => {
  it("counts differing positions", () => {
    expect(diffCount("cold", "cold")).toBe(0);
    expect(diffCount("cold", "cord")).toBe(1);
    expect(diffCount("cold", "warm")).toBe(4);
  });

  it("finds the changed letter only for single-letter changes", () => {
    expect(changedIndex("cold", "cord")).toBe(2);
    expect(changedIndex("cold", "card")).toBe(-1);
    expect(changedIndex("cold", "cold")).toBe(-1);
  });
});

describe("validateStep", () => {
  it("accepts a real word with exactly one letter changed", () => {
    expect(validateStep("crane", "crate", new Set(["crate"]))).toBeNull();
  });

  it("rejects incomplete words", () => {
    expect(validateStep("crane", "cra", new Set())).toBe("too-short");
  });

  it("rejects words not in the list", () => {
    expect(validateStep("crane", "craxe", new Set(["crate"]))).toBe("not-a-word");
  });

  it("rejects zero or multiple changes", () => {
    const v = new Set(["crane", "brine"]);
    expect(validateStep("crane", "crane", v)).toBe("not-one-change");
    expect(validateStep("crane", "brine", v)).toBe("not-one-change");
  });
});

describe("WordGraph", () => {
  const graph = new WordGraph(words);

  it("finds one-letter neighbors", () => {
    expect(graph.neighbors("cord").sort()).toEqual(["card", "cold", "word"]);
  });

  it("computes par as the shortest ladder length", () => {
    expect(graph.par("cold", "warm")).toBe(4); // cold-cord-card-ward-warm
    expect(graph.par("cold", "cold")).toBe(0);
    expect(graph.par("cold", "wild")).toBeNull();
  });

  it("returns a shortest path", () => {
    const path = graph.shortestPath("cold", "warm")!;
    expect(path).toHaveLength(5);
    expect(path[0]).toBe("cold");
    expect(path.at(-1)).toBe("warm");
    for (let i = 1; i < path.length; i++) {
      expect(valid.has(path[i])).toBe(true);
      expect(diffCount(path[i - 1], path[i])).toBe(1);
    }
  });

  it("restricts search to an allowed subset", () => {
    const allowed = new Set(["cold", "cord", "word", "worm", "warm"]);
    expect(graph.shortestPath("cold", "warm", allowed)).toEqual(["cold", "cord", "word", "worm", "warm"]);
    expect(graph.distances("cold", new Set(["cold"])).size).toBe(1);
  });
});
