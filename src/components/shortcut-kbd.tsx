"use client";

import { useSyncExternalStore } from "react";

function getIsMac() {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

function subscribe() {
  return () => {};
}

function useIsMac() {
  return useSyncExternalStore(subscribe, getIsMac, () => true);
}

/**
 * Renders a keyboard shortcut badge.
 * Replaces ⌘ with Ctrl on non-Mac platforms.
 */
export function ShortcutKbd({ shortcut }: { shortcut: string }) {
  const mac = useIsMac();
  const display = mac ? shortcut : shortcut.replace("⌘", "Ctrl+");

  return (
    <kbd className="text-[10px] font-mono bg-background/20 rounded px-1 py-0.5 text-background/70">
      {display}
    </kbd>
  );
}
