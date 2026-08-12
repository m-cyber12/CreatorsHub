#!/usr/bin/env node
/**
 * fix-placeholders.mjs (2026-08-08)
 * ---------------------------------------------------------------
 * Re-translates every message key whose placeholders were mangled by the
 * Google Translate bootstrap («» guillemet sentinel gets translated in some
 * languages). Uses a mixed-case alphanumeric sentinel (TK0nameTK) that
 * Google leaves untouched, then restores {name}.
 *
 * Keys fixed are ALSO removed from messages/.cache so the professional LLM
 * engine re-translates them on its next run.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const LOCALES = ['es', 'pt', 'fr', 'de', 'zh', 'ar', 'fa'];
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

const PH_RE = /\{([a-zA-Z0-9_]+)\}/g;
function phSet(s) {
  const out = new Set();
  for (const m of s.matchAll(PH_RE)) out.add(m[1]);
  return out;
}

/** Map placeholder name -> opaque index token (ZX<idx>x) and back. */
function opaqueTokenize(text) {
  const names = [...text.matchAll(PH_RE)].map((m) => m[1]);
  const sentinel = text.replace(PH_RE, (m, g) => 'ZX' + names.indexOf(g) + 'x');
  const restore = (s) => s.replace(/ZX(\d+)x/g, (m, i) => '{' + names[Number(i)] + '}');
  return { sentinel, restore };
}

async function gtx(text, target) {
  const { sentinel, restore } = opaqueTokenize(text);
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    target +
    '&dt=t&q=' +
    encodeURIComponent(sentinel);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  let out = (j?.[0] ?? []).map((x) => (Array.isArray(x) ? x[0] ?? '' : '')).join('');
  return restore(out).trim();
}

async function retry(text, target, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await gtx(text, target);
    } catch {
      await new Promise((r) => setTimeout(r, 700 * (i + 1)));
    }
  }
  return null;
}

const en = JSON.parse(readFileSync(path.join(MESSAGES, 'en.json'), 'utf8'));
const enFlat = flat(en);

async function main() {
  let total = 0;
  for (const loc of LOCALES) {
    const file = path.join(MESSAGES, `${loc}.json`);
    const locale = JSON.parse(readFileSync(file, 'utf8'));
    const locFlat = flat(locale);

    const toFix = Object.entries(enFlat).filter(([k, v]) => {
      if (!v || !v.includes('{')) return false;
      const cur = locFlat[k] ?? '';
      if (cur.includes('TK0') || cur.includes('ZX')) return true;
      const enP = phSet(v);
      const locP = phSet(cur);
      if (enP.size !== locP.size) return true;
      for (const p of enP) if (!locP.has(p)) return true;
      return false;
    });

    if (toFix.length === 0) {
      console.log(`${loc}: nothing to fix`);
      continue;
    }

    console.log(`${loc}: fixing ${toFix.length} placeholder keys…`);
    let done = 0;
    const CONCURRENCY = 5;
    for (let i = 0; i < toFix.length; i += CONCURRENCY) {
      const batch = toFix.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(async ([key, text]) => {
          const tr = await retry(text, loc);
          if (tr) {
            locFlat[key] = tr;
            done++;
          }
        })
      );
      await new Promise((r) => setTimeout(r, 100));
    }
    writeFileSync(file, JSON.stringify(unflatten(locFlat), null, 2) + '\n', 'utf8');

    const cacheFile = path.join(CACHE_DIR, `${loc}.json`);
    if (existsSync(cacheFile)) {
      const cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
      for (const [key] of toFix) delete cache[key];
      writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + '\n', 'utf8');
    }
    total += done;
    console.log(`${loc}: done=${done}`);
  }
  console.log(`\nTotal placeholder keys re-translated: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
