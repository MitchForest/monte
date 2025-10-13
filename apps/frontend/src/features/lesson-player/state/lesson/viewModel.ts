import { createLessonState } from './state';
import { createLessonActions } from './actions';

export const useLessonViewModel = () => {
  const state = createLessonState();
  const actions = createLessonActions(state);
  return { state, actions } as const;
};
