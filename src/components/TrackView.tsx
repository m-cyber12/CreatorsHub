'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

/**
 * Fires one analytics event when mounted (page-view style events:
 * tool_view, compare_opened, workflow_opened). Renders nothing.
 * Props follow the PII rule — slugs/counts/enums only.
 */
export function TrackView({
  event,
  ...props
}: {
  event: AnalyticsEvent;
} & Record<string, string | number | boolean | undefined>) {
  useEffect(() => {
    track(event, props);
    // Fire exactly once per mount — props are mount-time facts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
