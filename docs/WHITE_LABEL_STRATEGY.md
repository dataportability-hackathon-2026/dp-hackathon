# White-Label Strategy: Consumer & Higher Education

## Overview

CoreModel's architecture is now white-label ready. A single environment variable
(`NEXT_PUBLIC_SITE_PRESET`) switches the entire app between brand identities,
with no code changes required per deployment.

---

## What's Already Done

### 1. Centralized Site Config (`src/lib/white-label.ts`)

All brand-specific values are extracted into a typed `SiteConfig` object:

| Category | What's configurable |
|---|---|
| **Identity** | App name, tagline, description, logo, support email, legal entity |
| **Auth copy** | Sign-in/sign-up headings, CTAs, email placeholder |
| **Feature flags** | Billing, integrations panel, voice agent, landing page, custom topics |
| **Theme** | CSS custom property overrides for light and dark modes |
| **Content** | Default topic groups, API/MCP base URLs |

### 2. Three Built-in Presets

| Preset | Env value | Target market |
|---|---|---|
| **CoreModel** | `coremodel` (default) | Current product -- full-featured |
| **StudyPal** | `consumer` | B2C self-learners (simplified, no MCP/API panel) |
| **Adaptive Campus** | `higher-ed` | Universities & colleges (no billing, SSO-first, admin-managed curriculum) |

Switch with:
```bash
NEXT_PUBLIC_SITE_PRESET=consumer    # or higher-ed, coremodel
```

### 3. Theme Override System (`SiteConfigProvider`)

Each preset can define CSS custom property overrides that are injected at runtime,
overriding `globals.css` defaults without touching the stylesheet. This means a
university can have their brand colors applied through config alone.

### 4. Components Updated

The following components now read from `siteConfig` instead of hardcoded strings:

- `layout.tsx` -- page title and meta description
- `auth-gate.tsx` -- sign-in/sign-up copy and email placeholders
- `landing-page.tsx` -- navbar brand, hero description, footer
- `single-page-app.tsx` -- header brand, MCP/API URLs, export templates
- `topic-navigation-grid.tsx` -- header brand

---

## Easy Next Steps (Low Effort, High Impact)

### A. Custom Landing Pages per Preset

The `features.landingPage` flag already exists. For higher-ed, set it to `false`
and redirect `/` straight to the SSO/auth flow. For consumer, swap the personas
and case studies in the landing page data to match a B2C audience.

### B. Logo Support

`siteConfig.logoPath` is ready to use. Drop a logo in `/public/logos/` and point
the config at it. Components currently show a Lucide icon fallback -- add an
`<Image>` conditional in the header components:

```tsx
{siteConfig.logoPath
  ? <Image src={siteConfig.logoPath} alt={siteConfig.name} width={32} height={32} />
  : <Brain className="size-5" />}
```

### C. Feature-Gated UI Sections

The `features` object in the config can gate entire UI sections:

```tsx
{siteConfig.features.billing && <CreditPacksPanel />}
{siteConfig.features.integrations && <ConnectDialog />}
```

This is partially wired up -- the flags exist, and adding the conditionals to the
relevant components is straightforward.

### D. Per-Institution Config (Higher Ed)

For multi-tenant higher-ed deployments, extend the config system:

1. **Subdomain routing** -- `stanford.adaptivecampus.edu` resolves a config at runtime
2. **Institution table** in the database with name, logo, theme colors, SSO config
3. **Middleware** (`src/middleware.ts`) reads the subdomain and injects the config

This can be done incrementally -- start with the env var, graduate to DB-driven.

### E. LTI Integration (Higher Ed)

Add an LTI 1.3 launch endpoint that:
1. Authenticates via the institution's LMS (Canvas, Blackboard, Moodle)
2. Creates/links user accounts automatically
3. Passes course context to pre-filter topics

### F. Consumer Simplifications

The consumer preset should:
1. Hide the "uncertainty" and "audit trail" language (too academic)
2. Replace "mastery" with friendlier terms ("progress", "confidence")
3. Simplify the pricing page (single plan vs credit packs)
4. Add social sign-in (Google, Apple)

---

## Architecture Diagram

```
                    NEXT_PUBLIC_SITE_PRESET
                            |
                    +-------+-------+
                    |               |
               white-label.ts   globals.css
               (config + presets)  (base theme)
                    |               |
            SiteConfigProvider -----+
            (injects CSS overrides)
                    |
        +-----------+-----------+
        |           |           |
    layout.tsx  auth-gate  landing-page
    (metadata)  (copy)     (brand, hero)
        |
    single-page-app / topic-nav
    (header brand, URLs)
```

## Files Changed

| File | Change |
|---|---|
| `src/lib/white-label.ts` | **New** -- config types, 3 presets, active config resolver |
| `src/components/providers/site-config-provider.tsx` | **New** -- React context + CSS var injection |
| `src/app/layout.tsx` | Uses `siteConfig` for metadata; wraps app in `SiteConfigProvider` |
| `src/components/auth-gate.tsx` | Uses `siteConfig` for auth copy |
| `src/components/landing-page.tsx` | Uses `siteConfig` for brand name, tagline, description, footer |
| `src/components/single-page-app.tsx` | Uses `siteConfig` for brand name, API/MCP URLs |
| `src/components/topic-navigation-grid.tsx` | Uses `siteConfig` for brand name |
