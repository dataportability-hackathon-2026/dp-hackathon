import { cli, defineAgent, llm, ServerOptions, voice } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

console.log("[voice-agent] Starting up...");
console.log("[voice-agent] env check:", {
  hasOpenAiKey: !!OPENAI_API_KEY,
  appUrl: APP_URL,
  hasLivekitUrl: !!process.env.LIVEKIT_URL,
  hasLivekitApiKey: !!process.env.LIVEKIT_API_KEY,
  hasLivekitApiSecret: !!process.env.LIVEKIT_API_SECRET,
  nodeEnv: process.env.NODE_ENV,
});

// Room reference captured during agent entry
let currentRoom = null;

async function callAppApi(toolName, input) {
  console.log("[voice-agent] callAppApi:", {
    toolName,
    appUrl: APP_URL,
    input,
  });
  try {
    const res = await fetch(`${APP_URL}/api/agent-tools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: toolName, input }),
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("[voice-agent] callAppApi failed:", {
        toolName,
        status: res.status,
        errorText,
      });
      return `Sorry, I couldn't do that right now. The server returned an error (${res.status}). ${errorText ? `Details: ${errorText}` : "Please try again."}`;
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      return `I sent the request but got an empty response from the server. The ${toolName.replace(/_/g, " ")} may not have been created. Please try again.`;
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return `I got an unexpected response from the server. Please try again.`;
    }

    if (
      !result ||
      (typeof result === "object" && Object.keys(result).length === 0)
    ) {
      return `The server returned an empty result. The ${toolName.replace(/_/g, " ")} may not have been created. Please try again.`;
    }

    if (result.error) {
      return `Sorry, there was a problem: ${result.error}`;
    }

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

    const label =
      result.type || toolName.replace(/_/g, " ").replace(/^create /, "");
    console.log("[voice-agent] callAppApi success:", {
      toolName,
      label,
      hasRoom: !!currentRoom,
    });
    return `I've created a ${label} for you. It should appear on your screen now.`;
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

/** Fill in required profile-aware fields with sensible defaults */
function withProfileDefaults(args) {
  return {
    ...args,
    calibrationAccuracy: args.calibrationAccuracy ?? "well-calibrated",
    cognitiveLoadRisk: args.cognitiveLoadRisk ?? "medium",
    metacognitiveAwareness: args.metacognitiveAwareness ?? "medium",
    coachingTone: args.coachingTone ?? "encouraging",
  };
}

const createQuiz = llm.tool({
  description:
    "Create a multiple-choice quiz to test the learner's understanding. Use when the learner asks to be quizzed or wants practice questions.",
  parameters: artifactParams,
  execute: async (args) =>
    callAppApi("create_adaptive_quiz", withProfileDefaults(args)),
});

const createFlashcards = llm.tool({
  description:
    "Create flashcards for active recall practice. Use when the learner wants to memorize key terms or review definitions.",
  parameters: artifactParams,
  execute: async (args) =>
    callAppApi("create_adaptive_flashcards", withProfileDefaults(args)),
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

const readSourceContent = llm.tool({
  description:
    "Read the full text content of an uploaded source file by its ID. Use this when the learner asks about a specific file's content, wants a summary, or you need to understand the material. Ask the learner for the file name or ID first.",
  parameters: z.object({
    sourceId: z.string().describe("The source file ID to read"),
  }),
  execute: async (args) => {
    try {
      const res = await fetch(`${APP_URL}/api/agent-tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "read_source_content", input: args }),
      });
      if (!res.ok) return `Sorry, I couldn't read that file (${res.status}).`;
      const result = await res.json();
      if (result.error) return `Sorry, there was a problem: ${result.error}`;
      // Summarize for voice — the full content may be too long to speak
      const preview = result.content?.slice(0, 2000) ?? "";
      return `Here is the content of "${result.filename}":\n\n${preview}${result.content?.length > 2000 ? "\n\n[Content truncated for voice. The full file has been loaded.]" : ""}`;
    } catch (err) {
      return `Sorry, I couldn't read that file. Error: ${err.message}`;
    }
  },
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
    studyStrategies: z.array(z.string()).describe("Preferred study strategies"),
    concepts: z.array(z.string()).describe("Concepts to cover"),
  }),
  execute: async (args) => callAppApi("create_learning_guide", args),
});

export default defineAgent({
  entry: async (ctx) => {
    console.log("[voice-agent] Agent entry called, connecting...");
    await ctx.connect();
    console.log("[voice-agent] Connected to room:", ctx.room.name);

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
        "IMPORTANT: Always respond in English, regardless of what language you think you hear. " +
        "\n\n" +
        "CRITICAL RULE — ALWAYS USE TOOLS FOR LEARNING MATERIALS:\n" +
        "You have tools to create quizzes, flashcards, mind maps, slides, 3D visualizations, and study guides. " +
        "When a student asks for ANY learning material (flashcards, quizzes, slides, mind maps, study plans, etc.), " +
        "you MUST call the appropriate tool. NEVER generate these materials as spoken text or a verbal list. " +
        "The tools render interactive UI components on the student's screen — speaking the content bypasses this entirely.\n\n" +
        "Tool mapping:\n" +
        "- 'create flashcards' / 'study cards' / 'help me memorize' → create_flashcards\n" +
        "- 'quiz me' / 'test me' / 'practice questions' → create_quiz\n" +
        "- 'mind map' / 'concept map' / 'show relationships' → create_mind_map\n" +
        "- 'slides' / 'presentation' / 'overview' → create_slides\n" +
        "- '3D' / 'visualize' / 'spatial' → create_spatial\n" +
        "- 'study plan' / 'schedule' / 'learning guide' → create_learning_guide\n" +
        "- 'what's in this file' / 'read my file' / 'summarize the document' → read_source_content (requires sourceId)\n\n" +
        "When you call a tool, tell the learner it will appear on their screen. " +
        "CRITICAL: After the artifact is created, respond with ONLY a brief 1-2 sentence summary and a follow-up question. " +
        "Do NOT read out, list, or describe the full contents of the artifact (nodes, questions, cards, slides, etc.) — the student can already see it on their screen. " +
        "For example, say 'I created a mind map covering the key property law concepts. Want to explore any area further?' " +
        "NEVER enumerate or describe individual nodes, questions, or cards from the artifact. " +
        "If you are unsure about the subject or concepts, ask clarifying questions BEFORE calling the tool — " +
        "but NEVER respond by reading out flashcard content, quiz questions, or other materials verbally instead of using the tool.",
      llm: model,
      tools: {
        create_quiz: createQuiz,
        create_flashcards: createFlashcards,
        create_mind_map: createMindMap,
        create_slides: createSlides,
        create_spatial: createSpatial,
        create_learning_guide: createLearningGuide,
        read_source_content: readSourceContent,
      },
    });

    // Track whether we've already sent the initial greeting
    let greeted = false;
    // Queue context that arrives before the session is ready
    let pendingContextMessages = null;
    // Session reference — set after session.start()
    let activeSession = null;

    async function sendGreeting(messages) {
      if (greeted || !activeSession) return;
      greeted = true;
      if (Array.isArray(messages) && messages.length > 0) {
        const recent = messages.slice(-20);
        console.log(
          "[voice-agent] Resuming with conversation context:",
          recent.length,
          "messages",
        );

        // Inject prior messages as actual conversation turns in the chat context
        const currentAgent = activeSession.currentAgent;
        const chatCtx = currentAgent.chatCtx.copy();
        for (const m of recent) {
          chatCtx.addMessage({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          });
        }
        await currentAgent.updateChatCtx(chatCtx);

        activeSession.generateReply({
          userInput:
            "The user just reconnected to the voice session. " +
            "Greet them warmly and briefly, picking up where you left off. " +
            "Do NOT re-introduce yourself from scratch. Do NOT repeat the full conversation.",
          instructions:
            "Keep the greeting short and conversational. You already have the full conversation " +
            "history in context, so just continue naturally.",
        });
      } else {
        console.log("[voice-agent] No prior messages, using default greeting");
        activeSession.generateReply({
          userInput:
            "Say hello and introduce yourself as CoreModel, a learning assistant. " +
            "Mention you can create quizzes, flashcards, and other study materials. " +
            "Ask what they'd like to study today.",
          instructions: "Keep the greeting short and natural.",
        });
      }
    }

    // Register data listener BEFORE session.start() to catch early messages
    ctx.room.on("dataReceived", (payload, _participant) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        console.log("[voice-agent] Data received from frontend:", data.type);

        if (data.type === "conversation_context" && !greeted) {
          pendingContextMessages = data.messages ?? [];
          console.log(
            "[voice-agent] Received conversation context:",
            pendingContextMessages.length,
            "messages",
          );
          // If session is already ready, send greeting immediately
          if (activeSession) {
            sendGreeting(pendingContextMessages).catch((err) =>
              console.error("[voice-agent] Failed to send greeting:", err),
            );
          }
        }

        if (
          data.type === "text_input" &&
          typeof data.text === "string" &&
          activeSession
        ) {
          activeSession.generateReply({
            userInput: data.text,
            instructions:
              "The user typed this message instead of speaking. Respond naturally via voice. " +
              "You can acknowledge that they typed it if relevant, but don't make a big deal of it.",
          });
        }
      } catch (err) {
        console.warn("[voice-agent] Failed to parse data message:", err);
      }
    });

    const session = new voice.AgentSession({});
    console.log("[voice-agent] Starting agent session...");
    await session.start({
      agent,
      room: ctx.room,
    });
    console.log("[voice-agent] Agent session started successfully");
    activeSession = session;

    // Process any context that arrived while session was starting
    if (pendingContextMessages !== null) {
      sendGreeting(pendingContextMessages).catch((err) =>
        console.error("[voice-agent] Failed to send greeting:", err),
      );
    }

    // Fallback: if no conversation context arrives within 8 seconds, send the default greeting.
    // The frontend sends context on connect and again when the agent participant joins,
    // so 8s gives ample time for the data channel to be established.
    setTimeout(() => {
      if (!greeted) {
        sendGreeting(null).catch((err) =>
          console.error("[voice-agent] Failed to send greeting:", err),
        );
      }
    }, 8000);
  },
});

console.log("[voice-agent] Registering CLI app...");
cli.runApp(
  new ServerOptions({
    agent: import.meta.filename,
  }),
);
console.log("[voice-agent] CLI app registered");
