import { QuestionItem } from '@monte/question-service';
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
export declare const engineService: EngineService;
export default engineService;
//# sourceMappingURL=service.d.ts.map