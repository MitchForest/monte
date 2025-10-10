import { For, Show } from 'solid-js';

import {
  useEditorActions,
  useEditorComputed,
  useEditorConfirm,
  useEditorForms,
  useEditorSelection,
  useLessonEditor,
} from '../hooks/useEditorViewModel';
import { Button, Card, Input, Textarea } from '../../../components/ui';

export const CurriculumSidebar = () => {
  const { units, topics, lessons } = useEditorComputed();
  const { selectedUnitId, setSelectedUnitId, selectedTopicId, setSelectedTopicId, selectedLessonId, setSelectedLessonId } =
    useEditorSelection();
  const forms = useEditorForms();
  const {
    startCreateUnit,
    cancelCreateUnit,
    submitCreateUnit,
    handleMoveUnit,
    handleDeleteUnit,
    startCreateTopic,
    cancelCreateTopic,
    submitCreateTopic,
    handleMoveTopic,
    handleDeleteTopic,
    startCreateLesson,
    cancelCreateLesson,
    submitCreateLesson,
    handleDeleteLesson,
    handleMoveLessonOrder,
    handleSelectLesson,
  } = useEditorActions();
  const confirm = useEditorConfirm();
  const editor = useLessonEditor();

  const createUnit = forms.createUnit;
  const createTopic = forms.createTopic;
  const createLesson = forms.createLesson;

  return (
    <aside class="flex flex-col gap-4 lg:sticky lg:top-28">
      <Card variant="soft" class="flex flex-col gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Units</h2>
            <p class="text-xs text-[color:var(--color-text-muted)]">Reorder or jump between units.</p>
          </div>
          <Button
            size="compact"
            variant="secondary"
            onClick={() => (createUnit.isCreating() ? cancelCreateUnit() : startCreateUnit())}
          >
            {createUnit.isCreating() ? 'Close' : 'New unit'}
          </Button>
        </div>
        <Show when={units().length > 0} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No units yet.</p>}>
          <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
            <For each={units()}>
              {(unit, index) => (
                <div
                  class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                    unit._id === selectedUnitId()
                      ? 'border-[rgba(64,157,233,0.8)] bg-[rgba(233,245,251,0.6)]'
                      : 'border-[rgba(64,157,233,0.2)] bg-white hover:border-[rgba(64,157,233,0.4)]'
                  }`}
                  onClick={() => {
                    void (async () => {
                      if (editor.state.dirty && unit._id !== selectedUnitId()) {
                        const confirmNavigation = await confirm.request({
                          message: 'You have unsaved changes. Navigating away will discard them. Continue?',
                          confirmLabel: 'Discard changes',
                          cancelLabel: 'Stay here',
                        });
                        if (!confirmNavigation) return;
                      }
                      setSelectedUnitId(unit._id);
                    })();
                  }}
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="font-medium">{unit.title}</span>
                      <span class="text-xs text-[color:var(--color-text-muted)]">/{unit.slug}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveUnit(unit._id, -1);
                        }}
                        disabled={index() === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveUnit(unit._id, 1);
                        }}
                        disabled={index() === units().length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteUnit(unit);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={createUnit.isCreating()}>
          <form
            class="space-y-2 rounded-md border border-[rgba(64,157,233,0.35)] bg-white p-3 text-sm shadow-sm"
            onSubmit={(event) => void submitCreateUnit(event)}
          >
            <div class="grid gap-3">
              <Input
                label="Title"
                value={createUnit.form.title}
                onValueChange={(value) => createUnit.setForm('title', value)}
                required
              />
              <Input
                label="Slug"
                value={createUnit.form.slug}
                onValueChange={(value) => createUnit.setForm('slug', value)}
                placeholder="auto from title"
              />
              <Textarea
                label="Summary"
                value={createUnit.form.summary}
                onValueChange={(value) => createUnit.setForm('summary', value)}
                rows={3}
              />
              <Input
                label="Cover image"
                value={createUnit.form.coverImage}
                onValueChange={(value) => createUnit.setForm('coverImage', value)}
              />
            </div>
            <Show when={createUnit.error()}>
              <p class="text-xs text-[color:rgba(239,68,68,0.9)]">{createUnit.error()}</p>
            </Show>
            <div class="flex justify-end gap-2">
              <Button type="button" size="compact" variant="ghost" onClick={cancelCreateUnit}>
                Cancel
              </Button>
              <Button type="submit" size="compact">
                Create unit
              </Button>
            </div>
          </form>
        </Show>
      </Card>

      <Card variant="soft" class="flex flex-col gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Topics</h2>
            <p class="text-xs text-[color:var(--color-text-muted)]">Organize lessons within each unit.</p>
          </div>
          <Button
            size="compact"
            variant="secondary"
            onClick={() => (createTopic.isCreating() ? cancelCreateTopic() : startCreateTopic())}
            disabled={!selectedUnitId()}
          >
            {createTopic.isCreating() ? 'Close' : 'New topic'}
          </Button>
        </div>
        <Show when={topics().length > 0} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No topics yet.</p>}>
          <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
            <For each={topics()}>
              {(topic, index) => (
                <div
                  class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                    topic._id === selectedTopicId()
                      ? 'border-[rgba(140,204,212,0.8)] bg-[rgba(233,245,251,0.75)]'
                      : 'border-[rgba(140,204,212,0.2)] bg-white hover:border-[rgba(140,204,212,0.5)]'
                  }`}
                  onClick={() => {
                    void (async () => {
                      if (editor.state.dirty && topic._id !== selectedTopicId()) {
                        const confirmNavigation = await confirm.request({
                          message: 'You have unsaved changes. Navigating away will discard them. Continue?',
                          confirmLabel: 'Discard changes',
                          cancelLabel: 'Stay here',
                        });
                        if (!confirmNavigation) return;
                      }
                      setSelectedTopicId(topic._id);
                      setSelectedLessonId(topic.lessons[0]?._id);
                    })();
                  }}
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="font-medium">{topic.title}</span>
                      <span class="text-xs text-[color:var(--color-text-muted)]">/{topic.slug}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveTopic(topic._id, -1);
                        }}
                        disabled={index() === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveTopic(topic._id, 1);
                        }}
                        disabled={index() === topics().length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteTopic(topic);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={createTopic.isCreating()}>
          <form
            class="space-y-2 rounded-md border border-[rgba(140,204,212,0.35)] bg-white p-3 text-sm shadow-sm"
            onSubmit={(event) => void submitCreateTopic(event)}
          >
            <div class="grid gap-3">
              <Input
                label="Title"
                value={createTopic.form.title}
                onValueChange={(value) => createTopic.setForm('title', value)}
                required
              />
              <Input
                label="Slug"
                value={createTopic.form.slug}
                onValueChange={(value) => createTopic.setForm('slug', value)}
                placeholder="auto from title"
              />
              <Textarea
                label="Overview"
                value={createTopic.form.overview}
                onValueChange={(value) => createTopic.setForm('overview', value)}
                rows={3}
              />
              <Input
                label="Focus skills"
                value={createTopic.form.focusSkills}
                onValueChange={(value) => createTopic.setForm('focusSkills', value)}
                placeholder="skill.one, skill.two"
              />
              <Input
                label="Estimated minutes"
                type="number"
                min={0}
                value={createTopic.form.estimatedDurationMinutes}
                onValueChange={(value) => createTopic.setForm('estimatedDurationMinutes', value)}
              />
            </div>
            <Show when={createTopic.error()}>
              <p class="text-xs text-[color:rgba(239,68,68,0.9)]">{createTopic.error()}</p>
            </Show>
            <div class="flex justify-end gap-2">
              <Button type="button" size="compact" variant="ghost" onClick={cancelCreateTopic}>
                Cancel
              </Button>
              <Button type="submit" size="compact">
                Create topic
              </Button>
            </div>
          </form>
        </Show>
      </Card>

      <Card variant="soft" class="flex flex-col gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Lessons</h2>
            <p class="text-xs text-[color:var(--color-text-muted)]">Keep draft and publish state synchronized.</p>
          </div>
          <Button
            size="compact"
            variant="secondary"
            onClick={() => (createLesson.isCreating() ? cancelCreateLesson() : startCreateLesson())}
            disabled={!selectedTopicId()}
          >
            {createLesson.isCreating() ? 'Close' : 'New lesson'}
          </Button>
        </div>
        <Show when={lessons().length > 0} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No lessons in this topic.</p>}>
          <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
            <For each={lessons()}>
              {(lesson, index) => (
                <div
                  class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                    lesson._id === selectedLessonId()
                      ? 'border-[rgba(64,157,233,0.8)] bg-[rgba(233,245,251,0.75)]'
                      : 'border-[rgba(64,157,233,0.2)] bg-white hover:border-[rgba(64,157,233,0.4)]'
                  }`}
                  onClick={() => void handleSelectLesson(lesson._id)}
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="font-medium">{lesson.title || 'Untitled lesson'}</span>
                      <span class="text-xs text-[color:var(--color-text-muted)]">
                        {lesson.status === 'published' ? 'Published' : 'Draft'} ·{' '}
                        {new Date(lesson.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveLessonOrder(lesson._id, -1);
                        }}
                        disabled={index() === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMoveLessonOrder(lesson._id, 1);
                        }}
                        disabled={index() === lessons().length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="compact"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteLesson(lesson);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={createLesson.isCreating()}>
          <form
            class="space-y-2 rounded-md border border-[rgba(64,157,233,0.35)] bg-white p-3 text-sm shadow-sm"
            onSubmit={(event) => void submitCreateLesson(event)}
          >
            <Input
              label="Title"
              value={createLesson.form.title}
              onValueChange={(value) => createLesson.setForm('title', value)}
              required
            />
            <Input
              label="Slug"
              value={createLesson.form.slug}
              onValueChange={(value) => createLesson.setForm('slug', value)}
              placeholder="auto from title"
            />
            <Show when={createLesson.error()}>
              <p class="text-xs text-[color:rgba(239,68,68,0.9)]">{createLesson.error()}</p>
            </Show>
            <div class="flex justify-end gap-2">
              <Button type="button" size="compact" variant="ghost" onClick={cancelCreateLesson}>
                Cancel
              </Button>
              <Button type="submit" size="compact">
                Create lesson
              </Button>
            </div>
          </form>
        </Show>
      </Card>
    </aside>
  );
};
