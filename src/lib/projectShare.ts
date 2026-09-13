/**
 * Shareable project links (upgrade #24).
 *
 * A project's structure (name, type, tool slugs, workflow slugs) is encoded
 * into a compact base64url URL (?import=…). The receiving browser shows a
 * confirmation card and creates the project with one click — never
 * auto-writes. Prompts/notes/history are intentionally NOT shared.
 *
 * Decoding is strict: malformed payloads return null, unknown slugs are
 * dropped (the lib validates them again on attach), size is capped.
 */
import { ALL_TOOLS } from '@/data/tools';
import { WORKFLOWS } from '@/data/workflows';
import { PROJECT_TYPES, MAX_TOOLS_PER_PROJECT, type NoxiferaProject, type ProjectType } from '@/lib/projects';

export interface ProjectSharePayload {
  name: string;
  type: ProjectType;
  toolSlugs: string[];
  workflowSlugs: string[];
}

const MAX_NAME = 80;
const MAX_WORKFLOWS = 5;
const VALID_TOOLS = new Set(ALL_TOOLS.map((t) => t.slug));
const VALID_WORKFLOWS = new Set(WORKFLOWS.map((w) => w.slug));
const VALID_TYPES = new Set<string>(PROJECT_TYPES);

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return decodeURIComponent(escape(atob(padded)));
  } catch {
    return null;
  }
}

export function encodeProjectShare(p: NoxiferaProject): string {
  // Compact keys (n/t/ts/ws) — the payload lives in a URL.
  return toBase64Url(
    JSON.stringify({
      n: p.name.slice(0, MAX_NAME),
      t: p.type,
      ts: p.toolSlugs,
      ws: p.workflowSlugs,
    })
  );
}

export function decodeProjectShare(raw: string): ProjectSharePayload | null {
  const json = fromBase64Url(raw);
  if (!json) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  const name = typeof o.n === 'string' ? o.n.trim() : '';
  const type = typeof o.t === 'string' ? o.t : '';
  if (!name || !VALID_TYPES.has(type)) return null;
  const toolSlugs = Array.isArray(o.ts)
    ? (o.ts as unknown[]).filter((s): s is string => typeof s === 'string' && VALID_TOOLS.has(s)).slice(0, MAX_TOOLS_PER_PROJECT)
    : [];
  const workflowSlugs = Array.isArray(o.ws)
    ? (o.ws as unknown[]).filter((s): s is string => typeof s === 'string' && VALID_WORKFLOWS.has(s)).slice(0, MAX_WORKFLOWS)
    : [];
  return { name: name.slice(0, MAX_NAME), type: type as ProjectType, toolSlugs, workflowSlugs };
}
