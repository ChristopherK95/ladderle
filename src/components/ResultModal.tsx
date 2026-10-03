import { For, Show } from "solid-js";
import type { GameState } from "../core/game.ts";
import { changedIndex } from "../core/ladder.ts";
import { formatOverPar } from "../core/share.ts";
import { bucketFor, DISTRIBUTION_BUCKETS, displayStreak, type DistributionBucket, type Stats } from "../core/stats.ts";
import Modal from "./Modal.tsx";
import Row from "./Row.tsx";

interface ResultModalProps {
  /** The finished game to summarize, if any; omitted when just viewing stats. */
  game?: GameState;
  par: number;
  /** A par-length ladder, shown after giving up. */
  solution: string[];
  /** Daily stats; omitted in practice mode. */
  stats?: Stats;
  today: number;
  onShare?: () => void;
  onNewPuzzle?: () => void;
  onClose: () => void;
}

const BUCKET_LABELS: Record<DistributionBucket, string> = {
  "0": "Par",
  "1": "+1",
  "2": "+2",
  "3": "+3",
  "4+": "+4…",
  "gave-up": "Gave up",
};

export default function ResultModal(props: ResultModalProps) {
  const title = () =>
    !props.game ? "Statistics" : props.game.status === "won" ? "Solved!" : "Better luck next time";

  const currentBucket = () => {
    const game = props.game;
    if (!game || !props.stats) return null;
    return game.status === "gave-up" ? "gave-up" : bucketFor(game.steps.length, props.par);
  };

  return (
    <Modal title={title()} onClose={props.onClose}>
      <Show when={props.game}>
        {(game) => (
          <Show
            when={game().status === "won"}
            fallback={
              <>
                <p>A shortest ladder ({props.par} steps):</p>
                <div class="example">
                  <For each={props.solution}>
                    {(word, i) => (
                      <Row
                        word={word}
                        target={game().target}
                        changed={i() === 0 ? -1 : changedIndex(props.solution[i() - 1], word)}
                        small
                      />
                    )}
                  </For>
                </div>
              </>
            }
          >
            <p class="result">
              <strong>{game().steps.length}</strong> steps · par {props.par} ·{" "}
              <strong>{formatOverPar(game().steps.length - props.par)}</strong>
            </p>
          </Show>
        )}
      </Show>

      <Show when={props.stats}>
        {(stats) => (
          <>
            <div class="stat-grid">
              <Stat value={stats().played} label="Played" />
              <Stat value={stats().played ? Math.round((stats().won / stats().played) * 100) : 0} label="Win %" />
              <Stat value={displayStreak(stats(), props.today)} label="Streak" />
              <Stat value={stats().maxStreak} label="Max streak" />
            </div>
            <h3>Steps over par</h3>
            <div class="distribution">
              <For each={DISTRIBUTION_BUCKETS}>
                {(bucket) => {
                  const count = () => stats().distribution[bucket];
                  const max = () => Math.max(1, ...Object.values(stats().distribution));
                  return (
                    <div class="dist-row">
                      <span class="dist-label">{BUCKET_LABELS[bucket]}</span>
                      <div
                        class="dist-bar"
                        classList={{ current: currentBucket() === bucket }}
                        style={{ width: `${Math.max(8, (count() / max()) * 100)}%` }}
                      >
                        {count()}
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </>
        )}
      </Show>

      <div class="modal-actions">
        <Show when={props.onShare}>
          <button type="button" class="primary" onClick={() => props.onShare!()}>
            Share
          </button>
        </Show>
        <Show when={props.onNewPuzzle}>
          <button type="button" class="primary" onClick={() => props.onNewPuzzle!()}>
            New puzzle
          </button>
        </Show>
      </div>
    </Modal>
  );
}

function Stat(props: { value: number; label: string }) {
  return (
    <div class="stat">
      <div class="stat-value">{props.value}</div>
      <div class="stat-label">{props.label}</div>
    </div>
  );
}
