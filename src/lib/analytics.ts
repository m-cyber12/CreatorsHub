'use client';

/**
 * Product analytics — lightweight event tracking for the creator loop.
 *
 * Uses the already-installed @vercel/analytics (no new vendor, no new cost).
 * Every call is fire-and-forget and safe on server (no-op without window).
 * Events track USEFUL actions, never vanity page views:
 *
 *   Discovery:  tool_view, workflow_opened, updates_visit/_return_visit,
 *               search (in search-log, intent parsed server-side for admin)
 *   Decision:   compare_opened, advisor_completed, alternative_clicked
 *   Build:      stack_saved, workflow_saved/duplicated, tool_saved
 *   Return:     saved_tool_revisited, update_viewed, experiment_recorded
 *   Community:  question/answer/tip/showcase_created, helpful_vote
 *   Workspace:  stack_created/duplicated/deleted, workflow_created/...,
 *               comparison_opened/deleted, experiment_created/...,
 *               alert_acknowledged, workspace_imported
 *
 * PII rule: properties carry slugs/counts/enums only — never emails, notes,
 * or free text.
 */

import { type AnalyticsEvent } from './analyticsEvents';

export type { AnalyticsEvent };

type EventProps = Record<string, string | number | boolean | undefined>;

/** Fire-and-forget tracking. Safe to call anywhere, including server code. */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  try {
    if (typeof window === 'undefined') return;
    const clean: Record<string, string | number | boolean> = {};
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v !== undefined) clean[k] = v;
      }
    }
    // Dynamic import keeps the analytics chunk out of the critical path.
    void import('@vercel/analytics')
      .then(({ track: vaTrack }) => {
        vaTrack(event, clean);
      })
      .catch(() => undefined);
    // First-party mirror (P4): same event, same clean props, no identifiers.
    // Powers the admin activity dashboard without any new vendor.
    try {
      void fetch('/api/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, path: window.location.pathname.slice(0, 300), props: clean }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      /* beacon must never break the product */
    }
  } catch {
    /* analytics must never break the product */
  }
}
