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

1. **`withCanonicalOrigin` wrapper** in `app/api/auth/[...path]/route.ts` (above)

2. **`NEXT_PUBLIC_SITE_URL`** set in Vercel environment variables to the canonical production URL. No trailing slash. Example: `https://yourproject.app`. Without this, `withCanonicalOrigin` is a no-op.

3. **`trusted_origins` in the Neon DB** — after creating the Neon Auth project, run:
   ```sql
   UPDATE neon_auth.project_config
   SET trusted_origins = '["https://yourproject.app", "https://www.yourproject.app"]'::jsonb
   WHERE project = 'your-project-name';
   ```
   `allow_localhost` defaults to `true` — no change needed for local dev.
