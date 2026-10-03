import type { GameState } from "./game.ts";

const MATCH = "🟩";
const MISS = "⬛";

export function shareText(day: number, game: GameState, par: number): string {
  const header =
    game.status === "gave-up"
      ? `Ladderle #${day}  X (par ${par})`
      : `Ladderle #${day}  ${game.steps.length} steps (par ${par}, ${formatOverPar(game.steps.length - par)})`;
  const rows = game.steps.map((word) =>
    [...word].map((letter, i) => (letter === game.target[i] ? MATCH : MISS)).join(""),
  );
  return [header, ...rows].join("\n");
}

export function formatOverPar(over: number): string {
  return over === 0 ? "±0" : over > 0 ? `+${over}` : String(over);
}
