import { createRouteLogger } from '@/lib/route-logger';
import { track } from '@/lib/track';
import { z } from 'zod';

const log = createRouteLogger('track');

// CONFIGURE: add your project's event names here as you build.
// Only events in this set are persisted — everything else is silently dropped.
// Examples: 'demo_played', 'checkout_initiated', 'payment_captured', 'item_viewed'
const ALLOWED_EVENTS = new Set<string>([
  'newsletter_signup',
  'feedback_submit',
  // add events here
]);

const bodySchema = z.object({
  name: z.string(),
  properties: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return log.end(ctx, Response.json({ error: 'Invalid request' }, { status: 400 }));
    }

    const { name, properties, sessionId } = parsed.data;

    if (!ALLOWED_EVENTS.has(name)) {
      // Silently drop unknown events — not an error
      return log.end(ctx, Response.json({ ok: true }));
    }

    void track(name, { properties, sessionId });

    return log.end(ctx, Response.json({ ok: true }));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
