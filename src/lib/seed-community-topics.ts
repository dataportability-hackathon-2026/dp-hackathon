import { slugify } from "@/lib/topics";

/**
 * Community topic seed data — Law, Psychology, and Physics domains.
 * Used by the seed script and migration.
 */
export const COMMUNITY_TOPICS = [
  // ── Common Law ──
  { name: "Contract Law", domain: "Law", parentGroup: "Law", icon: "FileText" },
  {
    name: "Tort Law",
    domain: "Law",
    parentGroup: "Law",
    icon: "AlertTriangle",
  },
  {
    name: "Criminal Law",
    domain: "Law",
    parentGroup: "Law",
    icon: "ShieldAlert",
  },
  { name: "Property Law", domain: "Law", parentGroup: "Law", icon: "Home" },
  { name: "Evidence Law", domain: "Law", parentGroup: "Law", icon: "Search" },
  { name: "Civil Procedure", domain: "Law", parentGroup: "Law", icon: "Scale" },

  // ── Psychology ──
  {
    name: "Developmental Psychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "Baby",
  },
  {
    name: "Social Psychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "Users",
  },
  {
    name: "Abnormal Psychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "HeartCrack",
  },
  {
    name: "Neuropsychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "Brain",
  },
  {
    name: "Research Methods in Psychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "FlaskConical",
  },
  {
    name: "Behavioral Psychology",
    domain: "Psychology",
    parentGroup: "Psychology",
    icon: "Activity",
  },

  // ── Physics ──
  {
    name: "Classical Mechanics",
    domain: "Physics",
    parentGroup: "Physics",
    icon: "Orbit",
  },
  {
    name: "Electromagnetism",
    domain: "Physics",
    parentGroup: "Physics",
    icon: "Zap",
  },
  {
    name: "Thermodynamics",
    domain: "Physics",
    parentGroup: "Physics",
    icon: "Flame",
  },
  { name: "Optics", domain: "Physics", parentGroup: "Physics", icon: "Eye" },
  {
    name: "Nuclear Physics",
    domain: "Physics",
    parentGroup: "Physics",
    icon: "Atom",
  },
  {
    name: "Astrophysics",
    domain: "Physics",
    parentGroup: "Physics",
    icon: "Star",
  },
] as const;

export function buildCommunityTopicRows(systemUserId: string) {
  return COMMUNITY_TOPICS.map((t) => ({
    userId: systemUserId,
    name: t.name,
    slug: slugify(t.name),
    domain: t.domain,
    parentGroup: t.parentGroup,
    icon: t.icon,
    isCommunity: true,
    sourceCount: 0,
  }));
}
