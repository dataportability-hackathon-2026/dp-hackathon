/**
 * Academic citations registry for evidence-based learning tools.
 *
 * Every tool prompt references specific citations by key. This ensures
 * that AI-generated content is grounded in validated research, not
 * folk pedagogy or learning-styles myths.
 */

export type Citation = {
  key: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  finding: string;
  toolRelevance: string;
};

export const CITATIONS: Record<string, Citation> = {
  PASHLER_2008: {
    key: "PASHLER_2008",
    authors: "Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R.",
    year: 2008,
    title: "Learning styles: Concepts and evidence",
    journal: "Psychological Science in the Public Interest, 9(3), 105-119",
    finding:
      "No credible evidence that matching instruction to self-reported learning style improves outcomes. Preference does not equal effectiveness.",
    toolRelevance:
      "Guards against learning-styles personalization. Tools must never claim format matching improves retention.",
  },

  FREDERICK_2005: {
    key: "FREDERICK_2005",
    authors: "Frederick, S.",
    year: 2005,
    title: "Cognitive reflection and decision making",
    journal: "Journal of Economic Perspectives, 19(4), 25-42",
    finding:
      "CRT measures tendency to override intuitive-but-wrong responses. Predicts how learners handle 'intuitive trap' problems.",
    toolRelevance:
      "Profile tools use CRT scores to set reflectiveness level and determine scaffolding needs.",
  },

  SCHRAW_1994: {
    key: "SCHRAW_1994",
    authors: "Schraw, G., & Dennison, R. S.",
    year: 1994,
    title: "Assessing metacognitive awareness",
    journal: "Contemporary Educational Psychology, 19(4), 460-475",
    finding:
      "MAI assesses knowledge-of-cognition and regulation-of-cognition. Metacognitive awareness is the strongest predictor of self-regulated learning.",
    toolRelevance:
      "Profile tools assess metacognitive awareness to determine calibration training needs and reflection prompt frequency.",
  },

  WEINSTEIN_2016: {
    key: "WEINSTEIN_2016",
    authors: "Weinstein, C. E., Palmer, D. R., & Acee, T. W.",
    year: 2016,
    title: "LASSI User's Manual (3rd ed.)",
    journal: "H&H Publishing",
    finding:
      "Strategy use is trainable. Identifying strategy deficits enables targeted skill modules for time management, concentration, and test strategies.",
    toolRelevance:
      "Guide tools insert skill-builder blocks when strategy deficits are detected.",
  },

  RYAN_DECI_2000: {
    key: "RYAN_DECI_2000",
    authors: "Ryan, R. M., & Deci, E. L.",
    year: 2000,
    title:
      "Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being",
    journal: "American Psychologist, 55(1), 68-78",
    finding:
      "Three fundamental needs: autonomy, competence, relatedness. Motivation is the strongest predictor of persistence vs. dropout.",
    toolRelevance:
      "Guide and artifact tools adapt coaching tone and offer choice-based paths when autonomy needs are high.",
  },

  PINTRICH_1991: {
    key: "PINTRICH_1991",
    authors: "Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J.",
    year: 1991,
    title:
      "A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)",
    journal:
      "National Center for Research to Improve Postsecondary Teaching and Learning",
    finding:
      "Measures intrinsic/extrinsic goal orientation, task value, self-efficacy, and test anxiety. Motivation measures change how the system supports learning, not what is learned.",
    toolRelevance:
      "Profile tools use MSLQ dimensions to set motivational focus and dropout risk flags.",
  },

  VEDEL_2014: {
    key: "VEDEL_2014",
    authors: "Vedel, A.",
    year: 2014,
    title:
      "The Big Five and tertiary academic performance: A systematic review and meta-analysis",
    journal: "Personality and Individual Differences, 71, 66-76",
    finding:
      "Conscientiousness and Openness predict academic performance. Personality affects communication tone, never content or difficulty.",
    toolRelevance:
      "Profile tools set coaching tone based on personality. Never gates difficulty or content access.",
  },

  PRIMI_2016: {
    key: "PRIMI_2016",
    authors:
      "Primi, C., Morsanyi, K., Chiesi, F., Donati, M. A., & Hamilton, J.",
    year: 2016,
    title:
      "The development and testing of a new version of the Cognitive Reflection Test applying Item Response Theory (IRT)",
    journal: "Journal of Behavioral Decision Making, 29(5), 453-469",
    finding:
      "Prior exposure to CRT items inflates scores and undermines validity. Rotated forms and contamination detection are required.",
    toolRelevance:
      "Profile tools flag CRT contamination risk and adjust confidence in reflectiveness scores.",
  },

  ROEDIGER_KARPICKE_2006: {
    key: "ROEDIGER_KARPICKE_2006",
    authors: "Roediger, H. L., & Karpicke, J. D.",
    year: 2006,
    title:
      "Test-enhanced learning: Taking memory tests improves long-term retention",
    journal: "Psychological Science, 17(3), 249-255",
    finding:
      "Retrieval practice produces stronger and more durable learning than passive re-reading. Testing is a learning event, not just an assessment event.",
    toolRelevance:
      "Artifact tools prioritize active recall (quizzes, flashcards) over passive review (slides). Guide tools schedule retrieval-heavy blocks.",
  },

  CEPEDA_2006: {
    key: "CEPEDA_2006",
    authors: "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D.",
    year: 2006,
    title:
      "Distributed practice in verbal recall tasks: A review and quantitative synthesis",
    journal: "Psychological Bulletin, 132(3), 354-380",
    finding:
      "Spaced practice produces substantially better retention than massed practice. Optimal spacing intervals depend on retention interval.",
    toolRelevance:
      "Guide tools schedule spaced review blocks. Artifact tools embed spaced practice cues.",
  },

  ROHRER_TAYLOR_2007: {
    key: "ROHRER_TAYLOR_2007",
    authors: "Rohrer, D., & Taylor, K.",
    year: 2007,
    title: "The shuffling of mathematics problems improves learning",
    journal: "Instructional Science, 35(6), 481-498",
    finding:
      "Interleaving different problem types within practice sessions improves discrimination and transfer compared to blocked practice.",
    toolRelevance:
      "Guide tools interleave concepts in days 4-7. Quiz tools mix question types across concepts.",
  },

  SWELLER_1988: {
    key: "SWELLER_1988",
    authors: "Sweller, J.",
    year: 1988,
    title: "Cognitive load during problem solving: Effects on learning",
    journal: "Cognitive Science, 12(2), 257-285",
    finding:
      "Excessive cognitive load impairs learning. Worked examples reduce extraneous load for novices. As expertise grows, worked examples become redundant (expertise reversal effect).",
    toolRelevance:
      "Profile tools assess cognitive load risk. Guide tools adjust chunk size and insert worked examples. Artifact tools scale complexity to knowledge level.",
  },

  DUNLOSKY_2013: {
    key: "DUNLOSKY_2013",
    authors:
      "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T.",
    year: 2013,
    title:
      "Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology",
    journal: "Psychological Science in the Public Interest, 14(1), 4-58",
    finding:
      "Practice testing and distributed practice are highly effective. Summarization, highlighting, and rereading are low utility. Elaborative interrogation and self-explanation are moderate utility.",
    toolRelevance:
      "Guide tools prioritize high-utility techniques. Artifact tools avoid low-utility formats. Strategy recommendations are evidence-ranked.",
  },

  BJORK_2011: {
    key: "BJORK_2011",
    authors: "Bjork, E. L., & Bjork, R. A.",
    year: 2011,
    title:
      "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning",
    journal:
      "Psychology and the Real World: Essays Illustrating Fundamental Contributions to Society, 56-64",
    finding:
      "Desirable difficulties (retrieval, spacing, interleaving, variation) enhance long-term retention despite reducing short-term performance. Learners often misjudge effective strategies as less effective.",
    toolRelevance:
      "Guide and artifact tools intentionally introduce desirable difficulties. Profile tools detect when learners avoid effective-but-hard strategies.",
  },

  ZIMMERMAN_2002: {
    key: "ZIMMERMAN_2002",
    authors: "Zimmerman, B. J.",
    year: 2002,
    title: "Becoming a self-regulated learner: An overview",
    journal: "Theory Into Practice, 41(2), 64-70",
    finding:
      "Self-regulated learning involves forethought (planning), performance (monitoring), and self-reflection (evaluation). These phases are cyclical and trainable.",
    toolRelevance:
      "Profile tools assess self-regulation capacity. Guide tools embed planning, monitoring, and reflection phases in every session.",
  },
} as const;

