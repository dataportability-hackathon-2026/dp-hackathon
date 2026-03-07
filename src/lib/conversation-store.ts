/**
 * Unified conversation store that merges voice transcripts and text chat
 * messages into a single ordered timeline. Both the VoiceAgentUI and AgentTab
 * (text chat) read from and write to this store so that switching modalities
 * preserves full conversational context.
 *
 * Persistence: messages are flushed to `/api/conversations/[id]/messages`
 * when a conversationId is set. On mount, hydrate from the server.
 */

export type MessageModality = "voice" | "text";

export type MessageEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  modality: MessageModality;
  isFinal: boolean;
};

type Listener = () => void;

function createConversationStore() {
  let entries: MessageEntry[] = [];
  const knownIds = new Set<string>();
  const listeners = new Set<Listener>();
  let conversationId: string | null = null;
  let pendingFlush: MessageEntry[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  function getSnapshot(): MessageEntry[] {
    return entries;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flushToServer();
    }, 2000);
  }

  async function flushToServer() {
    if (!conversationId || pendingFlush.length === 0) return;
    const batch = pendingFlush.slice();
    pendingFlush = [];
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: batch.map((m) => ({
            id: m.id,
            role: m.role,
            text: m.text,
            modality: m.modality,
            timestamp: m.timestamp,
          })),
        }),
      });
    } catch {
      // Re-enqueue on failure so they get retried next flush
      pendingFlush = [...batch, ...pendingFlush];
      scheduleFlush();
    }
  }

  /** Merge incoming entries (idempotent — skips duplicates by id).
   *  Non-final (interim) entries are shown in the UI but not persisted.
   *  When a segment becomes final, it replaces the interim version and queues for flush. */
  function merge(incoming: MessageEntry[]) {
    let changed = false;
    for (const entry of incoming) {
      const existing = entries.find((e) => e.id === entry.id);
      if (existing) {
        // Update text of an existing interim segment, or mark it final
        if (
          existing.text !== entry.text ||
          existing.isFinal !== entry.isFinal
        ) {
          existing.text = entry.text;
          if (entry.isFinal && !existing.isFinal) {
            existing.isFinal = true;
            pendingFlush.push(existing);
          }
          changed = true;
        }
        continue;
      }
      knownIds.add(entry.id);
      entries = [...entries, entry];
      if (entry.isFinal) {
        pendingFlush.push(entry);
      }
      changed = true;
    }
    if (changed) {
      entries.sort((a, b) => a.timestamp - b.timestamp);
      notify();
      if (pendingFlush.length > 0) scheduleFlush();
    }
  }

  /** Add a single message (e.g. a typed text message). */
  function addMessage(entry: MessageEntry) {
    if (knownIds.has(entry.id)) return;
    knownIds.add(entry.id);
    entries = [...entries, entry];
    entries.sort((a, b) => a.timestamp - b.timestamp);
    pendingFlush.push(entry);
    notify();
    scheduleFlush();
  }

  /** Remove a message by id (e.g. on send failure rollback). */
  function removeMessage(id: string) {
    if (!knownIds.has(id)) return;
    knownIds.delete(id);
    entries = entries.filter((e) => e.id !== id);
    pendingFlush = pendingFlush.filter((e) => e.id !== id);
    notify();
  }

  /** Convert the conversation history to a format suitable for LLM context injection. */
  function toMessageHistory(): Array<{
    role: "user" | "assistant";
    content: string;
  }> {
    return entries
      .filter((e) => e.isFinal)
      .map((e) => ({
        role: e.role,
        content: e.text,
      }));
  }

  /** Set the active conversation ID and optionally hydrate from server. */
  async function setConversationId(id: string | null) {
    // Flush pending messages for current conversation first
    if (conversationId && pendingFlush.length > 0) {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      await flushToServer();
    }
    conversationId = id;
  }

  function getConversationId(): string | null {
    return conversationId;
  }

  /** Hydrate store from persisted messages on the server. */
  async function hydrate(convId: string) {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (!res.ok) return;
      const rows = (await res.json()) as Array<{
        id: string;
        role: string;
        text: string;
        modality: string;
        timestamp: number;
      }>;
      for (const row of rows) {
        if (knownIds.has(row.id)) continue;
        knownIds.add(row.id);
        entries = [
          ...entries,
          {
            id: row.id,
            role: row.role as "user" | "assistant",
            text: row.text,
            timestamp: row.timestamp,
            modality: row.modality as MessageModality,
            isFinal: true,
          },
        ];
      }
      entries.sort((a, b) => a.timestamp - b.timestamp);
      notify();
    } catch {
      // Silently fail — messages just won't be restored
    }
  }

  function clear() {
    entries = [];
    knownIds.clear();
    pendingFlush = [];
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    notify();
  }

  /** Force-flush before page unload. */
  function flushSync() {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (!conversationId || pendingFlush.length === 0) return;
    const batch = pendingFlush.slice();
    pendingFlush = [];
    // Use sendBeacon for reliability during unload
    navigator.sendBeacon(
      `/api/conversations/${conversationId}/messages`,
      new Blob(
        [
          JSON.stringify({
            messages: batch.map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
              modality: m.modality,
              timestamp: m.timestamp,
            })),
          }),
        ],
        { type: "application/json" },
      ),
    );
  }

  return {
    getSnapshot,
    subscribe,
    merge,
    addMessage,
    removeMessage,
    toMessageHistory,
    clear,
    setConversationId,
    getConversationId,
    hydrate,
    flushSync,
  };
}

export const conversationStore = createConversationStore();
