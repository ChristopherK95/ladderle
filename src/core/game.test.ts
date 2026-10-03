import { describe, expect, it } from "vitest";
import { currentWord, giveUp, newGame, submitStep } from "./game.ts";
import { shareText } from "./share.ts";
import { displayStreak, emptyStats, recordResult } from "./stats.ts";

const valid = new Set(["cold", "cord", "card", "ward", "warm"].map((w) => w + "s"));
const puzzle = { origin: "colds", target: "warms" };

function play(words: string[]) {
  let game = newGame(puzzle);
  for (const word of words) {
    const result = submitStep(game, word, valid);
    if (!result.ok) throw new Error(result.error);
    game = result.game;
  }
  return game;
}

describe("game", () => {
  it("advances on valid steps and wins on reaching the target", () => {
    const game = play(["cords", "cards", "wards"]);
    expect(currentWord(game)).toBe("wards");
    expect(game.status).toBe("playing");
    expect(play(["cords", "cards", "wards", "warms"]).status).toBe("won");
  });

  it("allows revisiting words, counting every step", () => {
    const game = play(["cords", "colds", "cords"]);
    expect(game.steps).toEqual(["cords", "colds", "cords"]);
  });

  it("rejects invalid steps without changing state", () => {
    const game = newGame(puzzle);
    expect(submitStep(game, "cards", valid)).toEqual({ ok: false, error: "not-one-change" });
    expect(game.steps).toEqual([]);
  });

  it("can be given up", () => {
    expect(giveUp(newGame(puzzle)).status).toBe("gave-up");
  });
});

describe("shareText", () => {
  it("renders green positions per step without letters", () => {
    const game = play(["cords", "cards", "wards", "warms"]);
    expect(shareText(12, game, 4)).toBe(
      ["Ladderle #12  4 steps (par 4, ±0)", "⬛⬛🟩⬛🟩", "⬛🟩🟩⬛🟩", "🟩🟩🟩⬛🟩", "🟩🟩🟩🟩🟩"].join("\n"),
    );
  });

  it("marks give-ups", () => {
    expect(shareText(3, giveUp(play(["cords"])), 4).split("\n")[0]).toBe("Ladderle #3  X (par 4)");
  });
});

describe("stats", () => {
  it("tracks streaks across consecutive wins and resets on give-up", () => {
    let stats = emptyStats();
    stats = recordResult(stats, { day: 1, gaveUp: false, steps: 5, par: 4 });
    stats = recordResult(stats, { day: 2, gaveUp: false, steps: 4, par: 4 });
    expect(stats.currentStreak).toBe(2);
    stats = recordResult(stats, { day: 3, gaveUp: true });
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
    expect(stats.played).toBe(3);
    expect(stats.won).toBe(2);
    expect(stats.distribution).toMatchObject({ "0": 1, "1": 1, "gave-up": 1 });
  });

  it("restarts the streak after a missed day", () => {
    let stats = recordResult(emptyStats(), { day: 1, gaveUp: false, steps: 4, par: 4 });
    stats = recordResult(stats, { day: 3, gaveUp: false, steps: 9, par: 4 });
    expect(stats.currentStreak).toBe(1);
    expect(stats.distribution["4+"]).toBe(1);
  });

  it("ignores recording the same day twice", () => {
    const once = recordResult(emptyStats(), { day: 1, gaveUp: false, steps: 4, par: 4 });
    expect(recordResult(once, { day: 1, gaveUp: false, steps: 4, par: 4 })).toBe(once);
  });

  it("shows a broken streak as zero", () => {
    const stats = recordResult(emptyStats(), { day: 1, gaveUp: false, steps: 4, par: 4 });
    expect(displayStreak(stats, 2)).toBe(1);
    expect(displayStreak(stats, 3)).toBe(0);
  });
});
