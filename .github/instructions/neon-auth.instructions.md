---
applyTo: '**/auth/**'
---

# Neon Auth — Required Auth Route Pattern

If `@neondatabase/auth` is installed, the auth proxy route at `app/api/auth/[...path]/route.ts` **must NOT be a plain re-export**. It must wrap every HTTP method with `withCanonicalOrigin()`.

## Why

Node.js 22's `fetch` (undici) automatically adds `sec-fetch-mode: cors` on cross-origin server-side requests. The SDK's proxy forwards this header to Neon Auth's upstream server, which rejects it with `INVALID_ORIGIN` (HTTP 403) — even when the origin is registered in `trusted_origins`. This only fails in production (Node.js 22 on Vercel). Local dev works because `allow_localhost` bypasses origin checks. Neon has marked this as "not planned" to fix upstream (GitHub issue #66 in neondatabase/neon-js).

## The required route pattern

```typescript
import { auth } from '@/lib/auth/server';
import type { NextRequest } from 'next/server';

const { GET: _GET, POST: _POST, PUT: _PUT, DELETE: _DELETE, PATCH: _PATCH } = auth.handler();

// Rewrites Origin to the canonical app URL before proxying to Neon Auth.
// Required: Node.js 22 undici adds sec-fetch-mode: cors on cross-origin
// server-side fetches, which Neon Auth rejects as INVALID_ORIGIN.
function withCanonicalOrigin(request: NextRequest): Request {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!appUrl) return request;

  const headers = new Headers(request.headers);
  headers.set('origin', appUrl);
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    duplex: 'half',
  } as RequestInit);
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  return _GET(withCanonicalOrigin(request), { params: Promise.resolve(params) });
}
export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  return _POST!(withCanonicalOrigin(request), { params: Promise.resolve(params) });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  return _PUT!(withCanonicalOrigin(request), { params: Promise.resolve(params) });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  return _DELETE!(withCanonicalOrigin(request), { params: Promise.resolve(params) });
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  return _PATCH!(withCanonicalOrigin(request), { params: Promise.resolve(params) });
}
```

## Never use the plain re-export

```typescript
// ❌ WRONG — causes INVALID_ORIGIN (403) in production on Node.js 22
export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
```

## Three things required for auth to work in production

### 1. `withCanonicalOrigin` wrapper
Use the route handler above. Do not simplify it back to a re-export.

### 2. Environment variables
Add these to `.env.local` and to Vercel environment variables:

```bash
# From the Neon console → your project → Auth tab
NEON_AUTH_BASE_URL=https://<endpoint-id>.neonauth.<region>.aws.neon.tech/<db>/auth

# Any random 32+ char string — generate one:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEON_AUTH_COOKIE_SECRET=your_32_plus_char_secret_here

# Your canonical production URL — no trailing slash
# withCanonicalOrigin() reads this to rewrite the Origin header
NEXT_PUBLIC_SITE_URL=https://yourproject.app
```

All three are stubbed in `.env.local.example`. Copy them to `.env.local` and fill in real values before testing auth locally.

**Important:** `NEXT_PUBLIC_SITE_URL` must be added to Vercel environment variables *before* the deployment runs. If you add it after a deploy, trigger a fresh redeploy — the value is baked in at build time.

### 3. `trusted_origins` — use the Neon console UI

**Always use the Neon console UI to add trusted origins** — not direct SQL.

Neon Auth's managed service may not immediately pick up writes to `neon_auth.project_config` via SQL. The console UI is the reliable path:

> Neon console → your project → **Auth** tab → **Trusted origins** → add `https://yourproject.app` and `https://www.yourproject.app`

Add both `www.` and non-`www.` variants. `allow_localhost` is on by default — no change needed for local dev.

## Neon Auth user store vs. your DB tables

Neon Auth manages its own user store separately from your application tables (`properties`, `yard_properties`, etc.).

- Deleting rows from your DB tables does **not** remove the user from Neon Auth.
- If you need to re-test a fresh signup with the same email, delete the user from: Neon console → Auth → Users.
- Stale auth users won't cause `INVALID_ORIGIN` — that's an origin header issue. They can cause "user already exists" errors if the same email tries to sign up again.
