import type { Resource } from "./types"

export const resources: Resource[] = [
  {
    slug: "spaced-repetition-implementation-guide",
    title: "The Complete Guide to Spaced Repetition",
    metaTitle: "Spaced Repetition Implementation Guide | Core Model Resources",
    metaDescription: "A comprehensive guide to implementing spaced repetition in your study routine. Includes schedules, algorithms, and best practices backed by cognitive science research.",
    keywords: ["spaced repetition guide", "study schedule", "learning guide", "memory techniques"],
    type: "guide",
    category: "Learning Science",
    description: "A 20-page guide to implementing spaced repetition effectively, with sample schedules and evidence-based best practices.",
    longDescription: "This comprehensive guide covers everything you need to know about spaced repetition: the neuroscience behind it, how to calculate optimal review intervals, sample weekly study schedules for different time budgets, common mistakes to avoid, and how to integrate spaced repetition with active recall and interleaving for maximum retention.",
    pages: 20,
    downloadCta: "Download Free Guide",
    topics: ["Spaced Repetition", "Memory Science", "Study Schedules", "Learning Optimization"],
    content: `THE COMPLETE GUIDE TO SPACED REPETITION
Implementation Guide for Learners and Educators

TABLE OF CONTENTS
1. What Is Spaced Repetition?
2. The Neuroscience of Memory Consolidation
3. Calculating Optimal Review Intervals
4. Sample Study Schedules
5. Integration with Active Recall
6. Common Mistakes and How to Avoid Them
7. Tools and Technology
8. Advanced Techniques

---

CHAPTER 1: WHAT IS SPACED REPETITION?

Spaced repetition is a learning technique that involves reviewing information at strategically increasing intervals. Instead of cramming all your study into a single session, you space reviews over days, weeks, and months.

The core principle: review material just before you would forget it. This strengthens the memory trace more effectively than reviewing when the information is still fresh.

Key Research Findings:
- Ebbinghaus (1885): First documented the forgetting curve
- Cepeda et al. (2006): Spaced practice produces 2.4x better retention
- Pashler et al. (2007): Optimal spacing depends on desired retention period

CHAPTER 2: THE NEUROSCIENCE OF MEMORY CONSOLIDATION

Memory consolidation occurs in two phases:
1. Synaptic consolidation (hours): New connections between neurons are stabilized
2. Systems consolidation (days to weeks): Memories transfer from hippocampus to cortex

Spaced repetition leverages both phases by allowing time for consolidation between review sessions. Each retrieval during a spaced session triggers reconsolidation, further strengthening the memory trace.

CHAPTER 3: CALCULATING OPTIMAL REVIEW INTERVALS

The optimal interval depends on three factors:
- How well you knew the material initially
- How many times you've reviewed it
- How long you need to retain it

A general guideline for new material:
- First review: 1 day after initial learning
- Second review: 3 days after first review
- Third review: 7 days after second review
- Fourth review: 21 days after third review
- Fifth review: 60 days after fourth review

These intervals should be adjusted based on performance. If you recall easily, extend the interval. If you struggle, shorten it.

CHAPTER 4: SAMPLE STUDY SCHEDULES

For 30 minutes/day:
- Monday: 15 min new material + 15 min review
- Tuesday: 10 min new material + 20 min review
- Wednesday: 15 min new material + 15 min review
- Thursday: 10 min new material + 20 min review
- Friday: 30 min review (mixed topics)

For 60 minutes/day:
- Split into two 30-minute sessions (morning and evening)
- Morning: New material + same-day review
- Evening: Spaced review of older material

CHAPTER 5: INTEGRATION WITH ACTIVE RECALL

Spaced repetition works best when combined with active recall (retrieval practice). During each review session:
1. Attempt to recall the information before seeing it
2. Rate your confidence in your answer
3. Check against the correct answer
4. Note discrepancies between confidence and accuracy

CHAPTER 6: COMMON MISTAKES

1. Reviewing too frequently: Over-reviewing wastes time on material you already know
2. Not spacing enough: If every review is easy, your intervals are too short
3. Passive review: Re-reading instead of actively recalling defeats the purpose
4. Ignoring difficulty: Not adjusting intervals based on performance
5. Too much new material: Balance new learning with review of existing material

CHAPTER 7: TOOLS AND TECHNOLOGY

Core Model automates spaced repetition with Bayesian mastery tracking, adjusting intervals individually based on your performance and confidence ratings.

CHAPTER 8: ADVANCED TECHNIQUES

- Interleaved spacing: Mix different topics within spaced review sessions
- Elaborative retrieval: During review, explain why the answer is correct
- Calibration tracking: Monitor your confidence accuracy over time`
  },
  {
    slug: "study-plan-template",
    title: "The Evidence-Based Study Plan Template",
    metaTitle: "Study Plan Template | Core Model Resources",
    metaDescription: "Download a free study plan template based on cognitive science research. Includes goal setting, scheduling, and progress tracking frameworks.",
    keywords: ["study plan template", "study schedule", "learning plan", "exam preparation template"],
    type: "template",
    category: "Study Planning",
    description: "A ready-to-use study plan template incorporating spaced repetition, retrieval practice, and interleaving schedules.",
    longDescription: "This template provides a structured framework for building an evidence-based study plan. It includes sections for goal setting with SMART criteria, daily and weekly scheduling blocks, spaced repetition tracking sheets, confidence calibration logs, and progress monitoring dashboards. Based on the learning science principles of retrieval practice, spaced repetition, and interleaving.",
    pages: 12,
    downloadCta: "Download Free Template",
    topics: ["Study Planning", "Time Management", "Goal Setting", "Progress Tracking"],
    content: `THE EVIDENCE-BASED STUDY PLAN TEMPLATE
Your Framework for Effective Learning

SECTION 1: GOAL SETTING

Define Your Learning Goals (SMART Framework):
- Specific: What exactly do you want to learn?
- Measurable: How will you know you've learned it?
- Achievable: Is this realistic given your time constraints?
- Relevant: Why does this matter for your goals?
- Time-bound: When is your deadline?

Example:
Goal: Master eigenvalues and eigenvectors
Measure: Score 85%+ on practice problems without reference
Achievable: 30 min/day, 5 days/week
Relevant: Required for Linear Algebra midterm
Deadline: March 28, 2026

SECTION 2: KNOWLEDGE AUDIT

Before building your study plan, assess your current knowledge:

For each topic in your syllabus, rate yourself:
[ ] Completely new to me (0-20% mastery)
[ ] I've seen this before (20-40% mastery)
[ ] I understand the basics (40-60% mastery)
[ ] I can apply this with some help (60-80% mastery)
[ ] I can teach this to others (80-100% mastery)

This self-assessment helps prioritize study time. Focus on topics rated 20-60% — they offer the highest return on study investment.

SECTION 3: WEEKLY SCHEDULE TEMPLATE

Monday:
[ ] New material: _____ (25 min)
[ ] Retrieval practice on yesterday's material (10 min)
[ ] Spaced review of last week's material (15 min)

Tuesday:
[ ] New material: _____ (25 min)
[ ] Retrieval practice on Monday's material (10 min)
[ ] Interleaved practice across topics (15 min)

[Pattern continues for each day]

Weekend:
[ ] Comprehensive spaced review (30 min)
[ ] Calibration check: predict performance, then test (15 min)
[ ] Plan next week's focus areas (15 min)

SECTION 4: DAILY SESSION STRUCTURE

Each study session should follow this pattern:
1. Warm-up retrieval (5 min): What do I remember from last session?
2. New material (15-20 min): Active reading with self-questioning
3. Immediate practice (10-15 min): Apply concepts without notes
4. Confidence calibration (5 min): Rate confidence on today's concepts
5. Plan next session (2 min): What will I focus on next?

SECTION 5: PROGRESS TRACKING

Weekly Progress Log:
Date: _____
Concepts studied: _____
Confidence level (1-5): _____
Actual performance (% correct): _____
Calibration gap: _____
Notes for next week: _____

SECTION 6: EXAM COUNTDOWN PLANNER

Weeks until exam: _____

Week 1: Focus on lowest-mastery topics
Week 2-3: Build breadth across all topics
Week 4: Interleaved practice across all topics
Final week: Light review, focus on confidence calibration
Exam day: Trust your preparation`
  },
  {
    slug: "metacognition-checklist",
    title: "The Metacognition Self-Assessment Checklist",
    metaTitle: "Metacognition Checklist for Students | Core Model Resources",
    metaDescription: "Assess and develop your metacognitive skills with this comprehensive checklist. Improve self-awareness, study planning, and learning efficiency.",
    keywords: ["metacognition checklist", "self-assessment", "study skills assessment", "learning self-awareness"],
    type: "checklist",
    category: "Metacognition",
    description: "A practical checklist for developing metacognitive awareness, with self-assessment tools and improvement strategies.",
    longDescription: "This checklist helps learners assess their metacognitive skills across four dimensions: planning, monitoring, evaluating, and calibrating. Each section includes diagnostic questions, scoring rubrics, and specific strategies for improvement. Use it weekly to track your metacognitive development and become a more self-aware learner.",
    pages: 8,
    downloadCta: "Download Free Checklist",
    topics: ["Metacognition", "Self-Assessment", "Study Skills", "Self-Regulation"],
    content: `THE METACOGNITION SELF-ASSESSMENT CHECKLIST
Develop Self-Awareness as a Learner

PART 1: PLANNING ASSESSMENT

Before each study session, do you:
[ ] Set specific learning goals for the session?
[ ] Choose study strategies based on the type of material?
[ ] Estimate how long the session will take?
[ ] Identify what you already know about the topic?
[ ] Gather all materials needed before starting?

Score: ___/5

If you scored 0-2: You tend to study reactively rather than strategically.
Action: Before each session, spend 2 minutes writing down your goal and approach.

If you scored 3-4: You plan sometimes but not consistently.
Action: Create a pre-study checklist and use it every session until it becomes habit.

If you scored 5: Excellent planning skills! Focus on monitoring and evaluation.

PART 2: MONITORING ASSESSMENT

During study sessions, do you:
[ ] Periodically check whether you understand the material?
[ ] Pause and self-explain when concepts are unclear?
[ ] Adjust your approach when something isn't working?
[ ] Notice when your attention is drifting?
[ ] Ask yourself "Can I explain this without notes?"

Score: ___/5

Improvement strategies:
- Set a timer for every 15 minutes. When it rings, pause and summarize what you've learned.
- Use the "explain it to a 5-year-old" test for each concept.
- Keep a "confusion log" of concepts that aren't clear.

PART 3: EVALUATION ASSESSMENT

After study sessions, do you:
[ ] Review whether you met your session goals?
[ ] Identify what worked and what didn't?
[ ] Plan adjustments for next session?
[ ] Test yourself on the material you just studied?
[ ] Honestly assess how well you understood the material?

Score: ___/5

Improvement strategies:
- End every session with 5 minutes of reflection.
- Write down 3 things you learned and 1 thing you're still unsure about.
- Use retrieval practice (self-testing) as your evaluation method.

PART 4: CALIBRATION ASSESSMENT

When assessing your own knowledge, do you:
[ ] Predict your performance before taking practice tests?
[ ] Compare your predictions to actual results?
[ ] Track whether you tend to be overconfident or underconfident?
[ ] Adjust your study time based on actual (not perceived) weaknesses?
[ ] Seek external feedback to validate self-assessments?

Score: ___/5

Improvement strategies:
- Before every practice test, write predicted scores for each section.
- Create a calibration log tracking predicted vs. actual performance.
- Focus extra study time on areas where you were most overconfident.

TOTAL SCORE: ___/20

16-20: Strong metacognitive learner
11-15: Developing metacognitive skills, focus on weakest area
6-10: Significant room for improvement, start with planning
0-5: Consider working with a study skills coach or advisor`
  },
  {
    slug: "adaptive-learning-whitepaper",
    title: "Adaptive Learning in Higher Education: Evidence and Implementation",
    metaTitle: "Adaptive Learning Whitepaper | Core Model Resources",
    metaDescription: "A research whitepaper on adaptive learning effectiveness in higher education. Includes data from meta-analyses, implementation strategies, and ROI analysis.",
    keywords: ["adaptive learning whitepaper", "education research", "learning technology", "higher education innovation"],
    type: "whitepaper",
    category: "Research",
    description: "A research whitepaper examining the evidence base for adaptive learning in higher education, with implementation recommendations.",
    longDescription: "This whitepaper synthesizes evidence from multiple meta-analyses examining adaptive learning effectiveness in higher education settings. It covers learning outcomes data, implementation models, cost-benefit analysis, faculty adoption strategies, and student experience research. Designed for administrators, department heads, and educational technology decision-makers.",
    pages: 28,
    downloadCta: "Download Whitepaper",
    topics: ["Adaptive Learning", "Higher Education", "Evidence-Based Practice", "Educational Technology"],
    content: `ADAPTIVE LEARNING IN HIGHER EDUCATION:
EVIDENCE AND IMPLEMENTATION
A Whitepaper by Core Model Research

EXECUTIVE SUMMARY

Adaptive learning technology adjusts content, difficulty, and pacing based on individual learner performance. This whitepaper examines the evidence base for adaptive learning in higher education, drawing on data from multiple meta-analyses covering over 300 controlled studies.

Key findings:
- Adaptive learning produces an average effect size of 0.41 SD (equivalent to moving from the 50th to the 66th percentile)
- Failure rates decrease by 20-35% in courses using adaptive technology
- Time to mastery reduces by 25-50% for most learners
- Student satisfaction increases, particularly among diverse learner populations
- Return on investment is positive within 2-3 semesters for most implementations

SECTION 1: THE EVIDENCE BASE

Meta-Analysis Summary:
Kulik and Fletcher (2016) analyzed 50 controlled studies of adaptive learning systems, finding a weighted mean effect size of 0.41 standard deviations favoring adaptive over non-adaptive instruction.

The U.S. Department of Education's National Education Technology Plan has consistently identified adaptive learning as a high-priority area for educational technology investment.

Key moderating variables:
- Subject matter: Effects are strongest in STEM and professional fields
- Implementation fidelity: Results depend heavily on proper integration with instruction
- Student population: Diverse prior knowledge levels benefit most from adaptation
- Instructor engagement: Faculty who actively use analytics see better outcomes

SECTION 2: IMPLEMENTATION MODELS

Model 1: Supplemental Study Tool
- Students use adaptive platform alongside traditional instruction
- Platform provides spaced repetition, retrieval practice, and mastery tracking
- Faculty access dashboards for concept-level student analytics
- Lowest barrier to adoption; positive results with minimal course redesign

Model 2: Blended Learning Integration
- Adaptive platform replaces some traditional instruction time
- In-class time shifts to active learning, discussion, and problem-solving
- Platform handles content delivery and assessment
- Moderate implementation effort; larger learning gains

Model 3: Fully Adaptive Course
- Course structure adapts entirely to individual learner progress
- Fixed timeline replaced by mastery-based progression
- Requires significant course redesign
- Highest potential impact; highest implementation complexity

SECTION 3: COST-BENEFIT ANALYSIS

Direct costs: Platform licensing ($15-50 per student per course)
Indirect costs: Faculty training, course redesign time, IT support
Benefits: Reduced failure rates (fewer repeating students), improved outcomes, faculty time savings from automated assessment and analytics

Typical ROI timeline: 2-3 semesters to breakeven, positive ongoing returns

SECTION 4: FACULTY ADOPTION STRATEGIES

Research shows faculty adoption is the primary predictor of implementation success. Recommended approaches:
1. Start with willing early adopters (don't mandate)
2. Provide release time for course redesign
3. Share student outcome data from pilot courses
4. Create faculty learning communities for peer support
5. Integrate with existing LMS to reduce friction

SECTION 5: STUDENT EXPERIENCE

Student survey data consistently shows:
- 78% prefer adaptive to non-adaptive study tools
- 85% report better understanding of their own knowledge gaps
- 72% feel more confident in exam preparation
- 68% report reduced study anxiety

The most valued features: personalized study plans, mastery tracking dashboards, and immediate feedback on practice questions.

CONCLUSION

The evidence for adaptive learning in higher education is compelling. Institutions that implement adaptive technology thoughtfully — with faculty support, proper integration, and attention to student experience — can expect meaningful improvements in learning outcomes, retention, and student satisfaction.`
  },
  {
    slug: "knowledge-gap-analysis-template",
    title: "Knowledge Gap Analysis Template for Educators",
    metaTitle: "Knowledge Gap Analysis Template | Core Model Resources",
    metaDescription: "A practical template for educators to identify and address knowledge gaps in their students. Includes assessment frameworks and intervention strategies.",
    keywords: ["knowledge gap analysis", "student assessment", "educator tools", "learning gaps", "formative assessment"],
    type: "template",
    category: "Educator Tools",
    description: "A structured template for identifying, analyzing, and addressing knowledge gaps in your students or your own learning.",
    longDescription: "This template provides a systematic framework for conducting knowledge gap analyses. It includes concept inventory checklists, mastery estimation rubrics, gap prioritization matrices, and intervention planning worksheets. Designed for educators who want data-driven insights into student understanding at the concept level.",
    pages: 15,
    downloadCta: "Download Free Template",
    topics: ["Assessment", "Knowledge Gaps", "Formative Assessment", "Intervention Planning"],
    content: `KNOWLEDGE GAP ANALYSIS TEMPLATE
For Educators and Self-Directed Learners

STEP 1: CONCEPT INVENTORY

List all concepts in your course/domain:

Concept | Prerequisite Concepts | Difficulty Level | Priority
--------|---------------------|-----------------|----------
[Concept 1] | [List prerequisites] | [Low/Med/High] | [Core/Supporting/Advanced]
[Concept 2] | [List prerequisites] | [Low/Med/High] | [Core/Supporting/Advanced]

Tips for building your concept inventory:
- Start with your syllabus or learning objectives
- Break broad topics into specific, assessable concepts
- Map prerequisite relationships between concepts
- Label each concept as core (essential), supporting (helpful), or advanced (bonus)

STEP 2: MASTERY ASSESSMENT

For each concept, assess current mastery level:

Rating Scale:
1 = Cannot define or recognize
2 = Can define but not explain
3 = Can explain but not apply
4 = Can apply in familiar contexts
5 = Can apply in novel contexts and teach to others

Assessment Methods:
- Self-report (least accurate, quickest)
- Concept check questions (moderate accuracy)
- Application problems (high accuracy)
- Teaching/explanation tasks (highest accuracy)

STEP 3: GAP IDENTIFICATION

Gaps = Concepts where current mastery < required mastery

Gap Analysis Matrix:
Concept | Current Mastery | Required Mastery | Gap Size | Priority
--------|----------------|-----------------|----------|----------
[Concept] | [1-5] | [1-5] | [Difference] | [Critical/Important/Nice-to-have]

Priority assignment:
- Critical: Core concept with large gap AND is a prerequisite for other topics
- Important: Core concept with moderate gap OR prerequisite for important topics
- Nice-to-have: Supporting or advanced concept with any gap size

STEP 4: ROOT CAUSE ANALYSIS

For each critical gap, identify likely causes:
[ ] Prerequisite knowledge missing
[ ] Insufficient practice
[ ] Misconception present
[ ] Material not yet covered
[ ] Assessment not aligned with instruction
[ ] Learning strategy ineffective for this content type

STEP 5: INTERVENTION PLANNING

For each critical gap:

Concept: _____
Root cause: _____
Intervention strategy: _____
Resources needed: _____
Timeline: _____
Success metric: _____
Follow-up assessment date: _____

Intervention Strategy Menu:
- Prerequisite remediation: Address underlying knowledge gaps first
- Retrieval practice: Generate practice questions targeting this concept
- Worked examples: Provide solved examples with step-by-step reasoning
- Peer instruction: Pair struggling students with proficient students
- Alternative explanation: Present concept using different approach or modality
- Spaced review: Schedule repeated practice at increasing intervals

STEP 6: MONITORING AND ADJUSTMENT

Weekly check-in:
- Which gaps are closing? (Reassess mastery)
- Which gaps persist? (Adjust intervention)
- Are new gaps emerging? (Update inventory)
- Is the pacing appropriate? (Adjust timeline)

Use this template iteratively throughout your course to maintain a data-driven approach to student learning.`
  },
  {
    slug: "learning-science-research-summary",
    title: "Learning Science Research Summary: What Works, What Doesn't",
    metaTitle: "Learning Science Research Summary | Core Model Resources",
    metaDescription: "A concise summary of the most important learning science research findings. Covers what study techniques work, what doesn't, and why, with citations.",
    keywords: ["learning science", "study techniques research", "evidence-based learning", "education research summary"],
    type: "research",
    category: "Learning Science",
    description: "A research summary covering the most impactful findings in learning science, with practical applications for students and educators.",
    longDescription: "This research summary distills decades of cognitive science and educational psychology research into actionable findings. It covers the most effective study strategies (and ranks them by evidence strength), debunks common learning myths, explains the key principles of memory and cognition, and provides a bibliography of essential readings for educators and serious learners.",
    pages: 18,
    downloadCta: "Download Research Summary",
    topics: ["Learning Science", "Cognitive Psychology", "Study Strategies", "Education Research"],
    content: `LEARNING SCIENCE RESEARCH SUMMARY
What Works, What Doesn't, and Why

PART 1: STUDY TECHNIQUES RANKED BY EVIDENCE

HIGHLY EFFECTIVE (Strong, replicated evidence):
1. Retrieval Practice (Self-Testing)
   - Effect: 50-100% improvement in long-term retention
   - Mechanism: Retrieval strengthens memory traces
   - Key study: Roediger & Karpicke (2006)
   - Application: Test yourself before re-reading

2. Spaced Practice (Distributed Study)
   - Effect: 2.4x better retention vs. massed practice
   - Mechanism: Allows memory consolidation between sessions
   - Key study: Cepeda et al. (2006)
   - Application: Space reviews at increasing intervals

3. Interleaving (Mixed Practice)
   - Effect: 25-76% improvement on delayed tests
   - Mechanism: Forces discrimination between problem types
   - Key study: Rohrer & Taylor (2007)
   - Application: Mix different topics in each study session

MODERATELY EFFECTIVE (Good evidence):
4. Elaborative Interrogation
   - Effect: 20-40% improvement
   - Mechanism: Generating explanations deepens processing
   - Application: Ask "why?" and "how?" for each concept

5. Self-Explanation
   - Effect: 20-40% improvement
   - Mechanism: Connecting new info to prior knowledge
   - Application: Explain each step of a solution in your own words

MINIMALLY EFFECTIVE (Weak evidence or limited application):
6. Summarization
   - Limited effect; quality of summary matters more than the act
   - Better alternatives exist (retrieval practice)

7. Highlighting/Underlining
   - Minimal effect; may actually impair learning by creating false confidence
   - One of the most popular but least effective strategies

8. Re-Reading
   - Minimal effect beyond first reading
   - Creates fluency illusion (feeling of learning without actual learning)
   - The most common study strategy and one of the least effective

PART 2: KEY PRINCIPLES

The Forgetting Curve: Without review, we forget 70% within 24 hours
The Testing Effect: Retrieval strengthens memory more than re-study
The Spacing Effect: Distributed practice beats massed practice
Desirable Difficulties: Conditions that feel harder often produce better learning
The Dunning-Kruger Effect: Low-knowledge learners overestimate their ability
Transfer: Deep understanding enables application to new contexts

PART 3: COMMON MYTHS DEBUNKED

MYTH: People have fixed "learning styles" (visual, auditory, kinesthetic)
REALITY: No credible evidence supports matching instruction to learning styles (Pashler et al., 2008)

MYTH: We only use 10% of our brains
REALITY: Brain imaging shows activity across all brain regions

MYTH: Multitasking is effective for studying
REALITY: Task-switching reduces learning efficiency by 20-40%

MYTH: More study time always means more learning
REALITY: Study quality matters more than quantity

PART 4: BIBLIOGRAPHY

Essential Readings:
- Brown, Roediger, & McDaniel (2014). Make It Stick
- Bjork & Bjork (2011). Making things hard on yourself
- Dunlosky et al. (2013). Improving students' learning with effective learning techniques
- Freeman et al. (2014). Active learning increases student performance in science
- Kornell & Bjork (2008). Learning concepts and categories

Full bibliography available at coremodel.app/research`
  },
]
