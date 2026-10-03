import Modal from "./Modal.tsx";
import Row from "./Row.tsx";

export default function HelpModal(props: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={props.onClose}>
      <p>Climb from the start word to the target word, one letter at a time.</p>
      <ul>
        <li>Each step must change exactly one letter.</li>
        <li>Every step must be a real 5-letter word.</li>
        <li>There are no undos: every step counts, including walking back.</li>
        <li>Try to match <strong>par</strong>, the shortest possible ladder.</li>
      </ul>
      <h3>Example: STONE → WHINE (par 3)</h3>
      <div class="example">
        <Row word="stone" target="whine" label="Start" small />
        <Row word="shone" target="whine" changed={1} small />
        <Row word="shine" target="whine" changed={2} small />
        <Row word="whine" target="whine" changed={0} small />
      </div>
      <p class="muted">
        <span class="swatch match" /> Green letters already match the target. The outlined letter is the one you changed.
      </p>
      <p class="muted">A new daily puzzle arrives at midnight. Practice mode has unlimited puzzles.</p>
    </Modal>
  );
}
