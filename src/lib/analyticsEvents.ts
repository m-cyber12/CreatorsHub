/**
 * Analytics event catalog (P4) — shared by the client tracker
 * (`lib/analytics.ts`) and the first-party beacon API (`/api/beacon`).
 *
 * Deliberately dependency-free and `'use client'`-free so both sides can
 * import it. Events carry slugs/counts/enums only — never emails, notes,
 * or free text (the PII rule from lib/analytics.ts).
 */

export const ANALYTICS_EVENTS = [
  // Discovery
  'tool_view',
  'compare_opened',
  'alternative_clicked',
  'workflow_opened',
  'updates_visit',
  'updates_return_visit',
  'update_viewed',
  // Decision
  'advisor_completed',
  'advisor_plan_saved',
  'compare_added',
  'compare_removed',
  'comparison_saved',
  'comparison_opened',
  'comparison_deleted',
  'go_click',
  // Build
  'stack_created',
  'stack_saved',
  'stack_duplicated',
  'stack_deleted',
  'stack_cloned',
  'stack_opened_in_builder',
  'workflow_created',
  'workflow_saved',
  'workflow_duplicated',
  'workflow_deleted',
  'workflow_cloned',
  'tool_saved',
  'tool_unsaved',
  'tool_status_changed',
  // Return
  'saved_tool_revisited',
  'experiment_recorded',
  'experiment_created',
  'experiment_status_changed',
  'experiment_deleted',
  'alert_acknowledged',
  'alerts_acknowledged_all',
  // Community
  'question_created',
  'answer_created',
  'tip_created',
  'showcase_created',
  'helpful_vote',
  'feedback_submitted',
  'benchmark_requested',
  // Workspace
  'workspace_imported',
  'preferences_saved',
  'preferences_used_in_advisor',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === 'string' && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export interface ValidBeaconEvent {
  event: AnalyticsEvent;
  path: string | null;
  props: Record<string, string | number | boolean>;
}

const MAX_PROPS = 10;
const MAX_PROP_LEN = 200;
const MAX_PATH_LEN = 300;

/**
 * Validate an inbound beacon payload. Unknown events, bad paths and
 * oversized props are rejected so the table stays small and queryable.
 */
export function validateBeaconEvent(
  input: unknown
): { ok: true; event: ValidBeaconEvent } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid payload' };
  const { event, path, props } = input as Record<string, unknown>;

  if (!isAnalyticsEvent(event)) return { ok: false, error: 'Unknown event' };

  let cleanPath: string | null = null;
  if (path !== undefined && path !== null) {
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > MAX_PATH_LEN) {
      return { ok: false, error: 'Invalid path' };
    }
    cleanPath = path;
  }

  const cleanProps: Record<string, string | number | boolean> = {};
  if (props !== undefined && props !== null) {
    if (typeof props !== 'object' || Array.isArray(props)) return { ok: false, error: 'Invalid props' };
    const entries = Object.entries(props);
    if (entries.length > MAX_PROPS) return { ok: false, error: 'Too many props' };
    for (const [k, v] of entries) {
      if (typeof k !== 'string' || k.length === 0 || k.length > 40) return { ok: false, error: 'Invalid prop key' };
      if (typeof v === 'string') {
        if (v.length > MAX_PROP_LEN) return { ok: false, error: 'Prop value too long' };
        cleanProps[k] = v;
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        if (typeof v === 'number' && !Number.isFinite(v)) return { ok: false, error: 'Invalid prop value' };
        cleanProps[k] = v;
      } else if (v !== undefined) {
        return { ok: false, error: 'Invalid prop value' };
      }
    }
  }

  return { ok: true, event: { event, path: cleanPath, props: cleanProps } };
}
