import { For } from "solid-js";
import { WORD_LENGTH } from "../core/ladder.ts";

interface RowProps {
  word: string;
  target: string;
  /** Index of the letter changed from the previous row, outlined; -1 for none. */
  changed?: number;
  /** Active rows are being typed: letters are not yet compared against the target. */
  variant?: "step" | "active" | "goal";
  label?: string;
  shake?: boolean;
  small?: boolean;
}

export default function Row(props: RowProps) {
  const letters = () => Array.from({ length: WORD_LENGTH }, (_, i) => props.word[i] ?? "");
  const variant = () => props.variant ?? "step";

  const tileState = (letter: string, i: number) => {
    if (!letter) return "empty";
    if (variant() === "active") return "typed";
    if (variant() === "goal") return "goal";
    return letter === props.target[i] ? "match" : "miss";
  };

  const tileLabel = (letter: string, i: number) => {
    const state = tileState(letter, i);
    if (state === "empty") return "empty";
    if (state === "match") return `${letter}, matches target`;
    if (state === "miss") return `${letter}, does not match target`;
    return letter;
  };

  return (
    <div class="row" classList={{ shake: props.shake, small: props.small, [variant()]: true }}>
      {props.label && <span class="row-label">{props.label}</span>}
      <div class="tiles" role="group" aria-label={props.label ?? props.word.toUpperCase()}>
        <For each={letters()}>
          {(letter, i) => (
            <div
              class={`tile ${tileState(letter, i())}`}
              classList={{ changed: props.changed === i() }}
              aria-label={tileLabel(letter.toUpperCase(), i())}
            >
              {letter}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
