// Raw material the line engine works from: rhyme classes, a word list for
// finding names hidden inside English words, and per-letter banks.
//
// TONE: these get sent from a phone, so they read like texts — contractions,
// short sentences, American spelling. Anything that sounds like it was written
// standing up at a lectern has been cut.
//
// VARIETY: every per-letter bank holds several options and every family in
// engine.js offers several phrasings. Two different names have to come back
// looking like two different sets, not one set with the name swapped out.

// ---------------------------------------------------------------------------
// RIME CLASSES
// Ordered LONGEST SUFFIX FIRST — the engine takes the first match, so a specific
// ending ("enelope") must sit above the general one ("ope"). A name that matches
// nothing gets the "nothing rhymes with you" line, which is a good line, so gaps
// here are cheap.
// ---------------------------------------------------------------------------
export const RIMES = [
  ['enelope', ['cantaloupe', 'antelope', 'envelope']],
  ['ictoria', ['euphoria', 'Astoria']],
  ['iffany', ['epiphany']],
  ['ethany', ['epiphany']],
  ['ichael', ['bicycle', 'recycle']],
  ['abella', ['umbrella', 'acapella', 'Coachella']],
  ['amilla', ['vanilla', 'chinchilla', 'flotilla']],
  ['amila', ['vanilla', 'chinchilla', 'flotilla']],
  ['arlett', ['starlet', 'scarlet fever']],
  ['arlet', ['starlet']],
  ['amuel', ['manual']],
  ['aniel', ['spaniel']],
  ['illow', ['pillow', 'armadillo']],
  ['arper', ['sharper']],
  ['iper', ['sniper', 'a windshield wiper']],
  ['ivia', ['trivia', 'Bolivia']],
  ['ailey', ['daily', 'a ukulele']],
  ['aylee', ['daily', 'a ukulele']],
  ['ayley', ['daily', 'a ukulele']],
  ['aleigh', ['daily']],
  ['aley', ['daily']],
  ['iley', ['smiley', 'highly', 'wildly']],
  ['ylie', ['smiley', 'highly']],
  ['ryan', ['a lion', 'iron', 'flyin’']],
  ['ordan', ['a warden', 'a garden']],
  ['organ', ['bourbon', 'a church organ']],
  ['eagan', ['vegan', 'pagan']],
  ['egan', ['vegan', 'pagan', 'began']],
  ['ogan', ['a slogan', 'began']],
  ['andon', ['abandon', 'random']],
  ['ustin', ['trustin’', 'adjustin’']],
  ['unter', ['a punter', 'blunter']],
  ['arter', ['smarter', 'a starter', 'a charter']],
  ['arker', ['darker', 'a marker']],
  ['eston', ['a question', 'a suggestion']],
  ['ayden', ['a maiden', 'shade in']],
  ['aiden', ['a maiden', 'shade in']],
  ['aden', ['a maiden', 'shade in']],
  ['ason', ['chasin’', 'racin’', 'a basin']],
  ['ummer', ['a bummer', 'a drummer', 'a plumber']],
  ['emma', ['a dilemma', 'a lemma']],
  ['ema', ['a dilemma', 'the cinema']],
  ['ella', ['umbrella', 'acapella', 'mozzarella']],
  ['elle', ['a carousel', 'caramel', 'clientele']],
  ['annah', ['a bandanna', 'Havana', 'a cabana']],
  ['anna', ['a bandanna', 'Havana', 'a cabana']],
  ['ana', ['a banana', 'a cabana', 'Havana']],
  ['issa', ['kiss ya', 'miss ya']],
  ['essa', ['finesse', 'espresso']],
  ['ina', ['a ballerina', 'an arena', 'a marina']],
  ['ena', ['an arena', 'a hyena', 'a marina']],
  ['ita', ['a margarita', 'a fajita']],
  ['aya', ['papaya']],
  ['aia', ['papaya']],
  ['una', ['tuna', 'Fortuna']],
  ['ova', ['a supernova', 'Casanova']],
  ['ava', ['lava', 'guava', 'java']],
  ['iara', ['a tiara', 'mascara']],
  ['ara', ['mascara', 'the Sahara', 'a tiara']],
  ['era', ['the Riviera', 'a chimera']],
  ['ira', ['the Riviera']],
  ['ora', ['a fedora', 'Pandora']],
  ['uby', ['a newbie', 'Scooby']],
  ['ucy', ['juicy', 'loosey-goosey']],
  ['olly', ['jolly', 'a trolley', 'volleyball']],
  ['illy', ['silly', 'chilly']],
  ['mily', ['family']],
  ['ily', ['silly', 'chilly']],
  ['ellie', ['jelly', 'a deli']],
  ['elly', ['jelly', 'a deli']],
  ['osie', ['cozy', 'nosy']],
  ['adie', ['a lady', 'shady']],
  ['ady', ['a lady', 'shady']],
  ['atie', ['weighty', 'lately']],
  ['aty', ['weighty', 'lately']],
  ['aisy', ['lazy', 'crazy', 'hazy']],
  ['acy', ['spacey', 'lacy']],
  ['arley', ['gnarly', 'barley']],
  ['arlie', ['gnarly', 'barley']],
  ['emi', ['dreamy', 'creamy']],
  ['emy', ['dreamy', 'creamy']],
  ['ophie', ['a trophy']],
  ['oey', ['snowy', 'doughy']],
  ['ace', ['space', 'a place', 'embrace']],
  ['ase', ['space', 'a place', 'embrace']],
  ['age', ['a stage', 'a page', 'backstage']],
  ['ope', ['nope', 'a horoscope']],
  ['ove', ['love', 'above', 'a glove']],
  ['ade', ['lemonade', 'a serenade', 'a parade']],
  ['ary', ['a canary', 'contrary', 'necessary']],
  ['ica', ['a harmonica', 'a replica']],
  ['ika', ['a harmonica', 'a replica']],
  ['oria', ['euphoria', 'Astoria']],
  ['uinn', ['a win', 'a twin', 'a penguin']],
  ['inn', ['a win', 'a twin', 'a penguin']],
  ['lynn', ['a violin', 'penicillin']],
  ['lyn', ['a violin', 'penicillin']],
  ['ette', ['a baguette', 'a silhouette', 'roulette']],
  ['aine', ['champagne', 'an airplane', 'a hurricane']],
  ['ane', ['champagne', 'an airplane', 'a hurricane']],
  ['een', ['caffeine', 'serene', 'a routine']],
  ['ene', ['caffeine', 'serene', 'a routine']],
  ['line', ['a valentine', 'a punchline', 'the borderline']],
  ['ames', ['games', 'flames', 'claims']],
  ['iver', ['a shiver', 'deliver', 'a quiver']],
  ['ucas', ['hocus pocus']],
  ['yatt', ['a riot', 'quiet', 'a diet']],
  ['oah', ['quinoa', 'Samoa', 'a boa']],
  ['ack', ['a snack', 'a track', 'attack']],
  ['ax', ['snacks', 'tracks', 'relax']],
  ['ateo', ['a rodeo', 'a video']],
  ['eo', ['a rodeo', 'a video']],
  ['evi', ['a high-five', 'a drive-by']],
  ['uke', ['a fluke', 'rebuke']],
  ['iah', ['a pariah', 'a messiah']],
  ['ian', ['a comedian', 'a guardian', 'obsidian']],
  ['ani', ['a tsunami', 'origami', 'salami']],
  ['lan', ['a villain', 'a melon']],
  ['len', ['a melon', 'fallen']],
  ['son', ['a lesson', 'venison', 'in unison']],
  ['ton', ['a button', 'mutton', 'forgotten']],
  ['ley', ['a medley', 'a melody', 'merrily']],
  ['lie', ['a medley', 'a melody']],
  ['lee', ['a medley', 'a melody']],
  ['ance', ['a chance', 'romance', 'a glance']],
  ['ine', ['caffeine', 'a routine', 'serene']],
  ['ia', ['see ya', 'IKEA', 'Korea']],
  ['eah', ['see ya', 'IKEA']],
];

