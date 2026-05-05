---
name: notify
description: Scans all API routes and wires founder notifications into any route that doesn't have them yet, using the notify.ts pattern
agent: agent
---

Scan every file under `src/app/api/**/route.ts` and add founder notifications to any meaningful event that doesn't already have one.

---

## Step 1: Read the helper

Read `src/lib/notify.ts` so you understand the exact function signatures before editing any route.

---

## Step 2: Audit all routes

List every file matching `src/app/api/**/route.ts`. For each file:

1. Read the full contents.
2. Note whether `sendNotification` is already imported.
3. Identify every exported handler (`GET`, `POST`, `PATCH`, `DELETE`).
4. For each handler, identify the meaningful events — successful resource creation, payment capture, content delivery, user engagement, or failure paths that require manual intervention.

**Skip these — do not add notifications:**

- `GET` handlers that return data (read-only)
- Polling loops that return `status: 'pending'` or `{ status: 202 }` — these fire repeatedly and would flood your inbox
- Validation error branches (`status: 400`) — already logged via `log.warn()`
- Auth rejections (`status: 401`, `403`)

**Always notify these:**

- New order / checkout created — immediately after Stripe session is created
- Payment captured — immediately after `stripe.paymentIntents.capture()`
- Core product delivered — after the main asset (song, report, output) is written and the DB row is set to `ready`
- Generation/delivery failed after payment was taken — these require manual intervention. Flag clearly: `🚨 MANUAL ACTION REQUIRED`
- Blob or DB finalise failure after capture — same: `🚨 MANUAL ACTION REQUIRED`
- Entity opened by end user (first open only — guard with an `openedAt` field; only fire on the first open, not every subsequent view)
- Reaction / engagement captured

---

## Step 3: Add missing notifications

For each route that needs notifications, edit the file following this pattern exactly:

**Imports to add** (only what isn't already imported):

```typescript
import { after } from 'next/server';
import { site } from '@/config/site';
import { sendNotification, notifyHtml } from '@/lib/notify';
```

**Fire-and-forget after response** (preferred for all user-facing routes):

```typescript
after(() =>
  sendNotification(
    `🎁 [${site.name}] Short subject — what happened`,
    notifyHtml('🎁 Short subject', [
      ['Order ID', id],
      ['From', senderName],
      ['To', recipientName],
    ])
  )
);
return log.end(ctx, Response.json({ ok: true }));
```

**Void call for synchronous failure paths** (where `after()` isn't appropriate):

```typescript
void sendNotification(subject, notifyHtml(title, rows));
return log.end(ctx, Response.json({ error: '...' }, { status: 422 }));
```

**Subject line conventions:**

- Success: `✅ [${site.name}] What happened — key detail`
- First open / engagement: `👁️ [${site.name}] Opened for the first time`
- Reaction: `📸 [${site.name}] Reaction received`
- New order: `🆕 [${site.name}] New order — Sender → Recipient`
- Payment: `💳 [${site.name}] Payment captured`
- Delivery: `✅ [${site.name}] Product delivered — RecipientName`
- Manual action needed: `🚨 [${site.name}] MANUAL ACTION REQUIRED — OrderId`
- Failure: `❌ [${site.name}] What failed — OrderId`

**Rows to include in notifyHtml:**

Always include:

- `['Order/Record ID', id]` — the primary key for looking it up
- The key human names (`['From', senderName]`, `['To', recipientName]`)
- The result URL when relevant: `['Result URL', resultUrl]`

For failures add:

- `['Payment Intent', paymentIntentId]` (if money was involved)
- `['Error', String(err)]`
- `['Action', 'Manual delivery required']`

---

## Step 4: Validate

After all edits, check for TypeScript errors on every file you touched:

```
get_errors([list of modified file paths])
```

Fix any type errors before finishing.

---

## Step 5: Report

List every route you modified and every notification you added, with the event name and subject line. Mark any routes you skipped and why.
