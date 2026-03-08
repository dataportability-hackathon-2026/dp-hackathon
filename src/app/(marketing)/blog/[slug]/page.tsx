import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/content/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let _inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc pl-6 space-y-1 text-neutral-700 dark:text-neutral-300"
        >
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
      _inList = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={elements.length}
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-10 mb-4"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={elements.length}
          className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-8 mb-3"
        >
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("- **") || line.startsWith("- ")) {
      _inList = true;
      const text = line.slice(2);
      listItems.push(text);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      const formatted = line
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
      elements.push(
        <p
          key={elements.length}
          className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />,
      );
    }
  }
  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge>{post.category}</Badge>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {post.readingTime} min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {post.author}
            </span>
            <span>&middot;</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose-equivalent">{renderMarkdown(post.content)}</div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-center">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Put Learning Science Into Practice
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Core Model applies these research-backed principles automatically.
            Upload your materials and start learning smarter.
          </p>
          <a href="/dashboard">
            <Button size="lg">
              Try Core Model Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          {prevPost ? (
            <a
              href={`/blog/${prevPost.slug}`}
              className="group flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="line-clamp-1 max-w-[200px]">
                {prevPost.title}
              </span>
            </a>
          ) : (
            <div />
          )}
          {nextPost ? (
            <a
              href={`/blog/${nextPost.slug}`}
              className="group flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <span className="line-clamp-1 max-w-[200px]">
                {nextPost.title}
              </span>
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <div />
          )}
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}
