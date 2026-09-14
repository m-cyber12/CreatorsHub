#!/usr/bin/env node
/**
 * Clear all news - run with: node scripts/clear-all-news.mjs
 * Requires env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * Or set them in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let url = process.env.SUPABASE_URL;
let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Try to read from .env.local if not in env
if (!url || !key) {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    for (const line of envFile.split('\n')) {
      const [k, ...v] = line.split('=');
      if (!k) continue;
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (k.trim() === 'SUPABASE_URL' && !url) url = val;
      if (k.trim() === 'SUPABASE_SERVICE_ROLE_KEY' && !key) key = val;
      if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL' && !url) url = val;
    }
  } catch {}
}

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Set them in env or .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

console.log('Deleting all news_comments...');
const { error: cErr, count: cCount } = await supabase.from('news_comments').delete().gte('created_at', '1970-01-01');
if (cErr) console.error('Comments delete error:', cErr.message);
else console.log(`Deleted comments (or truncated)`);

console.log('Deleting all news_items...');
const { error, count } = await supabase.from('news_items').delete().gte('created_at', '1970-01-01');
if (error) {
  console.error('Delete error:', error.message);
  console.log('Trying batch delete...');
  const { data: all } = await supabase.from('news_items').select('slug').limit(1000);
  if (all) {
    for (const r of all) {
      await supabase.from('news_items').delete().eq('slug', r.slug);
    }
    console.log(`Batch deleted ${all.length} items`);
  }
} else {
  console.log(`Deleted news_items`);
}

console.log('Done - news should be empty now');
