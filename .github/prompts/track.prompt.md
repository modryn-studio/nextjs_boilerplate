---
name: track
description: Scans all API routes and React components for meaningful events that lack tracking calls, then adds them — updating call sites, the ALLOWED_EVENTS whitelist, and funnel.sql
agent: agent
---

Scan every API route and every client component for meaningful events that should be tracked but aren't, then wire them up. All three changes travel together: call site + ALLOWED_EVENTS + funnel.sql.

---

## Step 1: Read the tracking infrastructure

Read these files before touching anything:

1. `src/lib/track.ts` — server-side helper signature
2. `src/lib/analytics.ts` — client-side helper (named methods + `track()` pattern)
3. `src/app/api/track/route.ts` — the `ALLOWED_EVENTS` whitelist
4. `scripts/funnel.sql` — current funnel queries

Note every event name already tracked so you don't add duplicates or overwrite existing calls.

---

## Step 2: Audit server-side routes

Scan every file matching `src/app/api/**/route.ts`. For each:

1. Read the full contents.
2. Check whether `import { track } from '@/lib/track'` is present.
3. Identify every meaningful business event in every exported handler.

**Skip — do not track:**
- `GET` handlers that return data (read-only — track client-side if needed)
- Polling endpoints that return `status: 'pending'` or `{ status: 202 }` — fire too frequently
- Validation error branches (`status: 400`) — already logged via route-logger
- Auth rejections (`status: 401`, `403`)
- `/api/track` itself

**Always track server-side:**
- Resource creation — after the new entity is persisted to the DB
- Payment captured — after `stripe.paymentIntents.capture()`
- Core product delivered — after the main deliverable is stored and the DB row is `ready`
- Delivery failed after payment was taken — `{ properties: { error: error.message } }`
- First open by end user — inside an `isFirstOpen` guard (entity has no `openedAt`)
- Reaction or engagement submitted — after the user asset is stored

---

## Step 3: Audit client-side pages and components

Scan files matching `src/app/**/page.tsx` and `src/components/**/*.tsx`. For each:

1. Read the full contents.
2. Check whether `analytics` is already imported from `@/lib/analytics`.
3. Identify meaningful user interactions that lack a tracking call.

**Always track client-side:**
- Demo or sample plays (one-shot per mount — use a `useRef` guard to avoid double-firing)
- Recipient/destination page views (on mount)
- Primary media plays and completions
- Share, download, or copy actions
- Opt-in actions: reaction submission, newsletter signup, feedback submit

**Skip:**
- Navigation clicks (Vercel Analytics covers pageviews automatically)
- Hover effects and decorative interactions
- Component re-renders or state changes that aren't user-initiated

---

## Step 4: Add missing tracking

For each gap, make all three changes together — never add a call site without updating the whitelist and funnel.

### A — Call site

**Server-side** (fire-and-forget, does not delay response):

```typescript
import { track } from '@/lib/track';

// after the meaningful operation succeeds:
void track('event_name', {
  // entityId: id, ← include the entity FK if this route operates on one
  properties: { /* relevant context */ },
});
```

**Client-side** (fire-and-forget via analytics.ts):

```typescript
import { analytics } from '@/lib/analytics';

// in handler / useEffect / onClick:
analytics.track('event_name', { /* props */ });
```

If the event maps to an existing named method on `analytics`, call that instead. If the event is new and will be called from more than one place, add a named method to `analytics.ts` first.

### B — ALLOWED_EVENTS

In `src/app/api/track/route.ts`, add the event name to the `ALLOWED_EVENTS` set:

```typescript
const ALLOWED_EVENTS = new Set([
  'existing_event',
  'new_event_name', // ← add here
]);
```

### C — funnel.sql

In `scripts/funnel.sql`, add a `COUNT(CASE WHEN ...)` column to the most relevant existing query. If the event represents a new funnel stage, add a new query block:

```sql
COUNT(CASE WHEN name = 'new_event_name' THEN 1 END) AS new_event_name
```

---

## Step 5: Sync analytics.ts named methods

After adding all call sites, check `analytics.ts` for named methods whose event names are **not** in `ALLOWED_EVENTS`. These are live client calls that silently drop because they were never whitelisted. Add them to `ALLOWED_EVENTS`.

---

## Step 6: Report

After all edits:

```
── Tracking Audit ─────────────────────────────────────────────

  Already tracked (skipped):
    ✓ newsletter_signup    analytics.ts → email-signup.tsx
    ✓ feedback_submit      analytics.ts → feedback-trigger.tsx

  Added:
    + item_purchased       api/orders/route.ts → ALLOWED_EVENTS → funnel.sql
    + demo_played          components/demo-player.tsx → ALLOWED_EVENTS

  Whitelisted (named method existed, was missing from ALLOWED_EVENTS):
    + newsletter_signup

  Skipped (not worth tracking):
    - GET /api/items       read-only
    - /api/status          polling

  Needs manual review:
    ? /api/webhook — third-party webhook, may fire multiple times — confirm intent
```

If everything is already covered, say so in one line.

---

## Note: track.ts is a stub in the boilerplate

If `src/lib/track.ts` shows `// no-op until Drizzle is wired`, tracking calls will console.log in dev and silently drop in prod. The pipeline still works — events reach this file, they just aren't persisted yet. Wire Drizzle when you're ready to store data (instructions in `src/lib/track.ts`).
