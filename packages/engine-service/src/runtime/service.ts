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
  selectNextTask(request: TaskRequest): Promise<TaskSelectionResult>;
}

const readEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined') return undefined;
  const value = process.env?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const ENGINE_SERVICE_ENABLED = readEnv('ENGINE_SERVICE_ENABLED') === 'true';
const ENGINE_SERVICE_QUESTION_LIMIT = Number.parseInt(readEnv('ENGINE_SERVICE_QUESTION_LIMIT') ?? '3', 10);

let disabledNoticeLogged = false;

const ensureEnabled = () => {
  if (!ENGINE_SERVICE_ENABLED) {
    if (!disabledNoticeLogged) {
      console.info(
        '[engine-service] Disabled. Set ENGINE_SERVICE_ENABLED=true to enable task selection.',
      );
      disabledNoticeLogged = true;
    }
    return false;
  }
  return true;
};

const chooseSkillIds = (skillIds: string[], count: number): string[] => {
  if (skillIds.length <= count) {
    return [...skillIds];
  }
  const pool = [...skillIds];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count);
};

const resolveTaskKind = (preferredKinds?: TaskKind[]): TaskKind => {
  if (preferredKinds?.length) {
    return preferredKinds[0];
  }
  return 'lesson';
};

export const isEngineServiceEnabled = () => ENGINE_SERVICE_ENABLED;

export type TaskSelectionResult =
  | { status: 'disabled'; reason: string }
  | { status: 'no-graph'; reason: string }
  | { status: 'no-questions'; reason: string; skillIds: string[] }
  | { status: 'ok'; payload: TaskPayload };

type SkillGraphRecord = Record<string, { prerequisites?: string[]; dependents?: string[] }>;

type GraphServiceApi = {
  getCanonicalGraph(): Promise<SkillGraphRecord>;
  getStudentGraph(studentId: string): Promise<SkillGraphRecord>;
};

export const engineService: EngineService = {
  async selectNextTask(request) {
    if (!ensureEnabled()) {
      return {
        status: 'disabled',
        reason: 'Engine service is disabled. Set ENGINE_SERVICE_ENABLED=true to enable task selection.',
      };
    }

    const canonicalGraph = await (graphService as unknown as GraphServiceApi).getCanonicalGraph();
    const skillIds = Object.keys(canonicalGraph);
    if (skillIds.length === 0) {
      console.warn('[engine-service] No skills available in canonical graph.');
      return {
        status: 'no-graph',
        reason: 'Canonical skill graph is empty. Ensure curriculum-domain graphs are configured.',
      };
    }

    const selection = chooseSkillIds(skillIds, Math.max(1, ENGINE_SERVICE_QUESTION_LIMIT));
    const kind = resolveTaskKind(request.preferredKinds);

    const questionContext: Parameters<typeof questionService.generate>[0]['context'] =
      kind === 'quiz' ? 'quiz' : kind === 'drill' ? 'drill' : 'lesson';

    const questions = await questionService.generate({
      skillIds: selection,
      context: questionContext,
      phase: kind === 'lesson' ? 'guided' : undefined,
      mode: kind === 'quiz' ? 'mastery' : undefined,
      limit: ENGINE_SERVICE_QUESTION_LIMIT,
      shuffle: true,
    });

    if (questions.length === 0) {
      console.warn(
        '[engine-service] No questions available for selected skills:',
        selection.join(', '),
      );
      return {
        status: 'no-questions',
        reason: 'Question service returned no items for the selected skills.',
        skillIds: selection,
      };
    }

    return {
      status: 'ok',
      payload: {
        kind,
        skillIds: selection,
        questions,
      },
    };
  },
};

export default engineService;
