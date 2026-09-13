// Validates that every message key referenced in the code exists in messages/en.json.
// Run: node scripts/check-keys.mjs   (also part of `npm run verify`)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const en = JSON.parse(readFileSync(join(ROOT, 'messages', 'en.json'), 'utf8'));

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (e === 'node_modules' || e === '.next') continue;
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(e) && !e.endsWith('.d.ts')) acc.push(p);
  }
  return acc;
}

const files = walk(join(ROOT, 'src'));

// Resolve a possibly-dotted namespace + possibly-dotted key against en.json.
// The namespace comes FIRST (e.g. t = useTranslations('advisor.actions');
// t('label') → en['advisor']['actions']['label']).
function resolvePath(parts) {
  let node = en;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return node;
}

const problems = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!/useTranslations|getTranslations/.test(src)) continue;

  // variable → set of namespaces. A variable may legitimately hold different
  // namespaces in different scopes of the same file (e.g. `tc` used for
  // 'common' in generateMetadata and 'categories' in the component), so we
  // accept a key if it resolves under ANY of the variable's namespaces.
  const nsVar = new Map();
  for (const m of src.matchAll(
    /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*?namespace:\s*'([\w.]+)'\s*\}|'([\w.]+)')/g
  )) {
    const ns = m[2] ?? m[3];
    if (!nsVar.has(m[1])) nsVar.set(m[1], new Set());
    nsVar.get(m[1]).add(ns);
  }
  if (nsVar.size === 0) continue;

  const lineNo = (idx) => src.slice(0, idx).split('\n').length;
  for (const [v, namespaces] of nsVar) {
    // t('key') or t.raw('key') usages within this file.
    const re = new RegExp(`[^\\w.]${v}(?:\\.raw)?\\(\\s*'([^']+)'`, 'g');
    let m;
    while ((m = re.exec(src))) {
      const key = m[1];
      const ok = [...namespaces].some((ns) => resolvePath([...ns.split('.'), ...key.split('.')]) !== undefined);
      if (!ok) {
        problems.push(`${file}:${lineNo(m.index)}  [${[...namespaces].join('|')}] .${key}  (${v})`);
      }
    }
  }
}

if (problems.length) {
  console.log(`✗ ${problems.length} missing message key(s):`);
  for (const p of [...new Set(problems)]) console.log('  ' + p);
  process.exit(1);
} else {
  console.log('✓ all message keys referenced in code exist in messages/en.json');
}
