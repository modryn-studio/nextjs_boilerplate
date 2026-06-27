# Copilot Setup — How To Use

> Get live fast. Track before you build. Distribute before you polish. One killer feature, not ten mediocre ones.

---

## Phase 1: Foundation

One-time setup. Run these in order when starting a new project.

1. Create a blank repo on GitHub
2. Create a project folder locally and clone this boilerplate into it:
   ```powershell
   git clone https://github.com/modryn-studio/nextjs_boilerplate [YOUR_PROJECT_NAME]
   cd [YOUR_PROJECT_NAME]
   ```
3. Reset git history, wire to the new repo, and create the `dev` branch — one script, run once:
   ```powershell
   $repo = Read-Host "Repo name (e.g. my-project)"
   Remove-Item -Recurse -Force .git
   git init -b main
   git add -A
   git commit -m "init"
   git remote add origin "https://github.com/modryn-studio/$repo"
   git push -u origin main
   git checkout -b dev
   git push -u origin dev
   ```
   From this point: never commit directly to `main`. Build on `dev`. Cut short-lived `feat/*` branches from `dev` for larger features if you want isolation. When `dev` is stable and shippable, open a PR to merge into `main` (= a release).
4. Run `npm install`
5. **Source docs** — `context.md` and `brand.md` are pre-written from /new-idea or /clone-and-own in modryn-hq. Drop them into the project root, replacing the stubs.
6. Type `/setup` — reads source docs, fills in `copilot-instructions.md` + `src/config/site.ts`. Start the dev server (`Ctrl+Shift+B`) and check the basic landing page in your browser. **If `/setup` blocks on a TBD:** return to modryn-hq, run `/threads design` (Jobs → Rams → Ogilvy) to resolve the open item, update `brand.md` with the approved value, then re-run `/setup`.
7. Build the logomark — three components in order:
   - **Icon mark** — generate via Nanobanana 2 in Recraft.ai (thinking mode ON for geometric precision). Vectorize in Recraft, export as PNG 1024×1024 with transparent background. Save to `public/brand/logomark.png`. Pad if needed: `magick logomark.png -gravity center -background none -extent 1024x1024 logomark.png`
   - **Wordmark** — code as an SVG component using the brand font, exact color, and letter-spacing from `brand.md`. Never AI-generate the wordmark.
   - **Lockup** (icon + wordmark together) — compose in code.
8. Run `/assets` — generates all favicons and icons. For the banner, the script will tell you it's missing and give you the commands. **Before running those commands: invoke Rams** (`modryn-hq/team/system-prompts/dieter-rams.md`) for a banner spec — font, mark size, tagline, color assignments. Then update the BANNER CONFIG block in `scripts/generate-banner.mjs`, install `@fontsource/<your-font>`, and run `npm run generate-banner`. Commit. Verify the favicon shows in the browser tab.
9. Run `/deps` — validates all dependencies against live docs, surfaces breaking API changes.

> After setup, **never edit `copilot-instructions.md` or `site.ts` directly**. Edit the source docs → run `/update`.

---

## Phase 2: Build the Landing Page

Every project that reaches this HOW-TO is already greenlit — /new-idea or /clone-and-own in modryn-hq produced the Ogilvy brief, Rams visual direction, and brand.md copy. The landing page ships before product code. Deploy to your domain immediately — every day it's live, Google is indexing. Hold the public announcement until the first working product milestone ships.

**Optional — modrynstudio.com footprint:**

1. Run `/tool` — registers the project with `status: "building"`. Defer if you're not actively maintaining the site.
2. Run `/log` — first build log post. Defer for the same reason.

> If you run these: merge the PRs and move on immediately. Don't let this become a distraction.

**Build the landing page:**

3. Build from what you already have — don't invent anything new:
   - **Hero, subline, CTA:** `brand.md` → Copy Examples section
   - **Visual register:** Rams' approved critique — `projects/[slug]/deliverables/critiques/`
   - **Advertising brief:** Ogilvy — `projects/[slug]/deliverables/briefs/`

4. Wire early access signup — email capture, no price gate. CTA language from `brand.md`.
   - Form with one email input → POST `/api/waitlist` → validate → `sendNotification()` via `src/lib/notify.ts` (nodemailer Gmail SMTP — already wired in the boilerplate)
   - Store the email in a `waitlist` table in Neon if DB is already set up; otherwise log + notify is enough until the DB is wired
   - No Resend. No external audience management service. Founder notification = Gmail SMTP.

