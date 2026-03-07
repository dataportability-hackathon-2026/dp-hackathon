import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resources } from "@/lib/content/resources";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) return {};
  return {
    title: resource.metaTitle,
    description: resource.metaDescription,
    keywords: resource.keywords,
    openGraph: {
      title: resource.metaTitle,
      description: resource.metaDescription,
      type: "website",
    },
  };
}

const typeLabels: Record<string, string> = {
  guide: "Guide",
  whitepaper: "Whitepaper",
  checklist: "Checklist",
  template: "Template",
  research: "Research Summary",
};

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) return notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        {/* Breadcrumbs */}
        <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          <a
            href="/"
            className="hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <a
            href="/resources"
            className="hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Resources
          </a>
          <span className="mx-2">/</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {resource.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Badge variant="outline" className="mb-4">
              {typeLabels[resource.type]}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-4">
              {resource.title}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
              {resource.longDescription}
            </p>

            {/* What's Inside */}
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              What&apos;s Inside
            </h2>
            <div className="space-y-3 mb-8">
              {resource.topics.map((topic) => (
                <div key={topic} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {topic}
                  </span>
                </div>
              ))}
            </div>

            {/* Preview */}
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Preview
            </h2>
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-6 md:p-8 border border-neutral-200 dark:border-neutral-800 mb-8">
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed max-h-96 overflow-y-auto">
                {resource.content.slice(0, 1500)}...
              </pre>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {resource.title}
                  </h3>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {resource.pages} pages &middot; PDF &middot; Free download
                  </div>
                  <a
                    href={`/api/resources/pdf?slug=${resource.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full mb-4" size="lg">
                      <Download className="mr-2 h-5 w-5" />
                      {resource.downloadCta}
                    </Button>
                  </a>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    No email required. Instant download.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-8 p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Apply These Principles Automatically
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Core Model puts learning science into practice with adaptive
                  study plans, spaced repetition, and mastery tracking.
                </p>
                <a href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Try Core Model Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
