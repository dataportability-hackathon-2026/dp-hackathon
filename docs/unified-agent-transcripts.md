# Unified Agent Transcripts: Voice + Text as One Conversation

## Problem

The voice agent (LiveKit + OpenAI Realtime) and the text agent (Vercel AI SDK + `useChat`) are completely separate systems:

| Dimension | Voice Agent | Text Agent |
|-----------|------------|------------|
| Backend | LiveKit agent (`agent/agent.mjs`) using OpenAI Realtime API | Next.js route (`/api/chat`) using `streamText` |
| Frontend | `useVoiceAssistant` + `useTrackTranscription` | `useChat` from `@ai-sdk/react` |
| Transcript | `transcriptStore` (module-level external store) | `messages` array from `useChat` |
| Context | Conversation lives in the LiveKit Realtime session | Conversation lives in the `useChat` message array |
| Tools | Defined in `agent/agent.mjs` via `llm.tool()` | Defined in `src/lib/ai/tools.ts` via Vercel `tool()` |

When a user switches from Voice to Chat mode (or vice versa), the conversation context is **lost**. The text agent has no idea what was discussed via voice, and the voice agent has no idea what was typed.

## Design Goals

1. **Unified transcript** — a single ordered list of all messages regardless of input modality
2. **Seamless mode switching** — user can toggle Voice/Chat mid-conversation and the agent understands the full context
3. **Text input during voice sessions** — user can type a message while voice is active, and the voice agent receives it
4. **Consistent UI** — one transcript view that shows both typed and spoken messages

## Architecture Changes

### 1. Unified Conversation Store

Replace the separate `transcriptStore` and `useChat` message arrays with a single `conversationStore` that holds all messages:

```ts
type MessageEntry = {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: number
  modality: "voice" | "text"  // how the message was produced
  isFinal: boolean
}
```

This store is the **single source of truth** for the conversation. Both the voice UI and chat UI read from and write to it.

### 2. Feed Transcript Context to the Text Agent

When the user switches to Chat mode, the existing voice transcript entries are injected as prior conversation context into the `useChat` message history. This way the text LLM knows what was discussed.

**Implementation:** Before calling `/api/chat`, prepend voice transcript entries as `{ role, content }` messages. The system prompt already exists — we just need to pass the conversation history.

### 3. Feed Text Messages to the Voice Agent via LiveKit Data Channel

When the user types a message while in Voice mode, send it to the LiveKit room via the data channel. The voice agent already uses `room.localParticipant.publishData()` for artifact data — we use the same channel for text input.

On the agent side (`agent/agent.mjs`), listen for data channel messages of type `"text_input"` and call `session.generateReply({ userInput: text })` to have the voice agent respond to typed text.

### 4. Text Input Bar in Voice Mode

Add a collapsible text input at the bottom of the `VoiceAgentUI` component. When the user types and hits send:
- The message is added to the unified conversation store
- The message is published to the LiveKit data channel
- The voice agent processes it and responds audibly (with transcript)

This lets users type when they can't speak (noisy environment, on mute, etc.) while staying in the voice session.

### 5. Unified Transcript View

The existing transcript toggle in `VoiceAgentUI` and the chat message list in `AgentTab` both render from the same `conversationStore`. Each message shows a small modality indicator (mic icon for voice, keyboard icon for text) so the user can see the input source.

## Implementation Approach

### Phase 1: Unified Store (this PR)

- Create `src/lib/conversation-store.ts` with the unified `conversationStore`
- Refactor `VoiceAgentUI` to write voice transcripts into `conversationStore`
- Refactor `AgentTab` to read from `conversationStore` and inject prior context
- Add text input to voice mode UI
- Wire up data channel for text-to-voice messages

### Phase 2: Agent-Side Text Input (future)

- Update `agent/agent.mjs` to listen for `text_input` data channel messages
- Call `session.generateReply()` with the text content
- This makes the voice agent respond to typed input during a live session

### Phase 3: Persistent Conversation (future)

- Persist `conversationStore` to the database per user/project
- Load conversation history when reconnecting
- Enable conversation export/review

## Key Decisions

1. **Why not merge the backends?** The voice agent runs on LiveKit's infrastructure (OpenAI Realtime API with audio streaming). The text agent runs as a standard Next.js API route. These are fundamentally different protocols. Instead of forcing one backend, we unify at the **conversation store** level and pass context between them.

2. **Why data channel for text input?** LiveKit's data channel is already used for artifact delivery. It's reliable, low-latency, and doesn't require a separate WebSocket connection. The voice agent already has access to `room` — we just add a listener.

3. **Why inject history vs. shared memory?** Injecting transcript entries as message history is the simplest approach that works with both the Vercel AI SDK and OpenAI Realtime API. Shared vector memory or RAG would be over-engineered for conversational context that fits within the context window.
