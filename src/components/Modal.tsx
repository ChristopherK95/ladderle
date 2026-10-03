import { onCleanup, onMount, type JSX } from "solid-js";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: JSX.Element;
}

export default function Modal(props: ModalProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
  };
  onMount(() => document.addEventListener("keydown", onKeyDown));
  onCleanup(() => document.removeEventListener("keydown", onKeyDown));

  return (
    <div class="overlay" onClick={(e) => e.target === e.currentTarget && props.onClose()}>
      <div class="modal" role="dialog" aria-modal="true" aria-label={props.title}>
        <button type="button" class="close" aria-label="Close" onClick={props.onClose}>
          ✕
        </button>
        <h2>{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
}
