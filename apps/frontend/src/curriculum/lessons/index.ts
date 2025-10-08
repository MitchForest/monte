import type { Lesson, Topic } from '../types';
import { multiplicationTopic } from './multiplication';

export const curriculumTopics: Topic[] = [multiplicationTopic];
export const curriculumLessons: Lesson[] = curriculumTopics.flatMap((topic) => topic.lessons);
