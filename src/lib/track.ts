// track.ts — server-side event persistence stub
// Default behavior: dev logs to console, prod is a no-op.
//
// To activate persistent event storage (requires Drizzle + Neon):
//   1. Add DATABASE_URL to .env.local
//   2. npm install drizzle-orm @neondatabase/serverless drizzle-kit
//   3. Add an `events` table to src/lib/schema.ts
//   4. Create src/lib/db.ts (Drizzle client with neon() driver)
//   5. Run `npx drizzle-kit push` to create the table in Neon
//   6. Replace this stub body with: await db.insert(events).values({ ... })
//
// The /api/track route and analytics.ts are already wired — only this file needs changing.

export interface TrackOpts {
  properties?: Record<string, unknown>;
  sessionId?: string;
  // Add entity FK fields when you have a data model, e.g.:
  // orderId?: string;
  // userId?: string;
}

export async function track(name: string, opts?: TrackOpts): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[track]', name, opts);
    return;
  }
  // no-op until Drizzle is wired — events silently dropped in production
}
