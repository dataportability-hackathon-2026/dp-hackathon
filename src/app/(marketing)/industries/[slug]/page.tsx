import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { industryPages } from "@/lib/content/industries"
import { LandingPageTemplate } from "@/components/marketing/landing-page-template"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return industryPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = industryPages.find((p) => p.slug === slug)
  if (!page) return {}
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
    },
  }
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params
  const page = industryPages.find((p) => p.slug === slug)
  if (!page) return notFound()
  return <LandingPageTemplate page={page} breadcrumbCategory="Industries" />
}