export type CitationKey = keyof typeof CITATIONS;

export function getCitationBlock(keys: CitationKey[]): string {
  return keys
    .map((key) => {
      const c = CITATIONS[key];
      return `[${c.key}] ${c.authors} (${c.year}). ${c.title}. ${c.journal}. Finding: ${c.finding}`;
    })
    .join("\n\n");
}

export function getCitationGuardrails(): string {
  return `## Evidence-Based Guardrails

1. NEVER claim that matching instruction to learning style preferences improves outcomes [PASHLER_2008].
2. ALWAYS present mastery estimates with uncertainty — never as single-number scores.
3. Preference does not equal effectiveness — track what works, not what feels good [PASHLER_2008, BJORK_2011].
4. Prioritize retrieval practice over passive review [ROEDIGER_KARPICKE_2006, DUNLOSKY_2013].
5. Space practice over time rather than massing it [CEPEDA_2006].
6. Interleave problem types to improve discrimination [ROHRER_TAYLOR_2007].
7. Adjust cognitive load based on expertise level [SWELLER_1988].
8. Motivation support is SDT-grounded policy, not vibe-based personalization [RYAN_DECI_2000].
9. Personality affects coaching tone ONLY, never content or difficulty [VEDEL_2014].
10. CRT scores require contamination controls [PRIMI_2016].
11. Self-regulation is cyclical and trainable — embed forethought, monitoring, and reflection [ZIMMERMAN_2002].`;
}
