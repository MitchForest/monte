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
      type: 'canvas.viewport';
      lessonId: string;
      segmentId: string;
      scale: number;
      offset: {
        x: number;
        y: number;
      };
    }
  | {
      type: 'inventory.delta';
      lessonId: string;
      segmentId: string;
      bankId: string;
      tokenTypeId: string;
      delta: number;
      reason: 'consume' | 'replenish';
    }
  | {
    type: 'notes.updated';
    lessonId: string;
    segmentId: string;
    content: string;
  };

export type DemoEvent = DemoEventPayload & { timestamp: number };

export type DemoEventRecorder = (payload: DemoEventPayload) => void;
