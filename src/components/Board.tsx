import { createEffect, createMemo, For, on, Show } from "solid-js";
import type { GameState } from "../core/game.ts";
import { changedIndex } from "../core/ladder.ts";
import Row from "./Row.tsx";

interface BoardProps {
  game: GameState;
  input: string;
  shake: boolean;
}

export default function Board(props: BoardProps) {
  let scroller!: HTMLDivElement;

  // Keep the row being typed in view as the ladder grows.
  createEffect(
    on(
      () => props.game.steps.length,
      () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" }),
    ),
  );

  // Index of a step that was just submitted, so only it plays the reveal animation
  // (not rows restored on load or swapped in by a mode switch); -1 for none.
  const revealed = createMemo<{ game: GameState; index: number }>(
    (prev) => {
      const game = props.game;
      const added =
        game.origin === prev.game.origin &&
        game.target === prev.game.target &&
        game.steps.length === prev.game.steps.length + 1;
      return { game, index: added ? game.steps.length - 1 : -1 };
    },
    { game: props.game, index: -1 },
  );

  const prevWord = (i: number) => (i === 0 ? props.game.origin : props.game.steps[i - 1]);

  return (
    <div class="board" ref={scroller}>
      <Row word={props.game.origin} target={props.game.target} label="Start" />
      <For each={props.game.steps}>
        {(word, i) => (
          <Row
            word={word}
            target={props.game.target}
            changed={changedIndex(prevWord(i()), word)}
            reveal={revealed().index === i()}
          />
        )}
      </For>
      <Show when={props.game.status === "playing"}>
        <Row word={props.input} target={props.game.target} variant="active" shake={props.shake} />
      </Show>
    </div>
  );
}
