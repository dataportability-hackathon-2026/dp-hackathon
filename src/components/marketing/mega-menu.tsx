"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Code2,
  FileText,
  FlaskConical,
  Gavel,
  GraduationCap,
  Heart,
  Languages,
  Menu,
  Microscope,
  Monitor,
  Palette,
  PenTool,
  RefreshCw,
  Scale,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import {
  blogPosts,
  industryPages,
  personaPages,
  resources,
  useCasePages,
} from "@/lib/content";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/white-label";

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  healthcare: Stethoscope,
  technology: Code2,
  legal: Scale,
  "higher-education": GraduationCap,
  finance: TrendingUp,
  "creative-arts": Palette,
};

const USE_CASE_ICONS: Record<string, LucideIcon> = {
  "exam-preparation": ClipboardCheck,
  "professional-development": Briefcase,
  "research-literature-review": BookOpen,
  "language-learning": Languages,
  "technical-interview-prep": Monitor,
  "curriculum-design": PenTool,
};

const PERSONA_ICONS: Record<string, LucideIcon> = {
  "graduate-students": GraduationCap,
  "working-professionals": Briefcase,
  educators: Users,
  "pre-med-students": Heart,
  "law-students": Gavel,
  "career-changers": RefreshCw,
};

const RESOURCE_TYPE_ICONS: Record<string, LucideIcon> = {
  guide: BookOpen,
  whitepaper: FileText,
  checklist: CheckSquare,
  template: ClipboardList,
  research: FlaskConical,
};

type MegaMenuProps = {
  landingAnchors?: boolean;
};

function MegaMenuLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <NavigationMenuLink
      render={<Link href={href} />}
      className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </NavigationMenuLink>
  );
}

function DesktopNav({ landingAnchors }: MegaMenuProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Solutions: Use Cases + Industries */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-sm text-muted-foreground hover:text-foreground data-popup-open:text-foreground">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[680px] grid-cols-2 gap-0">
              <div>
                <div className="px-3 pb-1 pt-1">
                  <Link
                    href="/use-cases"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use Cases
                  </Link>
                </div>
                {useCasePages.map((page) => {
                  const Icon = USE_CASE_ICONS[page.slug] ?? ClipboardCheck;
                  return (
                    <MegaMenuLink
                      key={page.slug}
                      href={`/use-cases/${page.slug}`}
                      icon={Icon}
                      title={page.title}
                      description={page.metaDescription}
                    />
                  );
                })}
              </div>
              <div className="border-l border-border/50">
                <div className="px-3 pb-1 pt-1">
                  <Link
                    href="/industries"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Industries
                  </Link>
                </div>
                {industryPages.map((page) => {
                  const Icon = INDUSTRY_ICONS[page.slug] ?? Microscope;
                  return (
                    <MegaMenuLink
                      key={page.slug}
                      href={`/industries/${page.slug}`}
                      icon={Icon}
                      title={page.title}
                      description={page.metaDescription}
                    />
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Who It's For: Personas */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-sm text-muted-foreground hover:text-foreground data-popup-open:text-foreground">
            Who It&apos;s For
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[440px] grid-cols-1 gap-0">
              <div className="px-3 pb-1 pt-1">
                <Link
                  href="/personas"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Personas
                </Link>
              </div>
              {personaPages.map((page) => {
                const Icon = PERSONA_ICONS[page.slug] ?? UserCheck;
                return (
                  <MegaMenuLink
                    key={page.slug}
                    href={`/personas/${page.slug}`}
                    icon={Icon}
                    title={page.title}
                    description={page.metaDescription}
                  />
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Learn: Blog + Resources */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-sm text-muted-foreground hover:text-foreground data-popup-open:text-foreground">
            Learn
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] grid-cols-[1fr_240px] gap-0">
              <div>
                <div className="flex items-center justify-between px-3 pb-1 pt-1">
                  <Link
                    href="/blog"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/blog"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {blogPosts.slice(0, 4).map((post) => (
                  <NavigationMenuLink
                    key={post.slug}
                    render={<Link href={`/blog/${post.slug}`} />}
                    className="flex flex-col gap-0.5 rounded-xl p-3 hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium leading-tight">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.readingTime} min read
                    </p>
                  </NavigationMenuLink>
                ))}
              </div>
              <div className="border-l border-border/50">
                <div className="flex items-center justify-between px-3 pb-1 pt-1">
                  <Link
                    href="/resources"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Resources
                  </Link>
                </div>
                {resources.slice(0, 5).map((resource) => {
                  const Icon = RESOURCE_TYPE_ICONS[resource.type] ?? FileText;
                  return (
                    <NavigationMenuLink
                      key={resource.slug}
                      render={<Link href={`/resources/${resource.slug}`} />}
                      className="flex items-center gap-2 rounded-xl p-3 hover:bg-muted transition-colors"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm font-medium leading-tight line-clamp-1">
                        {resource.title}
                      </p>
                    </NavigationMenuLink>
                  );
                })}
                <div className="px-3 pb-1">
                  <Link
                    href="/resources"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Landing page anchor links */}
        {landingAnchors && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<a href="#features" />}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-2xl bg-transparent px-4.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                )}
              >
                Features
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<a href="#pricing" />}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-2xl bg-transparent px-4.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                )}
              >
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

