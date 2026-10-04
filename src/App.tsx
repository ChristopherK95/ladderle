import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import Board from "./components/Board.tsx";
import HelpModal from "./components/HelpModal.tsx";
import Keyboard from "./components/Keyboard.tsx";
import ResultModal from "./components/ResultModal.tsx";
import Row from "./components/Row.tsx";
import { dailyPuzzle, dayNumber } from "./core/daily.ts";
import { giveUp, newGame, submitStep, type GameState } from "./core/game.ts";
import { DIFFICULTY_PAR, generatePuzzle, type Difficulty } from "./core/generator.ts";
import { STEP_ERROR_MESSAGES, WORD_LENGTH } from "./core/ladder.ts";
import { shareText } from "./core/share.ts";
import { emptyStats, recordResult } from "./core/stats.ts";
import { load, save } from "./storage.ts";
import { commonSet, commonWords, daily, graph, validWords } from "./words.ts";

type Mode = "daily" | "practice";

interface SavedDaily {
  day: number;
  game: GameState;
}

const today = dayNumber(new Date());
const todaysPuzzle = dailyPuzzle(daily, today);
const DIFFICULTIES = Object.keys(DIFFICULTY_PAR) as Difficulty[];

function loadDailyGame(): GameState {
  const saved = load<SavedDaily | null>("daily", null);
  const sameDay =
    saved?.day === today && saved.game.origin === todaysPuzzle.origin && saved.game.target === todaysPuzzle.target;
  return sameDay ? saved.game : newGame(todaysPuzzle);
}

function newPracticeGame(difficulty: Difficulty): GameState {
  return newGame(generatePuzzle(graph, commonWords, DIFFICULTY_PAR[difficulty], Math.random) ?? todaysPuzzle);
}

