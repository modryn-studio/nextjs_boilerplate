---
name: funnel
description: Runs the funnel health check against the live Neon DB and surfaces conversion anomalies — event counts by day, conversion rates, engagement, session sequences
agent: agent
---

Run the funnel health check for this project. Pull live data from Neon, format the results, and flag anything worth acting on.

---

## Step 1: Read the event whitelist

Read `src/app/api/track/route.ts` — note the `ALLOWED_EVENTS` set. These are the events currently being tracked. Reference them when interpreting results.

---

## Step 2: Read the funnel queries

Read `scripts/funnel.sql`. For each query block that has real event names (not still showing `step_1_event` placeholders), run it via `mcp_neon_run_sql`. Skip placeholder queries and note which ones still need to be configured.

---

## Step 3: Format results

Present the output in a clean readable format. Example:

```
── Funnel Health Check ─────────────────────────────────────────

  Full event counts (last 7 days)
  ┌──────────────────────┬───────┬────────────┐
  │ event                │ count │ date       │
  ├──────────────────────┼───────┼────────────┤
  │ newsletter_signup    │    12 │ 2026-05-07 │
  │ feedback_submit      │     3 │ 2026-05-07 │
  └──────────────────────┴───────┴────────────┘

  Conversion
  step_1 → step_2:   step_1=N/A (placeholder not yet configured)
```

---

## Step 4: Flag anomalies

After the table, write a short "Worth acting on" section:

- **Zero events in the last 24h**: Either no traffic, or the tracking pipeline is broken. Check that `/api/track` is deployed and the `events` table exists in Neon.
- **Conversion below expected threshold**: Call it out and suggest where to look.
- **Placeholder queries not yet configured**: List them. Tell the user which event names to add.
- If everything looks healthy, say so in one line.

---

## Step 5: How to update the funnel

When the user adds a new feature and wants to track it, walk them through the three-file update:

1. **`src/app/api/track/route.ts`** — add the new event name to `ALLOWED_EVENTS`
2. **Call site** — fire `void track('event_name', { properties })` server-side, or `analytics.track('event_name', props)` client-side
3. **`scripts/funnel.sql`** — add a `COUNT(CASE WHEN name = 'event_name' THEN 1 END)` column to the relevant query

To activate persistent storage (currently a stub):

1. Add `DATABASE_URL` to `.env.local`
2. `npm install drizzle-orm @neondatabase/serverless drizzle-kit`
3. Create `src/lib/db.ts` and `src/lib/schema.ts` with an `events` table
4. Run `npx drizzle-kit push`
5. Replace the stub body in `src/lib/track.ts` with `db.insert(events).values({ ... })`
