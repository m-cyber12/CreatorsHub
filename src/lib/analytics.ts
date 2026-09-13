'use client';

/**
 * Product analytics — lightweight event tracking for the creator loop.
 *
 * Uses the already-installed @vercel/analytics (no new vendor, no new cost).
 * Every call is fire-and-forget and safe on server (no-op without window).
 * Events track USEFUL actions, never vanity page views:
 *
 *   Discovery:  tool_view (via tool pages), search (already in search-log)
 *   Decision:   compare_opened, advisor_completed, alternative_clicked
 *   Build:      stack_saved, workflow_cloned, workflow_saved, tool_saved
 *   Return:     saved_tool_revisited, update_viewed, experiment_recorded
 *   Community:  question_created, answer_created, helpful_vote
 *   Workspace:  stack_created/duplicated/deleted, workflow_created/...,
 *               comparison_opened/deleted, experiment_created/...,
 *               alert_acknowledged, workspace_imported
 *
 * PII rule: properties carry slugs/counts/enums only — never emails, notes,
 * or free text.
 */

export type AnalyticsEvent =
  | 'tool_saved'
  | 'tool_unsaved'
  | 'tool_status_changed'
  | 'go_click'
  | 'stack_saved'
  | 'stack_created'
  | 'stack_duplicated'
  | 'stack_deleted'
  | 'stack_cloned'
  | 'stack_opened_in_builder'
  | 'workflow_saved'
  | 'workflow_created'
  | 'workflow_duplicated'
  | 'workflow_deleted'
  | 'workflow_cloned'
  | 'comparison_saved'
  | 'comparison_opened'
  | 'comparison_deleted'
  | 'compare_added'
  | 'compare_removed'
  | 'advisor_completed'
  | 'advisor_plan_saved'
  | 'alternative_clicked'
  | 'compare_opened'
  | 'experiment_recorded'
  | 'experiment_created'
  | 'experiment_status_changed'
  | 'experiment_deleted'
  | 'alert_acknowledged'
  | 'alerts_acknowledged_all'
  | 'workspace_imported'
  | 'saved_tool_revisited'
  | 'update_viewed'
  | 'question_created'
  | 'answer_created'
  | 'helpful_vote'
  | 'feedback_submitted'
  | 'benchmark_requested'
  | 'preferences_saved'
  | 'preferences_used_in_advisor';

type EventProps = Record<string, string | number | boolean | undefined>;

/** Fire-and-forget tracking. Safe to call anywhere, including server code. */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  try {
    if (typeof window === 'undefined') return;
    // Dynamic import keeps the analytics chunk out of the critical path.
    void import('@vercel/analytics')
      .then(({ track: vaTrack }) => {
        const clean: Record<string, string | number | boolean> = {};
        if (props) {
          for (const [k, v] of Object.entries(props)) {
            if (v !== undefined) clean[k] = v;
          }
        }
        vaTrack(event, clean);
      })
      .catch(() => undefined);
  } catch {
    /* analytics must never break the product */
  }
}
