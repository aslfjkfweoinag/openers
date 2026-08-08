# Opening lines, by name

Type a name, get ten opening lines built around that specific name — puns, hidden
words, rhymes, name meanings, and a few that skip the wordplay and just ask
something worth answering.

Covers **2,000 names** (1,100 girls' + 900 boys', minus the ~65 unisex names that
appear on both lists). A name outside the 2,000 still works: several of the line
families need nothing but the letters.

> **This directory is not part of the ArtistIQ app.** It shares the repo and
> nothing else. Note that GitHub Pages serves this repo at `artistiq.music`, so
> merging this branch to `main` would publish `artistiq.music/openers/`. The page
> carries `noindex, nofollow`, but if that isn't wanted, keep it off `main` or
> move it to its own repo.

## Using it

**Terminal**

```bash
cd /home/user/ArtistIQ/openers
node cli.js Emma
node cli.js Penelope --more                    # a different ten
node cli.js Ella --only=pun,wordplay           # puns only
node cli.js Grace --max-cheese=1 --plain       # the ones you can send without wincing
```

**In a browser, offline** — one self-contained file, no server, no internet:

```bash
cd /home/user/ArtistIQ/openers
node build.js
```

then open `dist/openers.html` (double-click it, or send it to yourself — it's a
single ~105 KB file with the whole engine inside).

**In a browser, while editing the source** — needs a server, because the page
loads ES modules:

```bash
cd /home/user/ArtistIQ/openers
python3 -m http.server 8777
# then open http://localhost:8777
```

**On an iPhone, with nothing hosted** — see [IPHONE.md](IPHONE.md). An iPhone
won't run a local web page as an app, so that route uses an Apple Shortcut
reading a pre-generated file: home-screen icon, works in airplane mode, no
server involved.

**On Android** — save `dist/openers.html` to Downloads and open it in Chrome.
Local files run JavaScript there, so it works as-is, offline.

**As an installable web app** — if it's hosted anywhere (`manifest.webmanifest`
and `sw.js` are in this directory), open it once and use *Add to Home Screen*.
The service worker is scoped to this directory and caches the shell, so it works
offline after the first visit.

**The database as data** — `node build.js` also writes:

| file | what it is |
| --- | --- |
| `data/openers.json` | all 2,000 names × 10 lines, with category and cheese rating |
| `data/openers.csv` | the same, one row per line, opens in Excel/Sheets |
| `data/names.json` | just the roster: name, gender, approximate rank |
| `dist/iphone/openers.json` | flat name → lines, for the iOS Shortcut (girls' names) |
| `dist/iphone/openers-all-2000.json` | the same for all 2,000 names |

## What you get back

Each line carries a **category** (`pun`, `wordplay`, `playful`, `question`,
`sincere`, `data`) and a **cheese rating** 0–3. Cheese is not quality — it's how
much of a bit the line is. A full-pun opener lands well with some people and
badly with others, so every set is built to mix: at least three low-cheese lines,
never more than five high-cheese ones, and never two lines from the same family.

## How a line gets made

Eleven families, each of which either has something to work with for a given name
or sits that name out:

| family | needs | example |
| --- | --- | --- |
| **gem** | a hand-written line for that name | *"Grace, I'm going to open with absolutely none of it and just hope the name rubs off on me."* |
| **hidden** | the name inside an English word | Sage → mes-**sage**, Ella → umbr-**ella**, Emma → dil-**emma** |
| **rhyme** | a rhyme class match | Penelope → cantaloupe; no match is its own good line ("Nothing rhymes with Ivy. I checked.") |
| **meaning** | an etymology entry | Vera → "truth"; Juniper → the berry that makes gin taste like gin |
| **nickname** | a known short form | "Are you a Penny, or is that a privilege you earn?" |
| **variant** | a spelling cluster | "Katie or Katy? I want it on record that I asked." |
| **shape** | palindrome / matching bookends / double letter | Hannah, Anna, Otto |
| **alliteration** | the first letter | "People whose names start with K are either kinder than you admit or keeping receipts." |
| **acrostic** | three distinct letters | spells a half-finished compliment and asks them to finish it |
| **syllables** | a name that can be counted confidently | see the caveat below |
| **rank** | a popularity rank | "You're about the #565 name in the country, which is my favorite kind of rare." |
| **universal** | nothing | works for any name at all |

Two rules keep a set from repeating itself. A hand-written gem can **claim**
another family's slot (`GEM_CLAIMS` in `src/knowledge.js`), so Quinn isn't told
twice that she rhymes with "win". And every line declares the wordplay words it
spends, so no two lines in a set can both reach for "umbrella".

## Adding to it

- **A better line for a specific name** → `GEMS` in `src/knowledge.js`. If it
  covers ground a generated family would also cover, add the name to
  `GEM_CLAIMS` so the generic version steps aside.
- **A name meaning, nickname or spelling variant** → the maps above it. These
  work for any name, including ones outside the 2,000.
- **A new rhyme class** → `RIMES` in `src/lexicon.js`, longest suffix first.
- **A word that hides a name** → `FUN_WORDS` in the same file. The engine finds
  the names inside it on its own.

Then `node test.js`. The suite sweeps all 2,000 names, so it catches the failures
that only hit one name — a leftover `{placeholder}`, a set that repeats itself, a
name that rhymes with itself.

## Caveats, honestly

- **Ranks are approximate.** The SSA's national baby-name data isn't reachable
  from the build environment that produced this (the proxy blocks `ssa.gov`), so
  the ordering is a good-faith reconstruction from recent SSA popularity, not a
  byte-exact copy of a given year's file. Spellings and gender tags are reliable;
  treat "#12 most popular" as "very common" rather than as a citation. To make it
  exact: download `names.zip` from ssa.gov/oact/babynames/limits.html and
  regenerate `src/names.js` from the newest `yobXXXX.txt`.
- **The syllable line declines rather than guesses.** A trailing "e" is silent in
  *Grace* and sounded in *Chloe*, and nothing in the spelling separates them, so
  names it can't count confidently (Penelope, Olivia, Sophia, anything ending
  consonant + e) simply don't get that line. A wrong syllable count inside a line
  somebody is about to send is worse than one fewer option.
- **No line comments on anyone's appearance or body**, on purpose. Every family
  works off the name, the etymology or a question.
- **Read it before you send it.** The best opener out of any of these is the one
  that sounds like you saying it — edit freely.
