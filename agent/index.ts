import { cli, voice } from "@livekit/agents"
import { ServerOptions } from "@livekit/agents"
import * as openai from "@livekit/agents-plugin-openai"

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1"
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY ?? ""

export default class LearningAgent extends voice.Agent {
  constructor() {
    super({
      instructions:
        "You are a friendly and knowledgeable learning assistant. " +
        "You help students understand concepts, quiz them, and provide " +
        "encouragement. Keep responses concise and conversational since " +
        "this is a voice interaction. Ask follow-up questions to check " +
        "understanding.",
      stt: new openai.STT({
        apiKey: AI_GATEWAY_API_KEY,
        baseURL: AI_GATEWAY_BASE_URL,
        language: "en",
      }),
      llm: new openai.LLM({
        model: "openai/gpt-4o-mini",
        apiKey: AI_GATEWAY_API_KEY,
        baseURL: AI_GATEWAY_BASE_URL,
      }),
      tts: new openai.TTS({
        apiKey: AI_GATEWAY_API_KEY,
        baseURL: AI_GATEWAY_BASE_URL,
      }),
    })
  }

  override async onEnter() {
    this.session.say(
      "Hi! I'm your learning assistant. What would you like to study today?",
      { allowInterruptions: true }
    )
  }
}

cli.runApp(
  new ServerOptions({
    agent: import.meta.filename,
  })
)
