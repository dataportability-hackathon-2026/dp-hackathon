"use client"

import { useState } from "react"
import {
  Brain,
  Upload,
  BarChart3,
  Shield,
  Plug,
  ChevronDown,
  ChevronRight,
  FileText,
  Presentation,
  Video,
  Braces,
  Map,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  GraduationCap,
  Microscope,
  Palette,
  Stethoscope,
  Scale,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Quote,
  Zap,
  Eye,
  LineChart,
  Menu,
  X,
} from "lucide-react"
import {
  SiOpenai,
  SiAnthropic,
  SiSlack,
  SiDiscord,
  SiModelcontextprotocol,
  SiMarkdown,
} from "react-icons/si"
import { BsMicrosoftTeams } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedbackForm } from "@/components/feedback-form"

// ── Personas & Case Studies Data ──

const personas = [
  {
    id: "priya",
    name: "Dr. Priya Ramanathan",
    role: "Biomedical Engineering Researcher",
    institution: "UT Austin",
    industry: "Healthcare / Biotech",
    icon: Stethoscope,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    learningStyle: "Visual-Spatial & Analytical",
    challenge:
      "Preparing for a career transition from wet lab research to computational biology. Needed to master Python, ML fundamentals, and bioinformatics pipelines while maintaining her clinical workload.",
    materials: [
      "Research papers (PDF)",
      "Video lectures from MIT OCW",
      "Jupyter notebooks",
      "Clinical case datasets",
    ],
    quote:
      "Core Model showed me I was overconfident in my stats knowledge but underestimating my programming ability. The calibration feedback changed how I approach learning entirely.",
    result:
      "Mastered Python for bioinformatics in 14 weeks. Landed a computational biology role at a top genomics startup. Calibration accuracy improved from 42% to 81%.",
    metric: "42% to 81%",
    metricLabel: "Calibration accuracy",
    weeks: 14,
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    role: "Senior UX Designer & MFA Candidate",
    institution: "Rhode Island School of Design",
    industry: "Creative / Design",
    icon: Palette,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    learningStyle: "Kinesthetic & Project-Based",
    challenge:
      "Balancing a full-time UX role with an MFA thesis on generative design systems. Struggled with academic research methodology and statistical analysis for his thesis.",
    materials: [
      "Design theory PDFs",
      "HCI conference proceedings",
      "Figma prototypes (exported)",
      "Thesis drafts in Markdown",
    ],
    quote:
      "I learn by doing, not reading. Core Model adapted by giving me project-based retrieval challenges instead of flashcards. My thesis advisor noticed the difference in my literature review quality.",
    result:
      "Completed MFA thesis 3 weeks ahead of schedule. Research methodology mastery went from 'novice' to 'proficient' in 9 weeks. Published first academic paper.",
    metric: "3 weeks early",
    metricLabel: "Thesis completion",
    weeks: 9,
  },
  {
    id: "elena",
    name: "Elena Vasquez, J.D.",
    role: "Corporate Attorney & LL.M. Student",
    institution: "Georgetown Law",
    industry: "Legal / Compliance",
    icon: Scale,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    learningStyle: "Verbal-Linguistic & Sequential",
    challenge:
      "Pursuing an LL.M. in International Tax Law while practicing full-time. Needed to master complex treaty networks, transfer pricing regulations, and EU tax directives across multiple jurisdictions.",
    materials: [
      "Tax code annotations (PDF)",
      "Case law databases",
      "Lecture slides",
      "Practice problem sets",
    ],
    quote:
      "The audit trail is what sold me. Every recommendation tells me exactly why. As a lawyer, I need that transparency. No other learning tool gives me the reasoning chain.",
    result:
      "Passed LL.M. comprehensive exam with distinction. Mastery of cross-border treaty concepts reached 94% confidence. Study time reduced by 35% through optimized spacing.",
    metric: "35% less",
    metricLabel: "Study time needed",
    weeks: 16,
  },
  {
    id: "kwame",
    name: "Kwame Asante",
    role: "Data Science Lead & Ph.D. Candidate",
    institution: "Georgia Tech",
    industry: "Technology / AI",
    icon: Microscope,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    learningStyle: "Logical-Mathematical & Self-Directed",
    challenge:
      "Preparing for qualifying exams covering advanced ML theory, causal inference, and Bayesian statistics while leading a team of 8 data scientists. Needed structured review of foundational topics he hadn't revisited in years.",
    materials: [
      "Textbook chapters (PDF)",
      "ArXiv preprints",
      "Lecture recordings",
      "Code repositories",
    ],
    quote:
      "I thought I knew Bayesian inference cold. Core Model's uncertainty tracking showed me exactly where my knowledge had gaps I didn't even know existed. Humbling but incredibly effective.",
    result:
      "Passed qualifying exams on first attempt (top 10% of cohort). Identified and remediated 23 concept gaps. Knowledge graph coverage went from 61% to 97%.",
    metric: "61% to 97%",
    metricLabel: "Knowledge coverage",
    weeks: 12,
  },
  {
    id: "sarah",
    name: "Sarah Lindqvist",
    role: "Nursing Educator & DNP Student",
    institution: "Johns Hopkins School of Nursing",
    industry: "Education / Nursing",
    icon: GraduationCap,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    learningStyle: "Social-Collaborative & Reflective",
    challenge:
      "Designing an evidence-based curriculum for nurse practitioner students while completing her own DNP capstone. Needed to model how adaptive learning could work for clinical education.",
    materials: [
      "Clinical guidelines (PDF)",
      "Simulation scenario scripts",
      "Pharmacology references",
      "Student assessment data",
    ],
    quote:
      "I used Core Model for my own learning and then recommended it to my students. The metacognitive awareness feedback is exactly what nursing education needs. Confidence without competence is dangerous in our field.",
    result:
      "Capstone project received outstanding evaluation. 89% of her students who adopted Core Model showed improved clinical reasoning scores. Published curriculum framework in nursing education journal.",
    metric: "89% improved",
    metricLabel: "Student outcomes",
    weeks: 20,
  },
]

