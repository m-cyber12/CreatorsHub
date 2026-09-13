/**
 * Noxifera Tool Playbooks — Roadmap §9.
 * Hand-written, opinionated "how to actually use this tool" guides for the
 * flagship tools. Content is editorial (English-first), like the outcome
 * guides; chrome is i18n.
 */

import { opusclip } from './playbook-entries/opusclip';
import { descript } from './playbook-entries/descript';
import { elevenlabs } from './playbook-entries/elevenlabs';
import { capcut } from './playbook-entries/capcut';
import { runway } from './playbook-entries/runway';

export interface PlaybookSection {
  title: string;
  body: string;
  tip?: string;
}

export interface Playbook {
  slug: string; // matches the tool slug
  title: string;
  oneLiner: string;
  bestFor: string[];
  setup: PlaybookSection[];
  workflow: PlaybookSection[];
  proMoves: PlaybookSection[];
  mistakes: string[];
  faq: { q: string; a: string }[];
}

export const PLAYBOOKS: Playbook[] = [opusclip, descript, elevenlabs, capcut, runway];

export function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}
