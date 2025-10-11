import { questionService, QuestionItem } from '@monte/question-service';
import graphService from '@monte/graph-service';

export type TaskKind = 'lesson' | 'drill' | 'quiz';

export interface TaskRequest {
  studentId: string;
  preferredKinds?: TaskKind[];
}

export interface TaskPayload {
  kind: TaskKind;
  skillIds: string[];
  questions: QuestionItem[];
}

export interface EngineService {
  selectNextTask(request: TaskRequest): Promise<TaskPayload | null>;
}

export const engineService: EngineService = {
  async selectNextTask() {
    void graphService; // placeholder dependency usage
    void questionService;
    return null;
  },
};

export default engineService;
