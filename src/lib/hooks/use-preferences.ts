import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  preferencesStore,
  type UserPreferences,
} from "@/lib/preferences-store";

/** Subscribe to the full preferences object */
export function usePreferences(): UserPreferences {
  return useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getServerSnapshot,
  );
}

/** Get a single preference value */
export function usePreference<K extends keyof UserPreferences>(
  key: K,
): [UserPreferences[K], (value: UserPreferences[K]) => void] {
  const prefs = usePreferences();

  const setter = useCallback(
    (value: UserPreferences[K]) => {
      preferencesStore.set({ [key]: value });
    },
    [key],
  );

  return [prefs[key], setter];
}

/** Hydrate preferences from server on mount (call once in root) */
export function usePreferencesHydration() {
  useEffect(() => {
    fetch("/api/preferences")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data: Partial<UserPreferences> | null) => {
        if (data) {
          preferencesStore.hydrate(data);
        }
      })
      .catch(() => {
        // Server unavailable — localStorage prefs are fine
      });
  }, []);
}
