import HomePageComponent from './pages/HomePage';
import UnitPageComponent from './pages/UnitPage';
import LessonPageComponent from './pages/LessonPage';

export {
  ProgressProvider,
  useProgress,
  getLessonTaskStatus,
  getLessonOrderedTasks,
  type TaskStatus,
} from './state/progress';
export { useLessonViewModel } from './state/lesson/viewModel';
export type { LessonAvailability, LessonState, LessonScenario } from './state/lesson/state';
export { CurriculumAccessNotice, type CurriculumAvailabilityStatus } from './components/CurriculumAccessNotice';
export { LessonCanvas } from './components/LessonCanvas';
export * from './components/canvas';
export { safeBuildLessonTasks, buildLessonTasks } from './utils/lessonTasks';
export { resolveNarrationAssets } from './utils/assets';
export { curriculumMaterials } from '../../shared/curriculum/materials';
export * from './utils/timeline';
export * as LessonPlayerAnalytics from './utils/analytics/events';
export const HomePage = HomePageComponent;
export const UnitPage = UnitPageComponent;
export const LessonPage = LessonPageComponent;
