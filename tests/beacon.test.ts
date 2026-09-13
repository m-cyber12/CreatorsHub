import { describe, it, expect } from 'vitest';
import { ANALYTICS_EVENTS, isAnalyticsEvent, validateBeaconEvent } from '@/lib/analyticsEvents';

describe('analytics event catalog', () => {
  it('covers every product-loop event the platform asks for', () => {
    for (const e of [
      'tool_view',
      'advisor_completed',
      'comparison_saved',
      'comparison_opened',
      'stack_created',
      'stack_saved',
      'workflow_opened',
      'workflow_saved',
      'workflow_cloned',
      'workflow_duplicated',
      'tool_saved',
      'saved_tool_revisited',
      'updates_visit',
      'updates_return_visit',
      'question_created',
      'answer_created',
      'helpful_vote',
    ]) {
      expect(isAnalyticsEvent(e), e).toBe(true);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(ANALYTICS_EVENTS).size).toBe(ANALYTICS_EVENTS.length);
  });
});

describe('validateBeaconEvent', () => {
  it('accepts a minimal valid event', () => {
    expect(validateBeaconEvent({ event: 'tool_view' })).toMatchObject({
      ok: true,
      event: { event: 'tool_view', path: null, props: {} },
    });
  });

  it('accepts path and clean props', () => {
    const r = validateBeaconEvent({
      event: 'advisor_completed',
      path: '/en/advisor',
      props: { content: 'podcast', stages: 5, saved: true },
    });
    expect(r).toMatchObject({
      ok: true,
      event: { event: 'advisor_completed', path: '/en/advisor', props: { content: 'podcast', stages: 5, saved: true } },
    });
  });

  it('rejects unknown events and malformed payloads', () => {
    expect(validateBeaconEvent({ event: 'page_view' }).ok).toBe(false);
    expect(validateBeaconEvent({ event: 'tool_view<script>' }).ok).toBe(false);
    expect(validateBeaconEvent(null).ok).toBe(false);
    expect(validateBeaconEvent('tool_view').ok).toBe(false);
    expect(validateBeaconEvent({}).ok).toBe(false);
  });

  it('rejects bad paths', () => {
    expect(validateBeaconEvent({ event: 'tool_view', path: 'https://evil/x' }).ok).toBe(false);
    expect(validateBeaconEvent({ event: 'tool_view', path: '/x'.repeat(200) }).ok).toBe(false);
    expect(validateBeaconEvent({ event: 'tool_view', path: 42 }).ok).toBe(false);
  });

  it('rejects oversized or mistyped props', () => {
    expect(validateBeaconEvent({ event: 'tool_view', props: { a: 'x'.repeat(201) } }).ok).toBe(false);
    expect(
      validateBeaconEvent({ event: 'tool_view', props: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, 1])) }).ok
    ).toBe(false);
    expect(validateBeaconEvent({ event: 'tool_view', props: { nested: { a: 1 } } }).ok).toBe(false);
    expect(validateBeaconEvent({ event: 'tool_view', props: [1, 2] }).ok).toBe(false);
    // undefined values are dropped, not rejected
    expect(validateBeaconEvent({ event: 'tool_view', props: { a: undefined } })).toMatchObject({
      ok: true,
      event: { props: {} },
    });
  });
});
