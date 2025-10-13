import { curriculumDomainGraphs } from '@monte/curriculum-service';
import type { CurriculumSkill } from '@monte/types';

export type SkillGraphNode = CurriculumSkill & {
  prerequisites?: string[];
  dependents?: string[];
};

export interface GraphService {
  getCanonicalGraph(): Promise<Record<string, SkillGraphNode>>;
  getStudentGraph(studentId: string): Promise<Record<string, SkillGraphNode>>;
}

type DomainGraph = (typeof curriculumDomainGraphs)[keyof typeof curriculumDomainGraphs];
type GraphEdge = DomainGraph['edges'][number];
type GraphSkill = DomainGraph['skills'][number];

const buildCanonicalGraph = (): Record<string, SkillGraphNode> => {
  const nodes = new Map<string, SkillGraphNode>();
  const prerequisites = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();

  const registerEdge = ({ sourceSkillId, targetSkillId }: GraphEdge) => {
    if (!prerequisites.has(targetSkillId)) {
      prerequisites.set(targetSkillId, new Set());
    }
    prerequisites.get(targetSkillId)!.add(sourceSkillId);

    if (!dependents.has(sourceSkillId)) {
      dependents.set(sourceSkillId, new Set());
    }
    dependents.get(sourceSkillId)!.add(targetSkillId);
  };

  const registerSkill = (skill: GraphSkill) => {
    if (!nodes.has(skill.id)) {
      nodes.set(skill.id, {
        ...skill,
        prerequisites: undefined,
        dependents: undefined,
      });
    }
  };

  for (const graph of Object.values(curriculumDomainGraphs)) {
    graph.skills.forEach(registerSkill);
    graph.edges.forEach(registerEdge);
  }

  for (const [skillId, node] of nodes) {
    const prereq = prerequisites.get(skillId);
    const depend = dependents.get(skillId);
    if (prereq && prereq.size > 0) {
      node.prerequisites = Array.from(prereq);
    }
    if (depend && depend.size > 0) {
      node.dependents = Array.from(depend);
    }
  }

  return Object.fromEntries(nodes.entries());
};

const canonicalGraph = buildCanonicalGraph();

const cloneGraph = (graph: Record<string, SkillGraphNode>): Record<string, SkillGraphNode> =>
  Object.fromEntries(
    Object.entries(graph).map(([id, node]) => [
      id,
      {
        ...node,
        prerequisites: node.prerequisites ? [...node.prerequisites] : undefined,
        dependents: node.dependents ? [...node.dependents] : undefined,
      },
    ]),
  );

export const graphService: GraphService = {
  async getCanonicalGraph() {
    return cloneGraph(canonicalGraph);
  },
  async getStudentGraph() {
    // Student overlays are not implemented yet; return canonical graph for now.
    return cloneGraph(canonicalGraph);
  },
};

export const isGraphServiceReady = () => Object.keys(canonicalGraph).length > 0;

export default graphService;