type MobileSection = "solutions" | "personas" | "learn" | null;

function MobileNav({
  landingAnchors,
  onClose,
  isSignedIn,
}: MegaMenuProps & { onClose: () => void; isSignedIn: boolean }) {
  const [openSection, setOpenSection] = useState<MobileSection>(null);
  const sectionId = useId();

  function toggle(section: MobileSection) {
    setOpenSection((prev) => (prev === section ? null : section));
  }

  return (
    <div className="space-y-1 p-4">
      {/* Solutions */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
        onClick={() => toggle("solutions")}
        aria-expanded={openSection === "solutions"}
        aria-controls={`${sectionId}-solutions`}
      >
        Solutions
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            openSection === "solutions" && "rotate-180",
          )}
        />
      </button>
      {openSection === "solutions" && (
        <div id={`${sectionId}-solutions`} className="space-y-1 pl-3">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Use Cases
          </p>
          {useCasePages.map((page) => (
            <Link
              key={page.slug}
              href={`/use-cases/${page.slug}`}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={onClose}
            >
              {page.title}
            </Link>
          ))}
          <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Industries
          </p>
          {industryPages.map((page) => (
            <Link
              key={page.slug}
              href={`/industries/${page.slug}`}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={onClose}
            >
              {page.title}
            </Link>
          ))}
        </div>
      )}

      {/* Who It's For */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
        onClick={() => toggle("personas")}
        aria-expanded={openSection === "personas"}
        aria-controls={`${sectionId}-personas`}
      >
        Who It&apos;s For
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            openSection === "personas" && "rotate-180",
          )}
        />
      </button>
      {openSection === "personas" && (
        <div id={`${sectionId}-personas`} className="space-y-1 pl-3">
          {personaPages.map((page) => (
            <Link
              key={page.slug}
              href={`/personas/${page.slug}`}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={onClose}
            >
              {page.title}
            </Link>
          ))}
        </div>
      )}

      {/* Learn */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
        onClick={() => toggle("learn")}
        aria-expanded={openSection === "learn"}
        aria-controls={`${sectionId}-learn`}
      >
        Learn
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            openSection === "learn" && "rotate-180",
          )}
        />
      </button>
      {openSection === "learn" && (
        <div id={`${sectionId}-learn`} className="space-y-1 pl-3">
          <Link
            href="/blog"
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            onClick={onClose}
          >
            Blog
          </Link>
          <Link
            href="/resources"
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            onClick={onClose}
          >
            Resources
          </Link>
        </div>
      )}

      {/* Landing anchors on mobile */}
      {landingAnchors && (
        <>
          <a
            href="#features"
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
            onClick={onClose}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
            onClick={onClose}
          >
            Pricing
          </a>
        </>
      )}

      <div className="space-y-2 pt-3">
        {!isSignedIn && (
          <Link href="/dashboard" className="block" onClick={onClose}>
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </Link>
        )}
        <Link href="/dashboard" className="block" onClick={onClose}>
          <Button className="w-full">
            {isSignedIn ? "Dashboard" : "Get Started"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function MegaMenu({ landingAnchors = false }: MegaMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-[100] border-b border-border/50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <DesktopNav landingAnchors={landingAnchors} />

        <div className="hidden items-center gap-3 md:flex">
          {!isSignedIn && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button size="sm">
              {isSignedIn ? "Dashboard" : "Get Started"}
              {!isSignedIn && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
            </Button>
          </Link>
        </div>

        <button
          className="p-2 text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <MobileNav
            landingAnchors={landingAnchors}
            onClose={() => setMobileOpen(false)}
            isSignedIn={isSignedIn}
          />
        </div>
      )}
    </header>
  );
}
