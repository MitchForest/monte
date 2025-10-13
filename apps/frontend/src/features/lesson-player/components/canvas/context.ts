import { createContext, useContext } from 'solid-js';

import type { LessonCanvasContextValue } from './types';

export const LessonCanvasContext = createContext<LessonCanvasContextValue>();

export const useLessonCanvasContext = () => {
  const context = useContext(LessonCanvasContext);
  if (!context) {
    throw new Error('useLessonCanvasContext must be used within a LessonCanvas provider.');
  }
  return context;
};
