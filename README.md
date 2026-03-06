# dp-hackathon

Next.js 16 adaptive learning platform with AI chat, artifact generation, and learning profile DNA.

## Prerequisites (Mac)

If you've never coded on this Mac before, run these one at a time in Terminal:

### 1. Install Xcode Command Line Tools

```bash
xcode-select --install
```

A popup will appear — click "Install" and wait for it to finish.

### 2. Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the instructions it prints at the end to add Homebrew to your PATH.

### 3. Install Node.js and Bun

```bash
brew install node
brew install oven-sh/bun/bun
```

Verify they installed:

```bash
node -v   # should print v22 or higher
bun -v    # should print 1.x
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/dataportability-hackathon-2026/dp-hackathon.git
cd dp-hackathon
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` in a text editor and fill in your keys. Ask a teammate if you don't have them.

### 4. Install agent dependencies

```bash
cd agent && bun install && cd ..
```

### 5. Run the app

```bash
bun dev
```

This starts both the Next.js dev server and the LiveKit voice agent concurrently. Open [http://localhost:3000](http://localhost:3000) in your browser.

You can also run them individually:

```bash
bun run dev:next    # Next.js only
bun run dev:agent   # voice agent only
```

## Scripts

```
bun dev             # start Next.js + voice agent
bun run dev:next    # start Next.js only
bun run dev:agent   # start voice agent only
bun run build       # production build
bun start           # production server
bun run lint        # lint (biome)
bun run format      # format (biome)
```

## Project Structure

```
src/
  app/
    (marketing)/          # SEO landing pages
    dashboard/            # Main learning dashboard
    api/                  # API routes (chat, auth, billing, etc.)
  components/
    artifacts/            # Artifact canvas (quiz, flashcards, mindmap, slides, etc.)
    marketing/            # Landing page templates, nav, footer
    billing/              # Stripe billing + usage dialogs
  lib/
    ai/                   # AI generation (profiles, guides, artifacts)
    content/              # Marketing content data
    topics.ts             # Topic/project mock data
  db/                     # Drizzle schema + DB connection
```

## Troubleshooting

**`command not found: bun`** — Restart your terminal after installing Homebrew and Bun.

**`xcode-select: error: command line tools are already installed`** — That's fine, move on.

**Port 3000 already in use** — Another app is using it. Kill it with `lsof -ti:3000 | xargs kill` or run `bun dev -- -p 3001`.

**Missing environment variables** — The app will crash on startup if keys are missing. Make sure `.env.local` is filled in.
