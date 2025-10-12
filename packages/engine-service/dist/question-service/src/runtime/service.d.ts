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
export declare const questionService: QuestionService;
export default questionService;
//# sourceMappingURL=service.d.ts.map