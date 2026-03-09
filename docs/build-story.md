# The Story of dp-hackathon: Built in 5 Days with 173 Conversations

## Day 0 — The Blank Canvas (Feb 25)

**"Create Next App"** — A single command. 10 files. 223 lines of code. Just the default Next.js starter. The canvas was empty.

---

## Day 1 — The Vision Takes Shape (Mar 4, evening)

**"basic"** — The first real session. A UI component library was installed (buttons, cards, dropdowns, inputs). 3,500 lines added. The building blocks were laid out on the table.

**"help me brainstorm a design doc, prd doc, marketing doc..."** — A deep brainstorming session about what this product should be: an AI-powered learning platform that ingests educational materials and generates personalized content. Design specs, architecture plans, and a core data model were drafted — nearly 10,000 lines of planning documents and the first working single-page app prototype.

---

## Day 2 — The Big Build (Mar 5, the marathon)

This was the day everything exploded. **Over 80 sessions** in a single day.

**"Add artifact canvas with clickable sidebar and chat tool-call buttons"** — The AI tutor got its creative workspace. Students could now see generated learning materials (flashcards, quizzes, mind maps) appear in a visual canvas alongside the chat. *1,295 lines added.*

**"Add learning profile assessment form with 12-screen questionnaire"** — A guided onboarding flow was built: 12 screens that ask about your learning style, goals, and preferences to personalize the experience. *1,520 lines added.*

**"Add topic navigation grid with grouped tiles"** — The homepage got a visual grid of learning topics — think of it like a Netflix-style browsable menu, but for study subjects. *456 lines added.*

**"Add landing page with personas, case studies, pricing, FAQ, and auth gate"** — The public-facing marketing site appeared: who this is for, what it costs, testimonials, and a login wall. *1,152 lines added.*

**"use this LiveKit audio visualizer — Aura"** — A voice-based AI tutor was integrated. Students could now *talk* to the AI, and a beautiful audio visualizer showed the conversation happening in real-time. Three different visualizer styles were built: bars, waves, and an ethereal "aura" effect.

**"is there anything we can do to speed up pause between voice?"** — The voice experience felt sluggish. Latency optimizations were explored and applied to make conversations feel more natural.

**"can we add tool calling to the voice agent?"** — The voice AI got superpowers: it could now generate flashcards, quizzes, and study guides *while talking to you*, and display them in the canvas. The same tools worked for both text and voice chat.

**"replace the homepage with bento grid"** — The layout was swapped to a modern "bento box" grid design — a trendy, visually appealing arrangement of cards in different sizes.

**"Add MCP server exposing learning tools for external AI clients"** — The platform's learning tools were made available to *other* AI assistants (like Claude Desktop), so students could use them from anywhere.

**"Add white-label configuration for consumer and higher-ed"** — The same platform could now be rebranded for universities or sold directly to consumers — different logos, colors, and messaging, same underlying product.

**"Add academic citation-backed learning tools"** — The AI tutor started backing its teaching with real academic references. Generated study guides now included proper citations.

**"Add comprehensive SEO landing pages, blog, and resources"** — A full content marketing section appeared: blog posts, industry pages, use case breakdowns, downloadable resources. *3,371 lines across 23 new files.*

**"Redesign landing page with scroll animations, shader hero"** — The homepage got a dramatic visual overhaul with smooth scroll-triggered animations and a GPU-powered gradient hero section. *1,007 lines rewritten.*

**"many of the branches I pulled down are refactors and improvements — create a plan to successfully merge them all"** — By this point, multiple parallel feature branches had piled up. A careful merging strategy was devised and executed to bring everything together without breaking anything.

**"Add academic resource logos and resource tiles"** — Visual branding for academic sources (university logos, publisher marks) was added to make the platform feel credible and trustworthy.

---

## Day 3 — Polish & Infrastructure (Mar 6)

**"what is a better URL path for users?"** — Thoughtful discussion about information architecture — how should the website's addresses be structured so they make sense to people?

**"reflect on the best way to add a megamenu"** — The navigation got a professional dropdown menu system so users could easily find any section of the platform.

**"reduce the content so cards are just title and hook subtitle"** — Less is more. The UI was decluttered — cards went from heavy blocks of text to clean, scannable titles with catchy one-liners.

**"make the dev-only logins work — Dr. Priya, Marcus, Maya, Admin"** — Demo personas were wired up so the team could quickly switch between different user types during testing and presentations.

**"update git to move to a new org"** — The codebase was migrated to the official hackathon organization on GitHub.

Multiple sessions focused on **deployment** — getting the app live on Vercel, setting up the database on Railway, configuring Stripe for payments, and connecting environment secrets.

---

## Day 4 — Real Data & Quality (Mar 7)

**"The 'middleware' file convention is deprecated. Please use 'proxy' instead."** — Framework upgrade issues were fixed. The app was modernized to follow the latest conventions.

**"move Academic Resources out of dashboard into the Sources tab"** — UX reorganization: study materials were moved to where students would naturally look for them — next to the file upload area.

**"research Vercel Workflow Dev — we need long-running tasks"** — The team explored how to run complex background jobs: generating all types of study materials at once, emailing students when they're ready, and scheduling ongoing review reminders.

**"in the voice agent, I can't see anything when I switch to wave or aura"** — Bug fix session. The audio visualizer styles weren't rendering properly and were debugged and repaired.

**"Generate Flash Cards and fix upload source issues"** — The flashcard generator was completed and file upload bugs were squashed.

Pre-commit hooks were added (**lefthook**) so that every code change was automatically checked for errors before being saved — a quality gate to prevent bugs from sneaking in.

---

## Day 5 — The Final Push (Mar 8)

**"we need to make the topic dashboard and creation real"** — The big moment: replacing all the fake demo data with real functionality. Users could now actually create their own study topics, and an empty state guided new users through their first topic creation.

**"Failed query: insert into 'topic'..."** — Database errors were debugged in real-time as the real data layer was stress-tested.

**"bars and aura works, but wave doesn't work"** — More audio visualizer debugging. Two out of three styles worked; the wave effect needed fixing.

**"update the pricing to be free and paid, at $5/mo"** — The business model was finalized: a free tier plus a $5/month premium plan.

**"move how it works above what you get"** — Landing page section reordering — explain the process before showing the features, because people need to understand *how* before they care about *what*.

**"Thread topicSlug through agent artifact tools"** — Behind the scenes, the AI was taught to generate content *specific to each study topic*, not just generic materials.

**"Add hackathon alignment spec for Track 2"** — The final documentation: a clear spec showing how the project meets the hackathon's judging criteria.

---

## By the Numbers

| Metric | Value |
|---|---|
| Days of building | 5 |
| Claude Code sessions | 173 |
| Git commits | 70 |
| Lines of code added | ~75,000+ |
| Features built | Voice AI tutor, text chat, flashcard generator, quiz builder, mind maps, 3D spatial views, audio visualizers (3 styles), learning assessments, topic management, billing/payments, landing page, blog, SEO pages, MCP server, white-label system, academic citations, file uploads, user profiles, preferences |

From a blank `create-next-app` to a full AI-powered learning platform — in five days, through 173 conversations.
