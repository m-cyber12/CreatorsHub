import { describe, it, expect } from 'vitest';
import { ALL_TOOLS } from '../src/data/tools';
import { WORKFLOWS } from '../src/data/workflows';
import { PROJECT_TEMPLATES } from '../src/data/projectTemplates';
import { PROJECT_TYPES } from '../src/lib/projects';

const TOOLS = new Set(ALL_TOOLS.map((t) => t.slug));
const WORKFLOW_SLUGS = new Set(WORKFLOWS.map((w) => w.slug));
const TYPES = new Set<string>(PROJECT_TYPES);

describe('project templates — catalog integrity', () => {
  it('references only real catalog tool slugs', () => {
    for (const tpl of PROJECT_TEMPLATES) {
      for (const slug of tpl.toolSlugs) {
        expect(TOOLS.has(slug), `template ${tpl.id} references unknown tool "${slug}"`).toBe(true);
      }
    }
  });

  it('references only real workflow template slugs', () => {
    for (const tpl of PROJECT_TEMPLATES) {
      for (const slug of tpl.workflowSlugs) {
        expect(WORKFLOW_SLUGS.has(slug), `template ${tpl.id} references unknown workflow "${slug}"`).toBe(true);
      }
    }
  });

  it('uses valid project types and unique ids', () => {
    const ids = new Set<string>();
    for (const tpl of PROJECT_TEMPLATES) {
      expect(TYPES.has(tpl.type), `template ${tpl.id} has invalid type "${tpl.type}"`).toBe(true);
      expect(ids.has(tpl.id), `duplicate template id "${tpl.id}"`).toBe(false);
      ids.add(tpl.id);
    }
  });

  it('every template has at least two tools', () => {
    for (const tpl of PROJECT_TEMPLATES) {
      expect(tpl.toolSlugs.length, `template ${tpl.id} has too few tools`).toBeGreaterThanOrEqual(2);
    }
  });
});
