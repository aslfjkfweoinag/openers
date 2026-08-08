#!/usr/bin/env node
// Look a name up from the terminal.
//
//   node cli.js Emma
//   node cli.js Emma --more          # a different ten
//   node cli.js Emma --only=pun,wordplay
//   node cli.js Emma --plain         # no colour, no numbering — easy to pipe

import { lookup, search, TOTAL } from './src/roster.js';
import { linesFor, normalizeName } from './src/engine.js';

const argv = process.argv.slice(2);
const flags = new Map(
  argv.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split('=');
    return [k, v ?? true];
  }),
);
const query = argv.filter((a) => !a.startsWith('--')).join(' ');

if (!query || flags.has('help')) {
  console.log(`
Opening lines by name — ${TOTAL} names.

  node cli.js <name> [--more] [--only=pun,wordplay,playful,question,sincere,data]
                     [--max-cheese=N] [--count=N] [--plain]
`);
  process.exit(query ? 0 : 1);
}

const name = normalizeName(query);
const entry = lookup(name);

const opts = { round: flags.has('more') ? 1 + Math.floor(Math.random() * 5) : 0 };
if (typeof flags.get('only') === 'string') opts.categories = flags.get('only').split(',');
if (flags.has('max-cheese')) opts.maxCheese = Number(flags.get('max-cheese'));
if (flags.has('count')) opts.count = Number(flags.get('count'));

const out = linesFor(name, entry || {}, opts);
const plain = flags.has('plain');
const dim = (s) => (plain ? s : `\x1b[2m${s}\x1b[0m`);
const bold = (s) => (plain ? s : `\x1b[1m${s}\x1b[0m`);

if (!plain) {
  const kind = entry
    ? `${entry.gender === 'f' ? 'girls’ name' : entry.gender === 'm' ? 'boys’ name' : 'unisex'} · about #${entry.rank} in America`
    : 'not in the top 2,000 — these are built from the letters and sounds';
  console.log(`\n${bold(out.name)} ${dim(`· ${kind}`)}\n`);
}

if (!out.lines.length) {
  console.log('Nothing matches those filters. Try dropping --only.');
  process.exit(1);
}

out.lines.forEach((l, i) => {
  if (plain) {
    console.log(l.text);
  } else {
    console.log(` ${String(i + 1).padStart(2)}. ${l.text}`);
    console.log(`     ${dim(`${l.category} · cheese ${l.cheese}/5`)}\n`);
  }
});

if (!entry && !plain) {
  const near = search(name, 3);
  if (near.length) console.log(dim(`Did you mean: ${near.map((n) => n.name).join(', ')}?\n`));
}
