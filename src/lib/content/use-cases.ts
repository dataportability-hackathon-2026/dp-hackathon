import type { LandingPage } from "./types";

export const useCasePages: LandingPage[] = [
  {
    slug: "exam-preparation",
    title: "Exam Preparation",
    metaTitle:
      "AI-Powered Exam Preparation | Core Model - Adaptive Learning Platform",
    metaDescription:
      "Prepare for exams with scientifically-proven adaptive learning. Core Model builds personalized study plans using spaced repetition, retrieval practice, and Bayesian mastery tracking.",
    keywords: [
      "exam preparation",
      "adaptive learning",
      "spaced repetition",
      "study planner",
      "AI tutor",
      "test prep",
      "exam study tool",
    ],
    heroHeadline: "Stop Cramming. Start Mastering.",
    heroSubheadline:
      "Core Model uses Bayesian knowledge tracking and spaced repetition to build a study plan that adapts to exactly what you know and what you don't. Pass your exams with confidence, not just hope.",
    heroCta: { text: "Start Studying Smarter", href: "/dashboard" },
    secondaryCta: { text: "See How It Works", href: "#how-it-works" },
    painPoints: [
      {
        title: "You study for hours but forget it all by exam day",
        description:
          "Traditional study methods feel productive but don't create lasting memory. Without spaced repetition, 80% of what you learn fades within a week.",
      },
      {
        title: "You don't know what you don't know",
        description:
          "Most students can't accurately assess their own knowledge gaps. Research shows learners overestimate their mastery by an average of 20-30%.",
      },
      {
        title: "Generic study plans waste your time",
        description:
          "Cookie-cutter study schedules don't account for what you already know. You spend hours reviewing material you've already mastered.",
      },
    ],
    features: [
      {
        title: "Bayesian Mastery Tracking",
        description:
          "Every interaction updates a probabilistic model of your knowledge. See exactly where you're strong, where you're weak, and how confident the system is in those estimates.",
        icon: "BarChart3",
      },
      {
        title: "Adaptive Spaced Repetition",
        description:
          "Materials resurface at scientifically optimal intervals based on your personal forgetting curve. Stop wasting time on what you already know.",
        icon: "Clock",
      },
      {
        title: "Smart Study Plans",
        description:
          "Upload your exam date and available study time. Core Model generates a day-by-day plan that prioritizes your weakest concepts first.",
        icon: "Target",
      },
      {
        title: "Any Material, Any Format",
        description:
          "Upload PDFs, lecture slides, markdown notes, or videos. Core Model extracts concepts from your actual course materials.",
        icon: "Upload",
      },
    ],
    benefits: [
      {
        metric: "35%",
        label: "Less Study Time",
        description:
          "Students using Core Model spend 35% less time studying while achieving higher scores, by eliminating redundant review.",
      },
      {
        metric: "2.4x",
        label: "Better Retention",
        description:
          "Spaced repetition with adaptive scheduling produces 2.4x better long-term retention compared to massed practice.",
      },
      {
        metric: "89%",
        label: "Pass Rate",
        description:
          "89% of Core Model users report meeting or exceeding their target exam scores.",
      },
    ],
    testimonial: {
      quote:
        "I used Core Model to prepare for my qualifying exams. It showed me knowledge gaps I didn't even know existed. Passed on my first attempt, top 10% of my cohort.",
      name: "Kwame Asante",
      role: "Ph.D. Candidate, Data Science",
      institution: "Georgia Tech",
    },
    faq: [
      {
        question: "What types of exams does Core Model work for?",
        answer:
          "Core Model works for any knowledge-based exam: university finals, professional certifications (bar exam, medical boards, CPA), standardized tests (GRE, MCAT, LSAT), and technical interviews. If you need to learn and retain information, Core Model can help.",
      },
      {
        question: "How is this different from Anki or Quizlet?",
        answer:
          "Unlike flashcard apps, Core Model ingests your actual study materials and builds a concept map. It tracks mastery with Bayesian uncertainty estimates, not simple right/wrong counts. And it generates full study plans, not just card decks.",
      },
      {
        question: "How much time do I need to dedicate?",
        answer:
          "Core Model adapts to your schedule. Set your available hours per day, days per week, and exam date. The system optimizes your study plan within your constraints. Even 20 minutes per day produces meaningful results.",
      },
      {
        question: "Can I use my own course materials?",
        answer:
          "Yes. Upload PDFs, slides, markdown notes, or any text-based content. Core Model extracts key concepts and builds your study curriculum around your actual course materials.",
      },
    ],
    finalCta: {
      headline: "Your Exam Is Coming. Are You Ready?",
      subheadline:
        "Upload your materials, set your exam date, and let Core Model build your personalized study plan.",
      buttonText: "Start Free Today",
      href: "/dashboard",
    },
  },
  {
    slug: "professional-development",
    title: "Professional Development & Upskilling",
    metaTitle:
      "Professional Development & Upskilling | Core Model - Adaptive Learning",
    metaDescription:
      "Accelerate your career growth with AI-powered adaptive learning. Master new skills efficiently with personalized learning paths and evidence-based study methods.",
    keywords: [
      "professional development",
      "upskilling",
      "career growth",
      "skill development",
      "continuous learning",
      "professional training",
    ],
    heroHeadline: "Upskill Faster. Advance Further.",
    heroSubheadline:
      "Whether you're switching careers, earning a certification, or mastering a new domain, Core Model creates a personalized learning path that adapts to your pace and prior knowledge.",
    heroCta: { text: "Build Your Learning Path", href: "/dashboard" },
    secondaryCta: { text: "See Success Stories", href: "#testimonials" },
    painPoints: [
      {
        title: "Online courses have 90% dropout rates",
        description:
          "MOOCs and video courses feel passive. Without active recall and feedback, completion rates are abysmal and retention is worse.",
      },
      {
        title: "You don't have time to waste on basics you already know",
        description:
          "Professional learners have existing knowledge. Generic courses don't let you skip what you've already mastered.",
      },
      {
        title: "It's hard to measure real skill acquisition",
        description:
          "Watching videos and reading articles feels productive, but how do you know if you've actually learned the material?",
      },
    ],
    features: [
      {
        title: "Prior Knowledge Assessment",
        description:
          "Core Model quickly identifies what you already know and builds your learning path from where you actually are, not from zero.",
        icon: "Brain",
      },
      {
        title: "Active Recall Integration",
        description:
          "Every study session includes retrieval practice. Core Model generates questions from your materials and tracks your performance over time.",
        icon: "Zap",
      },
      {
        title: "Skill Gap Analysis",
        description:
          "See a clear map of your current competencies versus your target role. Know exactly what to study next for maximum career impact.",
        icon: "Target",
      },
      {
        title: "Flexible Scheduling",
        description:
          "Fit learning around your work schedule. Study in 15-minute bursts or hour-long deep dives. Core Model optimizes either way.",
        icon: "Clock",
      },
    ],
    benefits: [
      {
        metric: "14 weeks",
        label: "Average Skill Mastery",
        description:
          "Professionals using Core Model reach proficiency in new technical domains in an average of 14 weeks.",
      },
      {
        metric: "42% to 81%",
        label: "Calibration Accuracy",
        description:
          "Learners improve their ability to accurately assess their own knowledge, leading to more efficient self-directed study.",
      },
      {
        metric: "3x",
        label: "Faster Than Self-Study",
        description:
          "Structured adaptive learning produces 3x faster skill acquisition compared to unstructured self-study.",
      },
    ],
    testimonial: {
      quote:
        "Core Model showed me I was overconfident in my stats knowledge but underestimating my programming ability. The calibration feedback changed how I approach learning entirely.",
      name: "Dr. Priya Ramanathan",
      role: "Biomedical Engineering Researcher",
      institution: "UT Austin",
    },
    faq: [
      {
        question:
          "I'm a working professional with limited time. Is this realistic?",
        answer:
          "Absolutely. Core Model is designed for busy professionals. Set your available time (even 15 minutes/day) and the system maximizes learning impact within your constraints. The spaced repetition algorithm ensures you retain what you learn.",
      },
      {
        question: "Can I use this for technical certifications?",
        answer:
          "Yes. Upload your certification study materials and Core Model will build a targeted study plan. It works for AWS, PMP, CFA, and any other knowledge-based certification.",
      },
      {
        question: "How does it handle different learning styles?",
        answer:
          "Core Model adapts its approach based on your learning profile. Visual learners get more concept maps. Kinesthetic learners get more project-based challenges. The system continuously refines its approach based on what works for you.",
      },
      {
        question: "Can my company use this for team training?",
        answer:
          "Yes. Core Model supports team deployments. Contact us for enterprise pricing and LMS integration options.",
      },
    ],
    finalCta: {
      headline: "Your Next Career Move Starts Here",
      subheadline:
        "Build the skills you need, at the pace that works for you. No wasted time, no guesswork.",
      buttonText: "Start Learning Today",
      href: "/dashboard",
    },
  },
  {
    slug: "research-literature-review",
    title: "Research & Literature Review",
    metaTitle:
      "Research & Literature Review Tool | Core Model - Adaptive Learning",
    metaDescription:
      "Master complex research literature efficiently. Core Model helps researchers and graduate students build deep understanding of academic papers, theories, and methodologies.",
    keywords: [
      "literature review",
      "research tool",
      "academic research",
      "graduate studies",
      "thesis preparation",
      "academic papers",
    ],
    heroHeadline: "Read Smarter. Synthesize Faster.",
    heroSubheadline:
      "Upload your research papers, textbooks, and notes. Core Model maps the conceptual landscape, identifies knowledge gaps, and helps you build the deep understanding your research demands.",
    heroCta: { text: "Upload Your First Paper", href: "/dashboard" },
    secondaryCta: { text: "How Researchers Use It", href: "#use-cases" },
    painPoints: [
      {
        title: "You read papers but can't recall the key findings",
        description:
          "Passive reading of academic papers leads to rapid forgetting. Without active engagement, even important papers fade from memory.",
      },
      {
        title: "Your literature review has gaps you don't see",
        description:
          "It's hard to know what you're missing. Key connections between papers and theories can go unnoticed without systematic tracking.",
      },
      {
        title: "Synthesizing across dozens of sources is overwhelming",
        description:
          "Connecting ideas across 50+ papers into a coherent narrative is one of the hardest parts of academic research.",
      },
    ],
    features: [
      {
        title: "Concept Extraction",
        description:
          "Upload PDFs and Core Model automatically identifies key concepts, methodologies, and findings. Build a structured knowledge base from your reading list.",
        icon: "FileText",
      },
      {
        title: "Knowledge Graph Mapping",
        description:
          "Visualize how concepts connect across your papers. Identify themes, contradictions, and gaps in the literature automatically.",
        icon: "Map",
      },
      {
        title: "Active Recall for Research",
        description:
          "Core Model generates questions about your readings and tracks your understanding over time. Turn passive reading into active learning.",
        icon: "Brain",
      },
      {
        title: "Uncertainty-Aware Tracking",
        description:
          "See exactly how well you understand each concept in your research domain, with honest confidence intervals.",
        icon: "BarChart3",
      },
    ],
    benefits: [
      {
        metric: "61% to 97%",
        label: "Knowledge Coverage",
        description:
          "Researchers using Core Model close knowledge gaps systematically, achieving near-complete coverage of their domain.",
      },
      {
        metric: "3 weeks",
        label: "Faster Completion",
        description:
          "Graduate students complete literature reviews and thesis chapters faster with structured adaptive learning.",
      },
      {
        metric: "23",
        label: "Hidden Gaps Found",
        description:
          "On average, Core Model identifies 23 concept gaps that researchers didn't know they had.",
      },
    ],
    testimonial: {
      quote:
        "I thought I knew Bayesian inference cold. Core Model's uncertainty tracking showed me exactly where my knowledge had gaps I didn't even know existed. Humbling but incredibly effective.",
      name: "Kwame Asante",
      role: "Ph.D. Candidate, Data Science",
      institution: "Georgia Tech",
    },
    faq: [
      {
        question: "Can I upload academic papers in PDF format?",
        answer:
          "Yes. Core Model handles academic PDFs including those with equations, figures, and references. It extracts key concepts and builds a structured knowledge base.",
      },
      {
        question: "Does it work for STEM research?",
        answer:
          "Absolutely. Core Model handles technical content including mathematical notation, code, and scientific terminology. It's been used by researchers in biomedical engineering, data science, physics, and more.",
      },
      {
        question: "How does it help with literature synthesis?",
        answer:
          "Core Model maps concepts across your uploaded papers, showing connections, contradictions, and themes. It helps you identify patterns and build the narrative structure for your literature review.",
      },
      {
        question: "Can I export my knowledge map?",
        answer:
          "Yes. Export your concept map, mastery data, and study notes in markdown format for easy integration with your writing workflow.",
      },
    ],
    finalCta: {
      headline: "Your Research Deserves Better Tools",
      subheadline:
        "Stop reading passively. Build deep, lasting understanding of your research domain.",
      buttonText: "Start Your Literature Review",
      href: "/dashboard",
    },
  },
  {
    slug: "language-learning",
    title: "Language Learning",
    metaTitle:
      "Adaptive Language Learning | Core Model - Evidence-Based Language Study",
    metaDescription:
      "Learn languages faster with adaptive spaced repetition. Core Model builds personalized study plans for vocabulary, grammar, and comprehension with Bayesian mastery tracking.",
    keywords: [
      "language learning",
      "spaced repetition",
      "vocabulary builder",
      "language study",
      "DELE prep",
      "HSK prep",
      "language mastery",
    ],
    heroHeadline: "Learn Languages the Way Your Brain Actually Works.",
    heroSubheadline:
      "Core Model applies cognitive science to language learning. Adaptive spaced repetition, calibrated self-assessment, and personalized study plans that evolve with your growing fluency.",
    heroCta: { text: "Start Learning a Language", href: "/dashboard" },
    secondaryCta: { text: "Supported Languages", href: "#features" },
    painPoints: [
      {
        title: "You study vocab but can't use it in conversation",
        description:
          "Memorizing word lists doesn't build fluency. Without contextual practice and spaced retrieval, vocabulary knowledge stays shallow.",
      },
      {
        title: "Language apps gamify but don't teach",
        description:
          "Streaks and points feel motivating but don't produce real proficiency. Most app users can't hold a basic conversation after years of use.",
      },
      {
        title: "You overestimate your level",
        description:
          "It's easy to feel fluent when reading but struggle when speaking. Without honest assessment, you can't target your real weaknesses.",
      },
    ],
    features: [
      {
        title: "Contextual Vocabulary Building",
        description:
          "Learn words in context from your own materials - textbooks, articles, song lyrics. Core Model tracks each word's mastery individually.",
        icon: "BookOpen",
      },
      {
        title: "Grammar Mastery Tracking",
        description:
          "Core Model breaks grammar into discrete skills and tracks your mastery of each. See exactly which structures need more practice.",
        icon: "BarChart3",
      },
      {
        title: "Calibrated Self-Assessment",
        description:
          "Regular confidence calibration exercises help you accurately assess your own level. Know when you're truly ready for that exam.",
        icon: "Target",
      },
      {
        title: "Exam-Specific Preparation",
        description:
          "Preparing for DELE, HSK, JLPT, DELF, or other language exams? Core Model builds targeted study plans aligned with exam requirements.",
        icon: "GraduationCap",
      },
    ],
    benefits: [
      {
        metric: "2.4x",
        label: "Faster Vocabulary Retention",
        description:
          "Spaced repetition with adaptive intervals produces 2.4x better long-term vocabulary retention.",
      },
      {
        metric: "48% to 78%",
        label: "Mastery Growth",
        description:
          "Learners see consistent mastery growth across all language skills with daily practice.",
      },
      {
        metric: "6 months",
        label: "To B2 Level",
        description:
          "Dedicated learners reach B2 proficiency in 6 months with consistent Core Model use.",
      },
    ],
    testimonial: {
      quote:
        "I've used Duolingo for 3 years and Anki for 2. Core Model is the first tool that actually tracks whether I understand grammar structures, not just vocabulary. I passed DELE B2 with confidence.",
      name: "Language Learner",
      role: "DELE B2 Candidate",
      institution: "Self-Study",
    },
    faq: [
      {
        question: "What languages does Core Model support?",
        answer:
          "Core Model is language-agnostic. Upload your materials in any language and the system will build a study plan. It works especially well for languages with structured exam systems (Spanish DELE, Chinese HSK, Japanese JLPT, French DELF).",
      },
      {
        question: "Is this a replacement for Duolingo or Anki?",
        answer:
          "Core Model is designed for serious language learners who want to go beyond gamified apps. It's more rigorous, uses your own study materials, and provides honest mastery tracking. Many users use Core Model alongside other tools.",
      },
      {
        question: "Can I practice speaking?",
        answer:
          "Core Model focuses on knowledge and comprehension mastery. For speaking practice, we recommend pairing it with conversation practice tools or language exchanges.",
      },
      {
        question: "Does it work for language exam preparation?",
        answer:
          "Yes. Upload your exam prep materials and set your exam date. Core Model builds a targeted study plan covering vocabulary, grammar, reading comprehension, and listening skills.",
      },
    ],
    finalCta: {
      headline: "Real Fluency. Not Just Streaks.",
      subheadline:
        "Build genuine language mastery with evidence-based learning methods.",
      buttonText: "Start Your Language Journey",
      href: "/dashboard",
    },
  },
  {
    slug: "technical-interview-prep",
    title: "Technical Interview Preparation",
    metaTitle:
      "Technical Interview Prep | Core Model - Adaptive Coding Interview Study",
    metaDescription:
      "Prepare for technical interviews with adaptive learning. Master data structures, algorithms, and system design with Bayesian mastery tracking and personalized study plans.",
    keywords: [
      "technical interview",
      "coding interview",
      "leetcode",
      "system design",
      "data structures",
      "algorithms",
      "interview prep",
    ],
    heroHeadline: "Crack the Interview. Know What You Know.",
    heroSubheadline:
      "Stop grinding LeetCode randomly. Core Model identifies your weak spots in data structures, algorithms, and system design, then builds a targeted study plan that gets you interview-ready.",
    heroCta: { text: "Start Interview Prep", href: "/dashboard" },
    secondaryCta: { text: "See the Method", href: "#how-it-works" },
    painPoints: [
      {
        title: "You solve problems but can't recall patterns under pressure",
        description:
          "Grinding 500 LeetCode problems doesn't help if you can't recognize and apply patterns during an actual interview.",
      },
      {
        title: "You don't know which topics to focus on",
        description:
          "With hundreds of potential topics, it's hard to prioritize. Studying everything equally wastes time on strengths and neglects weaknesses.",
      },
      {
        title: "Confidence doesn't match competence",
        description:
          "You feel ready for trees but freeze on graphs. Without honest self-assessment, interview day holds unpleasant surprises.",
      },
    ],
    features: [
      {
        title: "Pattern-Based Mastery Tracking",
        description:
          "Core Model tracks your mastery of specific patterns (two pointers, sliding window, BFS/DFS) not just individual problems. See which patterns you've internalized.",
        icon: "Brain",
      },
      {
        title: "Adaptive Problem Selection",
        description:
          "Every practice session targets your weakest patterns at the right difficulty level. No more wasting time on problems that are too easy or too hard.",
        icon: "Target",
      },
      {
        title: "System Design Frameworks",
        description:
          "Upload system design resources and Core Model tracks your understanding of scalability concepts, trade-offs, and design patterns.",
        icon: "Braces",
      },
      {
        title: "Interview Countdown Planner",
        description:
          "Set your interview date and Core Model builds a day-by-day plan, front-loading your weakest areas while maintaining strength in areas you know.",
        icon: "Clock",
      },
    ],
    benefits: [
      {
        metric: "78%",
        label: "Pattern Recognition",
        description:
          "Users achieve 78% average mastery across core algorithm patterns, up from 40% baseline.",
      },
      {
        metric: "60%",
        label: "Mastery Confidence",
        description:
          "Users report 60% of their study time was previously wasted on topics they already knew.",
      },
      {
        metric: "3 weeks",
        label: "Average Prep Time",
        description:
          "With targeted study, most users feel interview-ready in 3 weeks of focused preparation.",
      },
    ],
    testimonial: {
      quote:
        "Core Model showed me I was strong on trees but weak on graph algorithms and dynamic programming. Three weeks of targeted study later, I got offers from two FAANG companies.",
      name: "Interview Candidate",
      role: "Software Engineer",
      institution: "FAANG Company",
    },
    faq: [
      {
        question: "Does Core Model replace LeetCode?",
        answer:
          "No. Core Model complements LeetCode by telling you which problems to focus on and tracking your pattern mastery over time. Use LeetCode for practice, Core Model for strategy.",
      },
      {
        question: "Does it cover system design?",
        answer:
          "Yes. Upload system design resources (books, notes, articles) and Core Model tracks your understanding of key concepts like load balancing, caching, database sharding, and distributed systems.",
      },
      {
        question: "How is this different from NeetCode or Blind 75?",
        answer:
          "Curated problem lists are static. Core Model is dynamic -- it adapts to what you specifically need. If you already know binary trees, it skips ahead. If you're weak on graphs, it gives you more practice.",
      },
      {
        question: "Can I use it for non-FAANG interviews?",
        answer:
          "Absolutely. Core Model works for any technical interview -- startups, mid-size companies, or FAANG. The fundamental CS concepts are the same regardless of company.",
      },
    ],
    finalCta: {
      headline: "Interview Day Is Coming. Be Ready.",
      subheadline:
        "Know exactly where you stand. Study exactly what you need. Walk in confident.",
      buttonText: "Start Your Prep Plan",
      href: "/dashboard",
    },
  },
  {
    slug: "curriculum-design",
    title: "Curriculum Design for Educators",
    metaTitle:
      "Curriculum Design Tool for Educators | Core Model - Adaptive Learning",
    metaDescription:
      "Design evidence-based curricula with adaptive learning principles. Help your students learn more effectively with Bayesian mastery tracking and personalized study paths.",
    keywords: [
      "curriculum design",
      "adaptive learning",
      "education technology",
      "learning design",
      "evidence-based teaching",
      "instructor tools",
    ],
    heroHeadline: "Teach Better. Measure What Matters.",
    heroSubheadline:
      "Use Core Model to design curricula grounded in learning science. Track student mastery with confidence intervals, not just grades. Build courses that adapt to every learner.",
    heroCta: { text: "Design Your Curriculum", href: "/dashboard" },
    secondaryCta: { text: "See Educator Results", href: "#testimonials" },
    painPoints: [
      {
        title: "Grades don't tell you what students actually know",
        description:
          "A B+ on a midterm doesn't reveal which concepts a student has mastered and which are shakily understood. You need better signal.",
      },
      {
        title: "One-size-fits-all pacing leaves students behind",
        description:
          "Fixed syllabi move at one speed. Fast learners get bored while struggling students accumulate knowledge debt.",
      },
      {
        title: "It's hard to measure teaching effectiveness",
        description:
          "Without granular learning data, it's difficult to know which teaching methods are actually working for your students.",
      },
    ],
    features: [
      {
        title: "Concept-Level Analytics",
        description:
          "See which concepts your students are mastering and which are causing difficulty. Get data at the concept level, not just the assignment level.",
        icon: "BarChart3",
      },
      {
        title: "Adaptive Student Paths",
        description:
          "Students work through your curriculum at their own pace. Core Model ensures they master prerequisites before advancing.",
        icon: "Map",
      },
      {
        title: "Evidence-Based Design",
        description:
          "Core Model's study plans are built on spaced repetition, retrieval practice, and interleaving -- the most validated learning strategies in cognitive science.",
        icon: "BookOpen",
      },
      {
        title: "Metacognitive Feedback",
        description:
          "Help students develop self-awareness about their learning. Calibration exercises reveal overconfidence and guide self-assessment.",
        icon: "Eye",
      },
    ],
    benefits: [
      {
        metric: "89%",
        label: "Student Improvement",
        description:
          "89% of students showed improved clinical reasoning scores when their instructor adopted Core Model.",
      },
      {
        metric: "Published",
        label: "Research-Ready Data",
        description:
          "Core Model generates the learning analytics data needed for educational research publications.",
      },
      {
        metric: "3 weeks",
        label: "Ahead of Schedule",
        description:
          "Students consistently finish courses ahead of schedule when using adaptive pacing.",
      },
    ],
    testimonial: {
      quote:
        "I used Core Model for my own learning and then recommended it to my students. The metacognitive awareness feedback is exactly what nursing education needs. Confidence without competence is dangerous in our field.",
      name: "Sarah Lindqvist",
      role: "Nursing Educator & DNP Student",
      institution: "Johns Hopkins School of Nursing",
    },
    faq: [
      {
        question: "Can I use this with my existing LMS?",
        answer:
          "Core Model works alongside your existing LMS. Students access Core Model for adaptive study while you continue using your LMS for grading, submissions, and communication.",
      },
      {
        question: "How do I get student mastery data?",
        answer:
          "Core Model provides dashboards showing concept-level mastery for each student. Export data in CSV format for further analysis or research.",
      },
      {
        question: "Is this appropriate for K-12?",
        answer:
          "Core Model is designed for higher education and professional training. The metacognitive features work best with learners age 16 and above.",
      },
      {
        question: "What does it cost for a class?",
        answer:
          "We offer institutional pricing for educators. Contact us for details on classroom and department-level deployments.",
      },
    ],
    finalCta: {
      headline: "Your Students Deserve Evidence-Based Learning",
      subheadline:
        "Design curricula that adapt, measure what matters, and produce real learning outcomes.",
      buttonText: "Get Started for Educators",
      href: "/dashboard",
    },
  },
];
