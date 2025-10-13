import { For, Show } from 'solid-js';

import {
  useEditorActions,
  useEditorComputed,
  useEditorForms,
  useEditorMetaTab,
} from '../state/useEditorViewModel';
import { curriculumMaterials } from '../../../shared/curriculum/materials';
import { Button, Card, Chip } from '../../../shared/ui';

export const MetadataPanel = () => {
  const { units, currentUnit, currentTopic, lessonDocument, currentLessonMeta } = useEditorComputed();
  const forms = useEditorForms();
  const metaTab = useEditorMetaTab();
  const {
    handleUnitFormSubmit,
    handleTopicFormSubmit,
    handleLessonFieldChange,
    handleLessonDurationChange,
    handleLessonPrimaryMaterialChange,
    handleLessonSkillChange,
    handleLessonMetaChange,
  } = useEditorActions();

  const unitForm = forms.unit;
  const topicForm = forms.topic;
  const lessonMeta = forms.lessonMeta;

  return (
    <Card variant="soft" class="flex flex-col gap-4 p-5">
      <div>
        <h2 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Metadata workspace</h2>
        <p class="text-xs text-[color:var(--color-text-muted)]">Focus on one layer at a time before saving.</p>
      </div>
      <div class="flex gap-2 rounded-full bg-white p-1 text-sm font-semibold text-[color:var(--color-heading)]">
        <For
          each={[
            { value: 'unit', label: 'Unit', disabled: units().length === 0 },
            { value: 'topic', label: 'Topic', disabled: !currentTopic() },
            { value: 'lesson', label: 'Lesson', disabled: !lessonDocument() },
          ] as const}
        >
          {(tab) => (
            <button
              type="button"
              class={`rounded-full px-4 py-2 transition ${
                metaTab.active() === tab.value
                  ? 'bg-[rgba(64,157,233,0.15)] text-[color:var(--color-heading)]'
                  : 'text-[color:var(--color-text-muted)] hover:bg-[rgba(12,42,101,0.08)]'
              }`}
              disabled={tab.disabled}
              onClick={() => metaTab.setActive(tab.value)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>

      <Show when={metaTab.active() === 'unit'}>
        <Show when={currentUnit()} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">Select a unit to edit metadata.</p>}>
          <form class="space-y-3" onSubmit={(event) => void handleUnitFormSubmit(event)}>
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Unit details</h3>
              <Button type="submit" size="compact">
                Save unit
              </Button>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Title</span>
                <input
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                  value={unitForm.form.title}
                  onInput={(event) => unitForm.setForm('title', event.currentTarget.value)}
                  required
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Slug</span>
                <input
                  class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={unitForm.form.slug}
                  onInput={(event) => unitForm.setForm('slug', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm md:col-span-2">
                <span class="font-medium">Summary</span>
                <textarea
                  rows={2}
                  class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={unitForm.form.summary}
                  onInput={(event) => unitForm.setForm('summary', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Cover image</span>
                <input
                  class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={unitForm.form.coverImage}
                  onInput={(event) => unitForm.setForm('coverImage', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Status</span>
                <select
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                  value={unitForm.form.status}
                  onChange={(event) => unitForm.setForm('status', event.currentTarget.value as 'active' | 'archived')}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <Show when={unitForm.error()}>
              <p class="text-xs text-danger">{unitForm.error()}</p>
            </Show>
          </form>
        </Show>
      </Show>

      <Show when={metaTab.active() === 'topic'}>
        <Show when={currentTopic()} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">Select a topic to edit metadata.</p>}>
          <form class="space-y-3" onSubmit={(event) => void handleTopicFormSubmit(event)}>
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Topic details</h3>
              <Button type="submit" size="compact">
                Save topic
              </Button>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Title</span>
                <input
                  class="rounded-md border border-[rgba(140,204,212,0.4)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.title}
                  onInput={(event) => topicForm.setForm('title', event.currentTarget.value)}
                  required
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Slug</span>
                <input
                  class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.slug}
                  onInput={(event) => topicForm.setForm('slug', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm md:col-span-2">
                <span class="font-medium">Overview</span>
                <textarea
                  rows={2}
                  class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.overview}
                  onInput={(event) => topicForm.setForm('overview', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Focus skills</span>
                <input
                  class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.focusSkills}
                  onInput={(event) => topicForm.setForm('focusSkills', event.currentTarget.value)}
                  placeholder="skill.one, skill.two"
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Estimated minutes</span>
                <input
                  type="number"
                  min="0"
                  class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.estimatedDurationMinutes}
                  onInput={(event) => topicForm.setForm('estimatedDurationMinutes', event.currentTarget.value)}
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Status</span>
                <select
                  class="rounded-md border border-[rgba(140,204,212,0.4)] bg-white px-3 py-2 shadow-sm"
                  value={topicForm.form.status}
                  onChange={(event) => topicForm.setForm('status', event.currentTarget.value as 'active' | 'archived')}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <Show when={topicForm.error()}>
              <p class="text-xs text-danger">{topicForm.error()}</p>
            </Show>
          </form>
        </Show>
      </Show>

      <Show when={metaTab.active() === 'lesson'}>
        <Show when={lessonDocument()} fallback={<p class="text-xs text-[color:var(--color-text-muted)]">Select a lesson to manage metadata.</p>}>
          {(docAccessor) => (
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-3">
                <Chip tone="blue">{currentLessonMeta()?.status === 'published' ? 'Published' : 'Draft'}</Chip>
                <span class="text-xs text-[color:var(--color-text-muted)]">Slug: {currentLessonMeta()?.slug}</span>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Title</span>
                  <input
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={docAccessor().lesson.title}
                    onInput={(event) => handleLessonFieldChange('title', event.currentTarget.value)}
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Estimated duration (minutes)</span>
                  <input
                    type="number"
                    min="1"
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={docAccessor().lesson.estimatedDurationMinutes}
                    onInput={(event) => handleLessonDurationChange(Number(event.currentTarget.value))}
                  />
                </label>
              </div>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium">Summary</span>
                <textarea
                  rows={3}
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={docAccessor().lesson.summary ?? ''}
                  onInput={(event) => handleLessonFieldChange('summary', event.currentTarget.value)}
                />
              </label>
              <div class="grid gap-3 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Primary material</span>
                  <select
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={docAccessor().lesson.primaryMaterialId}
                    onChange={(event) => handleLessonPrimaryMaterialChange(event.currentTarget.value)}
                  >
                    <For each={curriculumMaterials}>
                      {(material) => <option value={material.id}>{material.name}</option>}
                    </For>
                  </select>
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Focus skills (comma separated)</span>
                  <input
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={(docAccessor().lesson.focusSkills ?? []).join(', ')}
                    onInput={(event) => handleLessonSkillChange(event.currentTarget.value)}
                  />
                </label>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Author</span>
                  <input
                    class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={lessonMeta.form.author}
                    onInput={(event) => handleLessonMetaChange('author', event.currentTarget.value)}
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Notes</span>
                  <textarea
                    rows={2}
                    class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={lessonMeta.form.notes}
                    onInput={(event) => handleLessonMetaChange('notes', event.currentTarget.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </Show>
      </Show>
    </Card>
  );
};
