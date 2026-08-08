// The line engine. Given a name, assemble candidate openers from every family
// that has something to work with, then pick a varied set.
//
// Runs unchanged in Node and in the browser — no imports beyond the data files.

import { RIMES, NO_RHYME, FUN_WORDS, HIDDEN_BLOCKLIST, ALLITERATION, ACROSTIC, UNIVERSAL, RANK_LINES,
  INSIDE_WORDS, INSIDE_RIFFS, SOUND_ENDINGS, SOUND_RIFFS, SUBSTITUTIONS } from './lexicon.js';
import { MEANINGS, NICKNAMES, VARIANT_CLUSTERS, GEMS } from './knowledge.js';

// --- tiny deterministic PRNG so a given name always gets the same set ---------
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- name helpers ------------------------------------------------------------
export function normalizeName(input) {
  const raw = String(input || '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';
  // Take the first word only — "Emma Watson" is a lookup for Emma.
  const first = raw.split(' ')[0];
  return first
    .split(/([-'’])/)
    .map((part) => (/^[-'’]$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join('');
}

const letterKey = (n) => n.toLowerCase().replace(/[^a-z]/g, '');

// "a marina" -> "marina". Rhyme entries carry their article so they read well in
// a sentence; comparisons have to look past it.
const bareWord = (w) => letterKey(String(w).replace(/^(a|an|the)\s+/i, ''));

// Vowel pairs that reliably make ONE sound in a name.
const SAFE_VOWEL_PAIRS = /^(ee|oo|ai|ay|ey|oy|au|ou|aw|ew|ui|ie)$/;

/**
 * Syllable count, or null when the spelling is genuinely ambiguous.
 *
 * Counting vowel groups gets Emma and Bailey right and Penelope, Olivia and
 * Chloe wrong — a trailing "e" is silent in Grace and sounded in Chloe, and "ia"
 * is one sound in some names and two in others, with nothing in the spelling to
 * tell them apart. Rather than print a wrong number in a line somebody is about
 * to send, this returns null for anything it can't count confidently and the
 * syllable line simply doesn't appear for that name.
 */
function syllables(name) {
  const w = letterKey(name);
  if (!w) return null;
  if (/[a-z]e$/.test(w)) return null; // Grace (1) and Chloe (2) look identical here.
  const groups = w.match(/[aeiouy]+/g);
  if (!groups) return null;
  for (const g of groups) {
    if (g.length > 2) return null;
    if (g.length === 2 && !SAFE_VOWEL_PAIRS.test(g)) return null; // "ia", "oa", "eo"…
  }
  return groups.length;
}

const NUMBER_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numWord = (n) => NUMBER_WORD[n] || String(n);

// Variant lookup, built once from the clusters.
const VARIANTS = (() => {
  const map = new Map();
  for (const cluster of VARIANT_CLUSTERS) {
    for (const name of cluster) {
      const others = cluster.filter((c) => c !== name);
      const key = letterKey(name);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(...others);
    }
  }
  return map;
})();

// --- hooks -------------------------------------------------------------------

// Words with the name sitting inside them, best candidates first.
export function hiddenWords(name) {
  const key = letterKey(name);
  if (key.length < 3) return [];
  const minExtra = key.length === 3 ? 3 : 2;
  const hits = [];
  for (const word of FUN_WORDS) {
    if (word.length < key.length + minExtra) continue;
    if (HIDDEN_BLOCKLIST.has(word)) continue;
    const idx = word.indexOf(key);
    if (idx < 0) continue;
    const atEnd = idx + key.length === word.length;
    const atStart = idx === 0;
    hits.push({
      word,
      idx,
      // Reveals read best when the name is flush to one end of the word.
      score: (atEnd ? 3 : atStart ? 2 : 0) + (word.length <= 11 ? 1 : 0),
    });
  }
  hits.sort((a, b) => b.score - a.score || a.word.length - b.word.length);
  return hits;
}

function splitWord(word, idx, len, display) {
  const pre = word.slice(0, idx);
  const post = word.slice(idx + len);
  return [pre, display, post].filter(Boolean).join('-');
}

export function rhymesFor(name) {
  const key = letterKey(name);
  if (NO_RHYME.has(key)) return [];
  for (const [suffix, words] of RIMES) {
    if (key.length >= suffix.length && key.endsWith(suffix)) {
      // "Ella rhymes with umbrella" is fine; "Marina rhymes with a marina" is not,
      // so compare after stripping the article.
      const usable = words.filter((w) => bareWord(w) !== key);
      if (usable.length) return usable;
    }
  }
  return [];
}

// --- families ----------------------------------------------------------------
// Each returns candidate lines. `tier` drives ranking: 0 is the hand-written
// stuff, 3 is the ballast that works for anybody.

// A gem may claim another family's slot via `f`. Gems sort first, so claiming
// 'rhyme' means the hand-written rhyme joke runs and the generic one steps
// aside — otherwise Quinn gets told twice that she rhymes with "win".
//
// Family claims are hand-maintained, so they only catch collisions somebody
// thought of. `uses` catches the rest at the word level: any word a gem already
// spent is off the table for every other line in the set.
function famGems(n) {
  const list = GEMS[letterKey(n.name)] || [];
  const vocabulary = [
    ...hiddenWords(n.name).map((h) => h.word),
    ...rhymesFor(n.name).map(bareWord),
  ];
  return list.map((g) => {
    const lower = g.t.toLowerCase();
    return {
      text: g.t,
      category: g.c,
      cheese: g.cheese,
      family: g.f || 'gem',
      tier: 0,
      uses: [...new Set(vocabulary.filter((w) => w && lower.includes(w)))],
    };
  });
}

// Every family offers SEVERAL phrasings under one family name. The picker takes
// one line per family and the shuffle is seeded off the name, so two names with
// the same hook still come back reading differently — which is the whole point.
// Adding a phrasing here costs nothing; a family with one phrasing is how you
// end up with 2,000 names sharing a sentence.

function famHidden(n) {
  const hits = hiddenWords(n.name).slice(0, 2);
  const out = [];
  const push = (text, uses) => out.push({ text, category: 'pun', cheese: 3, family: 'hidden', tier: 1, uses });
  hits.forEach((hit) => {
    const shown = splitWord(hit.word, hit.idx, letterKey(n.name).length, n.name);
    push(`Bad news, ${n.name}: I can’t unsee your name in “${hit.word}”. It’s ${shown} now. Permanently.`, [hit.word]);
    push(`${n.name}, your name is hiding inside “${hit.word}”. I noticed at 11pm and felt like a genius for about four seconds.`, [hit.word]);
    push(`Nobody asked, but — ${shown}. Your name has been in there this whole time and I’m the one who has to live with it.`, [hit.word]);
    if (hit.idx === 0) {
      push(`${n.name}, you’re the front half of “${hit.word}”, which I’m choosing to read as a personality test.`, [hit.word]);
    }
  });
  return out;
}

function famRhyme(n) {
  const r = rhymesFor(n.name);
  const line = (text, category, cheese, uses) => ({ text, category, cheese, family: 'rhyme', tier: 1, uses });

  if (!r.length) {
    return [
      line(`Nothing rhymes with ${n.name}. I checked. That’s where my evening went and we haven’t even talked yet.`, 'playful', 2, []),
      line(`Fun discovery: nothing rhymes with ${n.name}. I spent an unreasonable amount of time confirming that.`, 'playful', 2, []),
      line(`${n.name} doesn’t rhyme with anything, which I’m taking as a sign you’re hard to categorize generally.`, 'playful', 2, []),
      line(`I went looking for something that rhymes with ${n.name} and came back with nothing. Unrhymable. Respect.`, 'playful', 2, []),
      line(`Turns out ${n.name} is rhyme-proof. I tested this properly. Nobody asked me to.`, 'playful', 2, []),
      line(`Started writing you a poem, ${n.name}, and got stuck on line one because your name defeats the English language.`, 'playful', 2, []),
    ];
  }

  const uses = r.slice(0, 2).map(bareWord);
  const out = [
    line(`${n.name} rhymes with ${r[0]}. That’s where my evening went. How was yours?`, 'pun', 3, uses),
    line(`${n.name} / ${r[0]}. I got that far, realized I’m not the poet this moment needs, and came here instead.`, 'pun', 3, uses),
  ];
  if (r[1]) {
    out.push(line(`Things that rhyme with ${n.name}: ${r[0]}, ${r[1]}. That’s the list. That’s the whole list.`, 'pun', 3, uses));
    out.push(line(`I wanted to open with a rhyme, ${n.name}, but my options were ${r[0]} and ${r[1]}. Going with a question instead — what’s the best thing you’ve got planned this week?`, 'question', 1, uses));
  }
  return out;
}

function famMeaning(n) {
  const m = MEANINGS[letterKey(n.name)];
  if (!m) return [];
  const line = (text, cheese) => ({ text, category: 'wordplay', cheese, family: 'meaning', tier: 1 });
  return [
    line(`Looked this up instead of sleeping: ${n.name} means “${m}”. Big thing to be handed at birth. How’s that going?`, 2),
    line(`${n.name} means “${m}”. Strong opening statement from your parents — mine went with a name that means, roughly, “a guy”.`, 2),
    line(`Turns out ${n.name} means “${m}”. Not sure what to do with that yet, but I wanted you to know I have it.`, 2),
  ];
}

function famNickname(n) {
  const nick = NICKNAMES[letterKey(n.name)];
  if (!nick) return [];
  const line = (text) => ({ text, category: 'question', cheese: 1, family: 'nickname', tier: 2 });
  return [
    line(`Settle this early, ${n.name}: are you a ${nick}, or do you have to earn that?`),
    line(`${n.name} or ${nick}? I need to know which one I’m allowed to use.`),
    line(`Important question — is it ${n.name}, or does everyone call you ${nick}? Getting this wrong feels like a bad start.`),
  ];
}

function famVariant(n) {
  const alts = VARIANTS.get(letterKey(n.name));
  if (!alts || !alts.length) return [];
  const line = (text) => ({ text, category: 'question', cheese: 1, family: 'variant', tier: 2 });
  return [
    line(`Before this goes further — ${n.name} or ${alts[0]}? I want to spell it right and I want credit for asking.`),
    line(`${n.name} or ${alts[0]}? I’d rather ask than be confidently wrong about it for three weeks.`),
  ];
}

function famShape(n) {
  const key = letterKey(n.name);
  const out = [];
  const line = (text, cheese, category) => out.push({ text, category: category || 'wordplay', cheese, family: 'shape', tier: 2 });

  if (key.length >= 3 && key === key.split('').reverse().join('')) {
    line(`Hang on — ${n.name} is a palindrome. Same both directions. I’ve never trusted anything more.`, 2);
    line(`${n.name} reads the same backwards. Structurally sound. I noticed immediately and had to tell someone.`, 2);
  } else if (key.length >= 3 && key[0] === key[key.length - 1]) {
    line(`Your name starts and ends with the same letter, ${n.name}. Whoever named you knew exactly what they were doing.`, 2);
    line(`${n.name} — opens and closes on ${key[0].toUpperCase()}. Very tidy. I think about things like this too much.`, 2);
  }

  const dbl = key.match(/([a-z])\1/);
  if (dbl) {
    const L = dbl[1].toUpperCase();
    out.push({ text: `${n.name}, there’s a double ${L} in there. I’ve decided that means you do everything twice as hard. Accurate?`, category: 'playful', cheese: 2, family: 'double', tier: 2 });
    out.push({ text: `Double ${L} in ${n.name}. Reads like a warning label and I’m ignoring it.`, category: 'playful', cheese: 2, family: 'double', tier: 2 });
  }
  return out;
}

function famAlliteration(n) {
  const l = letterKey(n.name)[0];
  const pairs = ALLITERATION[l];
  if (!pairs) return [];
  const L = l.toUpperCase();
  const out = [];
  for (const [a, b] of pairs) {
    out.push({ text: `Working theory, ${n.name}: people whose names start with ${L} are either ${a} or ${b}. Which one am I getting?`, category: 'question', cheese: 1, family: 'alliteration', tier: 2 });
    out.push({ text: `${n.name}, my ${L} theory is that you’re either ${a} or ${b}. There’s no third option. Settle it.`, category: 'question', cheese: 1, family: 'alliteration', tier: 2 });
  }
  return out;
}

function famAcrostic(n) {
  const key = letterKey(n.name);
  // Distinct letters only — "E — …. M — …. M — …." reads like a bug, because it is.
  const ls = [...new Set(key.split(''))].filter((l) => ACROSTIC[l]).slice(0, 3);
  if (ls.length < 3) return [];
  const out = [];
  for (let variant = 0; variant < 2; variant++) {
    const body = ls.map((l) => `${l.toUpperCase()} — ${ACROSTIC[l][variant] || ACROSTIC[l][0]}`).join('. ');
    out.push({ text: `${n.name}, I got three letters into an acrostic before losing my nerve. ${body}. You finish it.`, category: 'playful', cheese: 2, family: 'acrostic', tier: 2 });
    out.push({ text: `Tried your name as an acrostic and made it three letters, ${n.name}. ${body}. Take it from here.`, category: 'playful', cheese: 2, family: 'acrostic', tier: 2 });
  }
  return out;
}

/**
 * A real word spelled inside the name, best first.
 *
 * Scored so the reveal is worth making: longer words are more surprising than
 * short ones, and a word flush to the start or end of the name ("Win-ter",
 * "Ja-mie") reads better than one buried in the middle. Two-letter words are
 * allowed only for the handful that carry a joke on their own — "me", "us" —
 * because otherwise every name in the roster turns up an "an" and a "or".
 */
const TINY_OK = new Set(['me', 'my', 'us', 'we', 'hi']);

export function wordsInside(name) {
  const key = letterKey(name);
  const hits = [];
  for (const word of INSIDE_WORDS) {
    if (word.length < 2) continue;
    if (word.length === 2 && !TINY_OK.has(word)) continue;
    if (word === key) continue;                    // the name IS the word; not a reveal
    if (key.length < word.length + 1) continue;    // need at least one letter left to split off
    const idx = key.indexOf(word);
    if (idx < 0) continue;
    const atEnd = idx + word.length === key.length;
    const atStart = idx === 0;
    // A single leftover letter reads as a typo, not a reveal: "Sum-ME-r" and
    // "Eliza-BET-h" both look broken. Penalized rather than banned, so a name
    // whose only option is an orphan split still gets one.
    const orphan = (!atEnd && key.length - (idx + word.length) === 1) || (!atStart && idx === 1 && !atEnd);
    hits.push({
      word,
      idx,
      score: word.length * 2 + (atEnd ? 3 : atStart ? 2 : 0) + (INSIDE_RIFFS[word] ? 4 : 0) - (orphan ? 6 : 0),
    });
  }
  hits.sort((a, b) => b.score - a.score || a.word.length - b.word.length);
  return hits;
}

// Ja-MIE. The name with the buried word cut out and shouted.
function revealInside(name, idx, len, upper) {
  const part = name.slice(idx, idx + len);
  return [name.slice(0, idx), upper ? part.toUpperCase() : part, name.slice(idx + len)]
    .filter(Boolean)
    .join('-');
}

/**
 * The name used AS the word, inside a sentence.
 *
 * This is the strongest version of the mechanic and it sits at tier 0.5 — below
 * a hand-written gem, above the plain reveal — because "trust ja-mie on this
 * one" beats "there's a me in your name" every time. It shares the `uses` key
 * with famInside/famSounds so a set never makes the same wordplay twice; the
 * lower tier is what decides which version survives.
 *
 * Works off BOTH sources: a word spelled in the name (win-ter) and one only
 * audible out loud (ja-mie), since the substitution reads the same either way.
 */
// "rings a bell" -> "rings an isa-bell-a". Swapping a name into a phrase written
// for the plain word breaks a/an agreement about a third of the time.
function fixArticles(sentence) {
  return sentence.replace(/\b(a|an) (?=([a-z]))/gi, (match, article, next) => {
    const wanted = 'aeiou'.includes(next.toLowerCase()) ? 'an' : 'a';
    const cased = article[0] === article[0].toUpperCase() ? wanted[0].toUpperCase() + wanted.slice(1) : wanted;
    return `${cased} `;
  });
}

function famSubstitute(n) {
  const key = letterKey(n.name);
  const options = [];

  // Check every hit, not just the top-scoring one: a name's best word often has
  // no phrase written for it while its second or third does, and a substitution
  // beats a plain reveal even off a lesser word.
  // A one-letter tail ("sum-me-r") reads as a broken word rather than a swap.
  // The plain reveal tolerates it; a substitution has to sound clean out loud.
  const cleanSplit = (h) => key.length - (h.idx + h.word.length) !== 1;
  const spelled = wordsInside(n.name).find((h) => SUBSTITUTIONS[h.word] && cleanSplit(h));
  if (spelled) {
    options.push({ word: spelled.word, idx: spelled.idx, len: spelled.word.length });
  }
  for (const [ending, sounds] of SOUND_ENDINGS) {
    if (key.length > ending.length && key.endsWith(ending) && SUBSTITUTIONS[sounds]) {
      options.push({ word: sounds, idx: n.name.length - ending.length, len: ending.length });
      break;
    }
  }
  if (!options.length) return [];

  const out = [];
  for (const opt of options) {
    // Lowercase: capitalized it reads as a name and the joke doesn't land.
    const lower = n.name.toLowerCase();
    const split = [lower.slice(0, opt.idx), lower.slice(opt.idx, opt.idx + opt.len), lower.slice(opt.idx + opt.len)]
      .filter(Boolean)
      .join('-');
    for (const phrase of SUBSTITUTIONS[opt.word]) {
      // The phrase was written for the plain word, so swapping the name in can
      // break agreement: "rings a bell" becomes "rings a isa-bell-a". And a
      // phrase that already ends in "?" must not also get a full stop.
      const sentence = fixArticles(phrase.replace('{s}', split));
      const closed = /[?!.]$/.test(sentence) ? sentence : `${sentence}.`;
      const add = (text) => out.push({ text, category: 'pun', cheese: 3, family: 'substitute', tier: 0.5, uses: [`in:${opt.word}`, `snd:${opt.word}`] });
      add(`${n.name}, hear me out: “${closed}” That’s it. That’s the whole joke.`);
      add(`Say this out loud: “${closed}” I’ll wait.`);
      add(`“${closed}” I’m fully aware of what I just did and I’d do it again.`);
    }
  }
  return out;
}

function famInside(n) {
  const hits = wordsInside(n.name).slice(0, 2);
  const out = [];
  hits.forEach((hit, rank) => {
    const split = revealInside(n.name, hit.idx, hit.word.length, true);
    const riff = INSIDE_RIFFS[hit.word];
    // The runner-up sits a tier down, so the shuffle picks among phrasings of the
    // BEST word rather than sometimes preferring the weaker one. Grace should get
    // "G-RACE", not "Gr-ACE", every time.
    const tier = rank === 0 ? 1 : 2;
    const add = (text) => out.push({ text, category: 'pun', cheese: 3, family: 'inside', tier, uses: [`in:${hit.word}`] });
    if (riff) {
      add(`${split}. ${riff}`);
      add(`Look at your name for a second, ${n.name}: ${split}. ${riff}`);
    }
    add(`Hang on — ${split}. There’s a whole “${hit.word}” hiding in your name and nobody told you.`);
    add(`${n.name}, I broke your name up and found something: ${split}. That “${hit.word}” has been in there the entire time.`);
  });
  return out;
}

/**
 * A word you only hear when the name is said out loud — Ja-mie ends in the
 * sound "me" without containing the letters. Spelling is what hides these, so
 * they can't be found by searching; the rules are checked by ear.
 */
function famSounds(n) {
  const key = letterKey(n.name);
  for (const [ending, sounds] of SOUND_ENDINGS) {
    if (key.length <= ending.length || !key.endsWith(ending)) continue;
    const split = revealInside(n.name, n.name.length - ending.length, ending.length, false);
    const riff = SOUND_RIFFS[sounds];
    const add = (text) => ({ text, category: 'pun', cheese: 3, family: 'sounds', tier: 1, uses: [`snd:${sounds}`] });
    const out = [
      add(`Say your name out loud, ${n.name}: ${split}. The end of it is just the word “${sounds}”.`),
      add(`${split}. Out loud, that last bit is “${sounds}”. Spelling was hiding it from you this whole time.`),
    ];
    if (riff) out.push(add(`Say it out loud: ${split}. ${riff}`));
    return out;
  }
  return [];
}

// Two broad families that still key off the actual name. Their job is to push
// the interchangeable universal lines out of the set: an unusual letter or the
// sound a name ends on is a small observation, but it's an observation about
// THIS name, and it splits the roster into groups instead of one big pool.

const NOTABLE_LETTERS = 'zxqjkvw';

function famLetters(n) {
  const key = letterKey(n.name);
  const found = [...new Set(key.split(''))].filter((c) => NOTABLE_LETTERS.includes(c));
  if (!found.length) return [];
  const L = found[0].toUpperCase();
  const line = (text) => ({ text, category: 'playful', cheese: 2, family: 'letters', tier: 2 });
  return [
    line(`${n.name}, there’s a ${L} in your name. Top-five letter. I don’t make the rules.`),
    line(`Not many names get a ${L}, ${n.name}. Yours does. Strong start before we’ve even spoken.`),
    line(`The ${L} in ${n.name} is doing a lot of work and I want it acknowledged.`),
  ];
}

function famSound(n) {
  const key = letterKey(n.name);
  if (!key) return [];
  const last = key[key.length - 1];
  const line = (text, cheese) => ({ text, category: 'playful', cheese, family: 'sound', tier: 2 });
  if ('aeiouy'.includes(last)) {
    return [
      line(`${n.name} ends on a vowel, which means it sounds good called across a room. Not that I’ve tested that.`, 2),
      line(`Your name lands softly, ${n.name}. I noticed that, which tells you roughly how my evening is going.`, 2),
      line(`${n.name} — ends open, so it’s impossible to say sharply. Useful information for anyone trying to be annoyed at you.`, 2),
    ];
  }
  return [
    line(`${n.name} ends on a hard consonant. No drifting off, no softening. I like that it doesn’t mess around.`, 2),
    line(`Your name stops exactly when it means to, ${n.name}. I’ve decided that says something about you.`, 2),
  ];
}

function famSyllables(n) {
  const s = syllables(n.name);
  if (!s) return [];
  const word = numWord(s);
  const Word = word.charAt(0).toUpperCase() + word.slice(1);
  const plural = s === 1 ? '' : 's';
  const line = (text, cheese) => ({ text, category: 'playful', cheese, family: 'syllables', tier: 3 });
  return [
    line(`${Word} syllable${plural}, and I’ve already said your name out loud twice to be sure I’d get it right in person. That’s where we are, ${n.name}.`, 2),
    line(`${n.name} is ${word} syllable${plural} of me practicing so I don’t fumble it when we actually meet.`, 2),
    line(`${Word} syllable${plural} and I’ve managed to overthink every one of them, ${n.name}.`, 2),
    line(`Your name is ${word} syllable${plural} long and I’ve spent about four minutes per syllable on this message, ${n.name}.`, 1),
  ];
}

function famRank(n) {
  if (!n.rank) return [];
  const bucket = n.rank <= 60 ? 'common' : n.rank <= 400 ? 'mid' : 'rare';
  const kind = n.gender === 'm' ? 'boys’' : n.gender === 'f' ? 'girls’' : '';
  return RANK_LINES[bucket].map((l) => ({
    text: l.t.replace(/\{name\}/g, n.name).replace(/\{rank\}/g, String(n.rank)).replace(/\{kind\}/g, kind).replace(/ {2,}/g, ' '),
    category: l.c, cheese: l.cheese, family: 'rank', tier: 3,
  }));
}

function famUniversal(n) {
  return UNIVERSAL.map((l, i) => ({
    text: l.t.replace(/\{name\}/g, n.name).replace(/\{letters\}/g, numWord(letterKey(n.name).length)),
    category: l.c, cheese: l.cheese, family: `universal${i}`, tier: 3,
  }));
}

const FAMILIES = [
  famGems, famHidden, famRhyme, famMeaning, famNickname, famVariant,
  famSubstitute, famInside, famSounds, famShape, famAlliteration, famAcrostic, famLetters, famSound,
  famSyllables, famRank, famUniversal,
];

/**
 * All candidate lines for a name, unranked.
 * meta: { gender?: 'f'|'m'|'u', rank?: number }
 */
export function candidatesFor(name, meta = {}) {
  const n = { name: normalizeName(name), gender: meta.gender || null, rank: meta.rank || null };
  if (!n.name) return [];
  return FAMILIES.flatMap((f) => f(n));
}

/**
 * The picked set. Deterministic for a given (name, round).
 *
 * Diversity rules, in order of how much they matter:
 *  - one line per family, so no name gets three rhyme jokes
 *  - at least MIN_LOW low-cheese lines, because ten puns in a row is a bit
 *  - no more than MAX_HIGH high-cheese lines, for the same reason
 */
export function linesFor(name, meta = {}, opts = {}) {
  const count = opts.count || 10;
  const round = opts.round || 0;
  const display = normalizeName(name);
  if (!display) return { name: '', lines: [] };

  const rnd = mulberry32(hashStr(letterKey(display)) + round * 7919);
  let pool = shuffled(candidatesFor(display, meta), rnd);
  if (opts.categories && opts.categories.length) {
    pool = pool.filter((l) => opts.categories.includes(l.category));
  }
  if (typeof opts.maxCheese === 'number') {
    pool = pool.filter((l) => l.cheese <= opts.maxCheese);
  }
  pool.sort((a, b) => a.tier - b.tier);

  // The low-cheese quota can't demand more than the filtered pool holds — asking
  // for three sincere lines inside a puns-only filter would starve the set.
  // The low-cheese quota has to scale with the size of the set. Fixed at three,
  // a request for three lines reserves every slot for low-cheese ones and the
  // wordplay — the whole point of the tool — never appears at all.
  const lowAvailable = pool.filter((l) => l.cheese <= 1).length;
  const MIN_LOW = Math.min(Math.max(1, Math.round(count * 0.3)), lowAvailable);
  const MAX_HIGH = 5;
  // Universals are the lines that read identically for every name, so they are
  // rationed: anything the name itself earned goes first. The backfill pass
  // below ignores this, so a name with few hooks still gets a full ten.
  const MAX_UNIVERSAL = 3;
  const picked = [];
  const usedFamily = new Set();
  const usedWords = new Set();
  let high = 0;
  let universals = 0;

  const isUniversal = (line) => line.family.startsWith('universal');
  const take = (line) => {
    picked.push(line);
    usedFamily.add(line.family);
    (line.uses || []).forEach((w) => usedWords.add(w));
    if (line.cheese >= 3) high++;
    if (isUniversal(line)) universals++;
  };
  const repeatsAWord = (line) => (line.uses || []).some((w) => usedWords.has(w));

  for (const line of pool) {
    if (picked.length >= count) break;
    if (usedFamily.has(line.family)) continue;
    if (repeatsAWord(line)) continue;
    if (line.cheese >= 3 && high >= MAX_HIGH) continue;
    if (isUniversal(line) && universals >= MAX_UNIVERSAL) continue;
    // Leave room for the low-cheese quota.
    const lowSoFar = picked.filter((p) => p.cheese <= 1).length;
    const slotsLeft = count - picked.length;
    if (line.cheese > 1 && lowSoFar + slotsLeft <= MIN_LOW) continue;
    take(line);
  }

  // Backfill if the constraints starved us (very short or unknown names).
  if (picked.length < count) {
    for (const line of pool) {
      if (picked.length >= count) break;
      if (picked.includes(line)) continue;
      if (usedFamily.has(line.family)) continue;
      if (repeatsAWord(line)) continue;
      take(line);
    }
  }

  return {
    name: display,
    gender: meta.gender || null,
    rank: meta.rank || null,
    lines: picked.slice(0, count),
  };
}

export const _internals = { syllables, letterKey, hashStr };
