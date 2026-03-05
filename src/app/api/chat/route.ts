import { streamText, stepCountIs } from "ai"
import { openai } from "@ai-sdk/openai"
import { tools } from "@/lib/ai/tools"

export async function POST(req: Request) {
  const { messages, priorContext } = await req.json()

  // If there is prior conversation context (e.g. from a voice session),
  // prepend it so the text agent understands the full conversation history.
  const contextPrefix = Array.isArray(priorContext) && priorContext.length > 0
    ? priorContext.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    : []

  const allMessages = [...contextPrefix, ...messages]

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a friendly and knowledgeable learning assistant called CoreModel.
You help students understand concepts, quiz them, and provide encouragement.
You have access to tools that create learning artifacts — use them proactively when relevant.

When a student asks to be quizzed, create a quiz. When they want flashcards, create flashcards.
When they want to visualize concepts, create a mind map or spatial model.
When they want a study plan, create a learning guide.
When they want a review, create slides.

Always explain what you're creating and why it will help the learner.
Keep text responses concise and focused on the learning objective.

Note: The conversation may include messages from a prior voice session. Treat these as part of the ongoing conversation and maintain continuity.`,
    messages: allMessages,
    tools,
    stopWhen: stepCountIs(3),
  })

  return result.toUIMessageStreamResponse()
}
