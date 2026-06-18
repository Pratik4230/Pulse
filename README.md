# Pulse

**Keyboard-first AI command center for Gmail and Google Calendar.**

[Live demo](https://pulse-three-zeta.vercel.app) · [Privacy](https://pulse-three-zeta.vercel.app/privacy) · [Terms](https://pulse-three-zeta.vercel.app/terms)

Built for the **ChaiCode × Corsair — Builder Mode On | MacBook Giveaway Hackathon**.

---

## Problem

Gmail and Calendar are universal, but the default UIs are slow for power users. Searching, scheduling, and following up often means too many clicks—and combining a calendar invite with a personal email is fragmented across tabs.

## Solution

Pulse is a workflow-first workspace with three pillars:

| Surface      | What it does                                            |
| ------------ | ------------------------------------------------------- |
| **Inbox**    | Fast, keyboard-navigable Gmail list and thread view     |
| **Calendar** | Week grid + agenda, create events in your timezone      |
| **Pulse AI** | Natural-language actions on your real mail and schedule |

Connect Gmail and Calendar once in Settings. Browse with shortcuts. Ask Pulse to draft replies, schedule meetings, or send confirmations—or use voice input in English and Indian languages.

New mail and calendar changes sync in real time via Google webhooks (no manual refresh).

---

## Architecture

Two lanes, one product:

| Lane   | Routes                | Data path                                         |
| ------ | --------------------- | ------------------------------------------------- |
| **UI** | `/inbox`, `/calendar` | TanStack Query → app API → raw Google APIs (fast) |
| **AI** | `/pulse`              | Vercel AI SDK → Corsair MCP → Gmail / Calendar    |

**Corsair** handles OAuth, encrypted token storage, webhooks, and powers the AI agent. UI pages stay on direct Google APIs for speed—not MCP round-trips.

```
┌─────────────────────────────────────────────────────────┐
│  /inbox  /calendar          │  /pulse (AI chat)         │
│  TanStack Query → raw APIs  │  AI SDK → Corsair MCP     │
└─────────────────────────────┴───────────────────────────┘
                              │
                    Corsair (OAuth, tokens, webhooks)
```

---

## Features

- **Keyboard-first inbox** — arrow keys, `/` to search, `r` to refresh, `⌘K` command palette
- **Real-time sync** — Gmail Pub/Sub + Calendar watches → SSE → TanStack Query invalidation
- **Pulse AI** — schedule + email in one message; web search; tool activity in chat
- **Voice input** — Sarvam STT; English, Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Punjabi, Gujarati
- **Chat persistence** — sessions and messages in Postgres
- **Locale-aware** — country, currency, timezone at signup; calendar and AI use your timezone

---

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · Better Auth · PostgreSQL (Neon) · Drizzle ORM · Corsair (`@corsair-dev/gmail`, `@corsair-dev/googlecalendar`) · Vercel AI SDK · OpenAI · Google Gmail & Calendar APIs · Google Pub/Sub · Sarvam STT · Resend

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (or Node 20+)
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Google Cloud project with Gmail API, Calendar API, OAuth client, and Pub/Sub (for push)
- OpenAI API key
- Corsair `CORSAIR_KEK` (generate a random secret for token encryption)

### Setup

```bash
git clone <your-repo-url>
cd pulse
bun install
cp .env.example .env
# Fill in .env (see .env.example)
bun run db:migrate
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Corsair credentials

After first run, set Google OAuth client credentials for Corsair plugins (integration-level):

```bash
bunx corsair setup -p gmail client_id=... client_secret=...
bunx corsair setup -p googlecalendar client_id=... client_secret=...
```

Use the same Google OAuth client as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`. Redirect URI for integrations:

```
http://localhost:3000/api/integrations/oauth/callback
```

### Environment variables

See [`.env.example`](.env.example). Required for core functionality:

- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CORSAIR_KEK`
- `OPENAI_API_KEY`
- `GOOGLE_PUBSUB_TOPIC` (Gmail push; optional for local dev without webhooks)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (email verification)

---

## Production

Deploy on Vercel. Full checklist: [`docs/production-setup.md`](docs/production-setup.md).

Prod URL: `https://pulse-three-zeta.vercel.app`

---

## Keyboard shortcuts

| Scope    | Keys            | Action                  |
| -------- | --------------- | ----------------------- |
| Global   | `⌘K` / `Ctrl+K` | Command palette         |
| Global   | `⌘B` / `Ctrl+B` | Toggle sidebar          |
| Global   | `D`             | Toggle light / dark     |
| Inbox    | `↑` `↓`         | Previous / next message |
| Inbox    | `/`             | Focus search            |
| Inbox    | `R`             | Refresh                 |
| Inbox    | `Esc`           | Clear selection         |
| Pulse AI | `Esc`           | Stop streaming reply    |

---

## Demo prompts

Try these in `/pulse` after connecting Gmail and Calendar:

```
Schedule interview with friend@example.com Saturday 10am and email them
Is there any meeting with friend@example.com this week?
List my 5 most recent unread emails with sender and subject
```

---

## Project structure

```
app/                    # Next.js App Router (pages + API routes)
features/
  inbox/                # Lane A — Gmail UI
  calendar/             # Lane A — Calendar UI
  pulse/                # Lane B — AI chat + MCP
  integrations/         # Corsair OAuth, webhooks, sync
db/                     # Drizzle schema + migrations
docs/production-setup.md
```

---

## License

MIT (or your chosen license—update before making the repo public).

---

**Corsair** powers OAuth and the AI agent. **Raw Google APIs** keep the inbox and calendar UI fast. That is the Pulse split.
