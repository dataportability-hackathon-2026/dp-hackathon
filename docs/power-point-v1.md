# CoreModel — Architecture Overview (Slide Deck Draft v1)

## Slide 1: Architecture Overview

**CoreModel** — An evidence-based adaptive learning platform that builds a cognitive "fingerprint" for each learner and personalizes everything from content to coaching tone.

```
User → Assessment (12 screens) → Learning DNA Fingerprint
         ↓                              ↓
    Voice Agent (LiveKit)         AI Content Engine
         ↓                              ↓
    Unified Chat + Voice       12 Artifact Types + 7-Day Guides
         ↓                              ↓
    MCP Server (6 tools)        Evalite QA (30+ scorers)
```

---

## Slide 2: Learning Assessment

- **12-screen intake** measuring cognition, metacognition, motivation, calibration, study habits
- **11 validated frameworks**: CRT, MAI, SDT, LASSI, MSLQ, Dunlosky rankings, Cognitive Load Theory, Desirable Difficulties, Zimmerman SRL, plus anti-learning-styles guardrails (Pashler 2008)
- **AI fingerprint generation** via GPT-4o-mini with structured output (Zod schemas)
- **Output**: cognitive profile (reflectiveness, metacognitive awareness, calibration accuracy), coaching approach (tone, frequency, SDT focus), strengths/risks/strategies

---

## Slide 3: AI-Generated Guides & Materials

- **7-day adaptive study plans** with 4 block types: core practice (60-70%), metacog routines, skill builders, motivation support
- **12 artifact types**: Quiz, Flashcards, Mind Map, Slides, Spatial 3D, Audio (TTS), Manim Video, Remix, Worked Examples, Elaborative Interrogation, Prediction-Reflection, Interleaved Problem Sets
- **Profile-aware adaptation**: chunk size, difficulty, scaffolding fade level, coaching tone — all driven by the learner's fingerprint
- **Storage**: Vercel Blob (JSON/MP3/MP4) + PostgreSQL metadata

---

## Slide 4: AI Voice, Chat & MCP

- **Voice**: LiveKit WebRTC agent with OpenAI STT → LLM → TTS pipeline, 3 WebGL audio visualizers (bar, aura, wave)
- **Chat**: Streaming via Vercel AI SDK (`streamText`), 40+ tools available (profile, guide, artifact, state, schedule tools)
- **Unified conversation store**: merges voice transcripts + text chat into one timeline, debounce-flushed to DB
- **MCP Server**: standalone stdio server exposing 6 learning tools (quiz, flashcards, mind map, slides, spatial, guide) via Model Context Protocol
- **Profile injection**: every AI call receives the learner's fingerprint as context

---

## Slide 5: Evals & Progress Tracking

- **Evalite framework** with 7 test suites and 30+ custom scorers across profile, guide, quiz, flashcards, mindmap, slides, spatial artifacts
- **5 real-time assessment tools**: calibration (Brier score), cognitive load risk, dropout risk (SDT), self-regulation (Zimmerman phases), full profile analysis
- **Mastery tracking**: Bayesian credible intervals per concept (posteriorMean, posteriorSD, credible bounds)
- **Session wraps**: mastery deltas, calibration notes, evidence-grounded encouragement
- **System adaptations**: dynamic chunk sizing, reflection prompt frequency, interleaving thresholds — all logged with observe→infer→act audit trails

---

## Slide 6: Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, Tailwind 4, shadcn/Base UI, Three.js, Deck.gl, XYFlow, Motion |
| **AI/ML** | OpenAI GPT-4o-mini, Vercel AI SDK, AI Gateway, LiveKit Agents |
| **Voice** | LiveKit (WebRTC), OpenAI TTS/STT, Silero VAD |
| **Database** | PostgreSQL (Vercel/Neon), Drizzle ORM, Vercel KV (Redis) |
| **Storage** | Vercel Blob (artifacts, audio, video) |
| **Auth** | better-auth with Drizzle adapter |
| **Payments** | Stripe (credits system) |
| **Testing** | Evalite, Vitest, Playwright |
| **MCP** | @modelcontextprotocol/sdk (6-tool server) |
| **DevOps** | Vercel (deploy), Biome (lint/format), Lefthook (git hooks), Bun |
