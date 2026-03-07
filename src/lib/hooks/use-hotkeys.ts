"use client";

import { useEffect, useRef } from "react";

type HotkeyMap = Record<string, () => void>;

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

/**
 * Register keyboard shortcuts. Keys prefixed with "mod+" use Cmd (Mac) / Ctrl.
 * Plain keys (no mod) are ignored when focus is inside an input/textarea.
 *
 * @example useHotkeys({ "mod+j": toggleAgent, "/": focusChat, "?": openHelp })
 */
export function useHotkeys(map: HotkeyMap) {
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      for (const [combo, fn] of Object.entries(mapRef.current)) {
        if (combo.startsWith("mod+")) {
          const key = combo.slice(4).toLowerCase();
          if (isMod && e.key.toLowerCase() === key) {
            e.preventDefault();
            fn();
            return;
          }
        } else {
          if (
            e.key === combo &&
            !isMod &&
            !e.altKey &&
            !isEditableTarget(e.target)
          ) {
            e.preventDefault();
            fn();
            return;
          }
        }
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}
