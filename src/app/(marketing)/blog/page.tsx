import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/lib/content/blog-posts";

export const metadata: Metadata = {
  title: "Blog | Core Model - Learning Science & Adaptive Education",
  description:
    "Evidence-based insights on spaced repetition, retrieval practice, metacognition, and adaptive learning. Research-backed articles for students, educators, and lifelong learners.",
  keywords: [
    "learning science blog",
    "study tips",
    "spaced repetition",
    "adaptive learning",
    "education research",
  ],
};

export default function BlogIndex() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <Badge variant="outline" className="mb-4">
          Blog
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          The Science of Learning, Made Practical
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-16">
          Research-backed insights on how to study effectively, build lasting
          knowledge, and become a better learner. No fluff, just evidence.
        </p>

        {/* Featured Post */}
        <a href={`/blog/${featured.slug}`} className="block mb-12">
          <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <Badge>{featured.category}</Badge>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {featured.readingTime} min read
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {featured.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 max-w-3xl">
                {featured.excerpt}
              </p>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center gap-1">
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </a>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readingTime} min
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{post.author}</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
      <section className="py-16 text-center bg-neutral-50 dark:bg-neutral-900/50">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Ready to Apply These Principles?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Core Model puts learning science into practice with adaptive study
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
