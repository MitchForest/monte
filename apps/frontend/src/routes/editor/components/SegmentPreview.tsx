import { Match, Switch, createEffect, createMemo, onCleanup } from 'solid-js';

import type {
  Lesson,
  LessonMaterialInventory,
  LessonScenarioBinding,
  LessonSegment,
  PresentationSegment as PresentationSegmentType,
  GuidedSegment as GuidedSegmentType,
  PracticeSegment as PracticeSegmentType,
  PresentationScript,
} from '@monte/types';
import { Card } from '../../../components/ui';
import { PresentationSegment } from '../../../domains/curriculum/components/segments/PresentationSegment';
import { GuidedSegment } from '../../../domains/curriculum/components/segments/GuidedSegment';
import { PracticeSegment } from '../../../domains/curriculum/components/segments/PracticeSegment';
import type { PresentationSegmentProps } from '../../../domains/curriculum/components/segments/PresentationSegment';
import type { GuidedSegmentProps } from '../../../domains/curriculum/components/segments/GuidedSegment';
import type { PracticeSegmentProps } from '../../../domains/curriculum/components/segments/PracticeSegment';
import { useLessonInventory } from '../../../domains/curriculum/inventory/context';

const handleAutoAdvance: PresentationSegmentProps['onAutoAdvance'] = () => {};
const handleNarrationChange: PresentationSegmentProps['onNarrationChange'] = () => {};
const handlePaperNotesChange: PresentationSegmentProps['onPaperNotesChange'] = () => {};
const handleActionChange: PresentationSegmentProps['onActionChange'] = () => {};
const handleGuidedComplete: GuidedSegmentProps['onSegmentComplete'] = () => {};
const handlePracticeResult: PracticeSegmentProps['onSegmentResult'] = () => {};
const handlePracticeTaskResult: PracticeSegmentProps['onTaskResult'] = () => {};

interface InventorySnapshotOptions {
  snapshot?: () => LessonMaterialInventory;
  verify?: () => void;
}

interface SegmentPreviewProps {
  lesson: Lesson;
  segment: LessonSegment;
  scenario?: LessonScenarioBinding;
  onInventorySnapshot?: (options?: InventorySnapshotOptions) => void;
}

export const SegmentPreview = (props: SegmentPreviewProps) => {
  const inventory = useLessonInventory();
  const presentationScript = createMemo<PresentationScript>(() => {
    if (props.segment.type !== 'presentation') {
      return { id: 'preview-empty', title: 'Preview', actions: [] };
    }
    const script = props.segment.script;
    return script ?? { id: 'preview-empty', title: 'Preview', actions: [] };
  });

  createEffect(() => {
    props.onInventorySnapshot?.({
      snapshot: () => inventory.snapshot(),
      verify: inventory.verifyConsistency,
    });
  });

  onCleanup(() => {
    props.onInventorySnapshot?.(undefined);
  });

  return (
    <Card variant="soft" class="space-y-4 p-5">
      <header class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Segment preview</h3>
        <p class="text-sm text-[color:var(--color-text-subtle)]">
          Live view of the selected segment with shared canvas + inventory state.
        </p>
      </header>

      <div class="min-h-[420px]">
        <Switch fallback={<PreviewPlaceholder />}> 
          <Match when={props.segment.type === 'presentation'}>
            <PresentationSegment
              lessonId={props.lesson.id}
              segment={props.segment as PresentationSegmentType}
              playerStatus="paused"
              onAutoAdvance={handleAutoAdvance}
              script={presentationScript()}
              recordEvent={undefined}
              onNarrationChange={handleNarrationChange}
              onPaperNotesChange={handlePaperNotesChange}
              onActionChange={handleActionChange}
              actionJumpToIndex={undefined}
            />
          </Match>

          <Match when={props.segment.type === 'guided'}>
            <GuidedSegment
              lessonId={props.lesson.id}
              segment={props.segment as GuidedSegmentType}
              steps={(props.segment as GuidedSegmentType).steps}
              scenario={undefined}
              onSegmentComplete={handleGuidedComplete}
              recordEvent={undefined}
            />
          </Match>

          <Match when={props.segment.type === 'practice'}>
            <PracticeSegment
              lessonId={props.lesson.id}
              segment={props.segment as PracticeSegmentType}
              questions={(props.segment as PracticeSegmentType).questions}
              passCriteria={(props.segment as PracticeSegmentType).passCriteria}
              refreshKey={0}
              onSegmentResult={handlePracticeResult}
              onTaskResult={handlePracticeTaskResult}
              recordEvent={undefined}
            />
          </Match>
        </Switch>
      </div>
    </Card>
  );
};

function PreviewPlaceholder() {
  return (
    <div class="flex h-full items-center justify-center rounded-lg border border-dashed border-[rgba(64,157,233,0.3)] bg-white/70 text-sm text-[rgba(64,157,233,0.9)]">
      Configure the segment to see a preview.
    </div>
  );
}
