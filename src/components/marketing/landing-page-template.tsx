"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Braces,
  Brain,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  LineChart,
  Map,
  Palette,
  Shield,
  Star,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LandingPage } from "@/lib/content/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Upload,
  BarChart3,
  Shield,
  Clock,
  Target,
  Zap,
  Eye,
  BookOpen,
  GraduationCap,
  Map,
  TrendingUp,
  FileText,
  Braces,
  Palette,
  LineChart,
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors rounded-lg"
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function LandingPageTemplate({
  page,
  breadcrumbCategory,
}: {
  page: LandingPage;
  breadcrumbCategory: string;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Core Model
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <a
              href="/use-cases"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="/industries"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Industries
            </a>
            <a
              href="/blog"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Blog
            </a>
            <a
              href="/resources"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Resources
            </a>
          </div>
          <a href="/dashboard">
            <Button size="sm">Get Started</Button>
          </a>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <nav className="text-sm text-neutral-500 dark:text-neutral-400">
          <a
            href="/"
            className="hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <a
            href={`/${breadcrumbCategory.toLowerCase().replace(/ /g, "-")}`}
            className="hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {breadcrumbCategory}
          </a>
          <span className="mx-2">/</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {page.title}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-4">
            {breadcrumbCategory}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-6">
            {page.heroHeadline}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
            {page.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={page.heroCta.href}>
              <Button size="lg">
                {page.heroCta.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            {page.secondaryCta && (
              <a href={page.secondaryCta.href}>
                <Button variant="outline" size="lg">
                  {page.secondaryCta.text}
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-center">
            Sound Familiar?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            These are the problems that traditional learning tools ignore. Core
            Model was built to solve them.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {page.painPoints.map((point, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {point.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-center">
            How Core Model Helps
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Evidence-based learning tools designed for real results, not just
            engagement metrics.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {page.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Brain;
              return (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits / Metrics */}
      <section className="bg-neutral-900 dark:bg-neutral-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white dark:text-neutral-900 mb-12 text-center">
            Real Results, Backed by Data
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {page.benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-blue-400 dark:text-blue-600 mb-2 font-heading">
                  {benefit.metric}
                </div>
                <div className="text-lg font-semibold text-white dark:text-neutral-900 mb-2">
                  {benefit.label}
                </div>
                <p className="text-neutral-400 dark:text-neutral-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {page.testimonial && (
        <section id="testimonials" className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative p-8 md:p-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-neutral-900 dark:text-neutral-100 leading-relaxed mb-6 italic">
                &ldquo;{page.testimonial.quote}&rdquo;
              </blockquote>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {page.testimonial.name}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {page.testimonial.role}
                </div>
                <div className="text-neutral-500 dark:text-neutral-500 text-sm">
                  {page.testimonial.institution}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {page.faq.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {page.finalCta.headline}
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            {page.finalCta.subheadline}
          </p>
          <a href={page.finalCta.href}>
            <Button size="lg">
              {page.finalCta.buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Core Model
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Evidence-based adaptive learning powered by cognitive science.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
                Use Cases
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <a
                    href="/use-cases/exam-preparation"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Exam Preparation
                  </a>
                </li>
                <li>
                  <a
                    href="/use-cases/professional-development"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Professional Development
                  </a>
                </li>
                <li>
                  <a
                    href="/use-cases/research-literature-review"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Research & Literature Review
                  </a>
                </li>
                <li>
                  <a
                    href="/use-cases/language-learning"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Language Learning
                  </a>
                </li>
                <li>
                  <a
                    href="/use-cases/technical-interview-prep"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Technical Interview Prep
                  </a>
                </li>
                <li>
                  <a
                    href="/use-cases/curriculum-design"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Curriculum Design
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
                Industries
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <a
                    href="/industries/healthcare"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Healthcare
                  </a>
                </li>
                <li>
                  <a
                    href="/industries/technology"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Technology
                  </a>
                </li>
                <li>
                  <a
                    href="/industries/legal"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Legal
                  </a>
                </li>
                <li>
                  <a
                    href="/industries/higher-education"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Higher Education
                  </a>
                </li>
                <li>
                  <a
                    href="/industries/finance"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Finance
                  </a>
                </li>
                <li>
                  <a
                    href="/industries/creative-arts"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Creative Arts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <a
                    href="/blog"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/resources"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Guides & Templates
                  </a>
                </li>
                <li>
                  <a
                    href="/personas/graduate-students"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    For Graduate Students
                  </a>
                </li>
                <li>
                  <a
                    href="/personas/working-professionals"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    For Professionals
                  </a>
                </li>
                <li>
                  <a
                    href="/personas/educators"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    For Educators
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} Core Model. Evidence-based
            adaptive learning.
          </div>
        </div>
      </footer>
    </div>
  );
}
