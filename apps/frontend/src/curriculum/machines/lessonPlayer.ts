import { assign, createMachine } from 'xstate';

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'completed';

interface PlayerContext {
  index: number;
  total: number;
  status: PlayerStatus;
}

export type PlayerEvent =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'COMPLETE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_INDEX'; index: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const createLessonPlayerMachine = (totalSegments: number) =>
  createMachine({
    types: {} as {
      context: PlayerContext;
      events: PlayerEvent;
    },
    id: 'lessonPlayer',
    context: {
      index: 0,
      total: Math.max(totalSegments, 0),
      status: 'idle',
    },
    initial: 'idle',
    states: {
      idle: {
        entry: assign(() => ({ status: 'idle' })),
        on: {
          PLAY: '#lessonPlayer.playing',
        },
      },
      playing: {
        entry: assign(() => ({ status: 'playing' })),
        on: {
          PAUSE: '#lessonPlayer.paused',
          COMPLETE: [
            {
              guard: ({ context }) => context.index >= Math.max(context.total - 1, 0),
              target: '#lessonPlayer.finished',
            },
            {
              target: '#lessonPlayer.idle',
              actions: assign(({ context }) => {
                const lastIndex = Math.max(context.total - 1, 0);
                return {
                  index: Math.min(context.index + 1, lastIndex),
                  status: 'idle',
                };
              }),
            },
          ],
          NEXT: {
            target: '#lessonPlayer.idle',
            actions: assign(({ context }) => {
              const lastIndex = Math.max(context.total - 1, 0);
              return {
                index: Math.min(context.index + 1, lastIndex),
                status: 'idle',
              };
            }),
          },
          PREV: {
            target: '#lessonPlayer.idle',
            actions: assign(({ context }) => ({
              index: Math.max(context.index - 1, 0),
              status: 'idle',
            })),
          },
        },
      },
      paused: {
        entry: assign(() => ({ status: 'paused' })),
        on: {
          PLAY: '#lessonPlayer.playing',
          STOP: '#lessonPlayer.idle',
        },
      },
      finished: {
        entry: assign(() => ({ status: 'completed' })),
        type: 'final',
        on: {
          STOP: '#lessonPlayer.idle',
        },
      },
    },
    on: {
      SET_INDEX: {
        target: '#lessonPlayer.idle',
        actions: assign(({ event, context }) => {
          if (event.type !== 'SET_INDEX') return {};
          return {
            index: clamp(event.index, 0, Math.max(context.total - 1, 0)),
            status: 'idle',
          } satisfies Partial<PlayerContext>;
        }),
      },
      PREV: {
        target: '#lessonPlayer.idle',
        actions: assign(({ context }) => ({
          index: Math.max(context.index - 1, 0),
          status: 'idle',
        })),
      },
      NEXT: {
        target: '#lessonPlayer.idle',
        actions: assign(({ context }) => {
          const lastIndex = Math.max(context.total - 1, 0);
          return {
            index: Math.min(context.index + 1, lastIndex),
            status: 'idle',
          };
        }),
      },
      STOP: {
        target: '#lessonPlayer.idle',
        actions: assign(() => ({ status: 'idle' })),
      },
    },
  });
