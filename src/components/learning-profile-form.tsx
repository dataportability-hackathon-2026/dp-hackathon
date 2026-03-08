"use client";

import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Lightbulb,
  RefreshCw,
  Save,
  Target,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// ── Types ──

export type LearningProfileData = {
  // Screen 1: About you
  displayName: string;
  educationLevel: string;
  fieldOfStudy: string;

  // Screen 2: Learning goals
  primaryGoal: string;
  goalDescription: string;
  deadline: string;
  urgency: string;

  // Screen 3: Study habits
  minutesPerDay: number;
  daysPerWeek: number;
  preferredTimeOfDay: string;
  sessionLength: string;

  // Screen 4: Cognitive reflection
  crtAnswer1: string;
  crtAnswer2: string;
  crtAnswer3: string;

  // Screen 5: Metacognitive awareness
  metacogPlanningFrequency: string;
  metacogMonitoring: string;
  metacogSelfEvaluation: string;

  // Screen 6: Study strategies
  studyStrategies: string[];
  primaryStrategy: string;

  // Screen 7: Motivation & drive
  motivationAutonomy: number;
  motivationCompetence: number;
  motivationRelatedness: number;

  // Screen 8: Confidence calibration
  calibrationConfidence: number;
  calibrationExplanation: string;

  // Screen 9: Challenges & obstacles
  biggestChallenge: string;
  procrastinationFrequency: string;
  distractionSources: string[];

  // Screen 10: Learning preferences
  preferredFormats: string[];
  feedbackStyle: string;
  coachingTone: string;

  // Screen 11: Prior knowledge
  priorKnowledgeLevel: string;
  priorKnowledgeDetails: string;
  relatedSubjects: string[];

  // Screen 12: Final reflection
  learningSuperpowers: string;
  areasToImprove: string;
  anythingElse: string;
};

export const DEFAULT_PROFILE: LearningProfileData = {
  displayName: "",
  educationLevel: "",
  fieldOfStudy: "",
  primaryGoal: "",
  goalDescription: "",
  deadline: "",
  urgency: "",
  minutesPerDay: 30,
  daysPerWeek: 5,
  preferredTimeOfDay: "",
  sessionLength: "",
  crtAnswer1: "",
  crtAnswer2: "",
  crtAnswer3: "",
  metacogPlanningFrequency: "",
  metacogMonitoring: "",
  metacogSelfEvaluation: "",
  studyStrategies: [],
  primaryStrategy: "",
  motivationAutonomy: 50,
  motivationCompetence: 50,
  motivationRelatedness: 50,
  calibrationConfidence: 70,
  calibrationExplanation: "",
  biggestChallenge: "",
  procrastinationFrequency: "",
  distractionSources: [],
  preferredFormats: [],
  feedbackStyle: "",
  coachingTone: "",
  priorKnowledgeLevel: "",
  priorKnowledgeDetails: "",
  relatedSubjects: [],
  learningSuperpowers: "",
  areasToImprove: "",
  anythingElse: "",
};

