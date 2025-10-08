export type DemoEventPayload =
  | {
      type: 'segment.start';
      lessonId: string;
      segmentId: string;
    }
  | {
      type: 'segment.end';
      lessonId: string;
      segmentId: string;
      reason: 'manual-complete' | 'narration-complete' | 'skipped';
    }
  | {
      type: 'audio.play';
      lessonId: string;
      segmentId: string;
      replay: boolean;
    }
  | {
      type: 'audio.pause';
      lessonId: string;
      segmentId: string;
    }
  | {
      type: 'audio.end';
      lessonId: string;
      segmentId: string;
    }
  | {
      type: 'audio.error';
      lessonId: string;
      segmentId: string;
      message: string;
    }
  | {
      type: 'hint.used';
      lessonId: string;
      segmentId: string;
      questionId: string;
      remediationId?: string;
    }
  | {
      type: 'practice.check';
      lessonId: string;
      segmentId: string;
      questionId: string;
      success: boolean;
      attempts: number;
    }
  | {
    type: 'notes.updated';
    lessonId: string;
    segmentId: string;
    content: string;
  };

export type DemoEvent = DemoEventPayload & { timestamp: number };

export type DemoEventRecorder = (payload: DemoEventPayload) => void;
