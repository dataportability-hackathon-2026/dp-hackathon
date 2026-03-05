# Core Model

## External Marketing and Scientific Profile

---

# PART I: THE PROBLEM AND THE PROMISE

---

## 1. The Learning Crisis in Graduate Education

Graduate education has a dirty secret: most of it is designed around how instructors teach, not how students learn.

Masters students face a unique problem. The material is dense. The stakes are high. The timelines are compressed. And the tools available -- generic flashcard apps, passive lecture recordings, one-size-fits-all learning management systems -- were designed for a different kind of learner operating at a different pace. They assume you have infinite time, infinite motivation, and a uniform brain.

You don't.

The mismatch is measurable. Students spend hours on study strategies that feel productive but produce minimal retention. They re-read notes instead of testing themselves. They cram instead of spacing. They follow a syllabus schedule instead of their own knowledge gaps. The cost is not just grades -- it is time, confidence, and the compounding frustration of working hard without working effectively.

To make matters worse, the edtech industry has spent two decades selling "personalization" built on a foundation of sand. Learning styles -- the idea that some people are "visual learners" and others are "auditory learners" and that matching instruction to style improves outcomes -- is one of the most persistent myths in education. Pashler et al. (2008) conducted a comprehensive review and found essentially no credible evidence that matching instructional format to self-reported learning style produces better learning outcomes [1]. The studies that claimed to show a benefit failed to meet basic methodological standards.

Yet the myth persists, because it feels true. People do have preferences. But preference does not equal effectiveness. That distinction matters.

Core Model starts from the opposite premise: measure what actually works, for you, right now, with honest uncertainty about what we don't yet know.

---

## 2. What Core Model Is

Core Model is an adaptive learning system that ingests your study materials in any format, builds a scientific profile of how you actually learn (not how you think you learn), and generates evidence-traced recommendations that evolve as you do.

**Value proposition, in three sentences.** First, upload anything -- PDFs, lecture notes, textbooks, slides, your own messy outlines -- and Core Model structures it into a learnable knowledge graph. Second, a behavior-first profiling system measures your mastery, metacognition, study strategies, and motivation using validated psychometric instruments and real-time performance data, all stored with confidence intervals. Third, every recommendation you receive comes with a complete audit trail: what was observed, what was inferred, what was changed, and why.

### The Trust Contract

Core Model makes four commitments to every user:

1. **"Scores are estimates with error bars."** We never present a single number as though it were ground truth. Every mastery estimate, every risk score, every construct inference comes with uncertainty. If we are not confident, we say so.

2. **"We personalize on mastery evidence, not preference surveys."** Your behavior -- what you get right, what you get wrong, how long it takes, how well you predict your own performance -- drives adaptation. Surveys are optional and only used when they demonstrably change a decision.

3. **"We show why we recommend each next step (audit trail)."** Every adaptive decision is logged with its observation, inference, and policy rationale. You can inspect it. You can disagree with it. You can override it.

4. **"Preference does not equal effectiveness."** We will never claim that matching your preferred format improves your outcomes. We will track what actually improves your outcomes and do more of that [1].

### Competitive Landscape

| Feature | Core Model | Generic Adaptive (Knewton, ALEKS) | Flashcard Apps (Anki, Quizlet) | LMS Tools (Canvas, Moodle) | AI Tutors (ChatGPT, Khanmigo) |
|---|---|---|---|---|---|
| Any-format material ingestion | Yes | No (proprietary content only) | Manual card creation | File hosting only | Paste-based, no persistence |
| Scientific learner profiling | 5 validated constructs + behavioral | Mastery only | None | None | None |
| Uncertainty quantification | Bayesian posteriors with CIs | Hidden internal model | None | None | None |
| Audit trail per recommendation | Full (observation-inference-policy) | None | None | None | None |
| Persistent learner model | Versioned, diffable | Session-scoped | Card-level stats only | Grade book | None (stateless) |
| Learning styles claims | Explicitly rejected [1] | Often implicit | N/A | N/A | Varies |
| Metacognitive training | Built into every session | Rare | None | None | Occasional prompting |
| Spaced repetition | Evidence-driven scheduling | Limited | Core feature (but context-free) | None | None |

