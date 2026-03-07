import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageTemplate } from "@/components/marketing/landing-page-template";
import { useCasePages } from "@/lib/content/use-cases";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return useCasePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = useCasePages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const page = useCasePages.find((p) => p.slug === slug);
  if (!page) return notFound();
  return <LandingPageTemplate page={page} breadcrumbCategory="Use Cases" />;
}
