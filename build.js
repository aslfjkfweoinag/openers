// Build the shipped artefacts. Run: node build.js
//
//   data/openers.json  every name with its ten lines — the database itself
//   data/openers.csv   the same thing for a spreadsheet
//   data/names.json    just the roster (name, gender, rank)
//   dist/openers.html  one self-contained file that runs offline, from file://
//
// The single-file build works by concatenating the source modules and stripping
// their import/export syntax. Imports may wrap across lines; exports must stay a
// plain `export const`/`export function` prefix. assertBundled() fails the build
// the moment either assumption stops holding — which it already has once.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_NAMES, TOTAL } from './src/roster.js';
import { linesFor } from './src/engine.js';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p), 'utf8');

function write(rel, body) {
  const path = join(here, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  const kb = (Buffer.byteLength(body) / 1024).toFixed(0);
  console.log(`  ${rel.padEnd(20)} ${String(kb).padStart(6)} KB`);
}

// --- the database ------------------------------------------------------------
console.log(`Generating lines for ${TOTAL} names…`);

const db = ALL_NAMES.map((entry) => ({
  name: entry.name,
  gender: entry.gender,
  rank: entry.rank,
  lines: linesFor(entry.name, entry).lines.map((l) => ({
    text: l.text,
    category: l.category,
    cheese: l.cheese,
  })),
}));

const thin = db.filter((d) => d.lines.length < 10);
if (thin.length) throw new Error(`${thin.length} names produced fewer than 10 lines, e.g. ${thin[0].name}`);

console.log('\nWriting:');

write('data/openers.json', JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  total: db.length,
  linesPerName: 10,
  note: 'Ranks are approximate, reconstructed from recent SSA baby-name popularity.',
  names: db,
}, null, 1));

write('data/names.json', JSON.stringify(
  ALL_NAMES.map((e) => ({ name: e.name, gender: e.gender, rank: e.rank })),
));

// Flat shape for the iOS Shortcut: lowercase key -> array of line strings.
// Shortcuts' "Get Value for Key" is case-sensitive and has no notion of nested
// objects worth fighting, so the file it reads is as dumb as possible.
// Girls' names are the stated use case and half the parse time, so that file
// gets the plain name — it's the one that goes on the phone.
const girls = {};
for (const row of db) if (row.gender !== 'm') girls[row.name.toLowerCase()] = row.lines.map((l) => l.text);
write('dist/iphone/openers.json', JSON.stringify(girls));

const everyone = {};
for (const row of db) everyone[row.name.toLowerCase()] = row.lines.map((l) => l.text);
write('dist/iphone/openers-all-2000.json', JSON.stringify(everyone));

console.log(`  ${'  ↳ names on phone'.padEnd(20)} ${String(Object.keys(girls).length).padStart(6)} / ${Object.keys(everyone).length}`);

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csv = ['﻿name,gender,rank,line_number,category,cheese,line'];
for (const row of db) {
  row.lines.forEach((l, i) => {
    csv.push([row.name, row.gender, row.rank, i + 1, l.category, l.cheese, l.text].map(csvCell).join(','));
  });
}
write('data/openers.csv', csv.join('\n') + '\n');

// --- the single-file app -----------------------------------------------------
const MODULES = ['src/names.js', 'src/lexicon.js', 'src/knowledge.js', 'src/engine.js', 'src/roster.js'];

