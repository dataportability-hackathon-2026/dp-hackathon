type ShortcutGroup = "Navigation" | "Agent" | "Voice" | "General";

type ShortcutDef = {
  id: string;
  key: string;
  mod: boolean;
  label: string;
  group: ShortcutGroup;
  display: string;
};

export const SHORTCUTS: ShortcutDef[] = [
  {
    id: "tab-guide",
    key: "1",
    mod: true,
    label: "Guide tab",
    group: "Navigation",
    display: "⌘1",
  },
  {
    id: "tab-sources",
    key: "2",
    mod: true,
    label: "Sources tab",
    group: "Navigation",
    display: "⌘2",
  },
  {
    id: "tab-progress",
    key: "3",
    mod: true,
    label: "Progress tab",
    group: "Navigation",
    display: "⌘3",
  },
  {
    id: "toggle-agent",
    key: "j",
    mod: true,
    label: "Toggle agent panel",
    group: "Agent",
    display: "⌘J",
  },
  {
    id: "toggle-profile",
    key: "u",
    mod: true,
    label: "Toggle profile",
    group: "Navigation",
    display: "⌘U",
  },
  {
    id: "focus-chat",
    key: "/",
    mod: false,
    label: "Focus chat input",
    group: "Agent",
    display: "/",
  },
  {
    id: "mute",
    key: "m",
    mod: true,
    label: "Mute / unmute",
    group: "Voice",
    display: "⌘M",
  },
  {
    id: "end-call",
    key: ".",
    mod: true,
    label: "End call",
    group: "Voice",
    display: "⌘.",
  },
  {
    id: "open-help",
    key: "?",
    mod: false,
    label: "Open help",
    group: "General",
    display: "?",
  },
];

export const SHORTCUT_GROUPS = [
  "Navigation",
  "Agent",
  "Voice",
  "General",
] as const;

export type { ShortcutDef, ShortcutGroup };
