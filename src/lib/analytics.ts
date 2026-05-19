// analytics.ts — client-side event tracking
// Fires events to /api/track, which persists to the events table when Drizzle is wired.
// Named methods keep call sites typed. All calls are fire-and-forget.
// Vercel Analytics (<Analytics /> in layout.tsx) handles pageviews automatically — no config needed.

type EventProps = Record<string, string | number | boolean | undefined>;

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  let sid = sessionStorage.getItem('app_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('app_sid', sid);
  }
  return sid;
}

function track(eventName: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', eventName, props);
    return;
  }
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: eventName,
      properties: props,
      sessionId: getSessionId(),
    }),
  }).catch(() => {
    // fire-and-forget — tracking must never throw
  });
}

export const analytics = {
  track,
  newsletterSignup: (props?: { source?: string }) => track('newsletter_signup', props),
  feedbackSubmit: () => track('feedback_submit'),
  // Add named methods for each distinct user action as you build the product.
  // Keep them typed here so call sites are discoverable and autocomplete works.
};
