import { Show, createMemo } from 'solid-js';

import { useEditorActions, useEditorSelection, useLessonEditor } from '../hooks/useEditorViewModel';
import { Button, Chip } from '../../../components/ui';

export const EditorHeader = () => {
  const editor = useLessonEditor();
  const { handlePublish, handleSave, handleReset } = useEditorActions();
  const { selectedLessonId } = useEditorSelection();

  const statusTone = createMemo<'yellow' | 'green' | 'neutral' | 'red'>(() => {
    if (!selectedLessonId()) return 'neutral';
    if (editor.state.status === 'saving') return 'yellow';
    if (editor.state.error) return 'red';
    if (editor.state.dirty) return 'yellow';
    return 'green';
  });

  const statusLabel = createMemo(() => {
    if (!selectedLessonId()) return 'Select a lesson to start editing.';
    if (editor.state.status === 'saving') return 'Saving changes…';
    if (editor.state.error) return editor.state.error;
    if (editor.state.dirty) return 'Unsaved changes';
    if (editor.state.lastSavedAt) {
      const timestamp = new Date(editor.state.lastSavedAt);
      return `Saved ${new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }).format(timestamp)}`;
    }
    return 'All changes saved';
  });

  return (
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold">Lesson Editor</h1>
        <p class="text-[color:var(--color-text-muted)] text-sm">
          Manage units, topics, and lessons with full draft and publish controls.
        </p>
        <Show when={statusLabel()}>
          {(label) => (
            <Chip tone={statusTone()} size="sm" class="w-fit">
              {label()}
            </Chip>
          )}
        </Show>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="compact" onClick={() => void handleReset()}>
          Reset draft
        </Button>
        <Button variant="secondary" size="compact" disabled={!editor.canUndo()} onClick={() => editor.undo()}>
          Undo
        </Button>
        <Button variant="secondary" size="compact" disabled={!editor.canRedo()} onClick={() => editor.redo()}>
          Redo
        </Button>
        <Button
          variant="secondary"
          size="compact"
          disabled={!selectedLessonId()}
          onClick={() => void handlePublish()}
        >
          Publish
        </Button>
        <Button onClick={() => void handleSave()} disabled={!editor.state.dirty || !selectedLessonId()}>
          Save
        </Button>
      </div>
    </header>
  );
};