export const MOCK_COMPLETED_PROFILE: LearningProfileData = {
  displayName: "Maya Chen",
  educationLevel: "undergraduate",
  fieldOfStudy: "Computer Science",
  primaryGoal: "exam",
  goalDescription: "Pass my Linear Algebra midterm with at least a B+",
  deadline: "2026-03-28",
  urgency: "high",
  minutesPerDay: 45,
  daysPerWeek: 5,
  preferredTimeOfDay: "morning",
  sessionLength: "25-30",
  crtAnswer1: "5 cents",
  crtAnswer2: "5 minutes",
  crtAnswer3: "24 days",
  metacogPlanningFrequency: "sometimes",
  metacogMonitoring: "sometimes",
  metacogSelfEvaluation: "rarely",
  studyStrategies: ["active-recall", "spaced-repetition", "worked-examples"],
  primaryStrategy: "active-recall",
  motivationAutonomy: 78,
  motivationCompetence: 62,
  motivationRelatedness: 45,
  calibrationConfidence: 80,
  calibrationExplanation:
    "I usually feel fairly confident about my understanding after studying, but sometimes I find that I've overestimated how well I know the material when the actual test comes.",
  biggestChallenge:
    "I sometimes overestimate how well I know the material, which leads me to move on before I've truly mastered it.",
  procrastinationFrequency: "sometimes",
  distractionSources: ["phone", "social-media", "noise"],
  preferredFormats: ["visual-diagrams", "worked-examples", "short-practice"],
  feedbackStyle: "direct",
  coachingTone: "concise",
  priorKnowledgeLevel: "intermediate",
  priorKnowledgeDetails:
    "I did well in precalculus and early calculus. I understand basic matrix operations but struggle with eigenvalues and abstract proofs.",
  relatedSubjects: ["calculus", "discrete-math"],
  learningSuperpowers:
    "I'm good at pattern recognition and I genuinely enjoy solving problems once I understand the approach.",
  areasToImprove:
    "I need to get better at checking my understanding before moving on, and I should practice more with proofs and abstract reasoning.",
  anythingElse:
    "I learn best when I can see concrete examples before abstract definitions.",
};

// ── Helpers ──

const TOTAL_SCREENS = 12;

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
        selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function CaseStudyTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
      <div className="flex gap-2">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="text-xs text-blue-800 dark:text-blue-300">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Screen Components ──

