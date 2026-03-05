"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/use-cases", label: "Use Cases" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
]

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Core Model
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard">
            <Button size="sm">Get Started</Button>
          </a>
          <button
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-4 space-y-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="block text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
