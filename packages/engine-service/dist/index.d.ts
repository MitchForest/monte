import { QuestionItem } from '@monte/question-service';

type TaskKind = 'lesson' | 'drill' | 'quiz';
interface TaskRequest {
    studentId: string;
    preferredKinds?: TaskKind[];
}
interface TaskPayload {
    kind: TaskKind;
    skillIds: string[];
    questions: QuestionItem[];
}
interface EngineService {
    selectNextTask(request: TaskRequest): Promise<TaskPayload | null>;
}
declare const engineService: EngineService;

export { type EngineService, type TaskKind, type TaskPayload, type TaskRequest, engineService as default, engineService };
