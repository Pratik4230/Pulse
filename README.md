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

**Storage split:**

| System            | Role                                                        |
| ----------------- | ----------------------------------------------------------- |
| **Neon Postgres** | Users, auth, chat history, billing plan, daily AI quota     |
| **Upstash Redis** | API burst rate limits + Better Auth rate-limit storage      |
| **TanStack Query** | Client-side cache and background refetch                   |

---

## Features

- **Keyboard-first inbox** — arrow keys, `/` to search, `r` to refresh, `⌘K` command palette
- **Real-time sync** — Gmail Pub/Sub + Calendar watches → SSE → TanStack Query invalidation
- **Pulse AI** — schedule + email in one message; web search; tool activity in chat
- **Voice input** — Sarvam STT; English, Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Punjabi, Gujarati
- **Chat persistence** — sessions and messages in Postgres
- **Locale-aware** — country, currency, timezone at signup; calendar and AI use your timezone
- **Free & Pro plans** — inbox and calendar stay free; Pulse AI is metered on Free, unlimited on Pro
- **Rate limiting** — Upstash Redis protects auth and API routes; friendly 429 toasts in the UI

---

## Plans

|                         | Free                         | Pro ($80/mo USD)   |
| ----------------------- | ---------------------------- | ------------------ |
| Inbox & Calendar        | ✓                            | ✓                  |
| Pulse AI messages       | 7 / day                      | Unlimited          |
| Voice transcription     | ✓ (burst-limited)            | ✓ (higher limits)  |

Billing is powered by [Dodo Payments](https://dodopayments.com) via the Better Auth plugin. Manage your plan in **Settings → Billing**.

---

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · Better Auth · PostgreSQL (Neon) · Drizzle ORM · Upstash Redis · Corsair (`@corsair-dev/gmail`, `@corsair-dev/googlecalendar`) · Vercel AI SDK · OpenAI · Google Gmail & Calendar APIs · Google Pub/Sub · Sarvam STT · Resend · Dodo Payments

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (or Node 20+)
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Google Cloud project with Gmail API, Calendar API, OAuth client, and Pub/Sub (for push)
- OpenAI API key
- Corsair `CORSAIR_KEK` (generate a random secret for token encryption)

Optional for local dev (required for production rate limits and billing):

- [Upstash Redis](https://upstash.com) — REST URL + token
- [Dodo Payments](https://dodopayments.com) — API key, webhook secret, Pro product ID

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

See [`.env.example`](.env.example).

**Required for core functionality:**

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | Auth and app URLs |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google login + integrations |
| `CORSAIR_KEK` | Encrypts OAuth tokens at rest |
| `OPENAI_API_KEY` | Pulse AI chat |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email verification and password reset |

**Optional locally, recommended in production:**

| Variable | Purpose |
| -------- | ------- |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | API + auth rate limits (no-op if unset) |
| `GOOGLE_PUBSUB_TOPIC` | Gmail push webhooks |
| `SARVAM_API_KEY` | Voice transcription |
| `DODO_PAYMENTS_*`, `DODO_PRO_PRODUCT_ID`, `PRO_PRICE_USD` | Pro subscriptions |

On Vercel, add the **Upstash** marketplace integration to inject Redis env vars automatically.

---

## Production

Deploy on [Vercel](https://vercel.com). Production URL: `https://pulse-three-zeta.vercel.app`

**Checklist:**

1. Set all required env vars in the Vercel project
2. Add Upstash Redis (rate limits + auth storage)
3. Run `bun run db:migrate` against the production database
4. Configure Dodo Payments webhooks → `https://<your-domain>/api/auth/dodopayments/webhooks`
5. Set Google OAuth redirect URIs for your production domain
6. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL

---

## Rate limiting

When Upstash Redis is configured, Pulse applies sliding-window limits per route (chat, transcribe, inbox, calendar, MCP, OAuth, webhooks, etc.). Limits are disabled locally if Redis env vars are missing.

The client shows a Sonner toast on `429` / `RATE_LIMITED` responses with a retry hint. Daily AI message quotas (Free plan) are tracked separately in Postgres—not in Redis.

Auth endpoints use Better Auth rate limits backed by the same Redis instance (stricter rules on sign-in, sign-up, and password reset).

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
  billing/              # Upgrade CTA, checkout hooks
  settings/             # Billing, integrations, locale
lib/
  billing/              # Plans, Dodo plugin, AI daily usage
  rate-limit.ts         # Upstash rate limit buckets
  api-client.ts         # Client fetch helpers + 429 toasts
db/                     # Drizzle schema + migrations
```

---

## License

MIT (or your chosen license—update before making the repo public).

---

**Corsair** powers OAuth and the AI agent. **Raw Google APIs** keep the inbox and calendar UI fast. That is the Pulse split.
