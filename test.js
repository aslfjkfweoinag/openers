// Guards for the line engine. Run: node test.js
//
// The expensive checks sweep all 2000 names rather than a sample, because the
// failures that matter here are one-name failures: a single set with a leftover
// {placeholder}, or a name that rhymes with itself, is exactly what someone
// would paste into a dating app without reading it first.

import { ROSTER, ALL_NAMES, TOTAL, lookup, search } from './src/roster.js';
import { linesFor, candidatesFor, normalizeName, rhymesFor, hiddenWords, wordsInside, _internals } from './src/engine.js';
import { HIDDEN_BLOCKLIST, ALLITERATION, ACROSTIC, INSIDE_WORDS, SOUND_ENDINGS, SUBSTITUTIONS } from './src/lexicon.js';
import { GEMS } from './src/knowledge.js';

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    const problem = fn();
    if (problem) failures.push(`${name}: ${problem}`);
    else passed++;
  } catch (err) {
    failures.push(`${name}: threw ${err && err.message}`);
  }
}

const eq = (actual, expected, label) =>
  actual === expected ? null : `${label || ''} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;

// --- roster ------------------------------------------------------------------
check('roster holds exactly 2000 distinct names', () => eq(ROSTER.size, TOTAL));
check('roster target is 2000', () => eq(TOTAL, 2000));

check('every roster entry is well formed', () => {
  for (const e of ALL_NAMES) {
    if (!e.name || !/^[A-Z]/.test(e.name)) return `bad name ${JSON.stringify(e.name)}`;
    if (!['f', 'm', 'u'].includes(e.gender)) return `${e.name} has gender ${e.gender}`;
    if (!(e.rank >= 1)) return `${e.name} has rank ${e.rank}`;
  }
  return null;
});

check('lookup is case-insensitive and ignores a surname', () => {
  if (!lookup('emma')) return 'lowercase emma missed';
  if (!lookup('  EMMA  ')) return 'padded uppercase missed';
  if (lookup('Emma Watson')?.name !== 'Emma') return 'surname not dropped';
  return lookup('Zzzznotaname') === null ? null : 'unknown name should be null';
});

check('search ranks an exact match first', () => {
  const hits = search('ana');
  return hits[0]?.name === 'Ana' ? null : `got ${hits[0]?.name}`;
});

check('search finds names by prefix, most popular first', () => {
  const hits = search('emm');
  return hits[0]?.name === 'Emma' ? null : `got ${hits.map((h) => h.name).join(',')}`;
});

// --- name handling -----------------------------------------------------------
check('normalizeName fixes casing', () => eq(normalizeName('eMMa'), 'Emma'));
check('normalizeName keeps hyphenated names capitalised on both sides', () =>
  eq(normalizeName('mary-kate'), 'Mary-Kate'));
check('normalizeName handles an apostrophe', () => eq(normalizeName("o'brien"), "O'Brien"));
check('normalizeName takes only the first word', () => eq(normalizeName('Ella Fitzgerald'), 'Ella'));
check('normalizeName survives empty input', () => eq(normalizeName('   '), ''));
check('linesFor on empty input returns no lines', () => eq(linesFor('').lines.length, 0));

check('syllable counting is right where it commits to an answer', () => {
  const cases = [['Emma', 2], ['Ivy', 2], ['Bailey', 2], ['Quinn', 1], ['Madison', 3], ['Kayla', 2]];
  for (const [name, want] of cases) {
    const got = _internals.syllables(name);
    if (got !== want) return `${name} counted ${got}, expected ${want}`;
  }
  return null;
});

check('syllable counting declines on the names it cannot spell out', () => {
  // Each of these breaks the vowel-group heuristic; a wrong count would ship
  // inside a line somebody sends, so the family must sit them out.
  for (const name of ['Penelope', 'Olivia', 'Chloe', 'Zoe', 'Grace', 'Sophia', 'Naomi', 'Phoebe']) {
    if (_internals.syllables(name) !== null) return `${name} returned ${_internals.syllables(name)}`;
  }
  return null;
});

check('no set ever states a syllable count for an ambiguous name', () => {
  for (const name of ['Penelope', 'Olivia', 'Chloe', 'Sophia']) {
    const out = linesFor(name, lookup(name) || {});
    if (out.lines.some((l) => l.family === 'syllables')) return `${name} got a syllable line`;
  }
  return null;
});

// --- rhyme + hidden-word correctness ----------------------------------------
check('a name never rhymes with itself', () => {
  for (const e of ALL_NAMES) {
    const key = e.name.toLowerCase();
    for (const r of rhymesFor(e.name)) {
      if (r.toLowerCase().replace(/^(a|an|the) /, '') === key) return `${e.name} rhymes with ${r}`;
    }
  }
  return null;
});

check('a hidden word is never just the name itself', () => {
  for (const e of ALL_NAMES) {
    for (const h of hiddenWords(e.name)) {
      if (h.word === e.name.toLowerCase()) return `${e.name} "hides" in ${h.word}`;
    }
  }
  return null;
});

check('blocklisted words never reach a hidden-word hit', () => {
  for (const e of ALL_NAMES) {
    for (const h of hiddenWords(e.name)) {
      if (HIDDEN_BLOCKLIST.has(h.word)) return `${e.name} -> ${h.word}`;
    }
  }
  return null;
});

check('known rhymes resolve the way the lexicon intends', () => {
  const cases = [['Ella', 'umbrella'], ['Penelope', 'cantaloupe'], ['Quinn', 'a win'], ['Sage', 'a stage']];
  for (const [name, want] of cases) {
    const got = rhymesFor(name)[0];
    if (got !== want) return `${name} -> ${got}, expected ${want}`;
  }
  return null;
});

check('names in NO_RHYME fall through to the "nothing rhymes" line', () => {
  if (rhymesFor('Ivy').length) return 'Ivy got a rhyme';
  const text = linesFor('Ivy', lookup('Ivy')).lines.map((l) => l.text).join(' ');
  return text.includes('Nothing rhymes with Ivy') ? null : 'missing the fallback line';
});

// --- per-letter banks --------------------------------------------------------
check('every letter has an alliteration pair that actually alliterates', () => {
  for (const [letter, pairs] of Object.entries(ALLITERATION)) {
    // Several options per letter, or every K name gets the identical sentence.
    if (pairs.length < 2) return `${letter} has only ${pairs.length} option(s)`;
    for (const pair of pairs) {
      if (pair.length !== 2) return `${letter} has an option with ${pair.length} halves`;
      // 'x' is the one letter where the sound and the spelling part ways.
      if (letter === 'x') continue;
      for (const phrase of pair) {
        if (!phrase.toLowerCase().startsWith(letter)) return `${letter}: "${phrase}" does not start with ${letter}`;
      }
    }
  }
  return null;
});

check('every letter has an acrostic phrase', () => {
  const missing = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((l) => !ACROSTIC[l]);
  return missing.length ? `missing ${missing.join(',')}` : null;
});

// --- the sweep over all 2000 -------------------------------------------------
const sets = ALL_NAMES.map((e) => ({ entry: e, result: linesFor(e.name, e) }));

check('every name gets a full set of 10 lines', () => {
  const short = sets.filter((s) => s.result.lines.length < 10);
  return short.length ? `${short.length} short, e.g. ${short[0].entry.name} (${short[0].result.lines.length})` : null;
});

check('no line leaks an unreplaced {placeholder}', () => {
  for (const s of sets) {
    const bad = s.result.lines.find((l) => /[{}]/.test(l.text));
    if (bad) return `${s.entry.name}: ${bad.text}`;
  }
  return null;
});

check('no set repeats a line', () => {
  for (const s of sets) {
    const texts = s.result.lines.map((l) => l.text);
    if (new Set(texts).size !== texts.length) return `${s.entry.name} has a duplicate`;
  }
  return null;
});

check('no set uses one family twice', () => {
  for (const s of sets) {
    const fams = s.result.lines.map((l) => l.family);
    if (new Set(fams).size !== fams.length) return `${s.entry.name}: ${fams.join(',')}`;
  }
  return null;
});

check('no set spends the same wordplay word twice', () => {
  for (const s of sets) {
    const seen = new Set();
    for (const line of s.result.lines) {
      for (const w of line.uses || []) {
        if (seen.has(w)) return `${s.entry.name} reuses "${w}"`;
        seen.add(w);
      }
    }
  }
  return null;
});

check('every set carries at least three low-cheese lines', () => {
  const thin = sets.filter((s) => s.result.lines.filter((l) => l.cheese <= 1).length < 3);
  return thin.length ? `${thin.length} sets too cheesy, e.g. ${thin[0].entry.name}` : null;
});

check('no set is more than half high-cheese', () => {
  const heavy = sets.filter((s) => s.result.lines.filter((l) => l.cheese >= 3).length > 5);
  return heavy.length ? `${heavy.length} sets, e.g. ${heavy[0].entry.name}` : null;
});

check('every line names the person it is written for', () => {
  // Not every line has to, but a set where most lines never say the name is not
  // what was asked for. Require a clear majority.
  for (const s of sets) {
    const withName = s.result.lines.filter((l) => l.text.includes(s.entry.name)).length;
    if (withName < 6) return `${s.entry.name}: only ${withName} of 10 lines use the name`;
  }
  return null;
});

check('every line is a sendable length', () => {
  for (const s of sets) {
    for (const l of s.result.lines) {
      if (l.text.length < 40) return `${s.entry.name}: too short — ${l.text}`;
      if (l.text.length > 400) return `${s.entry.name}: too long (${l.text.length})`;
    }
  }
  return null;
});

check('every line has a known category and a cheese rating', () => {
  const cats = new Set(['pun', 'wordplay', 'playful', 'question', 'sincere', 'data']);
  for (const s of sets) {
    for (const l of s.result.lines) {
      if (!cats.has(l.category)) return `${s.entry.name}: category ${l.category}`;
      if (!(l.cheese >= 0 && l.cheese <= 5)) return `${s.entry.name}: cheese ${l.cheese}`;
    }
  }
  return null;
});

// --- determinism -------------------------------------------------------------
check('the same name always returns the same set', () => {
  const a = linesFor('Charlotte', lookup('Charlotte')).lines.map((l) => l.text);
  const b = linesFor('charlotte', lookup('Charlotte')).lines.map((l) => l.text);
  return JSON.stringify(a) === JSON.stringify(b) ? null : 'sets differ between calls';
});

check('a new round shuffles in different lines', () => {
  const a = linesFor('Charlotte', lookup('Charlotte'), { round: 0 }).lines.map((l) => l.text);
  const b = linesFor('Charlotte', lookup('Charlotte'), { round: 1 }).lines.map((l) => l.text);
  return a.join('|') === b.join('|') ? 'round 1 matched round 0' : null;
});

check('rounds keep producing full sets', () => {
  for (let round = 0; round < 6; round++) {
    const out = linesFor('Aurora', lookup('Aurora'), { round });
    if (out.lines.length < 10) return `round ${round} gave ${out.lines.length}`;
  }
  return null;
});

// --- names the roster has never heard of -------------------------------------
check('an unknown name still gets a full set', () => {
  for (const name of ['Zephyrine', 'Blorbo', 'Xy', 'Anneliese-Rae']) {
    const out = linesFor(name, {});
    if (out.lines.length < 8) return `${name} got ${out.lines.length} lines`;
    if (out.lines.some((l) => /[{}]/.test(l.text))) return `${name} leaked a placeholder`;
  }
  return null;
});

check('an unknown name never claims a popularity rank', () => {
  const text = linesFor('Blorbo', {}).lines.map((l) => l.text).join(' ');
  return /most popular|popularity list/.test(text) ? 'rank line used without rank data' : null;
});

check('a two-letter name degrades without crashing', () => {
  const out = linesFor('Jo', {});
  return out.lines.length >= 5 ? null : `only ${out.lines.length} lines`;
});

// --- curated content ---------------------------------------------------------
const gemDisplay = (key) => ROSTER.get(key)?.name || normalizeName(key);

check('every gem actually mentions its name', () => {
  for (const [key, gems] of Object.entries(GEMS)) {
    const display = gemDisplay(key);
    for (const g of gems) {
      if (!g.t.includes(display)) return `${display}: "${g.t.slice(0, 50)}…"`;
    }
  }
  return null;
});

check('a gem always leads its name’s set', () => {
  for (const key of Object.keys(GEMS)) {
    const display = gemDisplay(key);
    const first = linesFor(display, ROSTER.get(key) || {}).lines[0];
    const isGem = GEMS[key].some((g) => g.t === first.text);
    if (!isGem) return `${display} led with ${first.family} instead`;
  }
  return null;
});

check('the most-searched names are all covered by the roster', () => {
  // A gem for a name outside the top 2000 still works, but the marquee names
  // should be in the database proper.
  const orphans = Object.keys(GEMS).filter((k) => !ROSTER.has(k));
  return orphans.length ? `not in roster: ${orphans.join(', ')}` : null;
});

check('candidatesFor offers more than it needs to pick from', () => {
  const thin = ALL_NAMES.filter((e) => candidatesFor(e.name, e).length < 12);
  return thin.length ? `${thin.length} names have a thin pool, e.g. ${thin[0].name}` : null;
});

// --- the name used AS a word ------------------------------------------------
const subLines = ALL_NAMES
  .map((e) => [e, linesFor(e.name, e).lines.find((l) => l.family === 'substitute')])
  .filter(([, l]) => l);

check('substitution lines exist at all', () =>
  subLines.length > 100 ? null : `only ${subLines.length} names got one`);

check('a substituted sentence never double-punctuates', () => {
  // The phrases end in "?" as often as not, so appending a full stop blindly
  // produced "sometime?." — visible, and exactly the kind of thing that makes a
  // line unsendable.
  for (const [e, l] of subLines) {
    if (/[?!.][.]/.test(l.text)) return `${e.name}: ${l.text}`;
  }
  return null;
});

check('a substituted sentence keeps a/an agreement', () => {
  // "rings a bell" becomes "rings a isa-bell-a" unless the article is fixed.
  for (const [e, l] of subLines) {
    const wrong = l.text.match(/\ba ([aeiou])/i) || l.text.match(/\ban ([^aeiou\s])/i);
    if (wrong) return `${e.name}: ${l.text}`;
  }
  return null;
});

check('the substituted name is lowercased so the pun lands', () => {
  for (const [e, l] of subLines) {
    const quoted = l.text.match(/“([^”]+)”/);
    if (!quoted) return `${e.name}: no quoted sentence`;
    if (quoted[1].includes(e.name)) return `${e.name}: name left capitalized in "${quoted[1]}"`;
  }
  return null;
});

check('every substituted sentence actually contains the hyphenated name', () => {
  for (const [e, l] of subLines) {
    const quoted = l.text.match(/“([^”]+)”/)[1];
    const stitched = quoted.replace(/-/g, '');
    if (!stitched.toLowerCase().includes(e.name.toLowerCase())) {
      return `${e.name} is not recoverable from "${quoted}"`;
    }
  }
  return null;
});

check('substitution wins over the plain reveal when both exist', () => {
  // "Trust ja-mie on this one" beats "there is a me in your name", so the plain
  // version must not take the slot. They share a `uses` key; the tier decides.
  for (const [e, l] of subLines) {
    const set = linesFor(e.name, e).lines;
    const plain = set.find((x) => x.family === 'inside' || x.family === 'sounds');
    if (plain && plain.uses.some((u) => l.uses.includes(u))) {
      return `${e.name} got both versions of the same wordplay`;
    }
  }
  return null;
});

check('every substitution phrase has a {s} slot to fill', () => {
  for (const [word, phrases] of Object.entries(SUBSTITUTIONS)) {
    for (const p of phrases) if (!p.includes('{s}')) return `${word}: "${p}"`;
  }
  return null;
});

// --- words hiding inside the name -------------------------------------------
check('a word found inside a name is really spelled there', () => {
  for (const e of ALL_NAMES) {
    for (const hit of wordsInside(e.name).slice(0, 3)) {
      const key = e.name.toLowerCase().replace(/[^a-z]/g, '');
      if (key.slice(hit.idx, hit.idx + hit.word.length) !== hit.word) {
        return `${e.name}: claims "${hit.word}" at ${hit.idx}`;
      }
    }
  }
  return null;
});

check('the inside-word finder only ever returns allowlisted words', () => {
  // The allowlist IS the safety mechanism — names contain plenty of substrings
  // nobody wants pointed at them, and never searching for them is what
  // guarantees they can't ship.
  const allowed = new Set(INSIDE_WORDS);
  for (const e of ALL_NAMES) {
    for (const hit of wordsInside(e.name)) {
      if (!allowed.has(hit.word)) return `${e.name} -> "${hit.word}" is not on the allowlist`;
    }
  }
  return null;
});

check('a name is never told the word it already is', () => {
  for (const e of ALL_NAMES) {
    const key = e.name.toLowerCase().replace(/[^a-z]/g, '');
    if (wordsInside(e.name).some((h) => h.word === key)) return `${e.name} "contains" itself`;
  }
  return null;
});

check('every reveal leaves something to split off', () => {
  for (const e of ALL_NAMES) {
    for (const hit of wordsInside(e.name)) {
      const key = e.name.toLowerCase().replace(/[^a-z]/g, '');
      if (key.length <= hit.word.length) return `${e.name} -> "${hit.word}" leaves nothing`;
    }
  }
  return null;
});

check('sound-alike endings only fire on names that end that way', () => {
  const rules = new Map(SOUND_ENDINGS);
  for (const e of ALL_NAMES) {
    const line = candidatesFor(e.name, e).find((c) => c.family === 'sounds');
    if (!line) continue;
    const key = e.name.toLowerCase().replace(/[^a-z]/g, '');
    const matched = [...rules.keys()].some((end) => key.length > end.length && key.endsWith(end));
    if (!matched) return `${e.name} got a sound-alike line without matching any ending`;
  }
  return null;
});

check('the Jamie case works, since it is the one that started this', () => {
  // The ask was not "tell me my name sounds like me" — it was to hyphenate the
  // name and USE it as the word in a sentence. So Jamie must get a substitution
  // line, with "ja-mie" standing in for "me", lowercased so it reads as a word.
  const out = linesFor('Jamie', lookup('Jamie') || {});
  const line = out.lines.find((l) => l.family === 'substitute');
  if (!line) return 'Jamie got no substitution line';
  if (!line.text.includes('ja-mie')) return `not hyphenated as "ja-mie": ${line.text}`;
  const sentence = line.text.match(/“([^”]+)”/)[1];
  const asWord = sentence.replace('ja-mie', 'me');
  return asWord.includes('me') && !asWord.includes('ja-') ? null : `"${sentence}" does not read as the word`;
});

// --- the three things the tone/variety pass fixed, locked down -------------
check('no line uses British spelling or lectern vocabulary', () => {
  // These get sent from a phone. "favourite" and "considerably" both read wrong.
  const bad = /favourite|colour|honour|behaviour|realise|categoris|apologis|whilst|amongst|considerably|precisely|indeed|hence/i;
  for (const s of sets) {
    const hit = s.result.lines.find((l) => bad.test(l.text));
    if (hit) return `${s.entry.name}: ${hit.text.slice(0, 70)}`;
  }
  return null;
});

check('lines stay short enough to actually send', () => {
  const lens = sets.flatMap((s) => s.result.lines.map((l) => l.text.length));
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  if (avg > 130) return `average line is ${avg.toFixed(0)} chars — too long for an opener`;
  const over = lens.filter((n) => n > 220).length;
  return over ? `${over} lines over 220 chars` : null;
});

check('sets are not carried by the interchangeable lines', () => {
  // Universals read identically for every name, so a set built mostly from them
  // is the "these are all the same" complaint waiting to happen. Five is the
  // floor for a genuinely hookless name — no rhyme class, no meaning, no hidden
  // word, nothing in the spelling — so the guard is: never MORE than five, and
  // the clear majority well under it. Raising the ceiling here is not the fix;
  // adding hooks (a meaning, a rime class, a fun word) is.
  const counts = sets.map((s) => s.result.lines.filter((l) => l.family.startsWith('universal')).length);
  const over = counts.filter((n) => n > 5).length;
  if (over) return `${over} sets use more than five universal lines`;
  const lean = counts.filter((n) => n <= 4).length / counts.length;
  if (lean < 0.85) return `only ${(lean * 100).toFixed(0)}% of sets keep universals to four or fewer`;
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  return avg > 4 ? `universals average ${avg.toFixed(2)} per set` : null;
});

check('two different names do not come back as the same set', () => {
  // The real test of the variety work: strip the name out of every line and
  // count how many line SHAPES two names share.
  const shapeOf = (e) => new Set(linesFor(e.name, e).lines.map((l) => l.text.split(e.name).join('~')));
  const sample = ALL_NAMES.filter((_, i) => i % 11 === 0).slice(0, 150).map((e) => [e, shapeOf(e)]);
  let total = 0;
  let pairs = 0;
  let worst = 0;
  let worstPair = '';
  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      let overlap = 0;
      for (const sh of sample[i][1]) if (sample[j][1].has(sh)) overlap++;
      total += overlap;
      pairs++;
      if (overlap > worst) {
        worst = overlap;
        worstPair = `${sample[i][0].name}/${sample[j][0].name}`;
      }
    }
  }
  const avg = total / pairs;
  if (avg > 1.2) return `two names share ${avg.toFixed(2)} of 10 lines on average`;
  if (worst > 5) return `${worstPair} share ${worst} of 10 lines`;
  return null;
});

check('every family offers more than one phrasing', () => {
  // A family with a single phrasing is how 2,000 names end up sharing a sentence.
  const counts = new Map();
  for (const name of ['Emma', 'Ella', 'Penelope', 'Kayla', 'Madison', 'Grace', 'Xiomara']) {
    for (const c of candidatesFor(name, lookup(name) || {})) {
      const key = c.family.replace(/\d+$/, '');
      if (key === 'universal' || key === 'gem' || key === 'rank') continue;
      counts.set(key, Math.max(counts.get(key) || 0, 0) + 0);
      counts.set(key + '|' + name, (counts.get(key + '|' + name) || 0) + 1);
    }
  }
  const singles = [...counts.entries()].filter(([k, v]) => k.includes('|') && v === 1).map(([k]) => k);
  return singles.length ? `single-phrasing families: ${singles.slice(0, 4).join(', ')}` : null;
});

// --- report ------------------------------------------------------------------
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('✓ all good\n');
