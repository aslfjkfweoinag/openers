// The 2000-name roster: name -> { name, gender, rank }.
//
// Rank is per-gender. A name that appears on both lists is tagged 'u' (unisex)
// and keeps its better (lower) rank, since that's the one worth quoting.

import { FEMALE, MALE, FEMALE_TARGET, MALE_TARGET } from './names.js';

export const TOTAL = FEMALE_TARGET + MALE_TARGET; // 2000 DISTINCT names

const byKey = new Map();

function add(name, gender, rank) {
  const key = name.toLowerCase();
  const existing = byKey.get(key);
  if (!existing) {
    byKey.set(key, { name, gender, rank });
    return true;
  }
  // Already on the other list: unisex, and quote whichever rank is better.
  existing.gender = 'u';
  existing.rank = Math.min(existing.rank, rank);
  return false;
}

FEMALE.slice(0, FEMALE_TARGET).forEach((n, i) => add(n, 'f', i + 1));

// Keep pulling from the boys' list until the roster holds 2000 DISTINCT names —
// the ~65 unisex names appear on both lists and must not be counted twice. Past
// the 2000 mark we keep scanning, but only to tag names already in the roster as
// unisex; nothing new is added.
for (let i = 0; i < MALE.length; i++) {
  const key = MALE[i].toLowerCase();
  if (byKey.size >= TOTAL && !byKey.has(key)) continue;
  add(MALE[i], 'm', i + 1);
}

if (byKey.size !== TOTAL) {
  throw new Error(`roster is ${byKey.size} names, expected ${TOTAL} — the source lists are too short`);
}

export const ROSTER = byKey;
export const ALL_NAMES = [...byKey.values()];

/** Roster entry for a name, or null. Case-insensitive. */
export function lookup(name) {
  return byKey.get(String(name || '').trim().toLowerCase().split(/\s+/)[0]) || null;
}

/**
 * Type-ahead search. Exact match first, then prefix, then substring; each group
 * ordered by popularity so the common spelling wins the top slot.
 */
export function search(query, limit = 8) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const exact = [];
  const prefix = [];
  const inner = [];
  for (const entry of byKey.values()) {
    const k = entry.name.toLowerCase();
    if (k === q) exact.push(entry);
    else if (k.startsWith(q)) prefix.push(entry);
    else if (q.length >= 3 && k.includes(q)) inner.push(entry);
  }
  const byRank = (a, b) => a.rank - b.rank;
  return [...exact.sort(byRank), ...prefix.sort(byRank), ...inner.sort(byRank)].slice(0, limit);
}
