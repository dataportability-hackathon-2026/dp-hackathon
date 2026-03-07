import type { ComponentType } from "react"

// Helper to create img-based logo components from public SVG files
function createLogoComponent(src: string, alt: string) {
  function LogoImg({ className }: { className?: string }) {
    return <img src={src} alt={alt} className={`${className ?? ""} object-contain`} />
  }
  LogoImg.displayName = `${alt}Logo`
  return LogoImg
}

// Official logos (SVG files in /public/logos/)
const UTAustinLogo = createLogoComponent("/logos/ut-austin.svg", "UT Austin")
const HarvardLogo = createLogoComponent("/logos/harvard.svg", "Harvard")
const YaleLogo = createLogoComponent("/logos/yale.svg", "Yale")
const StanfordLogo = createLogoComponent("/logos/stanford.svg", "Stanford")
const ColumbiaLogo = createLogoComponent("/logos/columbia.svg", "Columbia")
const PennLogo = createLogoComponent("/logos/upenn.svg", "Penn")
const PrincetonLogo = createLogoComponent("/logos/princeton.svg", "Princeton")
const CornellLogo = createLogoComponent("/logos/cornell.svg", "Cornell")
const SemanticScholarLogo = createLogoComponent("/logos/semantic-scholar.svg", "Semantic Scholar")
const ArxivLogo = createLogoComponent("/logos/arxiv.svg", "arXiv")
const OpenLibraryLogo = createLogoComponent("/logos/open-library.svg", "Open Library")
const CoreLogo = createLogoComponent("/logos/core.svg", "CORE")
const OpenEdxLogo = createLogoComponent("/logos/edx.svg", "edX")
const MitOcwLogo = createLogoComponent("/logos/mit.svg", "MIT OCW")

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
    id: "ut-austin-law",
    name: "UT Austin Tarlton Law Library",
    shortName: "Tarlton Law",
    description: "Comprehensive legal research guides and open resources from UT Austin",
    icon: UTAustinLogo,
    color: "text-[#BF5700] dark:text-[#E8852F]",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    url: "https://tarltonguides.law.utexas.edu",
    category: "content",
  },
  {
    id: "harvard",
    name: "Harvard Online Learning",
    shortName: "Harvard",
    description: "Free online courses and learning resources from Harvard University",
    icon: HarvardLogo,
    color: "text-[#A51C30] dark:text-[#E85468]",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    url: "https://pll.harvard.edu/catalog/free",
    category: "courses",
  },
  {
    id: "yale",
    name: "Yale Open Courses",
    shortName: "Yale OYC",
    description: "Free open courses and lectures from Yale University",
    icon: YaleLogo,
    color: "text-[#00356B] dark:text-[#4A8FD4]",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    url: "https://oyc.yale.edu",
    category: "courses",
  },
  {
    id: "stanford",
    name: "Stanford Online",
    shortName: "Stanford",
    description: "Free courses and educational content from Stanford University",
    icon: StanfordLogo,
    color: "text-[#8C1515] dark:text-[#D45454]",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    url: "https://online.stanford.edu/free-courses",
    category: "courses",
  },
  {
    id: "columbia",
    name: "Columbia University (edX)",
    shortName: "Columbia",
    description: "Open courses from Columbia University on edX",
    icon: ColumbiaLogo,
    color: "text-[#003DA5] dark:text-[#5A8FE8]",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    url: "https://www.edx.org/school/columbiax",
    category: "courses",
  },
  {
    id: "upenn",
    name: "Penn / Wharton (Coursera)",
    shortName: "Penn",
    description: "Courses from the University of Pennsylvania and Wharton School on Coursera",
    icon: PennLogo,
    color: "text-[#011F5B] dark:text-[#4A6FA5]",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    url: "https://www.coursera.org/penn",
    category: "courses",
  },
  {
    id: "princeton",
    name: "Princeton (Coursera)",
    shortName: "Princeton",
    description: "Courses from Princeton University on Coursera",
    icon: PrincetonLogo,
    color: "text-[#E77500] dark:text-[#F5A030]",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    url: "https://www.coursera.org/princeton",
    category: "courses",
  },
  {
    id: "cornell",
    name: "Cornell (edX)",
    shortName: "Cornell",
    description: "Open courses from Cornell University on edX",
    icon: CornellLogo,
    color: "text-[#B31B1B] dark:text-[#E85454]",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    url: "https://www.edx.org/school/cornellx",
    category: "courses",
  },
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
    icon: ArxivLogo,
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
