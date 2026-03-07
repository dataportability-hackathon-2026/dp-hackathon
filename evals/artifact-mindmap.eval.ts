import { evalite } from "evalite";
import type { ArtifactInput } from "../src/lib/ai/generate-artifact";
import { generateMindMap } from "../src/lib/ai/generate-artifact";
import type { MindMapArtifactData } from "../src/lib/ai/schemas";
import { LINEAR_ALGEBRA_CONCEPTS, ML_CONCEPTS } from "./fixtures";
import { mindMapTreeValidity } from "./scorers";

type MindMapEvalInput = ArtifactInput & { concepts: string[] };

const mindMapConceptCoverage = {
  name: "Mind Map Concept Coverage",
  description: "Checks that all input concepts appear as nodes in the mind map",
  scorer: ({
    input,
    output,
  }: {
    input: MindMapEvalInput;
    output: MindMapArtifactData;
  }) => {
    const labels = output.nodes.map((n) => n.label.toLowerCase());
    let covered = 0;
    for (const concept of input.concepts) {
      const found = labels.some(
        (l) =>
          l.includes(concept.toLowerCase()) ||
          concept.toLowerCase().includes(l),
      );
      if (found) covered++;
    }
    return covered / input.concepts.length;
  },
};

const mindMapDepth = {
  name: "Mind Map Depth",
  description: "Checks that the tree has at least 3 levels of depth",
  scorer: ({
    output,
  }: {
    input: MindMapEvalInput;
    output: MindMapArtifactData;
  }) => {
    const nodeMap = new Map<string, string | null>();
    for (const n of output.nodes) {
      nodeMap.set(n.id, n.parentId);
    }

    let maxDepth = 0;
    for (const node of output.nodes) {
      let depth = 0;
      let current: string | null = node.id;
      while (current) {
        const parent = nodeMap.get(current);
        if (!parent) break;
        depth++;
        current = parent;
      }
      maxDepth = Math.max(maxDepth, depth);
    }

    if (maxDepth >= 3) return 1;
    if (maxDepth === 2) return 0.7;
    return 0.3;
  },
};

evalite<MindMapEvalInput, MindMapArtifactData>("Mind Map Artifact Generation", {
  data: () => [
    {
      input: {
        subject: "Linear Algebra",
        concepts: LINEAR_ALGEBRA_CONCEPTS,
        priorKnowledgeLevel: "beginner",
        goalType: "exam",
      },
      expected: undefined,
    },
    {
      input: {
        subject: "Machine Learning",
        concepts: ML_CONCEPTS,
        priorKnowledgeLevel: "advanced",
        goalType: "fluency",
      },
      expected: undefined,
    },
  ],
  task: async (input) => {
    return generateMindMap(input);
  },
  scorers: [mindMapTreeValidity, mindMapConceptCoverage, mindMapDepth],
});
