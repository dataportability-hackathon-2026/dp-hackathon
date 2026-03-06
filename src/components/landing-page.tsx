"use client";

import { useState, useRef, type ReactNode } from "react";
import {
  Brain,
  Upload,
  BarChart3,
  Shield,
  ChevronDown,
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
  Play,
  Phone,
  Building2,
} from "lucide-react";
import {
  SiOpenai,
  SiAnthropic,
  SiSlack,
  SiDiscord,
  SiModelcontextprotocol,
  SiMarkdown,
} from "react-icons/si";
import { BsMicrosoftTeams } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackForm } from "@/components/feedback-form";
import { siteConfig } from "@/lib/white-label";
import { ACADEMIC_RESOURCES } from "@/lib/academic-resources";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { BlurText } from "@/components/reactbits/blur-text";
import { MegaMenu } from "@/components/marketing/mega-menu";

// ── Animation Helpers ──

function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: directionMap[direction].y,
        x: directionMap[direction].x,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : {
              opacity: 0,
              y: directionMap[direction].y,
              x: directionMap[direction].x,
            }
      }
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({
  children,
  className = "",
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  if (isInView) {
    spring.set(target);
  }

  return <motion.span ref={ref}>{display}</motion.span>;
}

// ── Data ──

const personas = [
  {
    id: "priya",
    name: "Dr. Priya Ramanathan",
    role: "Biomedical Engineering Researcher",
    institution: "UT Austin",
    icon: Stethoscope,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    challenge:
      "Transitioning from wet lab research to computational biology while maintaining clinical workload.",
    quote:
      "Core Model showed me I was overconfident in my stats knowledge but underestimating my programming ability.",
    metric: "42% → 81%",
    metricLabel: "Calibration accuracy",
    weeks: 14,
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    role: "Senior UX Designer & MFA Candidate",
    institution: "RISD",
    icon: Palette,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    challenge:
      "Balancing full-time UX role with MFA thesis on generative design systems.",
    quote:
      "I learn by doing. Core Model adapted by giving me project-based retrieval challenges instead of flashcards.",
    metric: "3 weeks",
    metricLabel: "Ahead of schedule",
    weeks: 9,
  },
  {
    id: "kwame",
    name: "Kwame Asante",
    role: "Data Science Lead & Ph.D. Candidate",
    institution: "Georgia Tech",
    icon: Microscope,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    challenge:
      "Preparing for qualifying exams covering ML theory, causal inference, and Bayesian statistics.",
    quote:
      "Core Model's uncertainty tracking showed me exactly where my knowledge had gaps I didn't even know existed.",
    metric: "61% → 97%",
    metricLabel: "Knowledge coverage",
    weeks: 12,
  },
];

const features = [
  {
    icon: Upload,
    title: "Ingest Any Material",
    description:
      "Upload PDFs, slides, videos, code, markdown. Core Model builds a concept map from your actual study materials.",
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
      "Built from validated psychometric instruments and real behavior. No learning-style myths — only constructs that change decisions.",
  },
  {
    icon: Map,
    title: "Adaptive 7-Day Guides",
    description:
      "Personalized learning plans that evolve every session. Spacing, interleaving, and retrieval practice optimized to your mastery state.",
  },
  {
    icon: Eye,
    title: "Full Audit Trail",
    description:
      "Every recommendation links to an observation, inference, and policy change. See exactly why each decision was made.",
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
      "Interventions are testable hypotheses. If they don't improve outcomes, they get revised or rolled back.",
  },
];

const integrations = [
  {
    icon: SiOpenai,
    label: "OpenAI",
    color: "text-zinc-800 dark:text-zinc-200",
  },
  {
    icon: SiAnthropic,
    label: "Anthropic",
    color: "text-zinc-800 dark:text-zinc-200",
  },
  {
    icon: SiSlack,
    label: "Slack",
    color: "text-[#4A154B] dark:text-[#E01E5A]",
  },
  { icon: SiDiscord, label: "Discord", color: "text-[#5865F2]" },
  { icon: BsMicrosoftTeams, label: "Teams", color: "text-[#6264A7]" },
  {
    icon: SiModelcontextprotocol,
    label: "MCP",
    color: "text-zinc-800 dark:text-zinc-200",
  },
];

const faqs = [
  {
    q: "What types of study materials can I upload?",
    a: "Core Model accepts PDFs, PowerPoint/Keynote slides, markdown files, code repositories, video links (YouTube, Vimeo), web page URLs, and plain text. Most files process in under 60 seconds.",
  },
  {
    q: "How is this different from Anki or Quizlet?",
    a: "Anki and Quizlet are flashcard tools with a single mechanism. Core Model builds a full scientific learner profile, tracks uncertainty explicitly, generates multiple intervention types, and provides a complete audit trail for every recommendation.",
  },
  {
    q: "Does Core Model use 'learning styles' to personalize?",
    a: "No. We explicitly reject the 'meshing hypothesis.' Instead, we use behavior-first constructs: mastery state, calibration quality, strategy repertoire, and motivational orientation.",
  },
  {
    q: "How long before I see results?",
    a: "Initial profiling takes 10-15 minutes. Your first adaptive 7-day guide generates immediately. By Week 4, the system provides precise, concept-level guidance. Most users report improvement within 2-3 weeks.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your learner profile is never sold or shared. You own your data completely — exportable and deletable at any time. Encryption at rest and in transit.",
  },
  {
    q: "What if I disagree with a recommendation?",
    a: "Every recommendation includes its full reasoning chain. You can override any recommendation, and your override becomes new behavioral evidence that updates the model.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For anyone trying it out on their own",
    features: [
      "Up to 3 projects",
      "50 MB storage",
      "Your learning dashboard",
      "7-day study plans",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Scholar",
    price: "$29",
    period: "/month",
    description: "For students and professionals who want the full picture",
    features: [
      "Unlimited projects",
      "5 GB storage",
      "Detailed knowledge report",
      "Knowledge map & gaps",
      "Faster AI responses",
      "Full history & export",
      "Email support",
    ],
    cta: "Start 14-Day Trial",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$79",
    period: "/seat/month",
    description: "For groups and departments working together",
    features: [
      "Everything in Scholar",
      "Shared workspace",
      "Admin dashboard & roles",
      "One bill for the team",
      "Team analytics",
      "Single sign-on (SSO)",
      "Onboarding help",
      "Priority email & chat",
    ],
    cta: "Start Team Trial",
    highlighted: false,
  },
];

const layers = [
  {
    step: "01",
    title: "Evidence Layer",
    subtitle: "What happened",
    description:
      "Raw behavioral data from study sessions. Response accuracy, confidence predictions, time patterns. No interpretation — just facts.",
    icon: Target,
    color: "from-emerald-500 to-emerald-600",
    items: [
      "Response accuracy",
      "Confidence ratings",
      "Time patterns",
      "Material coverage",
    ],
  },
  {
    step: "02",
    title: "Inference Layer",
    subtitle: "What we estimate",
    description:
      "Statistical models derive mastery estimates, calibration quality, and strategy risks. Every estimate includes explicit uncertainty bounds.",
    icon: TrendingUp,
    color: "from-violet-500 to-violet-600",
    items: [
      "Mastery distributions",
      "Calibration ECE/Brier",
      "Strategy risk scores",
      "Confidence intervals",
    ],
  },
  {
    step: "03",
    title: "Policy Layer",
    subtitle: "What to do next",
    description:
      "Deterministic rules map inferences to interventions. Spacing schedules, retrieval prompts, calibration exercises. Fully auditable.",
    icon: Zap,
    color: "from-amber-500 to-amber-600",
    items: [
      "Spaced repetition",
      "Retrieval practice",
      "Calibration loops",
      "Strategy coaching",
    ],
  },
];

// ── Component ──

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <MegaMenu landingAnchors />
      <div className="grayscale">
        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16"
          >
            <div className="w-full mx-auto">
              <motion.div
                className="relative p-10 sm:p-16 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <BlurText
                    text="Stop Studying Like It's 1995."
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.9] justify-center font-heading"
                    delay={75}
                    animateBy="words"
                    direction="bottom"
                    stepDuration={0.4}
                  />
                </motion.div>

                <motion.div
                  className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  Ingest your study materials and receive a scientific learner
                  profile &mdash; adaptive, transparent, and honest about its
                  own uncertainty. Full audit trails, no myths, no black boxes.
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <a href="/dashboard">
                    <Button
                      size="lg"
                      className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 group"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                  <a href="#how-it-works">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base px-8 py-6 rounded-xl backdrop-blur-sm"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      See How It Works
                    </Button>
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── Integrations ── */}
        <section className="py-16 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <p className="text-center text-sm text-muted-foreground mb-8">
                Connects with the tools you already use
              </p>
            </FadeInOnScroll>

            <FadeInOnScroll delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                {integrations.map((item) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="text-sm sm:text-base font-medium">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </FadeInOnScroll>
          </div>
        </section>
      </div>
      {/* ── Social Proof Bar ── */}
      <section className="relative py-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src="/logos/texas-longhorns.svg"
                alt="UT Austin"
                width={144}
                height={144}
                className="h-36 w-36 object-contain"
              />
              <p className="text-sm text-gray-500">Trusted Partner</p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <div className="grayscale">
        {/* ── Features ── */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Science-first
                <br />
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  adaptive learning.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature is grounded in validated research. No buzzwords.
                Just evidence-based interventions that measurably improve
                outcomes.
              </p>
            </FadeInOnScroll>

            <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="group relative overflow-hidden border-border/60 hover:border-primary/30 transition-colors h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="relative">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                        {feature.formats && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {feature.formats.map((fmt, j) => (
                              <span
                                key={j}
                                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                              >
                                <fmt.icon className="h-3 w-3" /> {fmt.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section
          id="how-it-works"
          className="py-24 sm:py-32 bg-muted/20 relative overflow-hidden"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                How It Works
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Three layers.
                <br />
                Total transparency.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {siteConfig.name}&apos;s architecture ensures every
                recommendation is traceable from raw data to action.
              </p>
            </FadeInOnScroll>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {layers.map((layer, i) => (
                <FadeInOnScroll key={i} delay={i * 0.15}>
                  <motion.div
                    className="relative h-full"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="rounded-2xl border border-border/60 bg-card p-6 h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <motion.div
                        className={`mb-4 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${layer.color} text-white shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                      >
                        <layer.icon className="h-6 w-6" />
                      </motion.div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">
                        LAYER {layer.step}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{layer.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {layer.subtitle}
                      </p>
                    </div>
                  </motion.div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── Metrics Ribbon ── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: 89, suffix: "%", label: "Student improvement" },
                { value: 14, suffix: " wks", label: "Avg. mastery timeline" },
                { value: 97, suffix: "%", label: "Knowledge coverage" },
                { value: 35, suffix: "%", label: "Less study time" },
              ].map((stat, i) => (
                <StaggerItem key={i}>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── Case Studies ── */}
        <section id="case-studies" className="py-24 sm:py-32 bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Case Studies
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Real learners.
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Measurable outcomes.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Professionals across industries share how Core Model transformed
                their approach to mastering complex material.
              </p>
            </FadeInOnScroll>

            <div className="space-y-8">
              {personas.map((persona, i) => (
                <FadeInOnScroll
                  key={persona.id}
                  delay={i * 0.1}
                  direction={i % 2 === 0 ? "left" : "right"}
                >
                  <motion.div
                    className={`rounded-2xl border ${persona.borderColor} ${persona.bgColor} overflow-hidden`}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className="grid md:grid-cols-5 gap-0">
                      {/* Profile */}
                      <div className="md:col-span-2 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <motion.div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${persona.color} text-white shadow-lg`}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                          >
                            <persona.icon className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg">
                              {persona.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {persona.role}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              {persona.institution}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              {persona.weeks}-week journey
                            </span>
                          </div>
                        </div>

                        {/* Metric */}
                        <div className="rounded-xl border border-border/40 bg-card p-4">
                          <div className="text-2xl sm:text-3xl font-black font-heading">
                            {persona.metric}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {persona.metricLabel}
                          </div>
                        </div>
                      </div>

                      {/* Story */}
                      <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-border/40 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold mb-2">The Challenge</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {persona.challenge}
                          </p>

                          <div className="relative rounded-xl bg-card border border-border/40 p-5">
                            <Quote className="absolute top-3 left-3 h-5 w-5 text-primary/20" />
                            <p className="text-sm italic leading-relaxed pl-6">
                              &ldquo;{persona.quote}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Pricing
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Simple pricing.
                <br />
                Start free, upgrade anytime.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                No credit card required. Choose the plan that fits — pay only
                when you need more.
              </p>
            </FadeInOnScroll>

            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <StaggerItem key={plan.name}>
                  <motion.div
                    className={`rounded-2xl border p-6 sm:p-8 h-full ${
                      plan.highlighted
                        ? "border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/10 relative"
                        : "border-border/60 bg-card"
                    }`}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="shadow-lg">Most Popular</Badge>
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-black font-heading">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
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
                      {plan.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}

              {/* Enterprise / Call Us */}
              <StaggerItem key="enterprise">
                <motion.div
                  className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 h-full flex flex-col"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Enterprise</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    For large organizations. Custom pricing and dedicated
                    support.
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black font-heading">
                      Custom
                    </span>
                  </div>
                  <a href="tel:+18005551234">
                    <Button className="w-full mb-6 gap-2" variant="outline">
                      <Phone className="h-4 w-4" />
                      Call Us
                    </Button>
                  </a>
                  <div className="space-y-3">
                    {[
                      "Everything in Teams",
                      "Unlimited seats",
                      "Custom integrations",
                      "Uptime guarantee",
                      "Your own servers (optional)",
                      "Dedicated success manager",
                      "Custom AI setup",
                      "24/7 phone & email support",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 sm:py-32 bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                FAQ
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                Common questions.
              </h2>
            </FadeInOnScroll>

            <StaggerChildren className="space-y-3">
              {faqs.map((faq, i) => (
                <StaggerItem key={i}>
                  <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                    <button
                      className="flex w-full items-center justify-between p-5 text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium text-sm pr-4">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaq === i ? "auto" : 0,
                        opacity: openFaq === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <motion.div
                className="relative rounded-3xl bg-gradient-to-br from-primary via-violet-700 to-purple-800 p-10 sm:p-16 text-center text-white overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                    Start learning
                    <br />
                    with evidence today.
                  </h2>
                  <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8">
                    Upload your first materials, build your scientific learner
                    profile, and get your personalized 7-day guide in minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/dashboard">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="text-base px-8 py-6 rounded-xl shadow-lg group"
                      >
                        Sign Up Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </a>
                    <a href="#case-studies">
                      <Button
                        size="lg"
                        variant="ghost"
                        className="text-base px-8 py-6 rounded-xl text-white/90 hover:text-white hover:bg-white/10"
                      >
                        Read Case Studies
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            </FadeInOnScroll>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Brain className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold">{siteConfig.name}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {siteConfig.tagline}.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Product</h4>
                <div className="space-y-2">
                  <a
                    href="#features"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                  <a
                    href="#case-studies"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Case Studies
                  </a>
                  <a
                    href="#faq"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Science</h4>
                <div className="space-y-2">
                  <span className="block text-sm text-muted-foreground">
                    Research Foundation
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Trust Contract
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Ethical Commitments
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Validation Model
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Partners</h4>
                <div className="space-y-2">
                  <span className="block text-sm text-muted-foreground">
                    UT Austin
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    AITX
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Contact Us
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteConfig.legalEntity}.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