// Names whose suffix match would produce a bad rhyme. Landing here is not a
// failure — it routes the name to the "nothing rhymes with you" line instead,
// which tests better than a forced rhyme anyway.
export const NO_RHYME = new Set([
  'ivy', 'sophia', 'sofia', 'ian', 'jasmine', 'orange', 'silver', 'purple',
  'month', 'morgan', 'autumn', 'olive', 'iris', 'pearl', 'wren',
  'faith', 'hazel', 'skye',
]);

// ---------------------------------------------------------------------------
// WORD LIST for hidden-name detection.
// The engine looks for a name sitting INSIDE one of these words ("Ella" inside
// "umbrella"). Chosen for being fun to point at, not for dictionary coverage —
// a boring hit is worse than no hit.
// ---------------------------------------------------------------------------
export const FUN_WORDS = `
avalanche available javelin lavender lava guava java cassava
umbrella acapella patella novella cinderella mozzarella
dilemma lemma gemma cinema
bandanna savannah hosanna banana cabana panorama analysis manager banner
amiable amiably
lunar lunatic
renovate innovation supernova
disgrace graceful gracious
primrose morose prose arose rosemary rosewood
skateboard skate
coral decorate decorative memorable corridor
honorary honorable
declaration declare
adamant adage
channel planner manner scanner annual annals
truth ruthless
faithful faithfully
enjoy joyful killjoy joyous
message passage sausage massage sabotage
skyline skyscraper
wrench wrenching
jaded unjaded
chamber chambered
angelic evangelist
harmonious harmonica
realization civilization organization visualization
familiar peculiar reliable australia
similar similarly
visa artisan
safari primary summary temporary
constellation
levitate levitation
brilliant guardian median italian comedian obsidian
william
delicious believe relief delightful elite delicate elimination
napoleon chameleon leopard
theory theater theatrical
washer washing
jackpot blackjack hijack
lukewarm fluke
maximum maximize
benefit benevolent
sample sesame samples
quinoa
hocus focus
spaniel
bicycle recycle
manual manually
smarter starter charter
abandon abandoned
imagination original originally
array betray portray
elevate unbelievable believable
mascara caramel caravan
trivia trivial
vanilla gorilla chinchilla flotilla guerrilla
autumnal
melodic melodrama
serenade serendipity serene
destined destination
alliance appliance compliance reliance variance
adventure venture
paradise canyon diamond harmony
victory victorious
notorious hilarious mysterious curious furious
aquarium planetarium auditorium
sanctuary dictionary imaginary extraordinary
experiment achievement commitment appointment
department apartment compartment
alphabet trumpet magnet
kindness kindred
january february
teacher preacher feature creature
peaceful peace
average beverage leverage
sabbatical fanatical
statistics logistics mathematics dramatics
karaoke
avocado
piano oregano espresso tiramisu
spaghetti confetti broccoli
zucchini martini bikini houdini
biscotti macaroni pepperoni minestrone provolone
telephone microphone saxophone xylophone
marathon paragon octagon hexagon polygon
cardigan mulligan ptarmigan
oxygen nitrogen hydrogen
margarine tangerine submarine clementine turpentine
valentine serpentine quarantine gasoline vaseline
mandolin franklin penicillin violin insulin muslin marlin merlin
dublin poplin bulletin gelatin satin
platinum laminate dominate nominate illuminate eliminate terminate
alternate carbonate chocolate pomegranate
delicatessen delegate elegant
elephant relevant defiant radiant
lenient convenient ingredient obedient expedient
recipient sufficient efficient ancient patient transient
conscience experience audience resilience brilliance
clearance insurance endurance assurance performance
romance finance abundance
adorable admirable adventurous
balloon baloney bonanza
calendar calamine caravan cathedral
dandelion daffodil dominoes
echo eclipse economy escalator
fantastic festival flamingo
galaxy gazebo glacier granola
habanero halibut harmonize hibernate
icicle igloo immaculate
jubilee juniper justice
kangaroo kaleidoscope
lasagna lantern lullaby luminous
macaron magnolia mahogany mandarin marigold
nectarine nostalgia notebook
oasis obstacle octopus opera orchestra
paprika parachute parmesan pavilion pelican
quesadilla quicksand
radiator raspberry renaissance rhubarb
salamander satellite semaphore sequoia sombrero
tambourine tapestry telescope tornado tuxedo
ukulele umbrage
velociraptor vertigo vinaigrette volcano
waffle walrus wanderlust watermelon
xylophone yogurt zeppelin
`.trim().split(/\s+/);