const features = [
  {
    icon: Upload,
    title: "Ingest Any Material",
    description:
      "Upload PDFs, slides, videos, code, markdown, and web links. Core Model builds a concept map from your actual study materials.",
    formats: [
      { icon: FileText, label: "PDFs" },
      { icon: Presentation, label: "Slides" },
      { icon: Video, label: "Video" },
      { icon: Braces, label: "Code" },
      { icon: SiMarkdown, label: "Markdown" },
    ],
  },
  {
    icon: Brain,
    title: "Scientific Learner Profile",
    description:
      "Built from validated psychometric instruments and your real behavior. No learning-style myths. Only constructs that change decisions.",
  },
  {
    icon: Map,
    title: "Adaptive 7-Day Guides",
    description:
      "Personalized learning plans that evolve with every session. Spacing, interleaving, and retrieval practice optimized to your mastery state.",
  },
  {
    icon: Eye,
    title: "Full Audit Trail",
    description:
      "Every recommendation links to an observation, inference, and policy change. See exactly why the system made each decision.",
  },
  {
    icon: LineChart,
    title: "Uncertainty as a Feature",
    description:
      "Estimates are distributions, not single scores. Early on, wide uncertainty drives exploration. Over time, precision sharpens.",
  },
  {
    icon: Shield,
    title: "Evidence-Based Only",
    description:
      "Interventions are testable hypotheses. If they don't improve outcomes, they get revised or rolled back. No permanent assumptions.",
  },
]

const integrations = [
  { icon: SiOpenai, label: "OpenAI", color: "text-zinc-800 dark:text-zinc-200" },
  { icon: SiAnthropic, label: "Anthropic", color: "text-zinc-800 dark:text-zinc-200" },
  { icon: SiSlack, label: "Slack", color: "text-[#4A154B]" },
  { icon: SiDiscord, label: "Discord", color: "text-[#5865F2]" },
  { icon: BsMicrosoftTeams, label: "Teams", color: "text-[#6264A7]" },
  { icon: SiModelcontextprotocol, label: "MCP", color: "text-zinc-800 dark:text-zinc-200" },
]

