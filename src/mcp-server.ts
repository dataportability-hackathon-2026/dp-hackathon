#!/usr/bin/env node
// @ts-nocheck - standalone MCP server, not part of Next.js build
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  generateFlashcards,
  generateMindMap,
  generateQuiz,
  generateSlides,
  generateSpatial,
} from "./lib/ai/generate-artifact";
import type { GuideInput } from "./lib/ai/generate-guide";
import { generateLearningGuide } from "./lib/ai/generate-guide";

const server = new McpServer({
  name: "coremodel",
  version: "1.0.0",
});

const artifactParams = {
  subject: z.string().describe("The subject or topic area"),
  concepts: z.array(z.string()).describe("Key concepts to cover"),
  priorKnowledgeLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("The learner's current knowledge level"),
  goalType: z
    .string()
    .describe("The learner's goal, e.g. 'exam prep', 'deep understanding'"),
};

server.tool(
  "create_quiz",
  "Create a multiple-choice quiz to test understanding of specific concepts",
  artifactParams,
  async (input) => {
    const result = await generateQuiz(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "create_flashcards",
  "Create flashcards for active recall practice",
  artifactParams,
  async (input) => {
    const result = await generateFlashcards(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "create_mind_map",
  "Create a hierarchical mind map showing relationships between concepts",
  artifactParams,
  async (input) => {
    const result = await generateMindMap(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "create_slides",
  "Create a slide deck summarizing key concepts",
  artifactParams,
  async (input) => {
    const result = await generateSlides(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "create_spatial",
  "Create a 3D spatial visualization of concepts",
  artifactParams,
  async (input) => {
    const result = await generateSpatial(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "create_learning_guide",
  "Create a structured 7-day learning guide with study blocks",
  {
    fieldOfStudy: z.string().describe("The subject area"),
    primaryGoal: z.string().describe("Main learning goal"),
    goalDescription: z.string().describe("Detailed description of the goal"),
    deadline: z.string().describe("Target completion date"),
    minutesPerDay: z.number().describe("Available study minutes per day"),
    daysPerWeek: z.number().describe("Days per week available to study"),
    sessionLength: z
      .enum(["short", "medium", "long"])
      .describe("Preferred session length"),
    priorKnowledgeLevel: z
      .enum(["beginner", "intermediate", "advanced"])
      .describe("Current knowledge level"),
    studyStrategies: z.array(z.string()).describe("Preferred study strategies"),
    concepts: z.array(z.string()).describe("Concepts to cover in the guide"),
  },
  async (input) => {
    const guideInput: GuideInput = {
      ...input,
      profileAnalysis: {
        summary: "Learner seeking a structured study plan.",
        strengths: ["Motivated", "Goal-oriented"],
        risks: [
          {
            area: "Time management",
            severity: "medium",
            description: "May need help pacing",
            mitigation: "Built-in breaks and checkpoints",
          },
        ],
        recommendedStrategies: [
          {
            strategy: "Active recall",
            rationale: "Evidence-based retention",
            priority: "primary",
          },
          {
            strategy: "Spaced repetition",
            rationale: "Long-term memory formation",
            priority: "secondary",
          },
        ],
        cognitiveProfile: {
          reflectivenessLevel: "medium",
          metacognitiveAwareness: "medium",
          calibrationAccuracy: "well-calibrated",
        },
        coachingApproach: {
          tone: "Encouraging and structured",
          feedbackFrequency: "daily",
          motivationalFocus: "competence",
        },
      },
    };
    const result = await generateLearningGuide(guideInput);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