---

## 3. The User Journey: From Upload to Mastery

### Step 1: Onboard (Upload Any Materials)

You arrive with your materials -- whatever you have. Lecture slides, textbook chapters, problem sets, your own notes. Core Model ingests them and maps them onto a concept graph: the topics, the prerequisite relationships, the difficulty structure. You define your goal (exam prep, project fluency, deep understanding), your time budget (minutes per day, days per week), and your deadline if you have one.

### Step 2: Profile (Scientific Intake, Not a Quiz)

The system runs a behavior-first baseline assessment: 10-15 minutes of adaptive diagnostic questions drawn from your material. This is not a personality quiz. It tracks correctness, error types, response latency, hint usage, and crucially, your confidence predictions before and after each item. The gap between your confidence and your accuracy -- your calibration -- is one of the strongest signals the system uses.

If you choose, you can opt into additional profiling modules: metacognitive awareness (MAI) [3], study strategies (LASSI) [4], motivation (SDT/MSLQ) [5][6], cognitive reflection (CRT) [2][8], and personality for coaching tone (Big Five) [7]. Each module explicitly states what decision it will change before you take it. If it would not change a decision, it is not offered.

### Step 3: Learn (Generated Artifacts Adapt in Real Time)

Core Model generates a 7-day learning guide: concrete, calendar-ready blocks of retrieval practice, skill-building exercises, metacognitive routines, and motivation supports. Every session embeds a prediction-attempt-reflection-repair loop. Every session produces evidence. Every piece of evidence updates your profile.

