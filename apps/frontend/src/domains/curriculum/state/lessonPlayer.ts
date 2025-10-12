import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';
import { createActor, type ActorRefFrom, type SnapshotFrom } from 'xstate';

import {
  createLessonPlayerMachine,
  type PlayerEvent,
  type PlayerStatus,
} from '@monte/lesson-service';

type LessonPlayerMachine = ReturnType<typeof createLessonPlayerMachine>;
type LessonPlayerActor = ActorRefFrom<LessonPlayerMachine>;
type LessonPlayerSnapshot = SnapshotFrom<LessonPlayerMachine>;

export interface LessonPlayerController {
  actor: () => LessonPlayerActor | undefined;
  state: () => LessonPlayerSnapshot | undefined;
  send: (event: PlayerEvent) => void;
  status: () => PlayerStatus;
}

export const useLessonPlayer = (segmentCount: Accessor<number>): LessonPlayerController => {
  const [actor, setActor] = createSignal<LessonPlayerActor>();
  const [snapshot, setSnapshot] = createSignal<LessonPlayerSnapshot>();

  createEffect(() => {
    const total = Math.max(segmentCount(), 0);
    const machine = createLessonPlayerMachine(total);
    const instance = createActor(machine);
    const subscription = instance.subscribe((value) => setSnapshot(value));
    instance.start();
    setActor(instance);
    setSnapshot(instance.getSnapshot());

    onCleanup(() => {
      subscription.unsubscribe();
      instance.stop();
      setActor(undefined);
      setSnapshot(undefined);
    });
  });

  const send = (event: PlayerEvent) => {
    actor()?.send(event);
  };

  const status = () => snapshot()?.context.status ?? 'idle';

  return {
    actor,
    state: snapshot,
    send,
    status,
  };
};
