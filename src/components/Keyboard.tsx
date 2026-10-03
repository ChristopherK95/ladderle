import { For } from "solid-js";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

export default function Keyboard(props: { onKey: (key: string) => void }) {
  return (
    <div class="keyboard" role="group" aria-label="Keyboard">
      <For each={ROWS}>
        {(row) => (
          <div class="key-row">
            <For each={row}>
              {(key) => (
                <button
                  type="button"
                  class="key"
                  classList={{ wide: key.length > 1 }}
                  aria-label={key === "backspace" ? "Backspace" : key === "enter" ? "Enter" : key.toUpperCase()}
                  onClick={() => props.onKey(key)}
                >
                  {key === "backspace" ? "⌫" : key}
                </button>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
