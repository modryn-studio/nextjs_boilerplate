# nextjs_boilerplate — Claude Code Guide

Production-wired Next.js starter for committed Modryn products. Pre-built: Stripe (checkout + webhook), Resend (email notifications), Vercel Analytics, and a feedback widget. Use this when the product is committed and needs the money loop from day one.

**When to use this vs modryn-boilerplate:**
- `nextjs_boilerplate` — committed product; needs payments, email, analytics. Start here.
- `modryn-boilerplate` — early exploration, prototype, no billing needed. That one has zero machinery.

For the full setup flow (how to clone, wire git, run the phases), read `.github/HOW-TO.md`.

---

## Starting a New Project From This Boilerplate

1. Copy folder to new project location, or: `git clone https://github.com/modryn-studio/nextjs_boilerplate [your-project]`
2. Remove `.git`, `git init -b main`, add remote, commit, push — the HOW-TO script handles this.
3. Rename `name` in `package.json`.
4. Fill in `src/config/site.ts` (name, URL, description, social links).
5. Recolor `src/app/globals.css` `@theme` tokens — or run the `frontend-design` skill.
6. `npm install`, then `npm run dev`.
7. Update `context.md` and `brand.md` for the specific product.
8. Replace this `CLAUDE.md` with the product-specific one.

---

## Stack

Next.js 16 (App Router) + React 19 · TypeScript · Tailwind CSS v4 · Vercel

React Compiler is on (`reactCompiler: true`).

---

## Pre-Wired Capabilities

These are already built — configure, don't rebuild:

| Capability | File | What to configure |
|---|---|---|
| Stripe checkout | `src/app/api/checkout/route.ts` | Change `mode: 'payment'` → `mode: 'subscription'` for subscriptions; update price ID |
| Stripe webhook | `src/app/api/stripe/webhook/route.ts` | Verify `STRIPE_WEBHOOK_SECRET` is set; add subscription-specific event handling |
| PayGate (one-time payment gate) | `src/components/PayGate.tsx` | localStorage-based — only for one-time purchases. Replace with auth-gated routes for subscriptions |
| Email notifications | `src/lib/notify.ts` | Set `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FEEDBACK_TO` in `.env.local` |
| Resend (audience) | wired in checkout | Set `RESEND_API_KEY`, `RESEND_SEGMENT_ID` |
| Vercel Analytics | `src/app/layout.tsx` | Already imported via `<Analytics />` — just deploy to Vercel |
| Feedback widget | present | Sends to `FEEDBACK_TO` email on submission |
| Client analytics | `src/lib/analytics.ts` | Fires `analytics.track()` to `/api/track` — extend `ALLOWED_EVENTS` per project |
| Route logging | `src/lib/route-logger.ts` | Use `createRouteLogger('route-name')` in every API route |

---

## What Is NOT Pre-Wired (add per project)

- **Auth** — use Neon Auth (first-party, lives in `neon_auth` schema, branches with DB). Never Clerk. Quickstart: `neon.com/docs/auth/quick-start/nextjs`
- **Database** — Drizzle + Neon. Add `DATABASE_URL` to `env.ts`, create `src/lib/db.ts`. Use pgvector when vector search is needed.
- **Subscription gate** — replace `PayGate` with auth-gated middleware when building a subscription product

---

## Conventions

**Tailwind v4 — no config file.** All theme customization lives in `src/app/globals.css` under `@theme` (never `:root`, never `tailwind.config.*`). Tokens: `bg`, `surface`, `border`, `text`, `muted`, `accent`, `accent-foreground`. Use `bg-surface`, `text-muted` directly — short utilities work when the token is in `@theme`.

**API routes** use `createRouteLogger` — never raw `console.log`:
```typescript
const log = createRouteLogger('my-route');
export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    return log.end(ctx, Response.json(result));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Env vars:** register every var in `src/lib/env.ts` (zod) — missing values fail fast at boot.

**Code style:** senior-engineer minimalism. Small surface area, obvious naming, no abstraction before it's needed. Comments explain WHY, not what. Early returns for errors. One file, one responsibility.

---

## Defaults Worth Knowing

- `src/app/layout.tsx` sets `robots: { index: false }` — remove when the product goes public.
- `.vscode/` ships `formatOnSave` + Prettier and a `Run dev server` build task (pipes to `dev.log`).
- `context.md` and `brand.md` are the source of truth for Copilot context — edit these, then run `/update` to cascade into `copilot-instructions.md` and `site.ts`. Never edit derived files directly.
- MCP servers: Stripe is per-project (reads `STRIPE_SECRET_KEY` from `.env.local`). Neon is global (add to `~\AppData\Roaming\Code\User\mcp.json`). GitHub is the VS Code Gallery extension.

---

## File Map (key files only)

```
.github/
├── HOW-TO.md                    ← Full setup + phase guide — read this first
├── copilot-instructions.md      ← Always-on context (derived — edit source docs)
├── instructions/                ← Auto-applied instruction files per file type
├── agents/                      ← @check, @prebuild agents
└── prompts/                     ← /setup, /update, /validate, /assets, etc.
src/app/api/
├── checkout/route.ts            ← Stripe checkout (change mode per product type)
├── stripe/webhook/route.ts      ← Stripe webhook handler
└── track/route.ts               ← Client event ingestion
src/lib/
├── analytics.ts                 ← Client-side event tracking
├── notify.ts                    ← Gmail SMTP notifications
├── route-logger.ts              ← API route logging
└── track.ts                     ← Server-side event persistence
src/components/
└── PayGate.tsx                  ← One-time payment gate (replace for subscriptions)
src/config/site.ts               ← Derived site metadata (edit via /update)
context.md                       ← SOURCE OF TRUTH: product, stack, routes, monetization
brand.md                         ← SOURCE OF TRUTH: voice, visuals, user types, copy
```
