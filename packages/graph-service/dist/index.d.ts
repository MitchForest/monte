import { CurriculumSkill } from '@monte/types';

type SkillGraphNode = CurriculumSkill & {
    prerequisites?: string[];
    dependents?: string[];
};
interface GraphService {
    getCanonicalGraph(): Promise<Record<string, SkillGraphNode>>;
    getStudentGraph(studentId: string): Promise<Record<string, SkillGraphNode>>;
}
declare const graphService: GraphService;

export { type GraphService, type SkillGraphNode, graphService as default, graphService };
