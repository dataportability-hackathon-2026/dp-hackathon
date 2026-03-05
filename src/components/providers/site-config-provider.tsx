"use client"

import { createContext, useContext } from "react"
import { siteConfig, type SiteConfig } from "@/lib/white-label"

const SiteConfigContext = createContext<SiteConfig>(siteConfig)

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

/**
 * Injects white-label theme overrides as inline CSS custom properties.
 * Wrap this around your app (inside ThemeProvider) so that any preset's
 * `theme.light` / `theme.dark` values override globals.css defaults.
 */
export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const lightVars = siteConfig.theme.light ?? {}
  const darkVars = siteConfig.theme.dark ?? {}

  const lightCss = Object.entries(lightVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")
  const darkCss = Object.entries(darkVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

  const styleTag =
    lightCss || darkCss
      ? `${lightCss ? `:root { ${lightCss} }` : ""}${darkCss ? ` .dark { ${darkCss} }` : ""}`
      : null

  return (
    <SiteConfigContext.Provider value={siteConfig}>
      {styleTag && <style dangerouslySetInnerHTML={{ __html: styleTag }} />}
      {children}
    </SiteConfigContext.Provider>
  )
}
