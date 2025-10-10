import { Component, For } from 'solid-js';

export interface LessonTimelineProps {
  segments: { id: string; title: string; type: string }[];
  activeIndex: number;
  onSelect?: (index: number) => void;
  currentActionIndex?: number;
  totalActions?: number;
  showActionProgress?: boolean;
}

export const LessonTimeline: Component<LessonTimelineProps> = (props) => {
  const segmentCount = () => props.segments.length;
  const progressPercent = () => {
    const count = segmentCount();
    if (count <= 1) return 100;
    
    // If in presentation segment with actions, calculate action-level progress
    if (props.showActionProgress && props.totalActions && props.totalActions > 0) {
      const actionProgress = props.currentActionIndex ?? 0;
      const actionPercent = props.totalActions <= 1 ? 100 : (actionProgress / (props.totalActions - 1)) * 100;
      const segmentSize = 100 / (count - 1);
      const segmentStartPercent = props.activeIndex * segmentSize;
      
      // Progress = segment start + (action progress within segment)
      return segmentStartPercent + (actionPercent * segmentSize / 100);
    }
    
    return (props.activeIndex / (count - 1)) * 100;
  };

  return (
    <div class="lesson-timeline" aria-label="Lesson timeline">
      <div class="lesson-timeline-track">
        <div
          class="lesson-timeline-progress"
          style={{ width: `${progressPercent()}%` }}
        />
        <For each={props.segments}>
          {(segment, index) => {
            const count = segmentCount();
            const position = count <= 1 ? 0 : (index() / (count - 1)) * 100;
            const isCurrent = index() === props.activeIndex;

            return (
              <button
                type="button"
                class={`lesson-timeline-dot ${isCurrent ? 'lesson-timeline-dot--active' : ''}`}
                style={{ left: `${position}%` }}
                title={segment.title}
                aria-label={`${segment.title} (${segment.type.replace('-', ' ')})`}
                onClick={() => props.onSelect?.(index())}
                data-type={segment.type}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
};