// A hit on one of these reads as an insult, so the engine never uses them for
// a "your name is hiding in this word" line.
export const HIDDEN_BLOCKLIST = new Set([
  'disgrace', 'morose', 'nuisance', 'killjoy', 'hopeless', 'ruthless',
  'salmonella', 'enema', 'sabotage', 'lunatic', 'goblin', 'gremlin',
  'hooligan', 'betray', 'abandon', 'abandoned', 'impatient', 'allergen',
  'desperado', 'tornado', 'volcano', 'furious', 'notorious', 'melodrama',
  'obstacle', 'quicksand', 'vertigo', 'umbrage', 'halibut', 'walrus',
]);

// ---------------------------------------------------------------------------
// PER-LETTER BANKS
// Three options per letter, because one option means every K name in the
// database comes back with the identical sentence. Both halves of a pair must
// start with the letter, and both must be something a person would happily cop
// to — "which one am I dealing with" only works if either answer is fun to claim.
// ---------------------------------------------------------------------------
export const ALLITERATION = {
  a: [['aggressively punctual', 'allergic to plans'], ['always the planner', 'avoiding your group chat'], ['ambitious', 'armed with strong restaurant opinions']],
  b: [['brutally honest', 'bad at texting first'], ['better at banter than small talk', 'busy in a way you secretly like'], ['bad with directions', 'brilliant at picking places']],
  c: [['chaotically fun', 'careful with your words'], ['competitive about board games', 'calm in a crisis'], ['crushing one very specific hobby', 'constantly cleaning out your camera roll']],
  d: [['dangerously competitive', 'down for anything'], ['dry-humored', 'dramatic about the weather'], ['definitely the driver', 'drawn to terrible reality TV']],
  e: [['extremely online', 'elegantly unbothered'], ['early to everything', 'easily distracted by dogs'], ['emotionally invested in one show', 'excellent at leaving a party']],
  f: [['funnier than you let on', 'fiercely loyal'], ['fast at texting', 'frighteningly good at trivia'], ['fussy about coffee', 'first to suggest a road trip']],
  g: [['great at comebacks', 'genuinely terrible at directions'], ['good in a crisis', 'glued to one podcast'], ['generous with recommendations', 'guarded until you know someone']],
  h: [['hilarious in group chats', 'hard to impress'], ['happiest outdoors', 'hopeless at picking a restaurant'], ['honest to a fault', 'hoarding screenshots']],
  i: [['incredibly stubborn', 'impossible to surprise'], ['into one very specific genre', 'indifferent to brunch'], ['instantly at home anywhere', 'indecisive about dinner']],
  j: [['just a little chaotic', 'judgmental about music'], ['juggling too many hobbies', 'joking to dodge sincerity'], ['joyfully competitive', 'justifiably picky']],
  k: [['kinder than you admit', 'keeping receipts on everyone'], ['known for one specific dish', 'killing it at karaoke'], ['keen on early mornings', 'knowingly bad at directions']],
  l: [['low-key competitive', 'loud in the car'], ['loyal to one coffee shop', 'late but worth it'], ['listening more than talking', 'likely to reorganize my playlists']],
  m: [['mildly feral on weekends', 'meticulous about playlists'], ['more fun than your profile lets on', 'married to a routine'], ['moving too fast', 'magnetically drawn to bad movies']],
  n: [['never on time', 'nicer than your texts suggest'], ['notoriously competitive', 'not a morning person'], ['nosy in a fun way', 'naturally good at everything']],
  o: [['obsessed with one show', 'outrageously picky about coffee'], ['organized to a fault', 'open to literally anything'], ['often the loudest', 'oddly good at accents']],
  p: [['particular about restaurants', 'pretending to be chill'], ['permanently planning a trip', 'pretty competitive'], ['punctual', 'prone to overthinking a text']],
  q: [['quietly hilarious', 'quick to argue about pizza'], ['questioning everything', 'quietly the most competitive'], ['quick with a comeback', 'quietly running the group chat']],
  r: [['ridiculously competitive', 'relentlessly kind'], ['running late', 'ready for anything'], ['reading three books at once', 'rewatching the same show again']],
  s: [['secretly competitive', 'sarcastic before noon'], ['stubborn about music', 'soft about animals'], ['sharp', 'slow to text back on purpose']],
  t: [['terrible at small talk', 'tragically loyal to one coffee order'], ['type A', 'totally winging it'], ['too competitive at trivia', 'testing every restaurant twice']],
  u: [['unreasonably good at trivia', 'up way too late'], ['unbothered', 'under-selling yourself'], ['usually early', 'unwilling to pick the restaurant']],
  v: [['very attached to your routine', 'voted most likely to overpack'], ['very competitive', 'vaguely nocturnal'], ['vetting me right now', 'voting for the dive bar']],
  w: [['witty and know it', 'way too into your playlist'], ['warm immediately', 'wary of anyone too smooth'], ['weirdly good at directions', 'waiting for me to say something normal']],
  x: [['excellent at trivia nobody asked for', 'exactly as fun as your name suggests'], ['extremely hard to categorize', 'excited about small things'], ['expecting better than this message', 'exceptionally hard to impress']],
  y: [['young at heart about one thing', 'yelling at the TV during sports'], ['yes to most adventures', 'yearning for a vacation'], ['your friends’ therapist', 'yawning at my message already']],
  z: [['zero chill about your favorite show', 'zealous about breakfast food'], ['zoned out right now', 'zealously loyal to one restaurant'], ['zigzagging between hobbies', 'zen about everything']],
};

