import type { Component, JSX } from 'solid-js';

interface PaperNoteProps {
  children: JSX.Element;
}

export const PaperNote: Component<PaperNoteProps> = (props) => (
  <div class="paper-note" aria-hidden="true">
    {props.children}
  </div>
);