The artifacts adapt. If your latency spikes on multi-step problems, chunk sizes shrink and worked examples appear. If your calibration is poor (you think you know things you don't), reflection prompts increase. If your adherence drops, the system shifts toward autonomy-supportive policies -- offering choices rather than mandating sequences.

### Step 4: See Why (Audit Trail for Every Recommendation)

Open any recommendation and see the chain: "We observed that your error rate on integration-by-parts items rose from 15% to 40% over the last three sessions while response time increased by 60%. We inferred that cognitive load risk increased (confidence: medium). We reduced chunk size from 8 to 4 items and inserted a worked example before each new problem type."

This is not decorative transparency. It is functional accountability. If the reasoning is wrong, you can see that and adjust.

### Step 5: Grow (Confidence Intervals Narrow Over Time)

In week one, your profile has wide confidence intervals. The system is honest about what it does not know. Recommendations are exploratory -- testing different approaches to see what produces the best evidence.

By week four, uncertainty has contracted. The system knows your mastery map with precision. It knows where your calibration breaks down. It knows which study strategies you actually use (not which ones you claim to use). Recommendations become precise and efficient. Your time is spent where it matters most.

---

# PART II: THE SCIENCE BEHIND CORE MODEL

---

## 4. Why Not "Learning Styles"?

The idea that people learn better when instruction matches their preferred modality -- visual, auditory, reading/writing, kinesthetic (VARK) -- is intuitive, popular, and wrong.

The concept dates back decades. Kolb's Learning Style Inventory (1984) categorized learners as divergers, assimilators, convergers, or accommodators. VARK followed. Dozens of instruments proliferated. By the early 2000s, "learning styles" had become a default assumption in education, corporate training, and edtech product design.

Then the evidence was tested rigorously. Pashler, McDaniel, Rohrer, and Bjork (2008) reviewed the full body of evidence and concluded: "Although the literature on learning styles is enormous, very few studies have even used an appropriate research design... and of those that did, several found results that flatly contradict the popular meshing hypothesis" [1]. To demonstrate that learning styles work, you need a crossover experiment -- assign learners to matched and mismatched conditions and show that matched conditions produce better outcomes. Those experiments consistently fail to show a benefit.

Why does the myth persist? Three reasons. First, people do have preferences, and preferences feel meaningful. Second, the instruments produce results that sound scientific (you are a "Type 2 Reflective Learner"). Third, the education industry has financial incentives to sell personalization, and "learning styles" is the easiest version to package.

Core Model's counter-position is explicit: **"We don't label you. We measure what helps you learn next -- with confidence intervals."** We track your preferences if you want us to, but we use them only for presentation format (UX), never for pedagogical claims. We never assert that showing you a diagram instead of text will improve your retention, because the evidence does not support that claim [1].

What does improve retention? Retrieval practice. Spaced repetition. Interleaving. Calibration training. These are the interventions Core Model builds on -- because they have the evidence behind them.

---

## 5. The Learning DNA: Scientific Framework

Core Model measures five constructs. Each one is grounded in a validated psychometric tradition. Each one changes a specific set of decisions. If a construct would not change a decision, we do not measure it.

### 5.1 Cognitive Reflection (CRT)

**What it measures.** The Cognitive Reflection Test, developed by Frederick (2005), measures a person's tendency to override an intuitive but incorrect response in favor of a reflective, correct one [2]. The classic example: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?" The intuitive answer (10 cents) is wrong. The reflective answer (5 cents) requires suppressing the gut response and doing the math.

**Why it matters.** CRT scores predict how learners handle "intuitive trap" problems -- questions where the obvious answer is wrong. Learners with low CRT scores benefit from explicit reflective pauses and structured reasoning scaffolds. Learners with high CRT scores can handle more complex, less scaffolded problem presentations.

**How Core Model uses it responsibly.** The original CRT items are now widely known, creating a contamination problem. Primi et al. (2016) demonstrated that prior exposure inflates scores and undermines validity [8]. Core Model addresses this through rotated item forms (form_family_id), exposure tracking per learner, self-reported prior exposure flags, and automatic contamination detection. If an item is flagged as contaminated, it is excluded from construct scoring. CRT results carry explicit uncertainty bands, and the system identifies the fastest way to reduce that uncertainty if it matters for a pending decision.

### 5.2 Metacognitive Awareness (MAI)

**What it measures.** The Metacognitive Awareness Inventory, developed by Schraw and Dennison (1994), assesses two dimensions: knowledge about cognition (what you know about how you think) and regulation of cognition (how well you plan, monitor, and evaluate your own learning) [3].

**Why it matters.** Metacognitive awareness is the single strongest predictor of self-regulated learning. Students who accurately predict what they know and don't know study more efficiently -- they spend time on gaps, not on material they have already mastered. Students with poor metacognition study the wrong things, overestimate their readiness, and are surprised by poor performance on exams.

**How Core Model uses it responsibly.** Rather than relying solely on the MAI survey, Core Model operationalizes metacognition as calibration tasks embedded in every session. Before each item, you predict your confidence. After the attempt, the system compares your prediction to your actual performance. This produces a calibration curve -- confidence plotted against accuracy -- and metrics like Expected Calibration Error (ECE) and Brier scores. Poor calibration triggers prediction-reflection-repair loops: "You predicted 80% confidence on this topic but scored 45%. Here is where the gap is. Try this repair item." The MAI survey, if opted into, provides additional signal but is never the sole basis for decisions.

### 5.3 Study Strategy Repertoire (LASSI)

**What it measures.** The Learning and Study Strategies Inventory, developed by Weinstein, Palmer, and Acee (2016), profiles learners across dimensions including time management, test strategies, concentration, information processing, motivation, anxiety management, and use of study aids [4].

**Why it matters.** Strategy use is trainable. Unlike cognitive ability, which is relatively stable, study strategies can be taught and improved. A student who scores poorly on time management is not condemned to poor time management -- they simply have not been taught effective approaches. Identifying the gap is the first step to closing it.

**How Core Model uses it responsibly.** LASSI results (when opted into) identify specific strategy deficits. These deficits activate targeted skill modules in the learning guide: planning scaffolds for poor time management, focus-block structures for concentration issues, test-taking strategy lessons for test anxiety. Crucially, Core Model also infers strategy use from behavioral telemetry -- adherence patterns, session timing, rescheduling frequency -- so the system can detect strategy gaps even without the survey. LASSI results carry uncertainty and are cross-validated against behavioral evidence.

### 5.4 Motivational Orientation (SDT + MSLQ)

**What it measures.** Two complementary frameworks. Self-Determination Theory (Ryan and Deci, 2000) identifies three fundamental psychological needs: autonomy (control over one's learning), competence (feeling effective), and relatedness (connection to others) [5]. The Motivated Strategies for Learning Questionnaire (Pintrich et al., 1991) measures intrinsic/extrinsic goal orientation, task value, self-efficacy beliefs, and test anxiety [6].

**Why it matters.** Motivation is the strongest predictor of whether a learner persists or drops out. A student who feels controlled rather than autonomous, incompetent rather than capable, or isolated rather than connected will disengage regardless of how good the content is. Motivational risk is a dropout signal -- and dropout is the single largest failure mode of any learning system.

**How Core Model uses it responsibly.** Motivation measures do not change what you learn. They change how the system supports you while you learn. High autonomy needs trigger choice-based learning paths (pick from equivalent options rather than following a fixed sequence). Low competence signals trigger more frequent mastery-proof checkpoints ("You just demonstrated X -- look how far you have come"). Dropout risk flags trigger policy shifts: shorter sessions, more immediate wins, explicit competence evidence. Motivation support is policy grounded in SDT, not vibe-based personalization [5].

### 5.5 Personality Traits (Big Five)

**What it measures.** The Big Five personality model (also called OCEAN) assesses five broad trait dimensions: Openness to experience, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Vedel (2014) demonstrated that these traits, particularly Conscientiousness and Openness, predict academic performance across educational settings [7].

**Why it matters.** Personality provides contextual modulation for how the system communicates, not what it teaches. A highly conscientious learner may respond well to structured accountability. A highly open learner may prefer exploratory, project-based challenges. A learner high in neuroticism may need more reassurance and explicit progress signals.

**How Core Model uses it responsibly.** Big Five data, when opted into, affects coaching tone only. It never gates difficulty. It never determines content. It never limits access. A high-openness learner gets the same retrieval practice schedule as a low-openness learner -- but the framing, the language, and the presentation may differ. Personality is a communication channel, not a pedagogical prescription [7].

---

## 6. Uncertainty as a Feature, Not a Bug

Most educational technology presents single-number scores: "You are 73% ready for your exam." This is misleading. A score of 73% based on three questions means something profoundly different from a score of 73% based on three hundred questions. Without uncertainty, the number is uninterpretable.

Core Model stores every estimate as a distribution, not a point.

**Bayesian updating, simply explained.** You start with a prior belief about a learner's mastery of a concept -- initially wide and uncertain. As evidence arrives (correct answers, incorrect answers, response times, confidence predictions), the system updates this belief using Bayes' theorem. The posterior distribution reflects both what the evidence says and how much evidence there is. More evidence means narrower uncertainty. Conflicting evidence means wider uncertainty. The math is straightforward: a Beta distribution for binary mastery, updated with each attempt, producing a posterior mean and standard deviation.

**Confidence intervals in practice.** When Core Model says your mastery of Gaussian elimination is 0.62, it also says the 95% credible interval is [0.41, 0.81]. That interval means: given the evidence so far, there is a 95% probability your true mastery lies in that range. It is honest. It tells you that the system is somewhat uncertain, and you should expect recommendations to be exploratory rather than definitive on this topic.

**Cold start honesty.** On day one, the system knows almost nothing about you. Rather than pretending otherwise, Core Model uses wide priors and says so: "We have limited evidence. Recommendations are exploratory. Expect them to change as we learn more about you." This is not a weakness -- it is the scientifically honest thing to do.

**Exploration vs. exploitation.** When uncertainty is high, the system explores: it tries different intervention types (retrieval, worked examples, interleaved practice) to see which produces the best evidence of learning. When uncertainty is low, the system exploits: it uses the approach that evidence has shown works best for you. This exploration-exploitation tradeoff is driven directly by the width of the confidence intervals. Uncertainty is not noise to be hidden -- it is the signal that drives intelligent adaptation.

---

## 7. The Intervention Map: How Measurement Becomes Action

Every construct Core Model measures connects to a specific intervention library through a traceable chain: evidence observed, inference computed (with uncertainty), decision made, intervention selected, outcome evaluated.

**Mastery State -> Retrieval, Spacing, and Interleaving**

Evidence: attempt correctness, error types, latency, hint usage, confidence predictions.
Inference: per-concept posterior (mean and standard deviation).
Decision: item selection and pacing. Which concepts need practice? How many items per session? What difficulty level?
Interventions: retrieval practice (testing yourself rather than re-reading), spaced repetition (reviewing at optimal intervals), interleaving (mixing problem types within a session).
Evaluation: retention at 7, 14, and 30 days.

**Metacognition -> Prediction, Reflection, and Repair Loops**

Evidence: calibration data (confidence-pre vs. actual accuracy), MAI subscales if opted in.
Inference: calibration error (ECE, Brier score), self-regulation risk.
Decision: inject metacognitive loops. How often? How deep?
Interventions: prediction prompts before items, reflection prompts after errors, repair tasks targeting specific misconceptions.
Evaluation: ECE and Brier score improvement over time.

**Study Strategies -> Targeted Skill Modules**

Evidence: LASSI subscales if opted in, adherence telemetry (blocks completed, skipped, rescheduled), session timing patterns.
Inference: strategy deficit risk scores by dimension.
Decision: add skill modules to the learning guide.
Interventions: planning scaffolds, focus-block structures, test-taking strategy lessons, information-processing skill training.
Evaluation: completion rates and downstream score improvements.

**Motivation -> Autonomy-Supportive Policy**

Evidence: SDT/MSLQ subscales if opted in, dropout signals (session abandonment, adherence decline, rescheduling frequency).
Inference: motivation support needed (estimate with uncertainty), dropout risk.
Decision: shift to autonomy-supportive policy.
Interventions: choice sets (pick from equivalent learning paths), competence proofs (explicit demonstrations of progress), shorter sessions with more immediate wins.
Evaluation: adherence and persistence changes, goal completion.

The key message: every recommendation traces from evidence through inference to policy. There are no black-box decisions. There are no unexplained jumps. The chain is auditable from end to end.

---

# PART III: TRUST, TRANSPARENCY, AND ETHICS

---

## 8. The Audit Trail: Full Transparency

An audit trail is not a log file. It is a user-facing explanation of why the system behaved the way it did.

### What a Recommendation Audit Trail Looks Like

Every adaptive decision in Core Model generates a structured audit event with three components:

- **Observation:** What raw evidence triggered this decision? (e.g., "Error rate on integration-by-parts items rose from 15% to 40% over the last three sessions. Response time increased by 60%.")
- **Inference:** What did the system conclude, with what confidence? (e.g., "Cognitive load risk increased from 0.35 to 0.68. Confidence: medium. Credible interval: [0.48, 0.85].")
- **Policy change:** What did the system do differently? (e.g., "Reduced chunk size from 8 to 4 items. Inserted worked example before each new problem type. Rationale: high cognitive load risk triggers pacing reduction per policy rule P-007.")

### Worked Example

> **Recommendation:** "We recommended spaced retrieval on Topic X because..."
>
> **Observation:** You attempted 12 items on eigenvalue decomposition over the past week. Your accuracy was 58% (down from 72% the previous week). Your confidence predictions averaged 75%, indicating overconfidence. Three items showed response latency greater than 2 standard deviations above your mean.
>
> **Inference:** Mastery posterior dropped from 0.72 (SD: 0.08) to 0.58 (SD: 0.10). Calibration error increased. The posterior suggests genuine skill regression, likely due to insufficient spaced review (last practice was 9 days ago, optimal interval estimated at 4 days).
>
> **Policy decision:** Schedule three spaced retrieval sessions on eigenvalue decomposition over the next 7 days, at intervals of 2, 4, and 7 days. Reduce confidence-prediction threshold for this topic. Add one metacognitive reflection prompt per session on this topic.

### How Users Access Their Audit Trails

The audit log is a first-class screen in the application, not buried in settings. Every recommendation displayed in the learning guide links to its audit event. Users can browse chronologically ("What changed today?") or by topic ("Why is the system doing this for eigenvalue decomposition?"). Profile version diffs show what improved, what remained uncertain, and what measurement would reduce uncertainty fastest.

---

## 9. Ethical Commitments

### Data Ownership

Your data is yours. You can export your complete profile -- evidence, inferences, policy decisions, audit log -- in structured format at any time. You can delete your account and all associated data at any time. There is no retention period. There is no "we keep anonymized data." Delete means delete.

### No External Profiling

Your learner profile is never sold. It is never shared with institutions, employers, or third parties. Core Model does not report your metacognitive scores to your university. It does not tell your employer that your motivation is flagging. The profile exists to serve you, not to evaluate you.

### Bias Awareness

Psychometric instruments have known biases. CRT items can be culturally loaded. MAI self-report scales are subject to social desirability bias. Big Five norms vary across populations. Core Model addresses this through multiple convergent measures: no single instrument drives a decision alone. Behavioral evidence (what you actually do) is always weighted more heavily than self-report (what you say you do). Construct inferences carry explicit confidence bands, and the system identifies when uncertainty is too high to act on a signal.

### Preference vs. Effectiveness

This commitment deserves its own section because it is the ethical core of the product. We will never tell you that a format preference improves your learning. We will track what actually improves your learning, using pre/post measurement and retention tests. If you prefer video but retrieval practice with text produces better outcomes for you, we will tell you that -- with the evidence. You can still choose video. But you will make that choice informed, not misled [1].

### Continuous Validation

Every intervention in Core Model's library is subject to ongoing evaluation. If spaced retrieval is not producing measurable retention improvement for a cohort, the policy is revised or removed. If a metacognitive prompt is not improving calibration, it is modified. The system includes a rollback rule: if policy X does not beat baseline Y for cohort Z, revert. Interventions earn their place through evidence, not assumptions.

---

# PART IV: COMPETITIVE POSITIONING

---

## 10. Why Core Model Is Different

### vs. Anki / Quizlet: Tools vs. System

Anki and Quizlet are flashcard tools. They implement spaced repetition at the card level. That is valuable. But they require manual card creation, have no concept of a knowledge graph, no learner profiling beyond card-level statistics, no metacognitive training, no uncertainty quantification, and no audit trail. They are hammers. Core Model is a workshop.

### vs. Coursera / EdX: Course-Level vs. Concept-Level Adaptation

Coursera and EdX adapt at the course level: if you fail a quiz, you retake the module. Core Model adapts at the concept level: if your mastery of eigenvalue decomposition drops, the system adjusts spacing, pacing, and problem types for that specific concept while leaving your linear systems practice unchanged. Course-level adaptation is too coarse for graduate-level material where knowledge is interconnected and gaps are specific.

### vs. AI Tutors (ChatGPT, Khanmigo): No Persistent Model, No Uncertainty, No Audit

ChatGPT is a remarkable conversational tool. But it has no persistent model of you. Every conversation starts from zero. It cannot track your mastery over time. It cannot detect that your calibration is deteriorating. It cannot tell you why it recommended something, because it does not have a policy engine -- it generates responses from patterns, not from inference chains. Khanmigo adds some persistence but still lacks uncertainty quantification and audit trails. Core Model is not a chatbot. It is a measurement-driven adaptive system that uses language models only for structured output generation, never for scoring, inference, or policy decisions.

### vs. "Learning Styles" Platforms: Debunked Science

Any platform that profiles you as a "visual learner" and then claims to improve your outcomes by showing you more diagrams is making a claim unsupported by evidence [1]. Core Model explicitly rejects this approach. We measure what works, not what you prefer. We show you the evidence. We let you decide.

---

# PART V: GETTING STARTED

---

## 11. Your First Week with Core Model

### What to Upload First

Start with whatever you are currently studying. The more representative the material, the better the initial concept graph. Lecture slides and problem sets are ideal because they provide both content structure and assessment items. Textbook chapters work well. Your own notes work too -- the system will extract structure from unstructured text.

### Initial Profiling Expectations

The baseline assessment takes 10-15 minutes. It is adaptive: items get harder or easier based on your responses. You will be asked to predict your confidence before each item and reflect on errors after incorrect items. This is not a quiz with a grade -- it is a measurement instrument.

If you opt into additional modules (MAI, LASSI, SDT, CRT, Big Five), expect an additional 15-25 minutes total. Each module explains what decision it will influence before you begin.

### Week 1: Wide Confidence Intervals, Exploratory Recommendations

Your initial profile (Version 1.0) will have wide confidence intervals. This is correct behavior, not a limitation. The system is being honest about the limited evidence available. Recommendations will be exploratory: the system will try different approaches (more retrieval, more worked examples, different spacing intervals) to see what produces the best evidence of learning for you specifically.

Expect the learning guide to change noticeably between days as new evidence arrives. This is the system learning about you.

### Week 4: Narrowing Uncertainty, Precise Recommendations

By week four, the system has accumulated substantial behavioral evidence. Confidence intervals have narrowed. The mastery map is detailed and precise. Calibration trends are clear. Strategy patterns have emerged from adherence data.

Recommendations are now precise and efficient. The system knows which concepts need spaced review and at what intervals. It knows where your calibration breaks down and inserts targeted reflection. It knows your adherence patterns and adjusts session structure accordingly. Your time is spent where it produces the most learning per minute.

### How to Read the Learning DNA Dashboard

The dashboard displays three panes corresponding to the three layers of the system:

**Pane A -- Evidence:** Your mastery map by concept (each with a confidence interval), your calibration curve (confidence vs. accuracy), retrieval stability indicators, and time-to-solution distributions. This is what the system observed.

**Pane B -- Inferences:** Construct estimates with uncertainty bands. Cognitive load risk, self-regulation risk, motivation support needed -- each showing the current estimate, the confidence level, and what measurement would reduce uncertainty fastest. This is what the system concluded.

**Pane C -- Policy:** The active decisions and their rationale. Pacing rules, spacing schedules, feedback style, study-skill modules, metacognitive prompt frequency. Each decision links to the inference that triggered it and the evidence behind that inference. This is what the system is doing and why.

---

## 12. References

[1] Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest*, 9(3), 105-119. https://journals.sagepub.com/doi/10.1111/j.1539-6053.2009.01038.x

[2] Frederick, S. (2005). Cognitive reflection and decision making. *Journal of Economic Perspectives*, 19(4), 25-42. https://www.aeaweb.org/articles?id=10.1257%2F089533005775196732

[3] Schraw, G., & Dennison, R. S. (1994). Assessing metacognitive awareness. *Contemporary Educational Psychology*, 19(4), 460-475. https://www.sciencedirect.com/science/article/pii/S0361476X84710332

[4] Weinstein, C. E., Palmer, D. R., & Acee, T. W. (2016). *LASSI User's Manual* (3rd ed.). H&H Publishing. https://www.hhpublishing.com/LASSImanual.pdf

[5] Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist*, 55(1), 68-78. https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf

[6] Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)*. National Center for Research to Improve Postsecondary Teaching and Learning. https://files.eric.ed.gov/fulltext/ED338122.pdf

[7] Vedel, A. (2014). The Big Five and tertiary academic performance: A systematic review and meta-analysis. *Personality and Individual Differences*, 71, 66-76. https://pubmed.ncbi.nlm.nih.gov/34265097/

[8] Primi, C., Morsanyi, K., Chiesi, F., Donati, M. A., & Hamilton, J. (2016). The development and testing of a new version of the Cognitive Reflection Test applying Item Response Theory (IRT). *Journal of Behavioral Decision Making*, 29(5), 453-469. https://pmc.ncbi.nlm.nih.gov/articles/PMC5225989/

---

## Appendix A: Glossary

**Bayesian posterior.** The updated probability distribution for a parameter (e.g., mastery level) after observing new evidence. Combines prior belief with observed data using Bayes' theorem.

**Confidence interval (credible interval).** A range within which a parameter is estimated to lie with a specified probability (e.g., 95%). In Bayesian terms, this is a credible interval: the posterior probability that the true value falls within the range.

**Calibration.** The degree to which a learner's confidence predictions match their actual performance. A well-calibrated learner who says "I am 80% sure" is correct about 80% of the time.

**ECE (Expected Calibration Error).** A metric that quantifies how well-calibrated a set of predictions is. It bins predictions by confidence level and measures the average gap between predicted confidence and observed accuracy across bins.

**Brier score.** A scoring rule that measures the accuracy of probabilistic predictions. It ranges from 0 (perfect) to 1 (worst). Captures both calibration and resolution (the ability to distinguish cases where the event occurs from those where it does not).

**Retrieval practice.** The learning strategy of actively recalling information from memory rather than passively re-reading or reviewing. Produces stronger and more durable learning than passive study.

**Spaced repetition.** The practice of reviewing material at increasing intervals over time. Items reviewed just before they would be forgotten produce the strongest retention signal.

**Interleaving.** The practice of mixing different problem types or topics within a single study session rather than blocking them (studying all of one type before moving to the next). Produces better transfer and discrimination.

**Knowledge graph.** A structured representation of concepts and their relationships (prerequisites, co-requisites, difficulty ordering) that enables the system to sequence learning material and identify gaps.

**Psychometric instrument.** A standardized tool for measuring psychological constructs (e.g., metacognitive awareness, cognitive reflection, personality traits). Validated instruments have established reliability and validity evidence.

---

## Appendix B: How We Validate

### A/B Testing

Core Model's policy engine supports A/B testing by design. Because policy decisions are versioned and auditable, two learners can receive different policy versions and their outcomes can be compared directly. The system tracks mastery retention (7/14/30 days), calibration improvement (ECE/Brier change), adherence and persistence, and time-to-mastery per concept.

### Pre/Post Measurement

Every learner serves as their own control. The baseline assessment establishes initial mastery, calibration, and construct estimates. Subsequent profile versions track changes over time. Because profiles are immutable snapshots with parent pointers, the system can compute precise diffs: what improved, what regressed, what remained uncertain.

### Revision Policy

If an intervention does not produce measurable improvement for a cohort, it is revised or removed. This is a non-negotiable principle. The system includes a rollback rule: if policy X does not beat baseline Y for cohort Z within a defined evaluation window, revert to baseline. Interventions are not permanent features -- they are hypotheses that must be validated by evidence. The same standard that Core Model applies to learner claims, it applies to its own recommendations.
