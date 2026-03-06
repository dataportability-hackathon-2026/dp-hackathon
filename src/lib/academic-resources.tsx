import type { ComponentType, SVGProps } from "react"
import { SiArxiv } from "react-icons/si"
import { BookOpen, Database, GraduationCap, Library, FlaskConical } from "lucide-react"

type IconProps = SVGProps<SVGSVGElement> & { className?: string; size?: number }

// Custom SVG logo components for services without react-icons entries

function SemanticScholarLogo({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-2.09c-1.35-.28-2.51-1.01-3.28-2.01l1.55-1.3c.53.71 1.32 1.19 2.23 1.35V10.7c-2.19-.54-3.5-1.67-3.5-3.45C8 5.54 9.46 4.18 11 3.97V3h2v.97c1.12.17 2.09.72 2.81 1.53l-1.47 1.38c-.42-.43-1-.73-1.34-.84v2.76c2.29.58 3.5 1.73 3.5 3.5 0 1.93-1.46 3.28-3.5 3.53V17h-2zm0-11.56c-.76.17-1.25.7-1.25 1.36 0 .63.42 1.12 1.25 1.4V5.94zm2 9.81c.82-.17 1.25-.73 1.25-1.45 0-.65-.42-1.17-1.25-1.5v2.95z" />
    </svg>
  )
}

function CoreLogo({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 2a6 6 0 100 12 6 6 0 000-12zm0 2a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  )
}

function OpenEdxLogo({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MitOcwLogo({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M2 4h4v16H2V4zm8 0h4v16h-4V4zm8 0h4v16h-4V4z" />
    </svg>
  )
}

function OpenLibraryLogo({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M4 2h2v20H4V2zm4 2h2v16H8V4zm4-2h2v20h-2V2zm4 2h2v16h-2V4zm4-2h2v20h-2V2z" />
    </svg>
  )
}

export type AcademicResource = {
  id: string
  name: string
  shortName: string
  description: string
  icon: ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  url: string
  category: "content" | "research" | "courses"
}

export const ACADEMIC_RESOURCES: AcademicResource[] = [
  {
    id: "semantic-scholar",
    name: "Semantic Scholar",
    shortName: "Semantic Scholar",
    description: "200M+ research papers with citation graphs across all disciplines",
    icon: SemanticScholarLogo,
    color: "text-[#1857B6] dark:text-[#6BA3F5]",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    url: "https://www.semanticscholar.org",
    category: "research",
  },
  {
    id: "arxiv",
    name: "arXiv",
    shortName: "arXiv",
    description: "Cutting-edge STEM preprints and research papers",
    icon: SiArxiv,
    color: "text-[#B31B1B] dark:text-[#E85454]",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    url: "https://arxiv.org",
    category: "research",
  },
  {
    id: "open-library",
    name: "Open Library",
    shortName: "Open Library",
    description: "Book lookup by ISBN and topic for course-based reading lists",
    icon: OpenLibraryLogo,
    color: "text-[#0B7A3E] dark:text-[#3EC77B]",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    url: "https://openlibrary.org",
    category: "content",
  },
  {
    id: "core",
    name: "CORE",
    shortName: "CORE",
    description: "Full-text access to open access papers from thousands of repositories",
    icon: CoreLogo,
    color: "text-[#6B21A8] dark:text-[#C084FC]",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    url: "https://core.ac.uk",
    category: "research",
  },
  {
    id: "open-edx",
    name: "Open edX",
    shortName: "edX",
    description: "Structured course catalogs and real syllabi from top universities",
    icon: OpenEdxLogo,
    color: "text-[#02262B] dark:text-[#00C2FF]",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    url: "https://www.edx.org",
    category: "courses",
  },
  {
    id: "mit-ocw",
    name: "MIT OpenCourseWare",
    shortName: "MIT OCW",
    description: "2,500+ courses with syllabi, problem sets, and reading lists from MIT",
    icon: MitOcwLogo,
    color: "text-[#A31F34] dark:text-[#E8586E]",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    url: "https://ocw.mit.edu",
    category: "courses",
  },
]
