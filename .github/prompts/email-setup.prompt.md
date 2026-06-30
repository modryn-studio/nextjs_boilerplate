---
name: email-setup
description: Guided email setup — nodemailer + Gmail SMTP for founder notifications, notify.ts wiring, and optional transactional email for users.
agent: agent
---

Walk through email setup for this project end-to-end. Work through each step in order. Skip steps that are already done.

## Step 1: Check what's already set

Read `.env.local`. Check which of these are set:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FEEDBACK_TO`
- `NEXT_PUBLIC_SITE_URL`

Report which are set, which are missing. Continue to the steps that are needed.

## Step 2: Gmail app password (if GMAIL_USER or GMAIL_APP_PASSWORD is missing)

Tell the user:

> 1. Go to [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App passwords
> 2. Generate one for "Mail"
> 3. Copy the 16-character code (with spaces is fine)
> 4. Add to `.env.local`:
>    ```
>    GMAIL_USER=you@gmail.com
>    GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
>    FEEDBACK_TO=you@gmail.com
>    ```

Wait for confirmation before continuing.

## Step 3: Smoke-test notifications

Check that `src/lib/notify.ts` exists. If it does, ask the user to submit the feedback form at `/` (or wherever the email signup component is mounted) and confirm they receive a notification email. If `notify.ts` doesn't exist, stop and note that the boilerplate file is missing.

## Step 4: Audit routes for missing notifications

Read all files matching `src/app/api/**/route.ts`.

For each route, check:

- Does it handle a significant user action? (payment, signup, core product delivery, reaction/engagement)
- Does it call `sendNotification` or use `after()` with a notification?

List every route that handles a significant action but has no notification call. Ask the user which ones to wire up.

For each confirmed route, add the notify pattern:

```typescript
import { after } from 'next/server';
import { sendNotification, notifyHtml } from '@/lib/notify';
import { site } from '@/config/site';

after(() =>
  sendNotification(`[${site.name}] Event name`, notifyHtml('Event name', [['Key field', value]]))
);
```

Use `after()` for routes where the notification must not delay the response (payments, form submissions). Use `void sendNotification(...)` for non-critical paths.

**Do not add notifications to:**

- Polling routes (`GET` returning `status: 'pending'`)
- Validation error branches
- Events that could fire hundreds of times per hour

## Step 5: Transactional email (optional — skip if not needed)

Ask: "Does this project need to send emails to users? (e.g. order confirmation, product delivery, magic link)"

If yes:

1. Use `sendUserEmail(to, subject, html)` from `src/lib/notify.ts` (nodemailer + Gmail SMTP) — never Resend, never SendGrid, per studio convention. If `sendUserEmail` isn't yet exported from `notify.ts`, add it following the same pattern as `sendNotification`.
2. Check that `NEXT_PUBLIC_SITE_URL` is set. If not, prompt:
   ```
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
3. Ask what the first email should say (e.g. "order confirmation with a link to the recipient page").
4. Build the HTML body inline (or with `notifyHtml`-style helpers) and call `sendUserEmail(...)` from the relevant route. No separate templating package is needed for the simple monospaced HTML pattern this boilerplate uses.

## Step 6: Done

Summarize:

- What was already set up
- What was wired in this session
- Any remaining steps the user needs to take manually (e.g. confirming the Gmail alias, rotating the app password)