5. Deploy. Committed products ship to their own domain:
   1. Deploy to Vercel (Pro plan — Hobby prohibits charging money)
   2. Point DNS to Vercel
   3. Set `mode: standalone-domain` and `url:` in `context.md` → run `/update`

**After it's live:**

6. **Private first — no public announcement yet.** Share the URL via direct links only (DMs to targeted community members). Your firsthand user research was already done in the gold standard step in modryn-hq — you don't need conversations with strangers to validate demand. The gold standard IS the validation.

7. **Go public when the first functional step ships.** Announce on socials, submit to Product Hunt, post in communities — only after something real works, not just the landing page. That's when attention converts to signups that matter.

---

## Phase 3: Instrument & Distribute

You have a live URL. Now wire tracking and do your first distribution push before building the core product. This is counterintuitive but critical — you want data from day one.

1. Run `/seo` — generates missing SEO files, audits the codebase, walks through Search Console + Bing setup. Needs a live URL.
2. Run `/launch` — distribution checklist. Fixes sharing hooks, social footer, OG tags, and share-on-X hooks.
3. Turn on **Vercel Analytics** — add `<Analytics />` to `layout.tsx` if not already present.
4. Run **`@check`** — quality gate on your setup. Scans for bugs, secrets, code issues → auto-fixes what it can → runs lint + build → commits fixes. Never pushes. Takes ~10 minutes — let it run.
5. Switch to **modryn-studio-v2** and run `/social` — generates launch copy (X, Reddit, shipordie) using v2 voice rules. Post on your networks.

> `/deploy` and `/social` are modryn-studio-v2 commands. They only work when modryn-studio-v2 is open in VS Code.

At this point you have: a live site, tracking, SEO filed, a public tool listing, a log post, and social distribution. All before writing a single line of core product code.

---

## Phase 4: Build the Core

You're here because demand is confirmed. Wire the complete flow end-to-end before polishing any single piece. One real order through the whole system beats a perfect intake with no delivery.

Open `context.md` → find `## Minimum Money Loop` → keep it visible. Every build session, ask: _does this work advance the loop, or is it polish?_

### Dev Loop

- `Ctrl+Shift+B` — starts the dev server, pipes output to `dev.log`. Tell Copilot **"check logs"** at any point.
- Edit `context.md` or `brand.md` → run `/update` immediately. Skipping this means Copilot works off stale context.
- Run `/deps` if you're unsure whether a package is current.

### Before a Major Implementation

**Scan GitHub for reference implementations.** Before building any non-trivial feature — backend service, data pipeline, integration, complex UI pattern — spend 20 minutes reading 2-3 open-source repos that have solved a similar problem. You're not looking for code to copy. You're looking for patterns to borrow and mistakes to skip.

How to search: use `mcp_github_search_repositories` with short 2-3 word queries (multi-word phrases return zero results). Read the root directory listing, then `README.md` + the main entry file.

What to extract:

- **API / interface shape** — how do callers start a job, poll for progress, handle errors?
- **Data/state schema** — what does the data flowing through the system look like?
- **Core algorithm or pattern** — what's the non-obvious decision at the center of this thing?
- **What they skipped** — scope they punted on that you might need (or should also skip)

Drop your findings in a `docs/` note before writing a line of code. One file, bullet points. Drag it into chat or reference it with `#file:docs/your-reference.md` at the start of the build session.

Run `/validate` with a focus area — **Agent mode only**:

1. Type `/validate` in chat — VS Code will show a dropdown. Select it so the prompt file actually loads.
2. In the **same message**, after the slash command, add your focus question.
3. Submit. The agent runs the full prompt + your question with live web search.

Example: `/validate — validate my approach to [feature]. Is this the right pattern for this user type?`

> If the output looks entirely offline (no fetched URLs, no live competitor data cited): you're in Ask or Plan mode. Switch to Agent and run again.

### When You're Stuck

1. **Research** — competitor analysis. Screenshot their flows. Read their reviews. Share with Copilot.
2. **Revalidate** — run `/validate` focused on the area you're stuck on.
3. **Plan** — switch to **Plan** mode. Hash out the architecture before switching back to Agent to build.
4. **Roadmap** — share your research + ask Copilot for a mini roadmap. Implement one step at a time.

### After a Major Implementation

Run **`@check`** as a quality gate. Then push.

---

## Phase 5: Iterate

You have a working core feature. Now loop: ship → validate → distribute → repeat.