export default function App() {
  const [mode, setMode] = createSignal<Mode>("daily");
  const [dailyGame, setDailyGame] = createSignal(loadDailyGame());
  const [practiceGame, setPracticeGame] = createSignal<GameState | null>(null);
  const [difficulty, setDifficulty] = createSignal<Difficulty>(load("difficulty", "medium"));
  const [stats, setStats] = createSignal(load("stats", emptyStats()));
  const [input, setInput] = createSignal("");
  const [shake, setShake] = createSignal(false);
  /** `top` pins the toast to a viewport offset; otherwise it uses the default position. */
  const [toast, setToast] = createSignal<{ message: string; top?: number } | null>(null);
  const [modal, setModal] = createSignal<"help" | "result" | null>(load("seenHelp", false) ? null : "help");

  createEffect(() => save("daily", { day: today, game: dailyGame() } satisfies SavedDaily));
  createEffect(() => save("stats", stats()));
  createEffect(() => save("difficulty", difficulty()));

  const game = () => (mode() === "daily" ? dailyGame() : practiceGame()!);
  const setGame = (next: GameState) => (mode() === "daily" ? setDailyGame(next) : setPracticeGame(next));
  const par = createMemo(() => graph.par(game().origin, game().target) ?? 0);
  const solution = createMemo(() => {
    const { origin, target, status } = game();
    if (status !== "gave-up") return [];
    return graph.shortestPath(origin, target, commonSet) ?? graph.shortestPath(origin, target) ?? [];
  });
  const finished = () => game().status !== "playing";

  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  /** Shows a message, placed just below `anchor` when given so it doesn't cover it. */
  function showToast(message: string, anchor?: Element | null, ms = 1500) {
    clearTimeout(toastTimer);
    setToast({ message, top: anchor ? anchor.getBoundingClientRect().bottom + 8 : undefined });
    toastTimer = setTimeout(() => setToast(null), ms);
  }

  function update(next: GameState) {
    setGame(next);
    if (next.status === "playing") return;
    if (mode() === "daily") {
      setStats((s) =>
        recordResult(
          s,
          next.status === "won"
            ? { day: today, gaveUp: false, steps: next.steps.length, par: par() }
            : { day: today, gaveUp: true },
        ),
      );
    }
    // A win waits for the final row's reveal animation to finish.
    setTimeout(() => setModal("result"), next.status === "won" ? 1400 : 700);
  }

  function submit() {
    const result = submitStep(game(), input(), validWords);
    if (!result.ok) {
      showToast(STEP_ERROR_MESSAGES[result.error], document.querySelector(".row.active"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setInput("");
    update(result.game);
  }

  function onKey(key: string) {
    if (modal() || finished()) return;
    if (key === "enter") submit();
    else if (key === "backspace") setInput((s) => s.slice(0, -1));
    else if (/^[a-z]$/.test(key) && input().length < WORD_LENGTH) setInput((s) => s + key);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    // Ctrl+Backspace (Alt+Backspace on macOS) clears the whole word, like deleting a word in a text field.
    if (key === "backspace" && (e.ctrlKey || e.altKey) && !e.metaKey) {
      if (modal() || finished()) return;
      e.preventDefault();
      setInput("");
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (key === "enter" || key === "backspace" || /^[a-z]$/.test(key)) {
      if (modal()) return;
      e.preventDefault();
      onKey(key);
    }
  };
  onMount(() => window.addEventListener("keydown", onKeyDown));
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));

  function switchMode(next: Mode) {
    if (next === "practice" && !practiceGame()) setPracticeGame(newPracticeGame(difficulty()));
    setMode(next);
    setInput("");
  }

  function startPractice(d = difficulty()) {
    setDifficulty(d);
    setPracticeGame(newPracticeGame(d));
    setInput("");
    setModal(null);
  }

  function onGiveUp() {
    const warning = mode() === "daily" ? " This ends your streak." : "";
    if (confirm(`Give up and reveal a solution?${warning}`)) update(giveUp(game()));
  }

  async function share() {
    const daily = dailyGame();
    try {
      await navigator.clipboard.writeText(shareText(today, daily, graph.par(daily.origin, daily.target) ?? 0));
      showToast("Copied results to clipboard");
    } catch {
      showToast("Couldn't copy to clipboard");
    }
  }

  function closeHelp() {
    save("seenHelp", true);
    setModal(null);
  }

  return (
    <div class="app">
      <header>
        <button type="button" class="icon" aria-label="How to play" onClick={() => setModal("help")}>
          ?
        </button>
        <h1>Ladderle</h1>
        <button type="button" class="icon" aria-label="Statistics" onClick={() => setModal("result")}>
          ▤
        </button>
      </header>

      <nav class="toolbar">
        <div class="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode() === "daily"} onClick={() => switchMode("daily")}>
            Daily #{today}
          </button>
          <button type="button" role="tab" aria-selected={mode() === "practice"} onClick={() => switchMode("practice")}>
            Practice
          </button>
        </div>
        <Show when={mode() === "practice"}>
          <select
            aria-label="Difficulty"
            value={difficulty()}
            onChange={(e) => startPractice(e.currentTarget.value as Difficulty)}
          >
            <For each={DIFFICULTIES}>{(d) => <option value={d}>{d[0].toUpperCase() + d.slice(1)}</option>}</For>
          </select>
          <button type="button" onClick={() => startPractice()}>
            New
          </button>
        </Show>
      </nav>

      <Board game={game()} input={input()} shake={shake()} />

      <div class="goal-area">
        <Row word={game().target} target={game().target} variant="goal" label="Target" />
        <div class="status-line">
          <span>
            Steps: <strong>{game().steps.length}</strong> · Par: <strong>{par()}</strong>
          </span>
          <Show
            when={!finished()}
            fallback={
              <button type="button" class="link" onClick={() => setModal("result")}>
                View result
              </button>
            }
          >
            <button type="button" class="link" onClick={onGiveUp}>
              Give up
            </button>
          </Show>
        </div>
      </div>

      <Keyboard onKey={onKey} />

      <Show when={toast()}>
        {(t) => (
          <div class="toast" role="status" style={{ top: t().top === undefined ? undefined : `${t().top}px` }}>
            {t().message}
          </div>
        )}
      </Show>

      <Show when={modal() === "help"}>
        <HelpModal onClose={closeHelp} />
      </Show>
      <Show when={modal() === "result"}>
        <ResultModal
          game={finished() ? game() : undefined}
          par={par()}
          solution={solution()}
          stats={mode() === "daily" || !finished() ? stats() : undefined}
          today={today}
          onShare={mode() === "daily" && finished() ? share : undefined}
          onNewPuzzle={mode() === "practice" ? () => startPractice() : undefined}
          onClose={() => setModal(null)}
        />
      </Show>
    </div>
  );
}
