import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
} from "lucide-react";
import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resources } from "@/lib/content/resources";

export const metadata: Metadata = {
  title: "Resources | Core Model - Free Guides, Templates & Research",
  description:
    "Free downloadable guides, templates, checklists, and research summaries on learning science, study techniques, and adaptive education. Evidence-based resources for learners and educators.",
  keywords: [
    "learning resources",
    "study guides",
    "study templates",
    "learning science research",
    "free education resources",
  ],
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  guide: BookOpen,
  whitepaper: FileText,
  checklist: CheckSquare,
  template: ClipboardList,
  research: FlaskConical,
};

const typeLabels: Record<string, string> = {
  guide: "Guide",
  whitepaper: "Whitepaper",
  checklist: "Checklist",
  template: "Template",
  research: "Research",
};

export default function ResourcesIndex() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <Badge variant="outline" className="mb-4">
          Resources
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Free Guides, Templates & Research
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-16">
          Evidence-based resources to help you study smarter. Download our
          guides, templates, and research summaries — all backed by cognitive
          science.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource) => {
            const TypeIcon = typeIcons[resource.type] || FileText;
            return (
              <a key={resource.slug} href={`/resources/${resource.slug}`}>
                <Card className="h-full hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <TypeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[resource.type]}
                          </Badge>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {resource.pages} pages
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-3">
                          {resource.description}
                        </p>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center gap-1">
                          <Download className="h-4 w-4" />{" "}
                          {resource.downloadCta}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </section>
      <section className="py-16 text-center bg-neutral-50 dark:bg-neutral-900/50">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Ready to Go Beyond Reading?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Core Model applies these principles automatically with adaptive study
          plans and mastery tracking.
        </p>
        <a href="/dashboard">
          <Button size="lg">
            Try Core Model Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </a>
      </section>
      <MarketingFooter />
    </div>
  );
}
