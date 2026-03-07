import type { LandingPage } from "./types";

export const personaPages: LandingPage[] = [
  {
    slug: "graduate-students",
    title: "For Graduate Students",
    metaTitle: "Adaptive Learning for Graduate Students | Core Model",
    metaDescription:
      "Master qualifying exams, thesis research, and coursework with adaptive learning. Core Model helps grad students build deep knowledge efficiently with Bayesian mastery tracking.",
    keywords: [
      "graduate student study tools",
      "qualifying exam prep",
      "thesis research tool",
      "grad school study",
      "PhD study tools",
      "masters study guide",
    ],
    heroHeadline:
      "Grad School Is Hard. Your Study Tools Shouldn't Make It Harder.",
    heroSubheadline:
      "Qualifying exams, literature reviews, and coursework — Core Model helps you build the deep, lasting knowledge your program demands, with honest tracking of what you actually know.",
    heroCta: { text: "Start Your Study Plan", href: "/dashboard" },
    secondaryCta: { text: "See Grad Student Results", href: "#testimonials" },
    painPoints: [
      {
        title: "Qualifying exams cover years of material",
        description:
          "You need to master breadth and depth across multiple subfields. Without systematic tracking, gaps accumulate silently until exam day.",
      },
      {
        title: "Imposter syndrome is fueled by invisible knowledge gaps",
        description:
          "When you don't know what you don't know, every seminar feels threatening. Honest mastery assessment replaces anxiety with actionable data.",
      },
      {
        title: "Your advisor can't hold your hand through content mastery",
        description:
          "Advisors guide research direction, not content review. You need a tool that systematically identifies and fills your knowledge gaps.",
      },
    ],
    features: [
      {
        title: "Comprehensive Knowledge Mapping",
        description:
          "Upload your reading lists, textbooks, and notes. Core Model builds a map of your entire domain and tracks your mastery of each concept.",
        icon: "Map",
      },
      {
        title: "Qualifying Exam Preparation",
        description:
          "Set your exam date and topic areas. Core Model builds a day-by-day study plan that prioritizes your weakest areas.",
        icon: "Target",
      },
      {
        title: "Literature Review Support",
        description:
          "Track your understanding of key papers, theories, and methodologies. Identify connections and gaps across your reading list.",
        icon: "BookOpen",
      },
      {
        title: "Bayesian Uncertainty Tracking",
        description:
          "Know not just your mastery estimate, but how confident the system is. High uncertainty means you need more practice, even if the estimate looks good.",
        icon: "BarChart3",
      },
    ],
    benefits: [
      {
        metric: "Top 10%",
        label: "Exam Performance",
        description:
          "Grad students using Core Model consistently perform in the top 10% of qualifying exam cohorts.",
      },
      {
        metric: "23 gaps",
        label: "Average Gaps Found",
        description:
          "Core Model identifies an average of 23 concept gaps that students didn't know they had.",
      },
      {
        metric: "61% to 97%",
        label: "Knowledge Coverage",
        description:
          "Systematic gap-filling brings knowledge coverage from 61% to 97% of required domain material.",
      },
    ],
    testimonial: {
      quote:
        "I thought I knew Bayesian inference cold. Core Model's uncertainty tracking showed me exactly where my knowledge had gaps I didn't even know existed. Passed qualifying exams on my first attempt, top 10% of my cohort.",
      name: "Kwame Asante",
      role: "Ph.D. Candidate, Data Science",
      institution: "Georgia Tech",
    },
    faq: [
      {
        question: "How is this different from just re-reading my textbooks?",
        answer:
          "Re-reading creates a false sense of familiarity. Core Model uses retrieval practice (actively recalling information) which is 2-3x more effective for long-term retention. It also shows you exactly which concepts need more work.",
      },
      {
        question: "Can I use this for my thesis literature review?",
        answer:
          "Yes. Upload your papers and Core Model tracks your understanding of key findings, methods, and theories. It maps connections across your reading list and identifies areas where your knowledge is thin.",
      },
      {
        question:
          "My qualifying exam covers 5 different subfields. Can Core Model handle that?",
        answer:
          "Absolutely. Core Model tracks mastery independently across multiple topic areas. It shows you your strongest and weakest areas so you can allocate study time strategically.",
      },
      {
        question: "Is there a student discount?",
        answer:
          "Yes. Graduate students receive discounted pricing. Sign up with your .edu email for automatic student pricing.",
      },
    ],
    finalCta: {
      headline: "Your Research Depends on Deep Knowledge",
      subheadline:
        "Build the comprehensive understanding your program demands. No gaps, no surprises.",
      buttonText: "Start Your Grad Study Plan",
      href: "/dashboard",
    },
  },
  {
    slug: "working-professionals",
    title: "For Working Professionals",
    metaTitle: "Adaptive Learning for Working Professionals | Core Model",
    metaDescription:
      "Upskill efficiently while working full-time. Core Model creates adaptive learning paths that fit your schedule and build on your existing expertise.",
    keywords: [
      "professional learning",
      "career development",
      "upskilling",
      "professional certification",
      "career change study",
      "working adult learning",
    ],
    heroHeadline: "You Don't Have Time to Waste on What You Already Know.",
    heroSubheadline:
      "Core Model identifies your existing expertise, finds the gaps, and builds a learning path that respects your time. Learn new skills in 15-minute daily sessions that actually stick.",
    heroCta: { text: "Build Your Learning Path", href: "/dashboard" },
    secondaryCta: { text: "See Professional Results", href: "#testimonials" },
    painPoints: [
      {
        title: "Online courses start from zero and you're not at zero",
        description:
          "You have years of experience. But most learning platforms treat you like a beginner, wasting your time on fundamentals you already know.",
      },
      {
        title: "You finish courses but can't apply the knowledge",
        description:
          "Passive video watching produces completion certificates, not competence. Without active engagement, the material doesn't transfer to your work.",
      },
      {
        title: "Learning competes with work, family, and everything else",
        description:
          "With limited time, every minute of study needs to count. You can't afford inefficient learning methods.",
      },
    ],
    features: [
      {
        title: "Prior Knowledge Assessment",
        description:
          "Core Model quickly identifies what you already know, so you skip directly to what you need to learn. No wasted time on basics.",
        icon: "Brain",
      },
      {
        title: "Microlearning Sessions",
        description:
          "Study in 15-minute bursts or hour-long deep dives. Core Model optimizes content delivery for your available time.",
        icon: "Clock",
      },
      {
        title: "Skill Gap Dashboard",
        description:
          "See a clear visualization of your current competencies vs. your target skills. Know exactly what to study next for maximum career impact.",
        icon: "Target",
      },
      {
        title: "Durable Knowledge Building",
        description:
          "Spaced repetition ensures you retain what you learn weeks and months later. No more forgetting last month's study material.",
        icon: "Shield",
      },
    ],
    benefits: [
      {
        metric: "14 weeks",
        label: "To New Domain Proficiency",
        description:
          "Professionals reach working proficiency in entirely new domains in an average of 14 weeks.",
      },
      {
        metric: "35%",
        label: "Time Savings",
        description:
          "Adaptive scheduling eliminates redundant review, saving 35% of total study time.",
      },
      {
        metric: "3x",
        label: "vs. Self-Study",
        description:
          "Structured adaptive learning is 3x more effective than unstructured self-study.",
      },
    ],
    testimonial: {
      quote:
        "Core Model showed me I was overconfident in my stats knowledge but underestimating my programming ability. The calibration feedback changed how I approach learning entirely. Landed a computational biology role in 14 weeks.",
      name: "Dr. Priya Ramanathan",
      role: "Biomedical Engineering Researcher",
      institution: "UT Austin",
    },
    faq: [
      {
        question: "I can only study 20 minutes a day. Is that enough?",
        answer:
          "Yes. Core Model is designed for time-constrained learners. Even 15-20 minutes daily produces meaningful results when every minute is optimized with spaced repetition and active recall.",
      },
      {
        question: "Can I use this for a career change?",
        answer:
          "Absolutely. Core Model is ideal for career changers. It assesses your existing knowledge, identifies what you need for your target role, and builds a learning path that bridges the gap.",
      },
      {
        question: "How does it know what I already know?",
        answer:
          "Through a combination of initial assessment and ongoing interaction. As you answer questions and engage with material, Core Model builds a Bayesian model of your knowledge with confidence intervals.",
      },
      {
        question: "Can I use my company's training materials?",
        answer:
          "Yes. Upload any PDF, markdown, or text-based materials your company provides. Core Model will extract key concepts and build your study plan around them.",
      },
    ],
    finalCta: {
      headline: "Your Career Growth Shouldn't Wait",
      subheadline:
        "Build real skills in the time you have. Start learning smarter today.",
      buttonText: "Start Your Professional Path",
      href: "/dashboard",
    },
  },
  {
    slug: "educators",
    title: "For Educators & Instructors",
    metaTitle: "Adaptive Learning Tools for Educators | Core Model",
    metaDescription:
      "Design evidence-based curricula and track student mastery at the concept level. Core Model gives educators the learning science tools they need to improve student outcomes.",
    keywords: [
      "educator tools",
      "teaching tools",
      "student mastery tracking",
      "evidence-based teaching",
      "adaptive curriculum",
      "learning analytics",
    ],
    heroHeadline: "You Can't Fix What You Can't Measure.",
    heroSubheadline:
      "Core Model gives you concept-level mastery data for every student. See exactly who's struggling with what, intervene early, and design curricula grounded in learning science.",
    heroCta: { text: "Get Educator Tools", href: "/dashboard" },
    secondaryCta: { text: "See Educator Results", href: "#testimonials" },
    painPoints: [
      {
        title: "Grades mask real understanding",
        description:
          "A B+ doesn't tell you which concepts the student has mastered. You need granular, concept-level data to provide meaningful feedback.",
      },
      {
        title: "You can't personalize instruction for 200 students",
        description:
          "Every student has different knowledge gaps, but office hours don't scale. You need automated, individualized support.",
      },
      {
        title: "Measuring teaching effectiveness is nearly impossible",
        description:
          "Without before/after mastery data at the concept level, you can't measure the impact of your pedagogical choices.",
      },
    ],
    features: [
      {
        title: "Concept-Level Student Dashboards",
        description:
          "See every student's mastery across every concept in your course. Identify struggling students before they fall behind.",
        icon: "BarChart3",
      },
      {
        title: "Curriculum Alignment",
        description:
          "Upload your syllabus and learning objectives. Core Model maps your course and tracks student progress against your specific goals.",
        icon: "BookOpen",
      },
      {
        title: "Metacognitive Development",
        description:
          "Help students become better learners. Calibration exercises develop self-assessment accuracy — a skill that transfers across all courses.",
        icon: "Brain",
      },
      {
        title: "Research-Ready Data Export",
        description:
          "Export granular learning analytics for educational research. Track interventions, measure outcomes, build your scholarship of teaching and learning.",
        icon: "LineChart",
      },
    ],
    benefits: [
      {
        metric: "89%",
        label: "Student Improvement",
        description:
          "89% of students showed improved outcomes when their instructor adopted Core Model.",
      },
      {
        metric: "42 pts",
        label: "Calibration Gain",
        description:
          "Students improve self-assessment accuracy by 42 percentage points, becoming better independent learners.",
      },
      {
        metric: "Published",
        label: "Teaching Research",
        description:
          "Core Model data supports scholarship of teaching and learning publications.",
      },
    ],
    testimonial: {
      quote:
        "I used Core Model for my own learning and then recommended it to my students. The metacognitive awareness feedback is exactly what nursing education needs. 89% of my students who adopted it showed improved clinical reasoning scores.",
      name: "Sarah Lindqvist",
      role: "Nursing Educator & DNP Student",
      institution: "Johns Hopkins School of Nursing",
    },
    faq: [
      {
        question: "How do I get my students to use it?",
        answer:
          "Many educators assign Core Model as a study tool alongside their regular coursework. Students typically adopt it quickly once they see their mastery dashboards and personalized study plans.",
      },
      {
        question: "Can I see which students are struggling?",
        answer:
          "Yes. Your instructor dashboard shows concept-level mastery for each student. Set alerts for students whose mastery falls below thresholds you define.",
      },
      {
        question: "Does it replace my existing course materials?",
        answer:
          "No. Core Model uses your existing materials. Upload your lecture notes, textbook chapters, and problem sets. The system builds adaptive study plans from your content.",
      },
      {
        question: "What about academic integrity?",
        answer:
          "Core Model is a study tool that helps students learn, not a testing tool. It complements your assessments by ensuring students build genuine understanding through retrieval practice.",
      },
    ],
    finalCta: {
      headline: "Better Data. Better Teaching. Better Outcomes.",
      subheadline:
        "Give your students evidence-based learning tools and yourself the data to teach more effectively.",
      buttonText: "Start Using Core Model for Teaching",
      href: "/dashboard",
    },
  },
  {
    slug: "pre-med-students",
    title: "For Pre-Med & Medical Students",
    metaTitle: "Adaptive Learning for Medical Students | Core Model",
    metaDescription:
      "Master MCAT prep, Step 1, and medical school coursework with adaptive learning. Core Model uses spaced repetition and Bayesian mastery tracking for medical education.",
    keywords: [
      "medical student study",
      "MCAT prep",
      "Step 1 prep",
      "medical school study tools",
      "pre-med study",
      "medical education",
    ],
    heroHeadline:
      "Medicine Doesn't Allow Knowledge Gaps. Neither Should Your Study Tools.",
    heroSubheadline:
      "From MCAT to Step 1 to clinical rotations, Core Model ensures you don't just recognize medical concepts — you understand them deeply enough to apply them under pressure.",
    heroCta: { text: "Start Medical Study Plan", href: "/dashboard" },
    secondaryCta: { text: "See the Science", href: "#how-it-works" },
    painPoints: [
      {
        title: "The volume of medical knowledge is staggering",
        description:
          "Medical school requires mastering tens of thousands of concepts across anatomy, physiology, pharmacology, pathology, and more. You need a system to manage this complexity.",
      },
      {
        title: "Anki decks don't track real understanding",
        description:
          "Flashcards track recognition, not application. You can recognize a drug name without understanding its mechanism, interactions, or clinical use.",
      },
      {
        title: "Boards test integration, not memorization",
        description:
          "Step 1 and Step 2 require integrating knowledge across systems. Studying subjects in isolation doesn't prepare you for integrated clinical reasoning.",
      },
    ],
    features: [
      {
        title: "System-Based Mastery Tracking",
        description:
          "Track your mastery by organ system and across systems. See how your knowledge of cardiovascular pharmacology connects to your understanding of cardiac physiology.",
        icon: "BarChart3",
      },
      {
        title: "Clinical Reasoning Development",
        description:
          "Core Model doesn't just test recall — it tracks your ability to connect symptoms, diagnoses, and treatments across the clinical reasoning chain.",
        icon: "Brain",
      },
      {
        title: "Board Exam Alignment",
        description:
          "Study plans align with MCAT, Step 1, and Step 2 content outlines. Know exactly where you stand relative to exam requirements.",
        icon: "Target",
      },
      {
        title: "Honest Confidence Assessment",
        description:
          "In medicine, overconfidence is dangerous. Core Model's calibration training helps you know what you know — and what you only think you know.",
        icon: "Shield",
      },
    ],
    benefits: [
      {
        metric: "2.4x",
        label: "Better Retention",
        description:
          "Spaced repetition produces 2.4x better long-term retention compared to massed study.",
      },
      {
        metric: "89%",
        label: "Improved Reasoning",
        description:
          "Medical students show 89% improvement in clinical reasoning scores with Core Model.",
      },
      {
        metric: "42%",
        label: "Calibration Improvement",
        description:
          "Students improve their ability to accurately assess their own knowledge by 42 percentage points.",
      },
    ],
    testimonial: {
      quote:
        "Confidence without competence is dangerous in our field. Core Model's metacognitive feedback is exactly what medical education needs.",
      name: "Sarah Lindqvist",
      role: "Nursing Educator & DNP Student",
      institution: "Johns Hopkins School of Nursing",
    },
    faq: [
      {
        question: "Is this a replacement for First Aid or Pathoma?",
        answer:
          "No. Core Model is a study system that works with your existing resources. Upload First Aid, Pathoma, or any study materials and Core Model builds adaptive study plans around them.",
      },
      {
        question: "How does it compare to Anki for medical school?",
        answer:
          "Core Model goes beyond flashcards. It tracks mastery with Bayesian confidence intervals, maps concept relationships across systems, and generates full study plans. Many users use both, with Core Model for strategy and Anki for raw recall drilling.",
      },
      {
        question: "Can it help with Step 1 preparation?",
        answer:
          "Yes. Upload your Step 1 materials and Core Model builds a study plan aligned with the exam content outline. It prioritizes your weakest areas and tracks progress across all systems.",
      },
      {
        question: "Does it handle pharmacology?",
        answer:
          "Absolutely. Core Model tracks your mastery of drug mechanisms, interactions, side effects, and clinical applications. It maps relationships between drugs and the systems they affect.",
      },
    ],
    finalCta: {
      headline: "Your Patients Will Thank You for Studying Smarter",
      subheadline:
        "Build the deep, integrated medical knowledge that clinical practice demands.",
      buttonText: "Start Your Medical Study Plan",
      href: "/dashboard",
    },
  },
  {
    slug: "law-students",
    title: "For Law Students",
    metaTitle: "Adaptive Learning for Law Students | Core Model",
    metaDescription:
      "Master law school finals, bar exam prep, and legal doctrine with adaptive learning. Core Model builds deep understanding with full audit trails on every recommendation.",
    keywords: [
      "law student study",
      "bar exam prep",
      "law school finals",
      "legal study tools",
      "1L study guide",
      "law school exam prep",
    ],
    heroHeadline:
      "Issue-Spotting Under Pressure Requires Deep Knowledge, Not Surface Memory.",
    heroSubheadline:
      "Core Model breaks legal doctrine into discrete components, tracks your mastery of each, and provides full audit trails on every recommendation. Built for people who demand transparency.",
    heroCta: { text: "Start Your Legal Study Plan", href: "/dashboard" },
    secondaryCta: { text: "See the Audit Trail", href: "#features" },
    painPoints: [
      {
        title: "Outlining is necessary but not sufficient",
        description:
          "Creating outlines organizes material, but doesn't ensure retention. Without retrieval practice, 60% of outline content fades before finals.",
      },
      {
        title: "Law school teaches legal reasoning but not study skills",
        description:
          "The Socratic method builds oral advocacy skills, not long-term retention. Law students need evidence-based study methods.",
      },
      {
        title: "The bar exam tests everything at once",
        description:
          "Bar prep requires juggling dozens of subjects simultaneously. Without systematic tracking, your weaker subjects get neglected.",
      },
    ],
    features: [
      {
        title: "Doctrine-Level Tracking",
        description:
          "Core Model doesn't just track 'Constitutional Law' — it tracks your mastery of strict scrutiny, Commerce Clause doctrine, due process, and every discrete legal rule.",
        icon: "BarChart3",
      },
      {
        title: "Multi-Part Test Decomposition",
        description:
          "Complex legal tests are broken into individual elements. Master each component of strict scrutiny, Erie doctrine, or Rule 12(b)(6) analysis independently.",
        icon: "Target",
      },
      {
        title: "Full Audit Trail",
        description:
          "Every mastery estimate shows why. Which interactions informed it, how recent they are, how much uncertainty remains. Lawyers need reasoning chains.",
        icon: "Eye",
      },
      {
        title: "Exam-Specific Study Plans",
        description:
          "Set your finals schedule or bar exam date. Core Model builds a day-by-day plan that prioritizes your weakest doctrines.",
        icon: "Clock",
      },
    ],
    benefits: [
      {
        metric: "94%",
        label: "Mastery Confidence",
        description:
          "Law students reach 94% mastery confidence in core doctrines before exams.",
      },
      {
        metric: "35%",
        label: "Time Savings",
        description:
          "Eliminate 35% of study time by skipping material you've already mastered.",
      },
      {
        metric: "Distinction",
        label: "Exam Results",
        description:
          "Users consistently report meeting or exceeding target exam scores.",
      },
    ],
    testimonial: {
      quote:
        "The audit trail is what sold me. Every recommendation tells me exactly why. As a lawyer, I need that transparency. No other learning tool gives me the reasoning chain.",
      name: "Elena Vasquez, J.D.",
      role: "Corporate Attorney & LL.M. Student",
      institution: "Georgetown Law",
    },
    faq: [
      {
        question: "Should I use this instead of commercial bar prep?",
        answer:
          "Core Model complements commercial bar prep (Barbri, Themis). Upload your bar prep materials and Core Model adds adaptive scheduling, mastery tracking, and retrieval practice on top.",
      },
      {
        question: "Can I upload my outlines?",
        answer:
          "Yes. Upload outlines, case briefs, hornbook excerpts, and class notes in PDF or markdown format. Core Model extracts key rules and doctrines.",
      },
      {
        question: "How granular is the mastery tracking?",
        answer:
          "Very granular. Core Model tracks individual doctrines, rules, tests, and their components. For example, within Equal Protection, it separately tracks rational basis, intermediate scrutiny, and strict scrutiny.",
      },
      {
        question: "Is there a student discount?",
        answer:
          "Yes. Law students receive discounted pricing. Sign up with your .edu email for automatic student pricing.",
      },
    ],
    finalCta: {
      headline: "Master the Law. Don't Just Memorize It.",
      subheadline:
        "Build the deep doctrinal knowledge that law school finals and the bar exam actually test.",
      buttonText: "Start Your Law Study Plan",
      href: "/dashboard",
    },
  },
  {
    slug: "career-changers",
    title: "For Career Changers",
    metaTitle: "Adaptive Learning for Career Changers | Core Model",
    metaDescription:
      "Switch careers faster with adaptive learning. Core Model assesses your existing knowledge, identifies gaps for your target role, and builds a personalized learning path.",
    keywords: [
      "career change learning",
      "career switch study",
      "career transition",
      "reskilling",
      "career pivot",
      "new career learning",
    ],
    heroHeadline: "You're Not Starting from Zero. Stop Learning Like You Are.",
    heroSubheadline:
      "Career changers bring years of transferable knowledge. Core Model identifies what you already know, maps the gap to your target role, and builds the shortest path to get there.",
    heroCta: { text: "Map Your Career Path", href: "/dashboard" },
    secondaryCta: { text: "See Career Change Stories", href: "#testimonials" },
    painPoints: [
      {
        title: "Bootcamps and courses treat everyone the same",
        description:
          "Whether you have 15 years of experience or none, most programs start from Chapter 1. That's months of wasted time for experienced professionals.",
      },
      {
        title: "You don't know what you don't know about the new field",
        description:
          "Switching careers means navigating an unfamiliar knowledge landscape. What are the must-know concepts? What can you skip? It's hard to judge from the outside.",
      },
      {
        title: "Imposter syndrome hits hard during transitions",
        description:
          "You're competent in your current field but a beginner in your target field. Without honest progress tracking, anxiety fills the gap.",
      },
    ],
    features: [
      {
        title: "Transferable Knowledge Assessment",
        description:
          "Core Model identifies knowledge and skills that transfer from your current role to your target role. You're never truly starting from zero.",
        icon: "Brain",
      },
      {
        title: "Gap Analysis Dashboard",
        description:
          "See a clear map of what you know vs. what your target role requires. Prioritize the gaps with the highest impact on employability.",
        icon: "Target",
      },
      {
        title: "Accelerated Learning Paths",
        description:
          "Skip what you know, focus on what you don't. Core Model builds the shortest learning path to your career goal.",
        icon: "Zap",
      },
      {
        title: "Progress Tracking with Confidence",
        description:
          "See your mastery grow week by week with honest confidence intervals. Know when you're genuinely ready, not just hoping.",
        icon: "TrendingUp",
      },
    ],
    benefits: [
      {
        metric: "14 weeks",
        label: "Average Transition Time",
        description:
          "Career changers using Core Model reach working proficiency in their new domain in 14 weeks on average.",
      },
      {
        metric: "42% to 81%",
        label: "Self-Assessment Accuracy",
        description:
          "Accurate self-assessment replaces imposter syndrome. Know exactly where you stand.",
      },
      {
        metric: "3x",
        label: "Faster Than Self-Study",
        description:
          "Structured adaptive learning is 3x faster than unstructured self-study for career transitions.",
      },
    ],
    testimonial: {
      quote:
        "I was preparing for a career transition from wet lab research to computational biology. Core Model showed me I was overconfident in stats but underestimating my programming ability. Landed the role in 14 weeks.",
      name: "Dr. Priya Ramanathan",
      role: "Biomedical Engineering Researcher",
      institution: "UT Austin",
    },
    faq: [
      {
        question: "What if I don't know what materials to study?",
        answer:
          "Start by uploading introductory materials for your target field. Core Model will identify concepts and build a study plan. As you learn more, add advanced materials and the system adapts.",
      },
      {
        question: "How does it know what my target role requires?",
        answer:
          "Upload job descriptions, role requirements, and study materials for your target field. Core Model extracts the key competencies and tracks your mastery against them.",
      },
      {
        question: "I have 20 years of experience. Will it respect that?",
        answer:
          "Absolutely. Core Model's initial assessment quickly identifies your existing knowledge and builds from there. Experienced professionals skip directly to new material.",
      },
      {
        question: "Can I use this part-time while working?",
        answer:
          "Yes. Most career changers use Core Model alongside their current job. Even 20 minutes daily produces meaningful progress with optimized learning.",
      },
    ],
    finalCta: {
      headline: "Your Next Career Is Closer Than You Think",
      subheadline:
        "Bridge the gap between where you are and where you want to be. Start with what you already know.",
      buttonText: "Map Your Career Transition",
      href: "/dashboard",
    },
  },
];