export const ACROSTIC = {
  a: ['actually funny', 'ahead of me already'],
  b: ['better taste than me', 'bad influence, probably'],
  c: ['chronically curious', 'cooler than this message'],
  d: ['dangerously charming', 'definitely trouble'],
  e: ['excellent taste, I can tell', 'easy to picture talking to'],
  f: ['funny first', 'fully aware of it'],
  g: ['good listener, I’m guessing', 'genuinely interesting'],
  h: ['hard to forget', 'here for a good time'],
  i: ['impossible to categorize', 'intimidating, slightly'],
  j: ['just my kind of trouble', 'judging this already'],
  k: ['kind, obviously', 'keeping me guessing'],
  l: ['a little bit chaotic', 'likely out of my league'],
  m: ['a menace, complimentary', 'making this hard'],
  n: ['no notes', 'not bored yet, hopefully'],
  o: ['objectively cool', 'out of nowhere'],
  p: ['probably competitive', 'pretty great so far'],
  q: ['quick-witted', 'quietly the best part of my day'],
  r: ['ridiculously easy to talk to', 'reading this at a red light'],
  s: ['somehow already interesting', 'still here, I hope'],
  t: ['terrifyingly cool', 'the reason I’m typing'],
  u: ['unreasonably charming', 'up to something'],
  v: ['very much my problem now', 'very hard to sum up'],
  w: ['worth the effort', 'winning already'],
  x: ['the x-factor', 'exactly the problem'],
  y: ['a yes to most things', 'younger than my jokes'],
  z: ['zero notes', 'zero chance I don’t send this'],
};

