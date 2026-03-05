import { artifactTools } from "./artifact-tools";
import { guideTools } from "./guide-tools";
import { profileTools } from "./profile-tools";

/**
 * Combined tool registry for the learning assistant.
 *
 * Three tool sets, each backed by academic citations:
 *
 * 1. Profile Tools — Learning profile generation and assessment
 *    Citations: PASHLER_2008, FREDERICK_2005, SCHRAW_1994, WEINSTEIN_2016,
 *    RYAN_DECI_2000, PINTRICH_1991, VEDEL_2014, PRIMI_2016, SWELLER_1988
 *
 * 2. Guide Tools — 7-day learning guide generation and adaptation
 *    Citations: ROEDIGER_KARPICKE_2006, CEPEDA_2006, ROHRER_TAYLOR_2007,
 *    SWELLER_1988, BJORK_2011, SCHRAW_1994, DUNLOSKY_2013, ZIMMERMAN_2002
 *
 * 3. Artifact Tools — Learning material generation (quizzes, flashcards, etc.)
 *    Citations: ROEDIGER_KARPICKE_2006, CEPEDA_2006, ROHRER_TAYLOR_2007,
 *    SWELLER_1988, BJORK_2011, DUNLOSKY_2013, SCHRAW_1994
 */
export const tools = {
  ...profileTools,
  ...guideTools,
  ...artifactTools,
};
