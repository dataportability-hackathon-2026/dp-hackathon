import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageTemplate } from "@/components/marketing/landing-page-template";
import { personaPages } from "@/lib/content/personas";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return personaPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = personaPages.find((p) => p.slug === slug);
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

export default async function PersonaPage({ params }: Props) {
  const { slug } = await params;
  const page = personaPages.find((p) => p.slug === slug);
  if (!page) return notFound();
  return <LandingPageTemplate page={page} breadcrumbCategory="Personas" />;
}
