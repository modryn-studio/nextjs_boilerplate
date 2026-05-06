---
name: email-setup
description: Guided email setup — Gmail SMTP for founder notifications, Resend for audience management, notify.ts wiring, and optional transactional email for users.
agent: agent
---

Walk through email setup for this project end-to-end. Work through each step in order. Skip steps that are already done.

## Step 1: Check what's already set

Read `.env.local`. Check which of these are set:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FEEDBACK_TO`
- `RESEND_API_KEY`
- `RESEND_SEGMENT_ID`
- `RESEND_FROM_EMAIL`
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

## Step 3: Resend API key (if RESEND_API_KEY is missing)

Tell the user:

> 1. Go to [resend.com](https://resend.com) → API Keys → Create API Key
> 2. Name it after the project
> 3. Add to `.env.local`:
>    ```
>    RESEND_API_KEY=re_xxxx
>    ```
> 4. Optional — if you want signups tagged to a named segment: Resend dashboard → Audience → Segments → Create → copy the segment ID → add `RESEND_SEGMENT_ID=your_id`

Wait for confirmation before continuing.

## Step 4: Smoke-test notifications

Check that `src/lib/notify.ts` exists. If it does, ask the user to submit the feedback form at `/` (or wherever the email signup component is mounted) and confirm they receive a notification email. If `notify.ts` doesn't exist, stop and note that the boilerplate file is missing.

## Step 5: Audit routes for missing notifications

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

## Step 6: Transactional email (optional — skip if not needed)

Ask: "Does this project need to send emails to users? (e.g. order confirmation, product delivery, magic link)"

If yes:

1. Check if `@react-email/components` and `react-email` are in `package.json`. If not, install them.
2. Check if `RESEND_FROM_EMAIL` and `NEXT_PUBLIC_SITE_URL` are set. If not, prompt:
   ```
   RESEND_FROM_EMAIL=Product Name <hello@modrynstudio.com>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
   Note: `modrynstudio.com` is already verified in Resend. For a standalone domain, the domain must be verified in Resend → Domains → Add Domain.
3. Create `src/emails/` if it doesn't exist.
4. Ask what the first template should be (e.g. "order confirmation with a link to the recipient page").
5. Scaffold the template at `src/emails/your-template.tsx` and the send call in the relevant route.

## Step 7: Done

Summarize:

- What was already set up
- What was wired in this session
- Any remaining steps the user needs to take manually (e.g. verifying a custom domain in Resend, confirming the Gmail alias)
