// User preferences store with localStorage + server sync
// Uses external-store pattern (same as app-store.ts)

export type VizType = "bars" | "wave" | "aura";
export type AppView = "guide" | "sources" | "progress";

export type UserPreferences = {
  // Voice agent
  vizType: VizType;

  // Navigation
  lastTopicId: string;
  lastProjectId: string;
  lastActiveView: AppView;

  // Learning adjustments
  dailyMinutes: number;
  difficulty: number;
  reviewFrequency: number;

  // Locale
  timezone: string;

  // Notifications
  emailNotifications: boolean;
  weeklyDigest: boolean;
  dailyReminders: boolean;

  // UI panels
  agentOpen: boolean;
  showCommunity: boolean;

  // Future template support
  templateId: string | null;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  vizType: "wave",
  lastTopicId: "topic-1",
  lastProjectId: "proj-1",
  lastActiveView: "guide",
  dailyMinutes: 30,
  difficulty: 50,
  reviewFrequency: 3,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  emailNotifications: true,
  weeklyDigest: true,
  dailyReminders: false,
  agentOpen: false,
  showCommunity: false,
  templateId: null,
};

const STORAGE_KEY = "user-preferences";

function loadFromStorage(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

function saveToStorage(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedServerSync(prefs: UserPreferences) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    }).catch(() => {
      // Server sync failed — localStorage still has the data
    });
  }, 1000);
}

function createPreferencesStore() {
  let state: UserPreferences = loadFromStorage();
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    getSnapshot(): UserPreferences {
      return state;
    },

    getServerSnapshot(): UserPreferences {
      return DEFAULT_PREFERENCES;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Update one or more preferences */
    set(updates: Partial<UserPreferences>) {
      state = { ...state, ...updates };
      saveToStorage(state);
      debouncedServerSync(state);
      emit();
    },

    /** Reset to defaults (or a template) */
    reset(template?: Partial<UserPreferences>) {
      state = { ...DEFAULT_PREFERENCES, ...template };
      saveToStorage(state);
      debouncedServerSync(state);
      emit();
    },

    /** Hydrate from server data (called once on mount) */
    hydrate(serverPrefs: Partial<UserPreferences>) {
      // Merge: server wins over defaults, localStorage wins over server
      const localRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;

      if (localRaw) {
        // User has local prefs — use them but fill gaps from server
        const local = JSON.parse(localRaw) as Partial<UserPreferences>;
        state = { ...DEFAULT_PREFERENCES, ...serverPrefs, ...local };
      } else {
        // No local prefs — use server data
        state = { ...DEFAULT_PREFERENCES, ...serverPrefs };
      }
      saveToStorage(state);
      emit();
    },
  };
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;

// Singleton
export const preferencesStore = createPreferencesStore();
