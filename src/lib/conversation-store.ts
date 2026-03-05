/**
 * Unified conversation store that merges voice transcripts and text chat
 * messages into a single ordered timeline. Both the VoiceAgentUI and AgentTab
 * (text chat) read from and write to this store so that switching modalities
 * preserves full conversational context.
 */

export type MessageModality = "voice" | "text"

export type MessageEntry = {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: number
  modality: MessageModality
  isFinal: boolean
}

type Listener = () => void

function createConversationStore() {
  let entries: MessageEntry[] = []
  const knownIds = new Set<string>()
  const listeners = new Set<Listener>()

  function getSnapshot(): MessageEntry[] {
    return entries
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function notify() {
    for (const listener of listeners) listener()
  }

  /** Merge incoming entries (idempotent — skips duplicates by id). */
  function merge(incoming: MessageEntry[]) {
    let changed = false
    for (const entry of incoming) {
      if (!entry.isFinal) continue
      if (knownIds.has(entry.id)) continue
      knownIds.add(entry.id)
      entries = [...entries, entry]
      changed = true
    }
    if (changed) {
      entries.sort((a, b) => a.timestamp - b.timestamp)
      notify()
    }
  }

  /** Add a single message (e.g. a typed text message). */
  function addMessage(entry: MessageEntry) {
    if (knownIds.has(entry.id)) return
    knownIds.add(entry.id)
    entries = [...entries, entry]
    entries.sort((a, b) => a.timestamp - b.timestamp)
    notify()
  }

  /** Convert the conversation history to a format suitable for LLM context injection. */
  function toMessageHistory(): Array<{ role: "user" | "assistant"; content: string }> {
    return entries
      .filter((e) => e.isFinal)
      .map((e) => ({
        role: e.role,
        content: e.text,
      }))
  }

  function clear() {
    entries = []
    knownIds.clear()
    notify()
  }

  return { getSnapshot, subscribe, merge, addMessage, toMessageHistory, clear }
}

export const conversationStore = createConversationStore()
