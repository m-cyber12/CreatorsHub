import type { WorkflowTemplate } from '../workflows';

export const ugcAds: WorkflowTemplate = {
  slug: 'ugc-ads',
  title: 'Product → 3 UGC Ad Variants',
  oneLiner: 'The synthetic-creator ad pipeline: a proven hook structure, a cloned or library presenter, product footage, and three cut variants ready for the ad account.',
  frequency: 'Per campaign / per week',
  nodes: [
    {
      id: 'script',
      label: 'Hook & script',
      tool: 'chatgpt',
      alternatives: ['claude'],
      input: 'Product + offer + target audience',
      output: '3 hook variants + 60–90s script',
      minutes: 20,
      instructions:
        'The ad converts at the level of the script and the offer, not the presenter. Get three structurally different hooks (a claim, a question, a contrarian take) and one body. Keep it under 90 seconds — per-minute avatar pricing makes long ads expensive.',
      prompt:
        'Write 3 distinct hook variants for a UGC-style ad: (1) a bold claim the product supports, (2) a question the target audience recognises, (3) a contrarian take against the usual advice. Then one 60–90 second body: problem → why usual solutions fail → product → proof → CTA. No hype words, no exclamation marks.',
    },
    {
      id: 'presenter',
      label: 'Presenter video',
      tool: 'heygen',
      alternatives: ['d-id', 'synthesia'],
      input: 'Best hook variant + script',
      output: 'Presenter video of the script',
      minutes: 20,
      instructions:
        'Clone yourself once for recurring campaigns — a consistent founder/spokesperson builds recognition across dozens of variants and kills the re-shoot cost. Disclosure: ad platforms and the FTC expect clear advertising disclosure for synthetic presenters. Do not disguise a synthetic creator as a real customer.',
    },
    {
      id: 'product',
      label: 'Product visuals',
      tool: 'midjourney',
      alternatives: ['adobe-express', 'runway'],
      input: 'Product shots / lifestyle frames',
      output: 'Product B-roll + callout frames',
      minutes: 15,
      instructions:
        'The product is the star, not the face: cut to real product footage or clean generated inserts at every claim. Build 2–3 feature callout frames with text in the editor. If the product is not the star in the edit, no avatar saves it.',
    },
    {
      id: 'cut',
      label: 'Edit',
      tool: 'capcut',
      alternatives: ['veed', 'descript'],
      input: 'Presenter + product + callouts',
      output: 'One master ad, captions on',
      minutes: 30,
      instructions:
        'Presenter + product + callouts, native short-form pacing, captions on. Punch-in on the hook line, cut to product footage at every claim, end on the offer screen — not a logo.',
    },
    {
      id: 'variants',
      label: 'Export 3 variants',
      tool: 'veed',
      alternatives: ['capcut'],
      input: 'Master ad',
      output: '3 platform-ready variants',
      minutes: 15,
      instructions:
        'Three variants: full script, hook-swapped (second hook first), and a 30-second cutdown. Export per platform spec. Ship all three to the ad account — the variant that wins is almost never the one you were proudest of.',
    },
  ],
  notes: [
    'The format is winning on product clarity, not presenter realism. Budget your attention accordingly.',
    'Cloning is the highest-leverage move: one clean consent-secured recording pays off across every future campaign.',
    'Track cost per finished variant, not cost per tool. Per-minute avatar pricing quietly dominates the budget if scripts drift past 90 seconds.',
  ],
};