// ---------------------------------------------------------------------------
// UNIVERSAL LINES — work for any name, no hooks required.
//
// This pool is deliberately large. These are the lines that carry names the
// engine knows nothing about, so a small pool is exactly what makes two
// different names come back looking like the same set with the name swapped.
// ---------------------------------------------------------------------------
export const UNIVERSAL = [
  { t: 'Draft one was a pun on your name. Draft two was worse. This is draft three: hi, {name}.', c: 'playful', cheese: 1 },
  { t: '{name} is a really fun name to say out loud. I know because I just did, twice, alone, like a normal person.', c: 'playful', cheese: 2 },
  { t: 'Okay {name}, three guesses about you: very specific coffee order, rewatched a comfort show this month, funnier over text than you let on. How many did I get?', c: 'question', cheese: 1 },
  { t: 'Spellcheck keeps underlining your name in red. Rude. The dictionary’s the one that’s wrong here.', c: 'playful', cheese: 2 },
  { t: '{name} — {letters} letters, and I’ve typed and deleted them about forty times. This is the one that made it out.', c: 'sincere', cheese: 1 },
  { t: 'Two options here, {name}: clever or honest. Going with honest — your profile made me laugh.', c: 'sincere', cheese: 0 },
  { t: 'Serious question, {name}: are you a four-minute replier or a four-business-days replier? Just managing expectations.', c: 'question', cheese: 1 },
  { t: '{name}, what’s the best thing you ate this week? I’m collecting recommendations and also stalling.', c: 'question', cheese: 0 },
  { t: 'Hi {name}. No bit, no wordplay. Just someone who read your profile twice and figured I’d say something.', c: 'sincere', cheese: 0 },
  { t: 'Opened this app to kill ten minutes and now I’m editing a message. That’s on you, {name}.', c: 'sincere', cheese: 1 },
  { t: '{name}, pick one and I’ll plan the whole first date around it: a bakery, a bookshop, or somewhere with an unhinged happy hour.', c: 'question', cheese: 1 },
  { t: 'Most important question first, {name}, and there is definitely a wrong answer: is a hot dog a sandwich?', c: 'question', cheese: 2 },
  { t: '{name}, I’m told the move is to ask something real, so — what are you weirdly good at?', c: 'question', cheese: 0 },
  { t: 'Be honest, {name}: how many messages have you gotten about your name? I’d like to know what I’m up against.', c: 'question', cheese: 1 },
  { t: 'Two truths and a lie, {name}. You go first — I want to see how you play before I show my hand.', c: 'question', cheese: 1 },
  { t: 'Settle something for me, {name}: best meal in this city, and you can’t say the obvious one.', c: 'question', cheese: 0 },
  { t: 'Let me guess your Sunday, {name}: nothing planned, one nice thing, home by nine. Close?', c: 'question', cheese: 1 },
  { t: '{name}, what’s the last thing that made you laugh out loud? Mine was watching myself retype this.', c: 'question', cheese: 1 },
  { t: 'Not going to pretend this was spontaneous, {name}. I reread your profile and here we are.', c: 'sincere', cheese: 0 },
  { t: '{name}, if this goes well we’ll have to lie about how it started. What’s our story?', c: 'playful', cheese: 2 },
  { t: 'Quick, {name}: coffee, a walk, or a drink somewhere with bad lighting and good fries?', c: 'question', cheese: 0 },
  { t: 'On a scale of one to “I have a spreadsheet”, how much of a planner are you, {name}?', c: 'question', cheese: 1 },
  { t: 'I had one good opener and I used it on a message I never sent. So: hi, {name}.', c: 'playful', cheese: 1 },
  { t: '{name}, what could you talk about for an hour with no warning? I’d genuinely like to hear it.', c: 'question', cheese: 0 },
  { t: 'Skipping the part where I act casual about this, {name}. Your profile’s great. Hi.', c: 'sincere', cheese: 0 },
  { t: '{name}, I’m going to need your position on pineapple, cilantro, and putting ketchup on eggs. Take your time.', c: 'question', cheese: 2 },
  { t: 'Genuine question, {name}: what’s something you changed your mind about this year?', c: 'question', cheese: 0 },
  { t: 'I reread this four times looking for the word that would make it sound less keen, {name}. Couldn’t find one.', c: 'sincere', cheese: 1 },
];

// Rank-aware lines. Popularity is real data we happen to have, so it may as well
// do some work.
export const RANK_LINES = {
  common: [
    { t: '{name} is around the #{rank} most popular {kind} name in America. I’ve met a few. None of them made me rewrite a message five times.', c: 'data', cheese: 1 },
    { t: 'There are a lot of {name}s out there. Exactly one of them is getting this message.', c: 'data', cheese: 1 },
  ],
  mid: [
    { t: '{name} sits around #{rank} on the name charts — common enough that I can spell it, rare enough that I’ll remember it.', c: 'data', cheese: 1 },
    { t: 'Looked it up: {name} is about the #{rank} most popular {kind} name here. Perfect spot, honestly.', c: 'data', cheese: 1 },
  ],
  rare: [
    { t: '{name} is only about #{rank} in the country. That’s my favorite kind of rare — not a whole conversation, just memorable.', c: 'data', cheese: 1 },
    { t: 'You’re around #{rank} on the popularity list, {name}, which means I’ve almost certainly never said this name out loud before.', c: 'data', cheese: 1 },
  ],
};

// More universals. The pool size IS the anti-repetition mechanism: with a small
// pool, two names that share no hooks come back looking like the same message.
// These skew low-cheese, since that is the half of the set the quota forces.
UNIVERSAL.push(
  { t: '{name}, what’s a small thing that made your week better? I’ll go first: someone let me merge.', c: 'question', cheese: 0 },
  { t: 'I’m not going to pretend I have a clever angle here, {name}. You seem great and I wanted to say hello.', c: 'sincere', cheese: 0 },
  { t: 'Okay {name}, real question: are you better in the morning or after 10pm? It explains a lot about a person.', c: 'question', cheese: 0 },
  { t: '{name}, what’s the one recommendation you give everybody? Book, restaurant, anything. I’ll take it seriously.', c: 'question', cheese: 0 },
  { t: 'Genuinely: what’s your week been like, {name}? Not the polite version.', c: 'sincere', cheese: 0 },
  { t: '{name}, I’d like to state for the record that I typed something much worse first and deleted it.', c: 'playful', cheese: 1 },
  { t: 'Tell me the thing you’d put on a billboard, {name}. No pressure, only the whole city is watching.', c: 'question', cheese: 1 },
  { t: '{name}, what were you doing right before you opened this? I’m curious what I interrupted.', c: 'question', cheese: 0 },
  { t: 'Hi {name} — I’m going to ask you something normal instead of being clever: what are you into lately?', c: 'sincere', cheese: 0 },
  { t: 'If we end up getting a drink, {name}, are you ordering the same thing every time or gambling every time?', c: 'question', cheese: 1 },
);

