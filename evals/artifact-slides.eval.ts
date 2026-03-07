import { evalite } from "evalite";
import type { ArtifactInput } from "../src/lib/ai/generate-artifact";
import { generateSlides } from "../src/lib/ai/generate-artifact";
import type { SlideArtifactData } from "../src/lib/ai/schemas";
import { DATA_SCIENCE_CONCEPTS, LINEAR_ALGEBRA_CONCEPTS } from "./fixtures";

type SlideEvalInput = ArtifactInput & { concepts: string[] };

const slideConceptCoverage = {
  name: "Slide Concept Coverage",
  description: "Checks that slide content covers all input concepts",
  scorer: ({
    input,
    output,
  }: {
    input: SlideEvalInput;
    output: SlideArtifactData;
  }) => {
    const allText = output.slides
      .map((s) => `${s.title} ${s.bullets.join(" ")}`)
      .join(" ")
      .toLowerCase();

    let covered = 0;
    for (const concept of input.concepts) {
      if (allText.includes(concept.toLowerCase())) covered++;
    }
    return covered / input.concepts.length;
  },
};

const slideStructure = {
  name: "Slide Structure Quality",
  description:
    "Checks that slides have proper structure (intro, content, summary)",
  scorer: ({
    output,
  }: {
    input: SlideEvalInput;
    output: SlideArtifactData;
  }) => {
    let score = 0;
    const total = 3;

    // Has enough slides
    if (output.slides.length >= 4) score++;

    // First slide looks like an intro (contains overview/intro/objective keywords)
    const firstTitle = output.slides[0]?.title?.toLowerCase() ?? "";
    if (
      firstTitle.includes("overview") ||
      firstTitle.includes("intro") ||
      firstTitle.includes("objective") ||
      firstTitle.includes("outline")
    )
      score++;

    // Last slide looks like a summary
    const lastTitle =
      output.slides[output.slides.length - 1]?.title?.toLowerCase() ?? "";
    if (
      lastTitle.includes("summary") ||
      lastTitle.includes("takeaway") ||
      lastTitle.includes("review") ||
      lastTitle.includes("conclusion")
    )
      score++;

    return score / total;
  },
};

const slideBulletQuality = {
  name: "Slide Bullet Quality",
  description: "Checks that bullets are concise (not too long, not too short)",
  scorer: ({
    output,
  }: {
    input: SlideEvalInput;
    output: SlideArtifactData;
  }) => {
    const allBullets = output.slides.flatMap((s) => s.bullets);
    if (allBullets.length === 0) return 0;

    let goodBullets = 0;
    for (const bullet of allBullets) {
      // Good bullets are 10-200 chars
      if (bullet.length >= 10 && bullet.length <= 200) goodBullets++;
    }
    return goodBullets / allBullets.length;
  },
};

evalite<SlideEvalInput, SlideArtifactData>("Slide Deck Artifact Generation", {
  data: () => [
    {
      input: {
        subject: "Linear Algebra",
        concepts: LINEAR_ALGEBRA_CONCEPTS,
        priorKnowledgeLevel: "beginner",
        goalType: "exam",
      },
      expected: undefined,
    },
    {
      input: {
        subject: "Data Science with Python",
        concepts: DATA_SCIENCE_CONCEPTS,
        priorKnowledgeLevel: "intermediate",
        goalType: "project",
      },
      expected: undefined,
    },
  ],
  task: async (input) => {
    return generateSlides(input);
  },
  scorers: [slideConceptCoverage, slideStructure, slideBulletQuality],
});
