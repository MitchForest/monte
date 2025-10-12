// src/index.ts
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
var BaseQuestionItemSchema = z.object({
  prompt: z.string(),
  answer: z.union([z.string(), z.number()]),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();
var LessonBucketsSchema = z.object({
  presentation: z.array(BaseQuestionItemSchema).optional(),
  guided: z.array(BaseQuestionItemSchema).optional(),
  independent: z.array(BaseQuestionItemSchema).optional()
}).strict();
var DrillBucketsSchema = z.object({
  mentalMath: z.array(BaseQuestionItemSchema).optional()
}).strict();
var QuizBucketsSchema = z.object({
  mastery: z.array(BaseQuestionItemSchema).optional(),
  fluency: z.array(BaseQuestionItemSchema).optional()
}).strict();
var SkillQuestionBankSchema = z.object({
  lesson: LessonBucketsSchema.optional(),
  drill: DrillBucketsSchema.optional(),
  quiz: QuizBucketsSchema.optional()
}).strict();
var DIFFICULTY_FALLBACK = "medium";
var QUESTIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../questions"
);
var bankCache = /* @__PURE__ */ new Map();
async function loadQuestionBank(skillId) {
  if (bankCache.has(skillId)) {
    return bankCache.get(skillId) ?? null;
  }
  const filePath = path.join(QUESTIONS_DIR, `${skillId}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = SkillQuestionBankSchema.parse(JSON.parse(raw));
    bankCache.set(skillId, parsed);
    return parsed;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.warn(
        `[question-service] Failed to load question bank for skill ${skillId}`,
        error
      );
    }
    bankCache.set(skillId, null);
    return null;
  }
}
function normalizeItems(items, skillId) {
  if (!items?.length) {
    return [];
  }
  return items.map((item) => ({
    prompt: item.prompt,
    answer: item.answer,
    difficulty: item.difficulty ?? DIFFICULTY_FALLBACK,
    skillId,
    metadata: item.metadata
  }));
}
function takeRandom(items, count) {
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
var questionService = {
  async generate(options) {
    const { skillIds, context, mode, phase, limit, shuffle } = options;
    if (!skillIds.length) {
      return [];
    }
    const collected = [];
    for (const skillId of skillIds) {
      const bank = await loadQuestionBank(skillId);
      if (!bank) continue;
      if (context === "drill") {
        const mentalItems = normalizeItems(bank.drill?.mentalMath, skillId);
        collected.push(...mentalItems);
      } else if (context === "lesson") {
        const bucket = phase === "presentation" ? bank.lesson?.presentation : phase === "guided" ? bank.lesson?.guided : phase === "independent" ? bank.lesson?.independent : void 0;
        collected.push(...normalizeItems(bucket, skillId));
      } else if (context === "quiz") {
        const quizBucket = mode === "fluency" ? bank.quiz?.fluency : bank.quiz?.mastery;
        collected.push(...normalizeItems(quizBucket, skillId));
      }
    }
    const unique = /* @__PURE__ */ new Map();
    for (const item of collected) {
      const key = `${item.skillId}:${item.prompt}:${item.answer}`;
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    }
    let results = Array.from(unique.values());
    if (shuffle) {
      results = takeRandom(results, limit ?? results.length);
    } else if (typeof limit === "number" && limit < results.length) {
      results = results.slice(0, limit);
    }
    return results;
  },
  async logResult() {
    return;
  }
};
var index_default = questionService;
export {
  index_default as default,
  questionService
};
//# sourceMappingURL=index.js.map