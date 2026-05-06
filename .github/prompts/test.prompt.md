---
name: test
description: "Run full end-to-end test of the money loop. Fill in the CONFIGURE section before running. Agent executes autonomously — browser, dev.log, Neon MCP, Stripe SDK."
agent: agent
---

<!-- CONFIGURE THIS SECTION before running -->
<!--
  LOG_FILE: dev.log (or whatever your dev server pipes to)
  DEV_URL: http://localhost:3000
  FORM_ROUTE: /create
  CONFIRM_ROUTE: /create/confirm
  RECIPIENT_ROUTE: /for/[id]
  NEON_PROJECT_ID: (from Neon dashboard)
  STRIPE_PI_STATUS_BEFORE_CAPTURE: requires_capture
  STRIPE_AMOUNT_CENTS: 900
  TEST_INPUTS: fill in real values — generic inputs produce generic output
-->

Run the full e2e test. Execute every step yourself using browser tools, terminal, and MCP. Do not ask for confirmation between steps. Report results at the end.

Before starting: tail the dev log in an async terminal so you can read it in real time throughout.

---

## Step 1 — Navigate to the form

Open `{DEV_URL}{FORM_ROUTE}` in the browser.

Verify:
- First question renders correctly with correct placeholder
- Progress indicator absent on first question
- Visual register matches design system — correct background, fonts, color tokens

---

## Step 2 — Complete all form questions

Fill in real, specific values — not placeholder test data. The quality of AI-generated output depends on specificity.

For each question:
- Verify the advance mechanism works (Enter key or button)
- Verify progress label updates correctly
- Verify back navigation works without losing previous answers

---

## Step 3 — Submit and payment checkout

Click the primary CTA.

Verify in dev.log:
- Exactly one POST to the gifts/orders creation route
- Row created — log the ID
- Stripe/payment session created — log the session ID
- No duplicate POSTs

Complete payment with Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Step 4 — Confirm page and generation

Watch dev.log in real time. Verify the full generation sequence:
- Payment intent status confirmed (`requires_capture`)
- External generation API called (ElevenLabs, OpenAI, etc.)
- Response received — log bytes/tokens/cost
- Asset uploaded to storage (Vercel Blob, S3, etc.)
- Payment captured
- DB row updated — `status = 'ready'`, asset URL set

Generation time varies. Wait for it — do not assume failure until the timeout fires.

Verify in Neon:
```sql
SELECT id, status, asset_url, opened_at FROM {table} WHERE id = '{id}'
```
Expect: `status = 'ready'`, `asset_url` set, `opened_at = null`

Verify via Stripe SDK:
```js
const Stripe = require('stripe');
require('@next/env').loadEnvConfig('.');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.paymentIntents.retrieve('{paymentIntentId}').then(pi => console.log(pi.status, pi.amount_received));
```
Expect: `status = 'succeeded'`, `amount_received = {STRIPE_AMOUNT_CENTS}`

---

## Step 5 — Confirmation screen

Verify:
- Success state renders — not a loading screen, not an error
- Shareable/deliverable link or asset present
- Link format correct: `{siteUrl}/{recipient_route}/{id}`

---

## Step 6 — Recipient/delivery page

Navigate to the recipient URL.

Verify each stage in sequence — adapt to your product's specific flow:
- Opening state renders correctly
- Core content (audio, video, text, etc.) loads and plays/displays
- Any timed stage transitions fire at correct intervals
- Post-content CTA appears (share, download, react, etc.)

Verify in Neon when the `openedAt` trigger fires:
```sql
SELECT opened_at FROM {table} WHERE id = '{id}'
```
Expect: `opened_at` now set

---

## Step 7 — Secondary interaction (share, react, download)

Test whatever the secondary action is — card export, reaction capture, share sheet.

Note: camera/microphone access fails in headless browser. Flag it and note it requires a real device.

---

## Step 8 — Double-submit idempotency

POST the generation endpoint again with the same session ID.

Verify in dev.log:
- `Already generated` / cached response returned
- Response time significantly faster than the original (no external API call)
- No double-billing

---

## Step 9 — Error path

Create a new order. Before generation fires, simulate failure (kill API key, disconnect network, force a timeout).

Verify:
- External API failure is caught cleanly
- PaymentIntent is cancelled — verify via Stripe SDK: `status = 'canceled'`
- DB row has `status = 'failed'`
- User-facing error screen shows — not a blank page or unhandled crash
- No charge on the test card

---

## Pass criteria

Adapt this list to your product — every box must be checked to call the test passed:

- [ ] Form renders correctly with correct copy and progress
- [ ] Single POST creates row and payment session
- [ ] Payment completes in test mode
- [ ] External generation API returns successfully
- [ ] Asset stored with permanent URL
- [ ] Payment captured after generation
- [ ] Confirmation screen shows deliverable link
- [ ] Recipient/delivery page renders in correct sequence
- [ ] `openedAt` (or equivalent) written on first open
- [ ] Secondary interaction (share/react/download) works
- [ ] Double-submit returns cached result, no re-billing
- [ ] Error path cancels payment and shows correct error screen

---

## If anything fails

Note the exact step, the dev.log output, and the DB row state at the time of failure. Do not guess at the fix — diagnose root cause first, then fix.

Report all results (pass/fail per criterion) at the end.