1. Run **`@check`** — quality gate after implementation.
2. Run `/polish` — UI consistency sweep. Ensures all interactive elements use shared primitives, brand tokens are applied consistently, responsive spacing is correct, mobile keyboard safety is wired, and touch targets meet minimums.
3. Run `/tool` — update the tool listing (flip status to `live` when ready). Merge the PR.
4. Run `/log` — document what you shipped. Each log post is content and distribution. Merge the PR.
5. Run `/social` (from modryn-studio-v2) if the milestone is worth announcing.
6. **Repeat Phase 4–5** until your first paying user.

**Milestones that earn a `/log` post:**

- Core feature working end-to-end
- First real order
- First stranger pays
- Major pivot or architecture decision
- Beta launch

**When to run `/validate` again:**

- Before adding a second feature (are you sure the first one is done?)
- After significant competitor research
- When your positioning or pricing might need to shift

> The goal of Phase 5 is not perfection — it's getting to one stranger paying and sharing the result. Everything else is noise.

---

## Quick Reference

### Reusable vs. One-Time Commands

| Command        | Frequency | What it does                                                                                                                                                          |
| -------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/setup`       | Once      | Fills `copilot-instructions.md` + `site.ts` from source docs                                                                                                          |
| `/update`      | Reusable  | Cascades source doc edits into derived files                                                                                                                          |
| `/validate`    | Reusable  | Reads `context.md`, `brand.md`, `strategy.md` + web-searches to validate. **Agent mode only.** Add a focus question in the same message.                              |
| `/assets`      | Reusable  | Generates favicons, icons, banner from logomark                                                                                                                       |
| `/tool`        | Reusable  | Registers/updates tool on modrynstudio.com (`building` → `live`)                                                                                                      |
| `/log`         | Reusable  | Drafts a build log post — run at every milestone                                                                                                                      |
| `/deps`        | Reusable  | Validates dependencies against live docs                                                                                                                              |
| `/seo`         | Once      | SEO audit + Search Console + Bing setup                                                                                                                               |
| `/launch`      | Once      | Distribution checklist: sharing hooks, OG, social prep                                                                                                                |
| `/polish`      | Reusable  | UI consistency sweep: primitives, migrations, responsive, keyboard safety, touch targets                                                                              |
| `/notify`      | Reusable  | Scans all API routes, adds founder notifications to any event that doesn't have one yet                                                                               |
| `/track`       | Reusable  | Scans all API routes and components, adds missing `track()` and `analytics.track()` calls. Updates ALLOWED_EVENTS and funnel.sql in the same pass.                   |
| `/funnel`      | Reusable  | Runs the Neon events funnel — event counts by day, conversion rates, session sequences. Flags anomalies. Shows how to add new events in 3 files.                     |
| `/email-setup` | Once      | Guided email setup: Gmail app password, Resend, notify.ts wiring, optional transactional email                                                                        |
| `@check`       | Reusable  | Quality gate: bugs, secrets, lint, build → auto-fixes, commits. Never pushes                                                                                          |
| `/test`        | Reusable  | Full e2e test of the money loop — agent executes autonomously: form, payment, generation, DB, recipient page, double-submit. Fill in CONFIGURE block first.            |
| `/issues`      | Reusable  | Syncs `docs/issues.md` from GitHub live — run before planning sessions or after a batch of issue changes                                                               |
| `@prebuild`    | Once      | Pre-build discovery: researches market, fills `context.md` + `brand.md`                                                                                               |
| `/deploy`      | Once      | Pre-deploy checklist: verifies basePath, runs build, outputs config for modryn-studio-v2 (run from this repo)                                                         |
| `/social`      | Reusable  | Generates launch/milestone copy (X, Reddit, shipordie) using voice rules — **modryn-studio-v2 only**                                                                  |

> **modryn-studio-v2 only:** `/social` exists only in that repo. Switch workspaces to run it.

### `@check` — When to Run

`@check` is a quality gate, not a one-time step. Run it at transitions:

- **End of Phase 3** — setup clean before building features? (recommended)
- **After Phase 4 implementations** — ready for users? (required)
- **Before any push you're unsure about** — best practice
- **Takes ~10 minutes** — let it run, don't interrupt

> **Before running `@check`:** Switch the chat permissions picker to **Bypass Approvals** (bottom of the Chat view, next to the model selector). This lets `@check` auto-confirm file edits and terminal commands without interrupting for approval — which is exactly what it needs to run end-to-end. Switch back to Default Approvals when done.
>
> There's no way to set this programmatically — it's a per-session UI setting only. No frontmatter field, no hook, no command can trigger it. The step is: open Chat → switch to Bypass Approvals → invoke `@check`.

### `/validate` — Focus Mode

Broad market validation is done in modryn-hq before any project reaches this HOW-TO. Use `/validate` here for focused questions during build: competitor positioning, a specific feature approach, pricing sensitivity. Always add the focus question in the same message as the command.

### VS Code Modes

| Mode      | When to use                         | How                   |
| --------- | ----------------------------------- | --------------------- |
| **Ask**   | Quick questions about your codebase | Chat → select "Ask"   |
| **Plan**  | Blueprint a feature before building | Chat → select "Plan"  |
| **Agent** | Build, edit files, run commands     | Chat → select "Agent" |

Open chat: `Ctrl+Alt+I`

### Brand Assets

Drop your logomark at `public/brand/logomark.png` (1024×1024, transparent background), then type `/assets`.

The script auto-detects whether your mark is colored or grayscale and generates the correct light/dark favicon pair.

**Banner generation (required — not auto-generated):**

The asset script does not auto-generate the banner with ImageMagick — Arial-Bold text rendering is wrong for brand work. The process every project:

1. **Invoke Rams** for a spec: font, mark size, tagline, colors
2. **Update `scripts/generate-banner.mjs` BANNER CONFIG block** with the spec values
3. `npm install --save-dev @fontsource/<your-font>` (Google Fonts serves WOFF2; Satori needs WOFF — use @fontsource)
4. `npm run generate-banner`

**Optional overrides:**

- `public/brand/logomark-dark.png` — hand-crafted dark favicon (skips auto-inversion)

**What gets generated:**

| File                      | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `public/favicon.svg`      | Primary favicon — embeds both PNGs, switches via `prefers-color-scheme` in the SVG |
| `public/icon-light.png`   | PNG fallback for browsers without SVG favicon support                              |
| `public/icon-dark.png`    | PNG fallback (dark variant)                                                        |
| `src/app/favicon.ico`     | Safari browser tab + legacy fallback — Next.js file convention                     |
| `src/app/icon.png`        | 1024×1024 — required for auto-generated webmanifest                                |
| `src/app/apple-icon.png`  | iOS "Add to Home Screen" — Next.js file convention                                 |
| `public/brand/banner.png` | README header (auto-generated if absent)                                           |

OG image is generated at build time by `src/app/opengraph-image.tsx` — not a static file.

Or run directly (requires [ImageMagick](https://imagemagick.org)):

```powershell
.\scripts\generate-assets.ps1
```

### Hooks

**Format on Save** — files are auto-formatted with Prettier on save. Requires the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (VS Code will prompt). Rules in `.prettierrc`.

### Email Setup

Two services, two jobs:

| Service                     | Job                                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| **Gmail SMTP (nodemailer)** | Founder notifications — you get an email when something happens             |
| **Resend**                  | Audience management — signups added to your contact list, tagged by project |

**Env vars to set** (copy from `.env.local.example`):

```bash
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail app password — not your account password
FEEDBACK_TO=you@gmail.com               # Where notifications land (defaults to GMAIL_USER)
RESEND_API_KEY=re_xxxx
RESEND_SEGMENT_ID=                       # optional — tags signups to a named Resend segment
RESEND_FROM_EMAIL=                       # for user-facing transactional email
NEXT_PUBLIC_SITE_URL=                    # used to build links inside emails
```

Run `/email-setup` for a guided walkthrough — checks what's set, walks through Gmail app password and Resend, wires `notify.ts` into routes that are missing notifications, and sets up transactional email templates if needed.

Run `/notify` after adding new routes to wire notifications into any event that doesn't have one yet.

### MCP Servers

MCP servers give Copilot access to external tools — Stripe, GitHub, Neon — directly from chat.

**GitHub** — install via the VS Code Extension Gallery (search "GitHub MCP"). Once installed, it connects globally. No entry needed in `.vscode/mcp.json`.

> **Don't add a `github` entry to `.vscode/mcp.json`.** The gallery extension already registers it globally. Adding it again causes duplicate GitHub servers in every project.

**Neon** — add once to your global `mcp.json` (`C:\\Users\\{you}\\AppData\\Roaming\\Code\\User\\mcp.json`):

```json
"Neon": {
  "type": "http",
  "url": "https://mcp.neon.tech/mcp",
  "headers": { "Authorization": "Bearer YOUR_NEON_API_KEY" }
}
```

Get your Neon API key at [neon.tech](https://neon.tech) → Account → API Keys.

**Stripe** — configured per-project. `scripts/stripe-mcp.js` reads `STRIPE_SECRET_KEY` from `.env.local` at startup. The key is never committed. `.vscode/mcp.json` points to this script.

To activate: open the MCP panel → start `Stripe`. To switch keys (test ↔ live), update `.env.local` and restart the `Stripe` server.

### File Map

```
.github/
├── copilot-instructions.md        ← Always-on context (derived — edit source docs, not this)
├── instructions/
│   ├── nextjs.instructions.md           ← Auto-applied to .ts/.tsx files
│   ├── seo.instructions.md              ← Auto-applied to .ts/.tsx files
│   ├── design-system.instructions.md   ← Auto-applied to .tsx files (primitives, brand tokens, responsive)
│   ├── file-writes.instructions.md     ← Applied to all files
│   └── writing.instructions.md         ← Auto-applied to .mdx files
├── agents/
│   ├── check.agent.md             ← @check agent (quality gate — reusable)
│   └── prebuild.agent.md          ← @prebuild agent (pre-build discovery)
├── prompts/
│   ├── setup.prompt.md            ← /setup (once)
│   ├── update.prompt.md           ← /update (reusable)
│   ├── validate.prompt.md         ← /validate (reusable)
│   ├── assets.prompt.md           ← /assets (reusable)
│   ├── tool.prompt.md             ← /tool (reusable)
│   ├── deps.prompt.md             ← /deps (reusable)
│   ├── log.prompt.md              ← /log (reusable)
│   ├── seo.prompt.md              ← /seo (once)
│   ├── launch.prompt.md           ← /launch (once)
│   ├── polish.prompt.md           ← /polish (reusable)
│   ├── notify.prompt.md           ← /notify (reusable)
│   ├── track.prompt.md            ← /track (reusable)
│   ├── funnel.prompt.md           ← /funnel (reusable)
│   ├── email-setup.prompt.md      ← /email-setup (once per project)
│   └── deploy.prompt.md           ← /deploy (once, modryn-app mode only)
.vscode/
├── settings.json                  ← Agent mode, formatOnSave, Prettier default formatter
├── extensions.json                ← Recommends Prettier on first open
└── mcp.json                       ← MCP server config (Stripe — reads key from .env.local)
src/config/
└── site.ts                        ← Derived — site name, URL, colors, social links (edit via /update)
src/lib/
├── cn.ts                          ← Tailwind class merge utility
├── route-logger.ts                ← API route logging (createRouteLogger)
├── analytics.ts                   ← Client-side event tracking — fires to /api/track (analytics.track)
├── track.ts                       ← Server-side event persistence stub — logs in dev, no-op in prod until Drizzle is wired
└── notify.ts                      ← Founder notifications via Gmail SMTP (sendNotification, notifyHtml)
src/app/api/track/
└── route.ts                       ← Client event ingestion — validates against ALLOWED_EVENTS whitelist
src/components/ui/
├── button.tsx                     ← Shared button primitive (3 variants, 3 sizes)
├── input.tsx                      ← Shared input primitive (forwardRef)
└── textarea.tsx                   ← Shared textarea primitive (forwardRef)
scripts/
├── generate-assets.ps1            ← Asset generator (run via /assets)
├── funnel.sql                     ← Health check queries template — configure event names, then run via Neon console or /funnel
└── stripe-mcp.js                  ← Stripe MCP wrapper — reads STRIPE_SECRET_KEY from .env.local
context.md                         ← SOURCE OF TRUTH: product, stack, routes, monetization
brand.md                           ← SOURCE OF TRUTH: voice, visuals, user types, copy
development-principles.md          ← SOURCE OF TRUTH: product philosophy (permanent)
strategy.md                        ← SOURCE OF TRUTH: monetization, distribution, launch playbook (permanent)
```

> **Tip:** To debug why a prompt or instruction isn't loading, open the Agent Debug panel: `Command Palette → Developer: Open Agent Debug Panel`. Shows system prompts, tool calls, and every customization loaded for the session. You can also type `#debugEventsSnapshot` in chat to attach a live snapshot of agent debug events directly into your message — then ask Copilot to explain what's loaded, what's missing, or why something isn't firing. Faster than reading the raw panel logs.

> **Tip:** After any session where you corrected Copilot on a boilerplate pattern, type `/create-instruction` to turn those corrections into a persistent `.instructions.md` file. Save it to `.github/instructions/` so it travels with the boilerplate. For multi-step procedures (e.g. a fix workflow), `/create-skill` packages it as a reusable runbook instead.
