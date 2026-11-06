#!/usr/bin/env node
/* Periksa apakah semua class di file HTML ada di nusa.css.  node check-classes.mjs about.html store.html */
import fs from 'node:fs';
const css = fs.readFileSync(new URL('./assets/nusa.css', import.meta.url), 'utf8');
const have = new Set();
for (const m of css.matchAll(/\.((?:\\.|[\w-])+)/g)) have.add(m[1].replace(/\\(.)/g, '$1'));
const local = new Set(); // class yang didefinisikan di <style> halaman sendiri
let bad = 0;
for (const f of process.argv.slice(2)) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) for (const c of m[1].matchAll(/\.([\w-]+)/g)) local.add(c[1]);
  const miss = new Map();
  for (const m of html.matchAll(/class=["']([^"']*)["']/g)) {
    m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter(Boolean).forEach(c => { if (c !== 'frame' && !have.has(c) && !local.has(c) && /^[a-z-][a-z0-9:\/.-]*[a-z0-9]$/.test(c) && !/[${}]/.test(c)) miss.set(c, (miss.get(c) || 0) + 1); });
  }
  console.log(f + ':', miss.size ? 'TIDAK DITEMUKAN → ' + [...miss.keys()].join(', ') : 'semua class valid');
  bad += miss.size;
}
process.exit(bad ? 1 : 0);
