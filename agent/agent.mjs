import { cli, voice, llm, defineAgent } from "@livekit/agents";
import { ServerOptions } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Room reference captured during agent entry
let currentRoom = null;

async function callAppApi(toolName, input) {
  try {
    const res = await fetch(`${APP_URL}/api/agent-tools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: toolName, input }),
    });
    if (!res.ok) {
      return `Failed to create artifact: ${res.status}`;
    }
    const result = await res.json();

    // Send artifact data to frontend via data channel
    if (currentRoom?.localParticipant) {
      const encoder = new TextEncoder();
      const payload = JSON.stringify({
        type: "artifact",
        tool: toolName,
        data: result,
      });
      await currentRoom.localParticipant.publishData(encoder.encode(payload), {
        reliable: true,
      });
    }

    return `I've created a ${result.type} for you. It should appear on your screen now.`;
  } catch (err) {
    return `Sorry, I wasn't able to create that right now. Error: ${err.message}`;
  }
}

const artifactParams = z.object({
  subject: z.string().describe("The subject or topic area"),
  concepts: z.array(z.string()).describe("Key concepts to cover"),
  priorKnowledgeLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("The learner's current knowledge level"),
  goalType: z
    .string()
    .describe("The learner's goal, e.g. 'exam prep', 'deep understanding'"),
});

const createQuiz = llm.tool({
  description:
    "Create a multiple-choice quiz to test the learner's understanding. Use when the learner asks to be quizzed or wants practice questions.",
  parameters: artifactParams,
  execute: async (args) => callAppApi("create_quiz", args),
});

const createFlashcards = llm.tool({
  description:
    "Create flashcards for active recall practice. Use when the learner wants to memorize key terms or review definitions.",
  parameters: artifactParams,
  execute: async (args) => callAppApi("create_flashcards", args),
});

const createMindMap = llm.tool({
  description:
    "Create a mind map showing relationships between concepts. Use when the learner wants to visualize connections.",
  parameters: artifactParams,
  execute: async (args) => callAppApi("create_mind_map", args),
});

const createSlides = llm.tool({
  description:
    "Create a slide deck summarizing key concepts. Use when the learner wants a review presentation or overview.",
  parameters: artifactParams,
  execute: async (args) => callAppApi("create_slides", args),
});

const createSpatial = llm.tool({
  description:
    "Create a 3D spatial visualization of concepts. Use for spatial reasoning like molecular structures or system architectures.",
  parameters: artifactParams,
  execute: async (args) => callAppApi("create_spatial", args),
});

const createLearningGuide = llm.tool({
  description:
    "Create a structured 7-day learning guide with study blocks. Use when the learner wants a study plan or weekly schedule.",
  parameters: z.object({
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
    studyStrategies: z
      .array(z.string())
      .describe("Preferred study strategies"),
    concepts: z.array(z.string()).describe("Concepts to cover"),
  }),
  execute: async (args) => callAppApi("create_learning_guide", args),
});

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();

    // Capture room reference for tool data channel messages
    currentRoom = ctx.room;

    const model = new openai.realtime.RealtimeModel({
      model: "gpt-4o-realtime-preview",
      apiKey: OPENAI_API_KEY,
      voice: "alloy",
      turnDetection: {
        type: "semantic_vad",
        eagerness: "high",
        create_response: true,
        interrupt_response: true,
      },
    });

    const agent = new voice.Agent({
      instructions:
        "You are a friendly and knowledgeable learning assistant called CoreModel. " +
        "You help students understand concepts, quiz them, and provide encouragement. " +
        "Keep responses concise and conversational since this is a voice interaction. " +
        "You have tools to create learning artifacts like quizzes, flashcards, mind maps, " +
        "slides, 3D visualizations, and study guides. Use them proactively when relevant. " +
        "When you create an artifact, tell the learner it will appear on their screen. " +
        "Ask follow-up questions to check understanding.",
      llm: model,
      tools: {
        create_quiz: createQuiz,
        create_flashcards: createFlashcards,
        create_mind_map: createMindMap,
        create_slides: createSlides,
        create_spatial: createSpatial,
        create_learning_guide: createLearningGuide,
      },
    });

    const session = new voice.AgentSession({});
    await session.start({
      agent,
      room: ctx.room,
    });

    // Listen for text messages sent from the frontend via data channel
    ctx.room.on("dataReceived", (payload, participant) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === "text_input" && typeof data.text === "string") {
          // Inject typed text as user input so the voice agent can respond
          session.generateReply({
            userInput: data.text,
            instructions:
              "The user typed this message instead of speaking. Respond naturally via voice. " +
              "You can acknowledge that they typed it if relevant, but don't make a big deal of it.",
          });
        }
      } catch {
        // Ignore malformed data
      }
    });

    session.generateReply({
      userInput:
        "Say hello and introduce yourself as CoreModel, a learning assistant. " +
        "Mention you can create quizzes, flashcards, and other study materials. " +
        "Ask what they'd like to study today.",
      instructions: "Keep the greeting short and natural.",
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: import.meta.filename,
  })
);
