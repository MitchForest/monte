type QuestionContext = 'lesson' | 'drill' | 'quiz';
interface GenerateOptions {
    skillIds: string[];
    context: QuestionContext;
    phase?: 'presentation' | 'guided' | 'independent';
    mode?: 'mental-math' | 'mastery' | 'fluency';
    limit?: number;
    shuffle?: boolean;
}
interface QuestionItem {
    prompt: string;
    answer: string | number;
    difficulty: 'easy' | 'medium' | 'hard';
    skillId: string;
    metadata?: Record<string, unknown>;
}
interface QuestionService {
    generate(options: GenerateOptions): Promise<QuestionItem[]>;
    logResult(result: {
        skillId: string;
        context: QuestionContext;
        difficulty: 'easy' | 'medium' | 'hard';
        correct: boolean;
        latencySec?: number;
    }): Promise<void>;
}
declare const questionService: QuestionService;

export { type GenerateOptions, type QuestionContext, type QuestionItem, type QuestionService, questionService as default, questionService };
