-- funnel.sql — health check queries for this project
-- CONFIGURE: replace placeholder event names with your project's actual events.
-- Run via Neon console or ask Copilot: "run funnel report" (uses mcp_neon_run_sql).
-- Each query is standalone — run individually or as a batch.

-- ── Full event counts by day ─────────────────────────────────────────────────
-- Shows all tracked events. Good for spotting traffic spikes and dead days.
SELECT name, COUNT(*), DATE(created_at)
FROM events
GROUP BY 1, 3
ORDER BY 3 DESC, 2 DESC;

-- ── Primary conversion funnel ────────────────────────────────────────────────
-- CONFIGURE: replace step_1_event / step_2_event with your actual funnel steps.
-- Example: 'checkout_initiated' → 'payment_captured'
SELECT
  COUNT(CASE WHEN name = 'step_1_event' THEN 1 END) AS step_1,
  COUNT(CASE WHEN name = 'step_2_event' THEN 1 END) AS step_2,
  ROUND(
    COUNT(CASE WHEN name = 'step_2_event' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN name = 'step_1_event' THEN 1 END), 0) * 100,
    1
  ) AS conversion_pct
FROM events;

-- ── Engagement rate ──────────────────────────────────────────────────────────
-- CONFIGURE: replace with your engagement events.
-- Example: demo_played → checkout_initiated
SELECT
  COUNT(CASE WHEN name = 'top_of_funnel_event' THEN 1 END) AS top_of_funnel,
  COUNT(CASE WHEN name = 'engagement_event'    THEN 1 END) AS engaged
FROM events;

-- ── Sessions with multiple events ────────────────────────────────────────────
-- How many sessions hit more than one tracked event (signals real intent, not bots).
SELECT
  session_id,
  COUNT(*) AS event_count,
  array_agg(name ORDER BY created_at) AS event_sequence
FROM events
WHERE session_id IS NOT NULL
GROUP BY session_id
HAVING COUNT(*) > 1
ORDER BY event_count DESC
LIMIT 20;
