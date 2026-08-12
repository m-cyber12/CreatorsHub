#!/usr/bin/env node
/**
 * fill-missing-ui.mjs (2026-08-08)
 * ---------------------------------------------------------------
 * Bootstrap translations for every UI key that is still missing or still
 * holding English fallback text in messages/{locale}.json.
 *
 * Why: the free Gemini tier rate-limit was exhausted while completing the
 * last pages (stack-builder, calculators, benchmark, developers, compare,
 * alternatives, account, login, privacy, terms, submit, founders, jobs,
 * templates, admin). This fills the gap with the public Google Translate
 * endpoint (free, no key) so EVERY locale is complete immediately.
 *
 * Professional re-polish: keys filled here are REMOVED from messages/.cache,
 * so the next `npm run translate:ui` run with a working provider (Gemini
 * free tier, OpenAI, or OpenRouter) re-translates them with the professional
 * LLM engine and caches them. Nothing stays machine-only forever.
 *
 * Usage: node scripts/fill-missing-ui.mjs [locale...]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const LOCALES = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const ALL_LOCALES = LOCALES.length ? LOCALES : ['es', 'pt', 'fr', 'de', 'zh', 'ar', 'fa'];

const MESSAGES = 'messages';
const CACHE_DIR = path.join(MESSAGES, '.cache');

function flat(d, p = '') {
  const out = {};
  if (Array.isArray(d)) {
    d.forEach((v, i) => {
      if (v && typeof v === 'object') Object.assign(out, flat(v, `${p}${i}.`));
      else out[`${p}${i}`] = v;
    });
  } else if (d && typeof d === 'object') {
    for (const [k, v] of Object.entries(d)) {
      if (v && typeof v === 'object') Object.assign(out, flat(v, `${p}${k}.`));
      else out[`${p}${k}`] = v;
    }
  }
  return out;
}

function unflatten(flatMap) {
  // Build a tree; then convert any node whose keys are consecutive integers
  // starting at 0 into a real array (preserves message arrays like
  // benchmark.briefs.b1.measures).
  function build(node, parts, value) {
    const [head, ...rest] = parts;
    if (rest.length === 0) {
      node[head] = value;
      return;
    }
    if (typeof node[head] !== 'object' || node[head] === null) node[head] = {};
    build(node[head], rest, value);
  }
  const out = {};
  for (const [key, value] of Object.entries(flatMap)) {
    build(out, key.split('.'), value);
  }
  const arrayify = (node) => {
    for (const k of Object.keys(node)) {
      if (node[k] && typeof node[k] === 'object') node[k] = arrayify(node[k]);
    }
    const keys = Object.keys(node);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      const nums = keys.map(Number);
      if (Math.max(...nums) === nums.length - 1) {
        const arr = nums.sort((a, b) => a - b).map((i) => node[i]);
        for (const k of keys) delete node[k];
        return arr;
      }
    }
    return node;
  };
  return arrayify(out);
}

const PLACEHOLDER_RE = /\{([a-zA-Z0-9_]+)\}/g;

async function gtxTranslate(text, target) {
  const sentinel = text.replace(PLACEHOLDER_RE, '«$1»');
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    target +
    '&dt=t&q=' +
    encodeURIComponent(sentinel);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  let out = (j?.[0] ?? []).map((x) => (Array.isArray(x) ? x[0] ?? '' : '')).join('');
  out = out.replace(/«([a-zA-Z0-9_]+)»/g, '{$1}');
  return out.trim();
}

async function translateWithRetry(text, target, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await gtxTranslate(text, target);
    } catch {
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return null;
}

const en = JSON.parse(readFileSync(path.join(MESSAGES, 'en.json'), 'utf8'));
const enFlat = flat(en);

async function main() {
  let totalFilled = 0;
  const cacheDirCreated = existsSync(CACHE_DIR);

  for (const loc of ALL_LOCALES) {
    const file = path.join(MESSAGES, `${loc}.json`);
    const locale = JSON.parse(readFileSync(file, 'utf8'));
    const locFlat = flat(locale);

    const toFill = Object.entries(enFlat).filter(
      ([k, v]) => v && v.trim() && (locFlat[k] === undefined || locFlat[k] === v)
    );

    if (toFill.length === 0) {
      console.log(`${loc}: nothing to fill`);
      continue;
    }

    console.log(`${loc}: filling ${toFill.length} keys…`);
    let done = 0;
    let failed = 0;

    // Concurrency ~5, one HTTP request per key.
    const worker = async (items) => {
      const results = await Promise.all(
        items.map(async ([key, text]) => {
          const tr = await translateWithRetry(text, loc);
          if (tr) {
            locFlat[key] = tr;
            done++;
          } else {
            failed++;
          }
        })
      );
      return results;
    };

    const CONCURRENCY = 5;
    for (let i = 0; i < toFill.length; i += CONCURRENCY) {
      await worker(toFill.slice(i, i + CONCURRENCY));
      await new Promise((r) => setTimeout(r, 120));
    }

    writeFileSync(file, JSON.stringify(unflatten(locFlat), null, 2) + '\n', 'utf8');
    totalFilled += done;

    // Remove cache entries for filled keys so the professional engine
    // re-translates (and caches) them on its next run.
    if (cacheDirCreated) {
      const cacheFile = path.join(CACHE_DIR, `${loc}.json`);
      if (existsSync(cacheFile)) {
        const cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
        for (const [key] of toFill) delete cache[key];
        writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + '\n', 'utf8');
      }
    }

    console.log(`${loc}: done=${done} failed=${failed}`);
  }

  console.log(`\nTotal keys filled: ${totalFilled}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