function stripModuleSyntax(src, file) {
  const lines = src.split('\n');
  const kept = [];
  // Imports may span several lines. Drop from the `import` keyword through to
  // the line that closes it, rather than assuming one import is one line —
  // assertBundled below caught exactly that assumption breaking.
  let inImport = false;
  for (const line of lines) {
    if (inImport) {
      if (/from\s+['"].*['"];?\s*$/.test(line)) inImport = false;
      continue;
    }
    if (/^\s*import\s/.test(line)) {
      if (!/from\s+['"].*['"];?\s*$/.test(line)) inImport = true;
      continue;
    }
    kept.push(line);
  }
  return kept
    .map((line) => {
      if (/^\s*export\s*\{/.test(line)) return '';
      return line.replace(/^(\s*)export\s+(const|let|function|class)\s/, '$1$2 ');
    })
    .join('\n')
    .concat(`\n// ── end ${file} ──\n`);
}

function assertBundled(code) {
  const leftovers = code
    .split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => /^\s*(import|export)\s/.test(line));
  if (leftovers.length) {
    throw new Error(`bundle still has module syntax at line ${leftovers[0][0]}: ${leftovers[0][1].trim()}`);
  }
}

const bundle = MODULES.map((f) => stripModuleSyntax(read(f), f)).join('\n');
assertBundled(bundle);

const MOUNT = 'window.mountApp({ linesFor, normalizeName, lookup, search, ROSTER, ALL_NAMES, TOTAL });';
const inlineApp = `<script>\n(function(){\n${bundle}\n${MOUNT}\n})();\n</script>`;

const source = read('index.html');

// 1. The offline file: a whole document with everything inlined, openable from
//    file:// with no server and no network.
const standalone = source
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${read('styles.css')}\n</style>`)
  .replace('<script src="ui.js"></script>', `<script>\n${read('ui.js')}\n</script>`)
  .replace(/<script type="module">[\s\S]*?<\/script>/, inlineApp)
  // Nothing external survives, so the links to files that no longer resolve go.
  .replace(/^.*<link rel="(manifest|apple-touch-icon|icon)".*$\n?/gm, '');

if (standalone.includes('type="module"')) throw new Error('the module script tag survived the inlining');
if (/<link[^>]+href="(styles\.css|manifest)/.test(standalone)) throw new Error('standalone still points at an external file');
write('dist/openers.html', standalone);

// 2. The artifact body: same app, but the host supplies <html>/<head>/<body>,
//    so this is markup only.
const between = source.match(/<!--APP-START-->([\s\S]*?)<!--APP-END-->/);
if (!between) throw new Error('index.html is missing its APP-START/APP-END markers');

write('dist/artifact.html', [
  '<title>Opening lines, by name</title>',
  `<style>\n${read('styles.css')}\n</style>`,
  between[1].trim(),
  `<script>\n${read('ui.js')}\n</script>`,
  inlineApp,
  '',
].join('\n'));

// 3. The GitHub Pages drop: six flat files, no subfolders, so the whole thing
//    can be dragged into a repo in one go. Same inlined app as the offline
//    build, but keeping the manifest/icon links and registering the worker, so
//    it installs to a home screen and runs with no signal after the first open.
const pageIndex = source
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${read('styles.css')}\n</style>`)
  .replace('<script src="ui.js"></script>', `<script>\n${read('ui.js')}\n</script>`)
  .replace(/<script type="module">[\s\S]*?<\/script>/, `${inlineApp}
<script>
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
</script>`);

if (pageIndex.includes('type="module"')) throw new Error('the module script tag survived the Pages inlining');
for (const needed of ['manifest.webmanifest', 'icon-180.png', 'icon.svg']) {
  if (!pageIndex.includes(needed)) throw new Error(`Pages index lost its link to ${needed}`);
}
write('dist/pages/index.html', pageIndex);

// Everything is inlined into index.html, so the worker caches far less than the
// source-tree one. Generated rather than copied for exactly that reason.
write('dist/pages/sw.js', `/* Offline cache for the published page. Stale-while-revalidate: answer from
 * cache so it opens with no signal, then refresh in the background so a new
 * upload lands on the next launch instead of being pinned forever. */
const CACHE = 'openers-pages-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
`);

for (const asset of ['manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png']) {
  writeFileSync(join(here, 'dist/pages', asset), readFileSync(join(here, asset)));
}
console.log(`  ${'dist/pages/'.padEnd(20)} ${'6 files'.padStart(6)} — the drag-and-drop bundle`);

console.log('\nDone.');
