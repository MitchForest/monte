import { createRoot, createSignal } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { useLessonPlayer } from '../lessonPlayer';

describe('useLessonPlayer', () => {
  it('drives the lesson player state machine', () => {
    createRoot((dispose) => {
      const [segments, setSegments] = createSignal(3);

      const controller = useLessonPlayer(segments);

      expect(controller.state()?.context.total).toBe(3);
      expect(controller.status()).toBe('idle');

      controller.send({ type: 'PLAY' });
      expect(controller.status()).toBe('playing');

      controller.send({ type: 'NEXT' });
      expect(controller.state()?.context.index).toBe(1);
      expect(controller.status()).toBe('idle');

      setSegments(1);
      expect(controller.state()?.context.total).toBe(1);
      expect(controller.state()?.context.index).toBe(0);

      dispose();
    });
  });
});
