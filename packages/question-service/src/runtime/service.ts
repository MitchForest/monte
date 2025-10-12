import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

export type QuestionContext = 'lesson' | 'drill' | 'quiz';

export interface GenerateOptions {
  skillIds: string[];
  context: QuestionContext;
  phase?: 'presentation' | 'guided' | 'independent';
  mode?: 'mental-math' | 'mastery' | 'fluency';
  limit?: number;
  shuffle?: boolean;
}

export interface QuestionItem {
  prompt: string;
  answer: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  skillId: string;
  metadata?: Record<string, unknown>;
}

const BaseQuestionItemSchema = z
  .object({
    prompt: z.string(),
    answer: z.union([z.string(), z.number()]),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
type BaseQuestionItem = z.infer<typeof BaseQuestionItemSchema>;

const LessonBucketsSchema = z
  .object({
    presentation: z.array(BaseQuestionItemSchema).optional(),
    guided: z.array(BaseQuestionItemSchema).optional(),
    independent: z.array(BaseQuestionItemSchema).optional(),
  })
  .strict();
type LessonBuckets = z.infer<typeof LessonBucketsSchema>;

const DrillBucketsSchema = z
  .object({
    mentalMath: z.array(BaseQuestionItemSchema).optional(),
  })
  .strict();
type DrillBuckets = z.infer<typeof DrillBucketsSchema>;

const QuizBucketsSchema = z
  .object({
    mastery: z.array(BaseQuestionItemSchema).optional(),
    fluency: z.array(BaseQuestionItemSchema).optional(),
  })
  .strict();
type QuizBuckets = z.infer<typeof QuizBucketsSchema>;

const SkillQuestionBankSchema = z
  .object({
    lesson: LessonBucketsSchema.optional(),
    drill: DrillBucketsSchema.optional(),
    quiz: QuizBucketsSchema.optional(),
  })
  .strict();
type SkillQuestionBank = z.infer<typeof SkillQuestionBankSchema>;

const DIFFICULTY_FALLBACK: QuestionItem['difficulty'] = 'medium';
const QUESTIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../questions'
);

const bankCache = new Map<string, SkillQuestionBank | null>();

async function loadQuestionBank(skillId: string): Promise<SkillQuestionBank | null> {
  if (bankCache.has(skillId)) {
    return bankCache.get(skillId) ?? null;
  }

  const filePath = path.join(QUESTIONS_DIR, `${skillId}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = SkillQuestionBankSchema.parse(JSON.parse(raw));
    bankCache.set(skillId, parsed);
    return parsed;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn(
        `[question-service] Failed to load question bank for skill ${skillId}`,
        error,
      );
    }
    bankCache.set(skillId, null);
    return null;
  }
}

function normalizeItems(items: BaseQuestionItem[] | undefined, skillId: string): QuestionItem[] {
  if (!items?.length) {
    return [];
  }

  return items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    difficulty: item.difficulty ?? DIFFICULTY_FALLBACK,
    skillId,
    metadata: item.metadata,
  }));
}

function takeRandom<T>(items: T[], count: number): T[] {
  if (count >= items.length) {
    return items;
  }
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export interface QuestionService {
  generate(options: GenerateOptions): Promise<QuestionItem[]>;
  logResult(result: {
    skillId: string;
    context: QuestionContext;
    difficulty: 'easy' | 'medium' | 'hard';
    correct: boolean;
    latencySec?: number;
  }): Promise<void>;
}

export const questionService: QuestionService = {
  async generate(options) {
    const { skillIds, context, mode, phase, limit, shuffle } = options;
    if (!skillIds.length) {
      return [];
    }

    const collected: QuestionItem[] = [];

    for (const skillId of skillIds) {
      const bank = await loadQuestionBank(skillId);
      if (!bank) continue;

      if (context === 'drill') {
        const mentalItems = normalizeItems(bank.drill?.mentalMath, skillId);
        collected.push(...mentalItems);
      } else if (context === 'lesson') {
        const bucket =
          phase === 'presentation'
            ? bank.lesson?.presentation
            : phase === 'guided'
            ? bank.lesson?.guided
            : phase === 'independent'
            ? bank.lesson?.independent
            : undefined;
        collected.push(...normalizeItems(bucket, skillId));
      } else if (context === 'quiz') {
        const quizBucket = mode === 'fluency' ? bank.quiz?.fluency : bank.quiz?.mastery;
        collected.push(...normalizeItems(quizBucket, skillId));
      }
    }

    const unique = new Map<string, QuestionItem>();
    for (const item of collected) {
      const key = `${item.skillId}:${item.prompt}:${item.answer}`;
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    }
    let results = Array.from(unique.values());

    if (shuffle) {
      results = takeRandom(results, limit ?? results.length);
    } else if (typeof limit === 'number' && limit < results.length) {
      results = results.slice(0, limit);
    }

    return results;
  },

  async logResult() {
    // Intentionally a no-op for now. Expect future implementations to persist outcomes.
    return;
  },
};

export default questionService;