// ---------------------------------------------------------------------------
// WORDS HIDING INSIDE NAMES — the reverse of FUN_WORDS.
//
// FUN_WORDS finds the name inside a word (Ella -> umbrELLA). This finds a word
// inside the name (Win-ter, C-ART-er, P-REST-on, Ja-mie).
//
// This is an ALLOWLIST on purpose, not a dictionary with a blocklist bolted on.
// Names contain plenty of substrings nobody wants pointed at them — Cassandra
// and Sadie are the obvious ones — and the only way to be certain none of them
// ever ships is to never search for them. Every word here is one a person would
// be pleased to find in their name.
// ---------------------------------------------------------------------------
export const INSIDE_WORDS = `
me my us we hi
ace ale and arc ark arm art ash awe
bay bee bell best bet bid boa bow box bud
cab cake calm can cape car card care cart case cave cell chat chin
coal coin cold cool cord core corn cove crow cue cup
dance dare dart date dawn day deal dear deer den dew dime dine dish dive
doe dot dove dream drum duo dusk
ear earn ease east eat echo eel elf elm end ever eve eye
fair fall fan far fare farm fawn fern fig fin fine fire fish five flag
flame fly foe fold folk fond fort four fox free frost
gale game gate gaze gear gem gift glad glen glow goal gold golf good
grace grain grand grape grass green grin
hail hair halo hand harp haven hawk hay heal heart heat herb hero
hey high hill hint hive hold holy home honey hood hope horn hour hunt
ice idea ink inn iris iron isle ivy
jam jar jazz jet jewel jig joy jump june
keen key kid kin kind king kiss kit kite knee know
lace lake lamb lamp land lane lark last late lava lawn lead leaf lean
leap lease lemon lend lens lie life lift light like lime line link lion
lip live loaf loan loft lone long look loop lord lore lot loud love luck
lure lush lute
made magic maid mail main make male mane map march mare mark mars mask
mast mate maze meal meat meet melon men mend mercy mesa mice mild mile
milk mill mind mine mint mist moat mode mole moon moor more moss most
moth motto mount move muse music
nail name nap near neat nest net new news nice night nine noble nod noon
north nose note nova nut
oak oar oat ocean ode olive omen one open opera orbit order ore organ
other oval oven owl own
pace pack page pail pair pal pale palm pan park part pass past path paw
pea peace peak pear pearl pen perch pet pie pier pike pin pine pink pint
pipe place plan plane plant play plea plum poem poet point pole pond pony
pool poppy port pose post pour power prize prom pure
quest quiet quill quilt quiz
race rack radio raft rail rain raise rake ranch range rank rare rate
rave raven ray reach read real realm reap reed reef reel rest rice ride
right ring rinse rise rite river road roam robin rock role roll roof
room root rope rose rosy round route row royal ruby rule run rush rye
safe sage sail saint sake sale salt same sand sane save saw say scale
scene scent score sea seal seam search season seat see seed seek seen
sell send sense seven shade shake shape share shark sharp sheen shelf
shell shine ship shire shore show shy side sigh sight sign silk silver
sing sir site six size ski skip sky slate sled sleep slide slim slope
small smart smile snow soap soar soda sofa soft soil sole solid solo son
song soon sort soul sound soup south space spade span spare spark speak
spear speed spell spice spin spire spoke spoon sport spot spring square
stable stage stair stake stall stamp stand star stare start state stay
steam steel stem step stern stew stick still sting stir stone store
storm story stove straw stream street strike string strong study style
sugar suit sum summer sun sure surf swan sway sweet swift swim swing
table tack tag tail take tale talk tall tame tan tank tap tape tart task
taste tea teach team tease tell ten tend tent term test text then thin
third thorn thread three throne tide tidy tie tiger tile time tin
tint tiny tip tire toast toe token tone tool top torch total touch tour
tower town toy trace track trade trail train tram trap tray treat tree
trek trend trial tribe trick trim trio trip troop true trust truth try
tube tuck tulip tune turn twig twin two
under unit urge use
vale valley value van vane vase vast veil vein vent verse very vest vet
vibe view vine violet visit vivid voice vote vow
wade wagon wait wake walk wall waltz wand ward warm wash watch water wave
wax way wear weave web wed week well west whale wheat wheel when where
while white whole wide wild will win wind wine wing wink winter wire wise
wish wit wolf wonder wood wool word work world worth wren write
yard yarn year yes yet yield yoga you young youth
zeal zen zero zest zone zoo
`.trim().split(/\s+/);

