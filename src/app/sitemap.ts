import type { MetadataRoute } from "next"
import { useCasePages } from "@/lib/content/use-cases"
import { industryPages } from "@/lib/content/industries"
import { personaPages } from "@/lib/content/personas"
import { blogPosts } from "@/lib/content/blog-posts"
import { resources } from "@/lib/content/resources"

const BASE_URL = "https://coremodel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/use-cases`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/industries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/personas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ]

  const useCases: MetadataRoute.Sitemap = useCasePages.map((page) => ({
    url: `${BASE_URL}/use-cases/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const industries: MetadataRoute.Sitemap = industryPages.map((page) => ({
    url: `${BASE_URL}/industries/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const personas: MetadataRoute.Sitemap = personaPages.map((page) => ({
    url: `${BASE_URL}/personas/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const blog: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const resourcePages: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${BASE_URL}/resources/${resource.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...useCases, ...industries, ...personas, ...blog, ...resourcePages]
}