const faqs = [
  {
    q: "What types of study materials can I upload?",
    a: "Core Model accepts PDFs, PowerPoint/Keynote slides, markdown files, code repositories, video links (YouTube, Vimeo), web page URLs, and plain text. Our ingestion pipeline extracts concepts and builds a knowledge graph automatically. Most files process in under 60 seconds.",
  },
  {
    q: "How is this different from Anki or Quizlet?",
    a: "Anki and Quizlet are flashcard tools with a single learning mechanism (spaced repetition). Core Model builds a full scientific learner profile using validated psychometric instruments, tracks uncertainty explicitly, generates multiple intervention types (retrieval practice, calibration exercises, strategy coaching, metacognitive reflection), and provides a complete audit trail for every recommendation.",
  },
  {
    q: "Does Core Model use 'learning styles' to personalize?",
    a: "No. Core Model explicitly rejects the 'meshing hypothesis' that matching instruction to learning style labels improves outcomes. The evidence does not support this claim (Pashler et al., 2008). Instead, we use behavior-first constructs: mastery state, calibration quality, strategy repertoire, and motivational orientation. Preference data may influence presentation, but never pedagogical claims.",
  },
  {
    q: "How long before I see results?",
    a: "Initial profiling takes 10-15 minutes. Your first adaptive 7-day guide generates immediately after uploading materials. In Week 1, recommendations are exploratory due to wide uncertainty. By Week 4, the system has enough behavioral evidence to provide precise, concept-level guidance. Most users report measurable improvement within 2-3 weeks.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your learner profile is never sold or shared with institutions, employers, or third parties. You own your data completely -- it's exportable and deletable at any time. We use encryption at rest and in transit. Our ethical commitments are built into the product architecture, not just the terms of service.",
  },
  {
    q: "Can I use Core Model for team or classroom settings?",
    a: "Yes. Our Teams plan supports cohort-level analytics while keeping individual profiles private. Educators can see aggregate mastery distributions and identify common concept gaps without accessing personal learner data. This is ideal for curriculum design and intervention planning.",
  },
  {
    q: "What if I disagree with a recommendation?",
    a: "Every recommendation includes its full reasoning chain: the observation that triggered it, the inference drawn, and the policy applied. You can override any recommendation, and your override becomes new behavioral evidence that updates the model. The system learns from your feedback.",
  },
  {
    q: "Do I need a specific academic background?",
    a: "Core Model is designed for Masters-level and self-directed learners across any discipline. Whether you're studying machine learning, constitutional law, pharmacology, or design theory, the system adapts to your materials and your domain. The only requirement is that you're motivated to learn.",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For individual learners exploring adaptive study",
    features: [
      "Up to 3 active learning projects",
      "50 MB material uploads",
      "Basic learner profile (CRT + calibration)",
      "7-day adaptive guides",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Scholar",
    price: "$29",
    period: "/month",
    description: "For serious graduate students and professionals",
    features: [
      "Unlimited learning projects",
      "5 GB material uploads",
      "Full scientific profile (all 5 construct families)",
      "Advanced knowledge graph visualization",
      "Priority AI generation pipeline",
      "Full audit trail access",
      "Export all data anytime",
      "Email support",
    ],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$19",
    period: "/seat/month",
    description: "For educators, departments, and learning organizations",
    features: [
      "Everything in Scholar",
      "Cohort analytics dashboard",
      "Aggregate mastery distributions",
      "Concept gap identification",
      "Curriculum design tools",
      "SSO / SAML integration",
      "Dedicated account manager",
      "99.9% uptime SLA",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

// ── Component ──

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">Core Model</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case Studies</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <FeedbackForm />
            <a href="/dashboard">
              <Button variant="ghost" size="sm">Sign In</Button>
            </a>
            <a href="/dashboard">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border md:hidden">
            <div className="space-y-1 p-4">
              <a href="#features" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Features</a>
              <a href="#case-studies" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Case Studies</a>
              <a href="#pricing" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Pricing</a>
              <a href="#faq" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">FAQ</a>
              <div className="pt-2 space-y-2">
                <a href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </a>
                <a href="/dashboard" className="block">
                  <Button className="w-full">Get Started</Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Built on validated science, not learning-style myths
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
              Learn with
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-600 to-primary bg-clip-text text-transparent">
                evidence,
              </span>
              <br />
              not guesswork.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Core Model ingests your study materials, builds a scientific learner profile,
              and recommends what to study next -- with explicit uncertainty and a full audit trail.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href="/dashboard">
                <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#case-studies">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl">
                  See Case Studies
                </Button>
              </a>
            </div>

            {/* App Preview */}
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/5 overflow-hidden">
                {/* Mock App Bar */}
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      <Brain className="h-3 w-3" /> app.coremodel.ai/dashboard
                    </div>
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-12 gap-0">
                  {/* Sidebar */}
                  <div className="col-span-3 border-r border-border/40 bg-muted/10 p-4 hidden sm:block">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium">
                        <BarChart3 className="h-4 w-4 text-primary" /> Dashboard
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <Brain className="h-4 w-4" /> Core Model
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" /> Materials
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <Map className="h-4 w-4" /> Knowledge Graph
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" /> Audit Trail
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="col-span-12 sm:col-span-9 p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">Bayesian Statistics Study</h3>
                        <p className="text-xs text-muted-foreground">Week 3 of 12 -- mastery growing</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">7-Day Guide Active</Badge>
                    </div>

                    {/* Mastery Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/40 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-3">
                        <div className="text-xs text-muted-foreground mb-1">Mastery</div>
                        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">73%</div>
                        <div className="text-[10px] text-muted-foreground">+/- 8% uncertainty</div>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 p-3">
                        <div className="text-xs text-muted-foreground mb-1">Calibration</div>
                        <div className="text-xl font-bold text-violet-700 dark:text-violet-400">81%</div>
                        <div className="text-[10px] text-muted-foreground">ECE: 0.12</div>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 p-3">
                        <div className="text-xs text-muted-foreground mb-1">Concepts</div>
                        <div className="text-xl font-bold text-sky-700 dark:text-sky-400">47/64</div>
                        <div className="text-[10px] text-muted-foreground">17 remaining</div>
                      </div>
                    </div>

                    {/* Activity Bar Chart Mock */}
                    <div className="rounded-xl border border-border/40 p-3">
                      <div className="text-xs text-muted-foreground mb-2">Weekly Mastery Progress</div>
                      <div className="flex items-end gap-1.5 h-16">
                        {[35, 42, 48, 55, 61, 67, 73].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-sm bg-primary/80"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[8px] text-muted-foreground">W{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Connection Badges */}
              <div className="absolute -right-2 top-1/4 sm:-right-4">
                <div className="flex flex-col gap-2">
                  {integrations.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-lg text-xs font-medium"
                    >
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -left-2 top-1/3 sm:-left-4">
                <div className="flex flex-col gap-2">
                  {integrations.slice(3).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-lg text-xs font-medium"
                    >
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations Bar ── */}
      <section className="border-y border-border/50 bg-muted/20 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Connect with the tools you already use
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {integrations.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
            <button className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plug className="h-3.5 w-3.5" />
              Connect More
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Science-first
              <br />
              adaptive learning.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature is grounded in validated research. No buzzwords, no learning-style myths.
              Just evidence-based interventions that measurably improve outcomes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i} className="group relative overflow-hidden border-border/60 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  {feature.formats && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.formats.map((fmt, j) => (
                        <span key={j} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          <fmt.icon className="h-3 w-3" /> {fmt.label}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infographic: How It Works ── */}
      <section className="py-24 sm:py-32 bg-muted/20 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Three layers.
              <br />
              Total transparency.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Core Model's architecture ensures every recommendation is traceable from raw data to action.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Evidence Layer",
                subtitle: "What happened",
                description: "Raw behavioral data from your study sessions. Response accuracy, time-on-task, confidence predictions, and material interactions. No interpretation yet -- just facts.",
                icon: Target,
                color: "from-emerald-500 to-emerald-600",
                items: ["Response accuracy", "Confidence ratings", "Time patterns", "Material coverage"],
              },
              {
                step: "02",
                title: "Inference Layer",
                subtitle: "What we estimate",
                description: "Statistical models derive mastery estimates, calibration quality, strategy risks, and motivation signals. Every estimate includes explicit uncertainty bounds.",
                icon: TrendingUp,
                color: "from-violet-500 to-violet-600",
                items: ["Mastery distributions", "Calibration ECE/Brier", "Strategy risk scores", "Confidence intervals"],
              },
              {
                step: "03",
                title: "Policy Layer",
                subtitle: "What to do next",
                description: "Deterministic rules map inferences to interventions. Spacing schedules, retrieval prompts, calibration exercises, and strategy coaching. Fully auditable.",
                icon: Zap,
                color: "from-amber-500 to-amber-600",
                items: ["Spaced repetition", "Retrieval practice", "Calibration loops", "Strategy coaching"],
              },
            ].map((layer, i) => (
              <div key={i} className="relative">
                <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
                  <div className={`mb-4 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${layer.color} text-white shadow-lg`}>
                    <layer.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">LAYER {layer.step}</div>
                  <h3 className="text-xl font-bold mb-1">{layer.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{layer.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{layer.description}</p>
                  <div className="space-y-2">
                    {layer.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section id="case-studies" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Case Studies</Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Real learners.
              <br />
              Measurable outcomes.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five professionals across different industries and learning styles share how
              Core Model transformed their approach to mastering complex material.
            </p>
          </div>

          <div className="space-y-12">
            {personas.map((persona, i) => (
              <div
                key={persona.id}
                className={`rounded-2xl border ${persona.borderColor} ${persona.bgColor} overflow-hidden`}
              >
                <div className="grid lg:grid-cols-5 gap-0">
                  {/* Profile Column */}
                  <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${persona.color} text-white shadow-lg`}>
                          <persona.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{persona.name}</h3>
                          <p className="text-sm text-muted-foreground">{persona.role}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{persona.institution}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Learning approach: {persona.learningStyle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{persona.weeks}-week journey</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-sm font-medium mb-2">Materials uploaded:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {persona.materials.map((mat, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">{mat}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metric Highlight */}
                    <div className="rounded-xl border border-border/40 bg-card p-4">
                      <div className="text-3xl font-black">{persona.metric}</div>
                      <div className="text-sm text-muted-foreground">{persona.metricLabel}</div>
                    </div>
                  </div>

                  {/* Story Column */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-border/40 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold mb-2">The Challenge</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {persona.challenge}
                      </p>

                      <div className="relative mb-6 rounded-xl bg-card border border-border/40 p-5">
                        <Quote className="absolute top-3 left-3 h-5 w-5 text-primary/20" />
                        <p className="text-sm italic leading-relaxed pl-6">
                          &ldquo;{persona.quote}&rdquo;
                        </p>
                      </div>

                      <h4 className="font-semibold mb-2">The Result</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {persona.result}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── University Partners / Logos ── */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Research partnership with
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {/* UT Austin Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#BF5700] text-white font-black text-lg shadow-lg">
                UT
              </div>
              <div>
                <div className="font-bold text-base leading-tight">The University of Texas</div>
                <div className="text-sm text-muted-foreground">at Austin</div>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-border" />

            {/* AITX Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#BF5700] to-[#333F48] text-white font-black text-xs shadow-lg tracking-wider">
                AITX
              </div>
              <div>
                <div className="font-bold text-base leading-tight">AITX</div>
                <div className="text-sm text-muted-foreground">Artificial Intelligence at UT Austin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Start free.
              <br />
              Scale when ready.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No credit card required. Upgrade when you need the full scientific profile
              and advanced features.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 sm:p-8 ${
                  plan.highlighted
                    ? "border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/10 relative"
                    : "border-border/60 bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <a href="/dashboard">
                  <Button
                    className="w-full mb-6"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </a>
                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32 bg-muted/20 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Common questions.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <button
                  className="flex w-full items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary to-violet-700 p-10 sm:p-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Start learning
                <br />
                with evidence today.
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                Upload your first materials, build your scientific learner profile, and get your
                personalized 7-day guide in minutes. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl shadow-lg">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#case-studies">
                  <Button size="lg" variant="ghost" className="text-base px-8 py-6 rounded-xl text-white/90 hover:text-white hover:bg-white/10">
                    Read Case Studies
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Brain className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold">Core Model</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Evidence-based adaptive learning for Masters-level self-directed learners.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">Features</a>
                <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</a>
                <a href="#case-studies" className="block text-sm text-muted-foreground hover:text-foreground">Case Studies</a>
                <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Science</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">Research Foundation</span>
                <span className="block text-sm text-muted-foreground">Trust Contract</span>
                <span className="block text-sm text-muted-foreground">Ethical Commitments</span>
                <span className="block text-sm text-muted-foreground">Validation Model</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Partners</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">UT Austin</span>
                <span className="block text-sm text-muted-foreground">AITX</span>
                <span className="block text-sm text-muted-foreground">Contact Us</span>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            &copy; 2026 Core Model. Built on validated science, not learning-style myths.
          </div>
        </div>
      </footer>
    </div>
  )
}