// Riffs for the payload words that deserve their own joke. Anything not listed
// falls back to a generic reveal, which is still a good line — the split itself
// is the surprise.
export const INSIDE_RIFFS = {
  race: 'There’s a whole race in there. I’m already behind, apparently.',
  jam: 'There’s a jam in there. Sweet, musical, or a traffic situation — you pick.',
  harp: 'There’s a harp in there, so your name literally comes with a soundtrack.',
  lane: 'There’s a lane in there. Staying in mine, but I did want to mention it.',
  mine: 'There’s a “mine” in there. Presumptuous of your name. I’m saying nothing.',
  wine: 'There’s a wine in there, which I’m reading as a suggestion rather than a coincidence.',
  note: 'There’s a note in there. Consider this me passing one back.',
  tune: 'There’s a tune in there. Your name is doing more work than mine ever has.',
  rain: 'There’s rain in there. Cozy, honestly.',
  hand: 'There’s a hand in there, which is a nice thing for a name to offer.',
  plan: 'There’s a plan in there, which is one more than I had when I opened this.',
  date: 'There’s a date in there. I want it on record that your name brought it up first.',
  time: 'There’s time in there, which is convenient, because I’d like some of yours.',
  home: 'There’s a home in there. That’s a lovely thing to carry around.',
  name: 'There’s literally a “name” inside your name. Efficient. A bit smug.',
  sage: 'There’s a sage in there — wise, or the herb. Either way it beats what mine has.',
  dawn: 'There’s a dawn in there. Your name is a better time of day than I am.',
  kind: 'There’s a “kind” in there, and I’m choosing to believe the name knows something.',
  ocean: 'There’s an ocean in there. My name has a consonant cluster.',
  key: 'There’s a key in there. Not sure what it opens. Curious though.',
  hi: 'There’s a “hi” in there, which is convenient, because that is roughly the extent of my plan.',
  me: 'There’s a “me” in there. I’d like there to be a “you and me” eventually, but let’s start with hello.',
  my: 'There’s a “my” in your name, which is presumptuous of it, and I’ve decided not to argue.',
  us: 'There’s an “us” in there already. Your name is significantly ahead of both of us.',
  we: 'There’s a “we” in there. Your name is making plans before I’ve even said hi.',
  and: 'There’s an “and” right in the middle, which feels like a good omen for a conversation.',
  art: 'There’s art in there. I’m taking that as a personality reference.',
  win: 'You’ve got a win built right into your name. Some of us have to go out and earn those.',
  rest: 'There’s a “rest” in there and I badly need one. Coffee?',
  sea: 'There’s an entire sea in your name. Mine has a shed in it.',
  sky: 'There’s a sky in there. Hard to compete with, frankly.',
  star: 'There’s a star in your name, which sets the bar unreasonably high before we’ve even spoken.',
  sun: 'There’s a sun in there, which explains why the weather improved.',
  moon: 'There’s a moon in there. Your name has better scenery than most.',
  hope: 'There’s hope in there, which is more than most names are offering right now.',
  joy: 'There’s a joy in there. Great name. Excellent advertising.',
  love: 'There’s a “love” in there. That’s moving fast, but your name started it, not me.',
  king: 'There’s a king in there. I’ll adjust my tone accordingly.',
  ever: 'There’s an “ever” in there. Ambitious for a first message, but I respect the confidence.',
  lie: 'There’s a “lie” in there — spelled, at least. Choosing to trust you anyway.',
  tell: 'There’s a “tell” in there. Poker is going to be difficult for you.',
  end: 'There’s an “end” in there, which is a strange thing to put in a name and I’d like to discuss it.',
  eat: 'There’s an “eat” in there. Taking that as a dinner suggestion.',
  gem: 'There’s a gem in there. Not going to elaborate.',
  ace: 'There’s an ace in there. Good hand.',
  wild: 'There’s a “wild” in there and I’d like to know exactly how accurate that is.',
  iron: 'There’s iron in there. Structurally sound.',
  calm: 'There’s a “calm” in there, which is the opposite of how I’ve been writing this message.',
  fire: 'There’s a fire in there. Noted, respected, slightly alarmed.',
  storm: 'There’s a storm in there. I’d like a little warning before it arrives.',
  song: 'There’s a song in there. Your name is basically a playlist.',
  music: 'There’s music in there. Mine just has consonants.',
  dream: 'There’s a “dream” in there. Whoever named you was aiming high.',
  magic: 'There’s magic in there. That feels like an unfair advantage.',
  night: 'There’s a night in there, which is convenient, because I was going to suggest one.',
  river: 'There’s a river in there. Your name has better scenery than mine.',
  rose: 'There’s a rose in there, so your name comes with its own garden.',
  true: 'There’s a “true” in there, which is a lot to live up to and I hope it’s working out.',
  best: 'There’s a “best” in there. Bold of your parents. Seems to have worked.',
  cool: 'There’s a “cool” in there, and honestly the name is just telling on you at this point.',
  quiet: 'There’s a “quiet” in there. I’m going to guess that’s misleading.',
};

// ---------------------------------------------------------------------------
// SOUND-ALIKE ENDINGS — the version you only hear out loud.
//
// Ja-mie ends in the sound "me" without containing the letters. Each rule is
// [ending, what it sounds like], longest first, and each is checked against real
// pronunciations rather than spelling patterns, because the spelling is exactly
// what hides these.
// ---------------------------------------------------------------------------
export const SOUND_ENDINGS = [
  ['ophie', 'fee'],     // Sophie
  ['ustine', 'teen'],   // Justine
  ['istine', 'teen'],   // Christine
  ['mille', 'meal'],    // Camille
  ['lise', 'lease'],    // Elise
  ['nise', 'niece'],    // Denise
  ['cole', 'coal'],     // Nicole
  ['leen', 'lean'],     // Colleen, Kathleen
  ['lene', 'lean'],     // Charlene, Marlene
  ['reen', 'green'],    // Doreen, Maureen
  ['ette', 'net'],      // Annette, Colette, Juliette
  ['eese', 'ease'],     // Reese
  ['ouise', 'ease'],    // Louise
  ['mmy', 'me'],        // Emmy, Tammy
  ['mie', 'me'],        // Jamie
  ['mi', 'me'],         // Naomi, Remi, Demi
];

