import { CurriculumSkill } from '@monte/types';
export type SkillGraphNode = CurriculumSkill & {
    prerequisites?: string[];
    dependents?: string[];
};
export interface GraphService {
    getCanonicalGraph(): Promise<Record<string, SkillGraphNode>>;
    getStudentGraph(studentId: string): Promise<Record<string, SkillGraphNode>>;
}
export declare const graphService: GraphService;
export default graphService;
//# sourceMappingURL=service.d.ts.map