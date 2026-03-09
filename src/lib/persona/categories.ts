export type PersonaCategory = {
  id: string;
  label: string;
  description: string;
  filename: string;
  defaultEnabled: boolean;
};

export const PERSONA_CATEGORIES: PersonaCategory[] = [
  {
    id: "conversations",
    label: "AI Conversations",
    description: "Chat history with AI assistants",
    filename: "conversations.jsonl",
    defaultEnabled: true,
  },
  {
    id: "calendar",
    label: "Calendar Events",
    description: "Schedule and calendar data",
    filename: "calendar.jsonl",
    defaultEnabled: true,
  },
  {
    id: "lifelog",
    label: "Life Log",
    description: "Daily activity and wellness data",
    filename: "lifelog.jsonl",
    defaultEnabled: true,
  },
  {
    id: "email",
    label: "Email Data",
    description: "Email metadata and content",
    filename: "email.jsonl",
    defaultEnabled: true,
  },
  {
    id: "financial",
    label: "Financial Records",
    description: "Transaction and financial data",
    filename: "financial.jsonl",
    defaultEnabled: false,
  },
  {
    id: "social",
    label: "Social Media",
    description: "Social media activity data",
    filename: "social.jsonl",
    defaultEnabled: false,
  },
  {
    id: "files_metadata",
    label: "Files & Documents",
    description: "File metadata and document info",
    filename: "files_metadata.jsonl",
    defaultEnabled: true,
  },
  {
    id: "persona_profile",
    label: "Persona Profile",
    description: "Personal profile and preferences",
    filename: "persona_profile.json",
    defaultEnabled: true,
  },
];
