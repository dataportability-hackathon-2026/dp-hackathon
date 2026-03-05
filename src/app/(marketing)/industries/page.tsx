import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { industryPages } from "@/lib/content/industries"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { MarketingFooter } from "@/components/marketing/marketing-footer"

export const metadata: Metadata = {
  title: "Industries | Core Model - Adaptive Learning by Industry",
  description: "See how Core Model serves healthcare, technology, legal, higher education, finance, and creative arts professionals with industry-specific adaptive learning.",
  keywords: ["adaptive learning industries", "healthcare education", "legal learning", "tech training", "finance certification"],
}

export default function IndustriesIndex() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <Badge variant="outline" className="mb-4">Industries</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Built for How Your Industry Learns
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-16">
          Every field has unique learning demands. Core Model adapts to the specific knowledge structures, compliance requirements, and professional standards of your industry.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryPages.map((page) => (
            <a key={page.slug} href={`/industries/${page.slug}`}>
              <Card className="h-full hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {page.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                    {page.metaDescription}
                  </p>
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center gap-1">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Your Industry Not Listed?</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">Core Model works for any knowledge-intensive field. Try it free and see the difference.</p>
        <a href="/dashboard">
          <Button size="lg">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button>
        </a>
      </section>
      <MarketingFooter />
    </div>
  )
}
