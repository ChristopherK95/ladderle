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
      <h3>Example: CHASE → SWORN (par 5)</h3>
      <div class="example">
        <Row word="chase" target="sworn" label="Start" small />
        <Row word="chose" target="sworn" changed={2} small />
        <Row word="chore" target="sworn" changed={3} small />
        <Row word="shore" target="sworn" changed={0} small />
        <Row word="swore" target="sworn" changed={1} small />
        <Row word="sworn" target="sworn" changed={4} small />
      </div>
      <p class="muted">
        <span class="swatch match" /> Green letters already match the target. The outlined letter is the one you changed.
      </p>
      <p class="muted">A new daily puzzle arrives at midnight. Practice mode has unlimited puzzles.</p>
    </Modal>
  );
}