export const SOUND_RIFFS = {
  me: 'That’s a “me” on the end. I’d like a “you” in front of it at some point.',
  lean: 'Your name ends on the word “lean”, which I’m choosing to read as advice.',
  green: 'Your name ends on “green”. Nothing to add. I just wanted you to hear it too.',
  meal: 'Your name ends on the word “meal”, which is either a coincidence or a dinner invitation.',
  coal: 'Your name ends on “coal”, which is a diamond eventually, so, patience.',
  net: 'Your name ends on “net”. Good, because I’m about to throw something and hope it lands.',
  ease: 'Your name ends on the word “ease”, which is the exact opposite of how I wrote this.',
  lease: 'Your name ends on “lease”. I’d like to sign something long-term but let’s start with a coffee.',
  teen: 'Your name ends on “teen”, which explains nothing but I noticed it and now you have to as well.',
  fee: 'Your name ends on “fee”, which sounds expensive, and honestly that tracks.',
  niece: 'Your name ends on “niece”. Not useful information. Passing it along regardless.',
};

// ---------------------------------------------------------------------------
// SUBSTITUTIONS — the name USED AS the word, not just pointed at.
//
// The difference matters. "Your name ends in the sound 'me'" is an observation.
// "Trust ja-mie on this one" is a joke, because you hear the name and the word
// at the same time. Same for "that's my best caro-line" and "don't put the
// cart-er before the horse".
//
// {s} is the name, lowercased and hyphenated at the seam. Lowercase on purpose:
// capitalized it reads as a name and the pun dies.
// ---------------------------------------------------------------------------
export const SUBSTITUTIONS = {
  sum: ['and that is the {s} of it'],
  part: ['that’s the best {s}'],
  start: ['now that is a good {s}'],
  tone: ['I like your {s}'],
  ten: ['solid {s} out of ten'],
  mile: ['I’d go a {s} for that'],
  mint: ['in {s} condition'],
  ray: ['you’re a {s} of light here'],
  rose: ['everything’s coming up {s}'],
  pace: ['I like your {s}'],
  point: ['you’ve got a {s}'],
  match: ['that might be a {s}'],
  pearl: ['that’s a {s} of wisdom'],
  spark: ['there’s a {s} here'],
  me: [
    'you, {s}, and a coffee somewhere with terrible lighting',
    'trust {s} on this one',
    'it’s not just {s}, right?',
    'between you and {s}',
  ],
  line: ['that’s my best {s}', 'and that is the last {s} I’ve got'],
  win: ['I’m calling this one a {s}'],
  meal: ['are you free for a {s} sometime?'],
  harp: ['I promise not to {s} on about it'],
  cart: ['I know, I know — don’t put the {s} before the horse'],
  bell: ['okay, that rings a {s}'],
  lot: ['that is a {s} to take in'],
  race: ['I wasn’t going to make this a {s}, and then I replied in nine seconds'],
  rest: ['I could genuinely use a {s}'],
  art: ['this conversation is basically {s}'],
  date: ['so… a {s}, then?'],
  time: ['do you have {s} on Thursday?'],
  plan: ['now that is a {s}'],
  home: ['get {s} safe'],
  key: ['you might be the {s} here'],
  tea: ['want to get a {s} sometime?'],
  star: ['you’re the {s} of this conversation'],
  lie: ['and that’s no {s}'],
  tell: ['that right there is a {s}'],
  gem: ['you are an absolute {s}'],
  ace: ['you’re an {s}'],
  best: ['you might be the {s} thing about this app'],
  true: ['and that is {s}'],
  hope: ['I {s} so, anyway'],
  kind: ['that’s very {s} of you'],
  more: ['I’d like {s}, please'],
  one: ['you might be the {s}'],
  sure: ['are you {s} about that?'],
  soon: ['see you {s}?'],
  fine: ['that’s {s} by me'],
  deal: ['is that a {s}?'],
  luck: ['wish me {s}'],
  song: ['this is turning into a {s}'],
  note: ['consider this a {s}'],
  dream: ['honestly, this is a {s}'],
  sun: ['you’re the {s} here'],
  sky: ['the {s}’s the limit'],
  wine: ['{s} sometime?'],
  wild: ['this is {s}'],
  calm: ['stay {s}'],
  fire: ['you are on {s}'],
  lane: ['I’ll stay in my {s}'],
  mine: ['is this seat {s}?'],
  end: ['no {s} in sight'],
  peace: ['I come in {s}'],
  green: ['I’m taking that as a {s} light'],
  ease: ['this is going at {s}'],
  lease: ['I’d sign a {s} on this conversation'],
  net: ['and it goes straight into the {s}'],
  lean: ['I’m going to {s} into this one'],
  fee: ['there’s no {s} for this conversation, it’s free'],
};
