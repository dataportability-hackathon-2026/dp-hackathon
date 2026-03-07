export type LandingPage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  painPoints: { title: string; description: string }[];
  features: { title: string; description: string; icon: string }[];
  benefits: { metric: string; label: string; description: string }[];
  testimonial?: {
    quote: string;
    name: string;
    role: string;
    institution: string;
  };
  faq: { question: string; answer: string }[];
  finalCta: {
    headline: string;
    subheadline: string;
    buttonText: string;
    href: string;
  };
};

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTime: number;
  category: string;
  tags: string[];
  excerpt: string;
  heroImage?: string;
  content: string;
};

export type Resource = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  type: "guide" | "whitepaper" | "checklist" | "template" | "research";
  category: string;
  description: string;
  longDescription: string;
  pages: number;
  downloadCta: string;
  topics: string[];
  content: string;
};
