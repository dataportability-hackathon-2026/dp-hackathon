# dp-hackathon

Next.js 16 adaptive learning platform with AI chat, artifact generation, and learning profile DNA.

## Setup

```bash
bun install
cp .env.local.example .env.local  # then fill in your keys
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with:

```
OPENAI_API_KEY=
AI_GATEWAY_API_KEY=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Scripts

```
bun dev          # dev server
bun run build    # production build
bun start        # production server
bun run lint     # lint (biome)
bun run format   # format (biome)
bun run eval     # run AI evals once
bun run eval:watch  # evals in watch mode (UI at localhost:3006)
```

## Project Structure

```
src/
  app/
    (marketing)/          # SEO landing pages (industries, personas, use-cases, blog, resources)
    dashboard/            # Main learning dashboard with topic/project drill-down
    single-page/          # Single-page app view
    api/                  # API routes (chat, auth, billing, feedback, livekit, etc.)
  components/
    artifacts/            # Artifact canvas (quiz, flashcards, mindmap, slides, spatial 3D, etc.)
    marketing/            # Landing page templates, nav, footer, mega menu
    billing/              # Stripe billing + usage dialogs
    agents-ui/            # Audio visualizers for voice agent
  lib/
    ai/                   # AI generation (profiles, guides, artifacts), tools, schemas
    content/              # Marketing content data (industries, personas, use-cases, blog, resources)
    topics.ts             # Topic/project mock data
    white-label.ts        # White-label site config
  db/                     # Drizzle schema + DB connection
evals/                    # Evalite test suites
docs/                     # Architecture docs, billing, evals guide
```

## Extending the App

### Add a new AI artifact type

1. Add the Zod schema to `src/lib/ai/schemas.ts`
2. Add the generator function in `src/lib/ai/generate-artifact.ts`
3. Add a tool definition in `src/lib/ai/artifact-tools.ts`
4. Add a renderer card in `src/components/artifacts/artifact-canvas.tsx`
5. Add an eval in `evals/artifact-{name}.eval.ts`

### Add a new API route

Create a file at `src/app/api/{name}/route.ts`. Use the existing routes (e.g. `api/chat/route.ts`, `api/feedback/route.ts`) as templates.

### Add a new dashboard page

Add a folder under `src/app/dashboard/`. The existing pattern is `[topicSlug]/[projectSlug]/page.tsx` for nested routes.

## Adding Evals

Evals use [Evalite](https://evalite.dev) and live in the `evals/` directory. See `docs/evals.md` for full details.

Quick version:

1. Create `evals/my-feature.eval.ts`
2. Define test data, a task function, and scorers
3. Run `bun run eval`

```typescript
import { evalite } from "evalite"

evalite("My Feature", {
  data: () => [
    { input: { /* test input */ }, expected: undefined },
  ],
  task: async (input) => {
    return myGenerationFunction(input)
  },
  scorers: [
    {
      name: "My Check",
      description: "What it validates",
      scorer: ({ output }) => output.someField ? 1 : 0,
    },
  ],
})
```

Existing evals cover: profiles, guides, quizzes, flashcards, mindmaps, slides, spatial 3D, and academic tools.

## Adding Source Materials / Content

### Marketing pages (industries, personas, use-cases, blog, resources)

All marketing content lives in `src/lib/content/`. Each file exports an array of typed objects:

- `industries.ts` - Industry landing pages (`LandingPage` type)
- `personas.ts` - Persona landing pages (`LandingPage` type)
- `use-cases.ts` - Use-case landing pages (`LandingPage` type)
- `blog-posts.ts` - Blog posts (`BlogPost` type)
- `resources.ts` - Downloadable resources (`Resource` type)

To add a new page, add an object to the relevant array. The types are in `src/lib/content/types.ts`. Routes are auto-generated from slugs via `src/app/(marketing)/`.

### Topics and learning content

Edit `src/lib/topics.ts` to add topics, projects, guide blocks, and chat history. The dashboard reads from this file.

## Drag and Drop / Artifact Canvas

The artifact canvas (`src/components/artifacts/artifact-canvas.tsx`) uses:

- **@xyflow/react** for the mind map node graph (drag, pan, zoom)
- **@react-three/fiber + drei** for 3D spatial artifacts
- **@tanstack/react-table** for data table artifacts

These are rendered conditionally based on artifact type. The canvas is driven by the `artifact-store.ts` Zustand-style store.

## Caveats for Beginners

- **This is a hackathon project.** Expect rough edges, hardcoded data, and placeholder content.
- **Mock data everywhere.** Topics, projects, and guide blocks in `src/lib/topics.ts` are mock data, not from a real database yet.
- **AI calls cost money.** Running evals or using the chat hits the OpenAI API. Set spending limits on your API key.
- **Local SQLite by default.** `DATABASE_URL=file:local.db` creates a local file. No external DB needed for dev.
- **Stripe is in test mode.** The placeholder keys won't process real payments. Replace with your own test keys from the Stripe dashboard.
- **LiveKit requires a cloud account.** Voice agent features need a LiveKit Cloud project at livekit.io.
- **No seed script yet.** The DB starts empty. Auth creates users on first sign-up.
- **White-label config** is in `src/lib/white-label.ts`. Changing it affects branding across the whole app.
- **Marketing pages are static TS arrays**, not a CMS. To edit content, you edit code.
- **The `(marketing)` route group** uses a separate layout from the dashboard. Don't mix them up.
- **Biome, not ESLint.** Run `bun run lint` and `bun run format`. Config is in `biome.json`.
