import { useEditorActions, useEditorSelection, useLessonEditor } from '../hooks/useEditorViewModel';
import { Button } from '../../../design-system';

export const EditorHeader = () => {
  const editor = useLessonEditor();
  const { handlePublish, handleSave, handleReset } = useEditorActions();
  const { selectedLessonId } = useEditorSelection();

  return (
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold">Lesson Editor</h1>
        <p class="text-muted text-sm">
          Manage units, topics, and lessons with full draft and publish controls.
        </p>
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