function Screen1({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">About You</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let's start with the basics so we can personalize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What should we call you?</Label>
          <Input
            name="displayName"
            placeholder="Your preferred name"
            autoComplete="given-name"
            value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>What level of education are you at?</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "high-school", label: "High School" },
              { value: "undergraduate", label: "Undergraduate" },
              { value: "graduate", label: "Graduate" },
              { value: "professional", label: "Professional" },
              { value: "self-directed", label: "Self-directed" },
              { value: "other", label: "Other" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.educationLevel === opt.value}
                onClick={() => onChange({ educationLevel: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What are you studying or learning about?</Label>
          <Input
            name="fieldOfStudy"
            placeholder="e.g. Linear Algebra, Machine Learning, Spanish"
            autoComplete="off"
            value={data.fieldOfStudy}
            onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
          />
        </div>
      </div>

      <CaseStudyTip>
        <strong>Why we ask:</strong> Maya, an undergrad CS student, got a
        personalized plan that adapted pacing to her course schedule and exam
        dates. Knowing your context helps us do the same for you.
      </CaseStudyTip>
    </div>
  );
}

function Screen2({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Learning Goals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What are you working towards? This helps us build a plan that matches
          your priorities.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What's your primary goal?</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "exam", label: "Pass an Exam", icon: GraduationCap },
              { value: "project", label: "Complete a Project", icon: Target },
              { value: "fluency", label: "Build Deep Fluency", icon: Brain },
              { value: "teach", label: "Learn to Teach It", icon: BookOpen },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <OptionButton
                  key={opt.value}
                  selected={data.primaryGoal === opt.value}
                  onClick={() => onChange({ primaryGoal: opt.value })}
                >
                  <Icon className="size-4 shrink-0" />
                  {opt.label}
                </OptionButton>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Describe your goal in your own words</Label>
          <Textarea
            placeholder="e.g. I want to pass my Linear Algebra midterm with at least a B+"
            value={data.goalDescription}
            onChange={(e) => onChange({ goalDescription: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Do you have a deadline?</Label>
          <Input
            name="deadline"
            type="date"
            autoComplete="off"
            value={data.deadline}
            onChange={(e) => onChange({ deadline: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>How urgent does this feel?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "low", label: "No rush" },
              { value: "medium", label: "Moderate" },
              { value: "high", label: "Urgent" },
              { value: "critical", label: "Crunch time" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.urgency === opt.value}
                onClick={() => onChange({ urgency: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Case study:</strong> A student targeting an exam 3 weeks out got
        a plan with increasing intensity and strategic review sessions. A
        "fluency" learner got a more relaxed, depth-first approach with
        interleaved practice.
      </CaseStudyTip>
    </div>
  );
}

function Screen3({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const handleSlider =
    (field: keyof LearningProfileData) =>
    (value: number | readonly number[]) => {
      const v = Array.isArray(value) ? value[0] : value;
      onChange({ [field]: v });
    };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Study Habits</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Help us understand your schedule and preferences so we can build
          realistic study blocks.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>
            How many minutes per day can you study? {data.minutesPerDay} min
          </Label>
          <Slider
            value={[data.minutesPerDay]}
            onValueChange={handleSlider("minutesPerDay")}
            min={10}
            max={180}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Most learners see the best results with 25-60 minutes of focused
            study.
          </p>
        </div>

        <div className="space-y-2">
          <Label>How many days per week? {data.daysPerWeek} days</Label>
          <Slider
            value={[data.daysPerWeek]}
            onValueChange={handleSlider("daysPerWeek")}
            min={1}
            max={7}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>When do you prefer to study?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "morning", label: "Morning" },
              { value: "afternoon", label: "Afternoon" },
              { value: "evening", label: "Evening" },
              { value: "varies", label: "It varies" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.preferredTimeOfDay === opt.value}
                onClick={() => onChange({ preferredTimeOfDay: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What session length works best for you?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "15-20", label: "15-20 min sprints" },
              { value: "25-30", label: "25-30 min (Pomodoro)" },
              { value: "45-60", label: "45-60 min deep work" },
              { value: "60+", label: "60+ min marathons" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.sessionLength === opt.value}
                onClick={() => onChange({ sessionLength: opt.value })}
              >
                <Clock className="size-3.5 shrink-0" />
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Research insight:</strong> Distributed practice (shorter
        sessions across more days) outperforms massed practice for long-term
        retention. We'll optimize your schedule based on the science.
      </CaseStudyTip>
    </div>
  );
}

function Screen4({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Cognitive Reflection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These short puzzles help us understand how you approach tricky
          problems. There's no penalty for wrong answers -- we're measuring your
          thinking style, not intelligence.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puzzle 1</CardTitle>
            <CardDescription>
              A bat and a ball cost $1.10 in total. The bat costs $1.00 more
              than the ball. How much does the ball cost?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Your answer (e.g. 5 cents)"
              value={data.crtAnswer1}
              onChange={(e) => onChange({ crtAnswer1: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puzzle 2</CardTitle>
            <CardDescription>
              If it takes 5 machines 5 minutes to make 5 widgets, how long would
              it take 100 machines to make 100 widgets?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Your answer (e.g. 5 minutes)"
              value={data.crtAnswer2}
              onChange={(e) => onChange({ crtAnswer2: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puzzle 3</CardTitle>
            <CardDescription>
              In a lake, there is a patch of lily pads. Every day, the patch
              doubles in size. If it takes 48 days for the patch to cover the
              entire lake, how long would it take for the patch to cover half of
              the lake?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Your answer (e.g. 47 days)"
              value={data.crtAnswer3}
              onChange={(e) => onChange({ crtAnswer3: e.target.value })}
            />
          </CardContent>
        </Card>
      </div>

      <CaseStudyTip>
        <strong>What this tells us:</strong> These are from the Cognitive
        Reflection Test (CRT). Students who pause and override their initial
        "gut" response tend to benefit from different study strategies than
        those who go with intuition. We use this to calibrate how we present new
        material to you.
      </CaseStudyTip>
    </div>
  );
}

function Screen5({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Metacognitive Awareness</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How well do you monitor and regulate your own learning? Be honest --
          this helps us build the right support scaffolds for you.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>
            Before studying, how often do you plan what you'll cover?
          </Label>
          <p className="text-xs text-muted-foreground">
            e.g. "Today I'll review chapter 3, do 10 practice problems, then
            self-test"
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "always", label: "Always" },
              { value: "often", label: "Often" },
              { value: "sometimes", label: "Sometimes" },
              { value: "rarely", label: "Rarely" },
              { value: "never", label: "Never" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.metacogPlanningFrequency === opt.value}
                onClick={() =>
                  onChange({ metacogPlanningFrequency: opt.value })
                }
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            During studying, do you check whether you actually understand?
          </Label>
          <p className="text-xs text-muted-foreground">
            e.g. pausing to ask yourself "Can I explain this without looking?"
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "always", label: "Always" },
              { value: "often", label: "Often" },
              { value: "sometimes", label: "Sometimes" },
              { value: "rarely", label: "Rarely" },
              { value: "never", label: "Never" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.metacogMonitoring === opt.value}
                onClick={() => onChange({ metacogMonitoring: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            After studying, do you evaluate what worked and what didn't?
          </Label>
          <p className="text-xs text-muted-foreground">
            e.g. "Active recall worked well today, but I need more practice on
            proofs"
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "always", label: "Always" },
              { value: "often", label: "Often" },
              { value: "sometimes", label: "Sometimes" },
              { value: "rarely", label: "Rarely" },
              { value: "never", label: "Never" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.metacogSelfEvaluation === opt.value}
                onClick={() => onChange({ metacogSelfEvaluation: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Why it matters:</strong> Students with strong metacognitive
        skills learn 20-40% faster. If you're still developing these habits,
        we'll weave in reflection prompts and self-check routines throughout
        your guide automatically.
      </CaseStudyTip>
    </div>
  );
}

function Screen6({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const strategies = [
    {
      value: "active-recall",
      label: "Active Recall",
      desc: "Testing yourself without looking at notes",
    },
    {
      value: "spaced-repetition",
      label: "Spaced Repetition",
      desc: "Reviewing at increasing intervals",
    },
    {
      value: "worked-examples",
      label: "Worked Examples",
      desc: "Studying solved problems step-by-step",
    },
    {
      value: "elaboration",
      label: "Elaboration",
      desc: "Explaining concepts in your own words",
    },
    {
      value: "interleaving",
      label: "Interleaving",
      desc: "Mixing different types of problems",
    },
    {
      value: "summarization",
      label: "Summarization",
      desc: "Writing summaries of what you learned",
    },
    {
      value: "highlighting",
      label: "Highlighting / Rereading",
      desc: "Marking up text and re-reading it",
    },
    {
      value: "mind-mapping",
      label: "Mind Mapping",
      desc: "Creating visual concept maps",
    },
  ];

  const toggleStrategy = (value: string) => {
    const current = data.studyStrategies;
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onChange({ studyStrategies: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Study Strategies</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Which techniques do you currently use? Select all that apply.
        </p>
      </div>

      <div className="space-y-3">
        {strategies.map((s) => (
          <label
            key={s.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
              data.studyStrategies.includes(s.value)
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            }`}
          >
            <Checkbox
              checked={data.studyStrategies.includes(s.value)}
              onCheckedChange={() => toggleStrategy(s.value)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">{s.label}</span>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {data.studyStrategies.length > 0 && (
        <div className="space-y-2">
          <Label>Which is your go-to strategy?</Label>
          <div className="flex flex-wrap gap-2">
            {data.studyStrategies.map((s) => {
              const strat = strategies.find((st) => st.value === s);
              return (
                <OptionButton
                  key={s}
                  selected={data.primaryStrategy === s}
                  onClick={() => onChange({ primaryStrategy: s })}
                >
                  {strat?.label ?? s}
                </OptionButton>
              );
            })}
          </div>
        </div>
      )}

      <CaseStudyTip>
        <strong>Evidence-based tip:</strong> Active recall and spaced repetition
        are among the most effective strategies (Dunlosky et al., 2013). If
        you're mostly using highlighting, we'll gently introduce more effective
        techniques into your study plan.
      </CaseStudyTip>
    </div>
  );
}

function Screen7({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const handleSlider =
    (field: keyof LearningProfileData) =>
    (value: number | readonly number[]) => {
      const v = Array.isArray(value) ? value[0] : value;
      onChange({ [field]: v });
    };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Motivation & Drive</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Understanding what drives you helps us create a learning experience
          that keeps you engaged. Based on Self-Determination Theory (Deci &
          Ryan), we measure three core needs.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Autonomy</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {data.motivationAutonomy}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            How important is it that you choose <em>what</em> and <em>how</em>{" "}
            you study?
          </p>
          <Slider
            value={[data.motivationAutonomy]}
            onValueChange={handleSlider("motivationAutonomy")}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>I prefer structure</span>
            <span>I need full control</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Competence</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {data.motivationCompetence}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            How much do you need to feel like you're making progress and
            building mastery?
          </p>
          <Slider
            value={[data.motivationCompetence]}
            onValueChange={handleSlider("motivationCompetence")}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress is secondary</span>
            <span>I need visible growth</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Relatedness</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {data.motivationRelatedness}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            How much does studying with or for others motivate you?
          </p>
          <Slider
            value={[data.motivationRelatedness]}
            onValueChange={handleSlider("motivationRelatedness")}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>I prefer solo</span>
            <span>Community drives me</span>
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Case study:</strong> A learner with high autonomy and low
        relatedness got an independent, self-paced plan with flexible ordering.
        A high-relatedness learner got prompts to share progress and discuss
        with study partners.
      </CaseStudyTip>
    </div>
  );
}

function Screen8({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const handleSlider = (value: number | readonly number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    onChange({ calibrationConfidence: v });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Confidence Calibration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One of the most important learning skills is knowing what you know --
          and what you don't. This helps us understand your calibration
          patterns.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick scenario</CardTitle>
            <CardDescription>
              Imagine you just studied a chapter for 45 minutes and feel like
              you understood it. If someone gave you a 10-question quiz right
              now, how confident are you that you'd score 80% or higher?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Your confidence level</Label>
                <span className="text-sm font-medium tabular-nums">
                  {data.calibrationConfidence}%
                </span>
              </div>
              <Slider
                value={[data.calibrationConfidence]}
                onValueChange={handleSlider}
                min={0}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not confident at all</span>
                <span>Extremely confident</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Why did you pick that number?</Label>
          <Textarea
            placeholder="e.g. I usually feel confident after studying but sometimes find I overestimate..."
            value={data.calibrationExplanation}
            onChange={(e) =>
              onChange({ calibrationExplanation: e.target.value })
            }
          />
        </div>
      </div>

      <CaseStudyTip>
        <strong>Research insight:</strong> Many learners are "overconfident" --
        they predict 80% but score 55%. If we detect this pattern, we'll add
        prediction-reflection loops and spaced self-testing to help you
        calibrate better.
      </CaseStudyTip>
    </div>
  );
}

function Screen9({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const distractions = [
    { value: "phone", label: "Phone notifications" },
    { value: "social-media", label: "Social media" },
    { value: "noise", label: "Background noise" },
    { value: "fatigue", label: "Tiredness / fatigue" },
    { value: "multitasking", label: "Trying to multitask" },
    { value: "anxiety", label: "Stress / anxiety" },
    { value: "boredom", label: "Boredom / disengagement" },
    { value: "other", label: "Something else" },
  ];

  const toggleDistraction = (value: string) => {
    const current = data.distractionSources;
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onChange({ distractionSources: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Challenges & Obstacles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone faces barriers to learning. Being honest about yours helps us
          build in the right support at the right time.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>What's your biggest learning challenge right now?</Label>
          <Textarea
            placeholder="e.g. I overestimate my understanding, I procrastinate on hard topics..."
            value={data.biggestChallenge}
            onChange={(e) => onChange({ biggestChallenge: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>How often do you procrastinate on studying?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "never", label: "Never" },
              { value: "rarely", label: "Rarely" },
              { value: "sometimes", label: "Sometimes" },
              { value: "often", label: "Often" },
              { value: "always", label: "Almost always" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.procrastinationFrequency === opt.value}
                onClick={() =>
                  onChange({ procrastinationFrequency: opt.value })
                }
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            What distracts you most during study? Select all that apply.
          </Label>
          <div className="flex flex-wrap gap-2">
            {distractions.map((d) => (
              <ToggleChip
                key={d.value}
                selected={data.distractionSources.includes(d.value)}
                onClick={() => toggleDistraction(d.value)}
              >
                {d.label}
              </ToggleChip>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>How we help:</strong> A student who reported frequent
        procrastination got micro-commitment prompts ("Just do 5 minutes") and
        progress celebrations built into their plan. Students who struggle with
        phone distractions get timed focus blocks with clear start/stop signals.
      </CaseStudyTip>
    </div>
  );
}

function Screen10({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const formats = [
    { value: "visual-diagrams", label: "Visual diagrams" },
    { value: "text-explanations", label: "Text explanations" },
    { value: "worked-examples", label: "Worked examples" },
    { value: "short-practice", label: "Short practice problems" },
    { value: "videos", label: "Video content" },
    { value: "interactive", label: "Interactive exercises" },
    { value: "flashcards", label: "Flashcards" },
    { value: "discussion", label: "Discussion-based" },
  ];

  const toggleFormat = (value: string) => {
    const current = data.preferredFormats;
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onChange({ preferredFormats: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Learning Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How do you like to learn and receive feedback? This helps us customize
          the presentation and coaching style.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>What formats work best for you? Select all that apply.</Label>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <ToggleChip
                key={f.value}
                selected={data.preferredFormats.includes(f.value)}
                onClick={() => toggleFormat(f.value)}
              >
                {f.label}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>How do you prefer to receive feedback?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "direct", label: "Direct & honest" },
              { value: "encouraging", label: "Encouraging & supportive" },
              { value: "socratic", label: "Through questions (Socratic)" },
              { value: "detailed", label: "Detailed explanations" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.feedbackStyle === opt.value}
                onClick={() => onChange({ feedbackStyle: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What coaching tone do you prefer?</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "concise", label: "Brief & to the point" },
              { value: "conversational", label: "Conversational & warm" },
              { value: "academic", label: "Academic & formal" },
              { value: "motivational", label: "Motivational & upbeat" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.coachingTone === opt.value}
                onClick={() => onChange({ coachingTone: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Personalization in action:</strong> A learner who preferred
        visual diagrams and concise coaching got streamlined concept maps and
        bullet-point feedback. A conversational learner got more narrative-style
        explanations with analogies.
      </CaseStudyTip>
    </div>
  );
}

function Screen11({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  const subjects = [
    { value: "calculus", label: "Calculus" },
    { value: "statistics", label: "Statistics" },
    { value: "discrete-math", label: "Discrete Math" },
    { value: "programming", label: "Programming" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "writing", label: "Writing" },
    { value: "languages", label: "Foreign Languages" },
    { value: "other", label: "Other" },
  ];

  const toggleSubject = (value: string) => {
    const current = data.relatedSubjects;
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onChange({ relatedSubjects: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Prior Knowledge</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What do you already know? This helps us start at the right level and
          connect new material to things you already understand.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>
            How would you rate your current knowledge of this subject?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "beginner",
                label: "Complete Beginner",
                desc: "Brand new to this",
              },
              {
                value: "novice",
                label: "Novice",
                desc: "Some exposure but shaky",
              },
              {
                value: "intermediate",
                label: "Intermediate",
                desc: "Know the basics, gaps in advanced topics",
              },
              {
                value: "advanced",
                label: "Advanced",
                desc: "Strong foundation, refining skills",
              },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={data.priorKnowledgeLevel === opt.value}
                onClick={() => onChange({ priorKnowledgeLevel: opt.value })}
              >
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {opt.desc}
                  </div>
                </div>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Tell us more about what you know (and what trips you up)
          </Label>
          <Textarea
            placeholder="e.g. I did well in precalculus but struggle with eigenvalues and abstract proofs..."
            value={data.priorKnowledgeDetails}
            onChange={(e) =>
              onChange({ priorKnowledgeDetails: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>What related subjects do you have experience with?</Label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <ToggleChip
                key={s.value}
                selected={data.relatedSubjects.includes(s.value)}
                onClick={() => toggleSubject(s.value)}
              >
                {s.label}
              </ToggleChip>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyTip>
        <strong>Smart connections:</strong> When a calculus student said they
        also knew programming, we used code examples to illustrate abstract math
        concepts. Your existing knowledge becomes a bridge to new learning.
      </CaseStudyTip>
    </div>
  );
}

function Screen12({
  data,
  onChange,
}: {
  data: LearningProfileData;
  onChange: (d: Partial<LearningProfileData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Final Reflection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Last step! In your own words, help us understand what makes you tick
          as a learner. There are no right answers -- just be yourself.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>What are your learning superpowers?</Label>
          <p className="text-xs text-muted-foreground">
            What do you do well when you're at your best?
          </p>
          <Textarea
            placeholder="e.g. I'm great at pattern recognition, I love solving puzzles once I understand the approach..."
            value={data.learningSuperpowers}
            onChange={(e) => onChange({ learningSuperpowers: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>
            What would you most like to improve about how you learn?
          </Label>
          <Textarea
            placeholder="e.g. I need to be better at checking my understanding before moving on..."
            value={data.areasToImprove}
            onChange={(e) => onChange({ areasToImprove: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Anything else you'd like us to know?</Label>
          <Textarea
            placeholder="Optional: anything that would help us personalize your experience..."
            value={data.anythingElse}
            onChange={(e) => onChange({ anythingElse: e.target.value })}
          />
        </div>
      </div>

      <CaseStudyTip>
        <strong>What happens next:</strong> We'll combine your answers across
        all 12 screens to build a comprehensive learning profile. This profile
        powers everything -- from how we pace your guide, to what coaching tone
        we use, to when we add reflection prompts. You can retake this
        assessment anytime from your profile.
      </CaseStudyTip>
    </div>
  );
}

// ── Saved Confirmation ──

function SavedConfirmation({
  onRegenerateGuide,
  onDismiss,
}: {
  onRegenerateGuide: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Profile Saved!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your learning profile has been updated. The system will use this to
            personalize your experience, coaching style, and study plan.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={onRegenerateGuide} className="w-full">
            <RefreshCw className="size-4" data-icon="inline-start" />
            Regenerate Guide with New Profile
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onDismiss}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Form Component ──

export function LearningProfileForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: LearningProfileData;
  onSave: (data: LearningProfileData) => void;
  onCancel: () => void;
}) {
  const [screen, setScreen] = useState(0);
  const [data, setData] = useState<LearningProfileData>(
    initialData ?? DEFAULT_PROFILE,
  );
  const [saved, setSaved] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formId = useId();

  // Create assessment on mount
  useEffect(() => {
    async function initAssessment() {
      try {
        // Check for existing in-progress assessment
        const listRes = await fetch("/api/assessments?limit=1");
        if (listRes.ok) {
          const list = await listRes.json();
          const inProgress = list.find(
            (a: { status: string }) => a.status === "in_progress",
          );
          if (inProgress) {
            setAssessmentId(inProgress.id);
            if (inProgress.responses) {
              setData((prev) => ({ ...prev, ...inProgress.responses }));
            }
            if (
              typeof inProgress.currentStep === "number" &&
              inProgress.currentStep > 0
            ) {
              setScreen(inProgress.currentStep);
            }
            return;
          }
        }

        // Create new assessment
        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "full_onboarding" }),
        });
        if (res.ok) {
          const created = await res.json();
          setAssessmentId(created.id);
        }
      } catch {
        // Silently fail — form still works without persistence
      }
    }
    void initAssessment();
  }, []);

  // Auto-save on step navigation (debounced)
  const saveProgress = useCallback(
    (step: number, currentData: typeof data) => {
      if (!assessmentId) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch(`/api/assessments/${assessmentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentStep: step, responses: currentData }),
          });
        } catch {
          // Silently fail
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [assessmentId],
  );

  const update = (partial: Partial<LearningProfileData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    if (assessmentId) {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed", responses: data }),
        });
        if (res.ok) {
          const completed = await res.json();
          // Hydrate the data store with the completed assessment
          const { dataStore } = await import("@/lib/data-store");
          dataStore.hydrateFromAssessment(completed);
        }
      } catch {
        // Still call onSave even if DB save fails
      }
    }
    onSave(data);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <SavedConfirmation
          onRegenerateGuide={() => {
            onSave(data);
            onCancel();
          }}
          onDismiss={onCancel}
        />
      </div>
    );
  }

  const screens = [
    <Screen1 key="s1" data={data} onChange={update} />,
    <Screen2 key="s2" data={data} onChange={update} />,
    <Screen3 key="s3" data={data} onChange={update} />,
    <Screen4 key="s4" data={data} onChange={update} />,
    <Screen5 key="s5" data={data} onChange={update} />,
    <Screen6 key="s6" data={data} onChange={update} />,
    <Screen7 key="s7" data={data} onChange={update} />,
    <Screen8 key="s8" data={data} onChange={update} />,
    <Screen9 key="s9" data={data} onChange={update} />,
    <Screen10 key="s10" data={data} onChange={update} />,
    <Screen11 key="s11" data={data} onChange={update} />,
    <Screen12 key="s12" data={data} onChange={update} />,
  ];

  const screenLabels = [
    "About You",
    "Goals",
    "Study Habits",
    "Cognitive Reflection",
    "Metacognition",
    "Study Strategies",
    "Motivation",
    "Calibration",
    "Challenges",
    "Preferences",
    "Prior Knowledge",
    "Final Reflection",
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <div className="flex items-center gap-2 px-1 py-1">
          <Brain className="size-5 text-primary" />
          <span className="text-sm font-semibold">
            Learning Profile Assessment
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          Screen {screen + 1} of {TOTAL_SCREENS}: {screenLabels[screen]}
        </span>
        {saving && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Saving...
          </span>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
          Close
        </button>
      </div>

      {/* Progress bar + dots */}
      <div className="shrink-0 border-b px-6 py-3">
        <div className="mx-auto max-w-2xl">
          <Progress value={((screen + 1) / TOTAL_SCREENS) * 100}>
            <ProgressLabel className="sr-only">
              Assessment progress: {screen + 1} of {TOTAL_SCREENS}
            </ProgressLabel>
          </Progress>
          <div className="mt-2 flex justify-center gap-1">
            {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
              <button
                key={`${formId}-dot-${i}`}
                type="button"
                onClick={() => {
                  setScreen(i);
                  saveProgress(i, data);
                }}
                className={`size-2 rounded-full transition-colors ${
                  i === screen
                    ? "bg-primary"
                    : i < screen
                      ? "bg-primary/40"
                      : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl">{screens[screen]}</div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {screen > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                const prev = screen - 1;
                setScreen(prev);
                saveProgress(prev, data);
              }}
            >
              <ChevronLeft className="size-4" data-icon="inline-start" />
              Back
            </Button>
          ) : (
            <div />
          )}
          <span className="text-xs text-muted-foreground">
            {screen + 1} / {TOTAL_SCREENS}
          </span>
          {screen < TOTAL_SCREENS - 1 ? (
            <Button
              onClick={() => {
                const next = screen + 1;
                setScreen(next);
                saveProgress(next, data);
              }}
            >
              Next
              <ChevronRight className="size-4" data-icon="inline-end" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="size-4" data-icon="inline-start" />
              Save Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
