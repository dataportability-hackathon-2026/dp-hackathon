# Core Model (External) - Concise Profile

## What Core Model is

Core Model is an adaptive learning system that:

1. Ingests your study materials (PDFs, notes, slides, text, links).
2. Builds a scientific learner profile from behavior + optional validated instruments.
3. Recommends what to study next, with clear reasoning and explicit uncertainty.

Core principle: **measure what works, not what feels personalized.**

---

## Part I: Problem and Promise

## 1) The problem

Graduate learners often use tools that are:

- generic,
- content-centric instead of learner-centric,
- opaque about why recommendations happen,
- overconfident without uncertainty.

Many systems also inherit weak assumptions (especially learning-styles claims) that do not hold up empirically [1].

## 2) The promise

Core Model makes four commitments ("Trust Contract"):

1. **Scores include uncertainty.** No fake precision.
2. **Adaptation is behavior-first.** Mastery evidence drives decisions.
3. **Every recommendation is auditable.** Observation -> inference -> policy change.
4. **Preference is not effectiveness.** Preferences can shape UX, not pedagogy claims [1].

## 3) User journey (upload -> mastery)

1. **Onboard:** upload material + set goals and time budget.
2. **Profile:** short adaptive baseline; confidence and behavior are measured.
3. **Learn:** a 7-day guide adapts with each session.
4. **See why:** every recommendation links to an audit trail.
5. **Grow:** uncertainty narrows over time; guidance becomes more precise.

---

## Part II: Science Foundation

## 4) Why not learning styles?

Core Model explicitly rejects "meshing" pedagogy to learning style labels. Evidence does not support outcome gains from that approach [1].

Preference data, if collected, is used for presentation choices only, not effectiveness claims.

## 5) Learning DNA: constructs measured

Core Model uses five main construct families:

- **Cognitive Reflection (CRT):** reflective vs intuitive response tendency (refs 2 and 8).
- **Metacognitive Awareness (MAI + behavioral calibration):** how well confidence matches performance [3].
- **Study Strategy Repertoire (LASSI + telemetry):** strategy gaps and trainable habits [4].
- **Motivational Orientation (SDT + MSLQ):** autonomy/competence/relatedness and dropout risk signals (refs 5 and 6).
- **Big Five (optional):** coaching tone modulation only, not content/difficulty gating [7].

Rule: a construct is used only if it changes an intervention decision.

## 6) Uncertainty is a feature

Core Model stores estimates as distributions, not single scores.

- Early stage: wide uncertainty -> exploratory recommendations.
- Later stage: narrower uncertainty -> precise recommendations.

This drives exploration vs exploitation in a transparent, measurable way.

## 7) Intervention map (measurement -> action)

- **Mastery state** -> retrieval, spacing, interleaving decisions.
- **Calibration quality** -> prediction/reflection/repair loops.
- **Strategy risk** -> study-skill modules (planning, focus, test strategy).
- **Motivation risk** -> autonomy-supportive policy and persistence supports.

Every recommendation must be traceable from evidence to policy.

---

## Part III: Trust, Transparency, Ethics

## 8) Audit trail

Each adaptive decision includes:

- **Observation:** what changed in behavior.
- **Inference:** what the system concluded (with confidence/uncertainty).
- **Policy change:** what was adjusted and why.

Audit trails are first-class UX, not hidden logs.

## 9) Ethical commitments

- **Data ownership:** exportable and deletable by the learner.
- **No external profiling:** learner profile is not sold/shared with institutions or employers.
- **Bias awareness:** no single instrument controls decisions; behavior is weighted heavily.
- **Preference vs effectiveness clarity:** users can choose, but evidence is shown.
- **Continuous validation:** interventions are revised/rolled back if outcomes do not improve.

---

## Part IV: Competitive Positioning

## 10) Why Core Model is different

- **vs Anki/Quizlet:** not just flashcards; includes profiling, uncertainty, policy logic, audits.
- **vs LMS/course platforms:** adapts at concept level, not just module level.
- **vs generic AI tutors:** persistent learner model + uncertainty + auditable policy.
- **vs learning-styles platforms:** rejects unsupported pedagogy claims [1].

---

## Part V: Getting Started

## 11) First week expectations

### What to upload first

Current course material (slides, problem sets, notes, chapters) that reflects what you are actively studying.

### Initial profiling

- Baseline takes about 10-15 minutes.
- Optional modules add roughly 15-25 minutes total.
- Confidence prediction is part of measurement, not a "personality quiz."

### Week 1 vs Week 4

- **Week 1:** wider uncertainty, more exploratory recommendations.
- **Week 4:** tighter uncertainty, sharper concept-level guidance.

### Reading the dashboard

- **Evidence pane:** observed performance + calibration.
- **Inference pane:** estimated risks/support needs + uncertainty.
- **Policy pane:** active decisions and rationale links.

---

## 12) Validation model

Core Model validates interventions with:

- **A/B testing** across policy versions.
- **Pre/post profile diffs** over time.
- **Revision/rollback policy** when intervention cohorts fail to beat baseline.

Interventions are treated as testable hypotheses, not permanent assumptions.

---

## Glossary (Short)

- **Calibration:** match between confidence and correctness.
- **ECE/Brier:** calibration quality metrics.
- **Knowledge graph:** concept + prerequisite map from uploaded materials.
- **Credible interval:** uncertainty range around an estimate.
- **Psychometric instrument:** validated measurement tool (used only when decision-relevant).

---

## References

[1] Pashler et al. (2008), Learning styles: Concepts and evidence  
<https://journals.sagepub.com/doi/10.1111/j.1539-6053.2009.01038.x>

[2] Frederick (2005), Cognitive reflection and decision making  
<https://www.aeaweb.org/articles?id=10.1257%2F089533005775196732>

[3] Schraw & Dennison (1994), Metacognitive Awareness Inventory  
<https://www.sciencedirect.com/science/article/pii/S0361476X84710332>

[4] Weinstein et al. (2016), LASSI manual  
<https://www.hhpublishing.com/LASSImanual.pdf>

[5] Ryan & Deci (2000), Self-Determination Theory  
<https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf>

[6] Pintrich et al. (1991), MSLQ manual  
<https://files.eric.ed.gov/fulltext/ED338122.pdf>

[7] Vedel (2014), Big Five and tertiary academic performance  
<https://pubmed.ncbi.nlm.nih.gov/34265097/>

[8] Primi et al. (2016), CRT contamination and rotated forms  
<https://pmc.ncbi.nlm.nih.gov/articles/PMC5225989/>
