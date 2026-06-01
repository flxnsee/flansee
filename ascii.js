/* ============================================================
   ascii.js — the ASCII art library for HABITAT OS
   plain global script (no JSX) — exposes window.ASCII
   ============================================================ */
(function () {
  // ---- big hero mascot: a calm sleeping habitat-cat ----
  const MASCOT = String.raw`
        .                          .
         \\'-._   _.-'/
          \\_  '-'  _//          ( ( o o ) )
        .-'  '-. .-'  '-.         \   --   /
       /   .-.   '   .-.   \       '~~~~~~'
      |   ( o )     ( o )   |    ~ habitat is awake ~
      |    '-'   ^   '-'    |
       \        ___        /
        '-.    '...'    .-'
           '-._     _.-'
          jgs   '''''
`;

  // a compact awake cat (used near hero)
  const CAT_AWAKE = String.raw`
 /\_/\
( o.o )
 > ^ <`;

  // animation frames for a blinking / sleeping cat
  const CAT_FRAMES = [
    String.raw` /\_/\
( o.o )
 > ^ <`,
    String.raw` /\_/\
( -.- )
 > ^ <`,
    String.raw` /\_/\
( o.o )
 > ^ <`,
    String.raw` /\_/\
( ^.^ )  ~
 > ^ <`,
  ];

  const CAT_SLEEP = [
    String.raw`  |\___/|
  )     (   z
 =\     /=   z
   )   (
  (  :  )
   )   (
  (_____)`,
    String.raw`  |\___/|
  )     (    z
 =\     /=  z
   )   (
  (  :  )
   )   (
  (_____)`,
  ];

  // floating blob entity frames (breathing)
  const BLOB_FRAMES = [
    String.raw` .-""-.
/ .--. \
| |  | |
\ '--' /
 '-..-'`,
    String.raw` .-""-.
/ o  o \
|  --  |
\      /
 '-..-'`,
    String.raw`.-"""-.
/ o  o \
|  ww  |
\      /
 '-...-'`,
  ];

  // terminal spirit / ghost frames (drifting)
  const SPIRIT_FRAMES = [
    String.raw`  .-.
 (o o)
 | O |
 '~'~'`,
    String.raw`  .-.
 (- -)
 | O |
 '~'~'`,
    String.raw`  .-.
 (o o)
 |O  |
 '~~'~`,
  ];

  // tiny inline creatures for sprinkling in text
  const TINY = {
    catSit:  `=^.^=`,
    catRun:  `=^o^=`,
    blob:    `(°ᴥ°)`,
    spirit:  `ᗤ`,
    paw:     `🐾`,
    sparkle: `*`,
  };

  // specimen (project) field-guide arts
  const SPECIMEN_ART = {
    loom: String.raw`   ___________
  | . . . . . |   weaving
  |: : : : : :|   threads
  |. . . . . .|   into
  |___________|   light`,
    drift: String.raw`     ~  ~   ~
   ~   .-.   ~
      (   )      a slow
   ~   '-'   ~   ambient
     ~   ~  ~    field`,
    glade: String.raw`   ^   ^   ^
  /|\ /|\ /|\    a quiet
   |   |   |     forest
  _|___|___|_    of notes`,
    ember: String.raw`      (
       )        keeps a
      (         small fire
   .-"""-.      burning
  ( ember )
   '-...-'`,
    relay: String.raw`  o---o---o
  |   |   |      passing
  o---o---o      signals
  |   |   |      between
  o---o---o      minds`,
    seed: String.raw`     .
     |          things
    \|/         that
   --o--        grow on
    /|\         their own
     |`,
  };

  // ---- LIFEFORM NODES: each section is a living ASCII creature ----
  // every node has multiple frames so it breathes / reacts.
  const NODE_ART = {
    // the resident — a calm seated cat (about / inhabitant)
    inhabitant: [
      String.raw` /\_/\
( o.o )
 > ^ <`,
      String.raw` /\_/\
( -.- )
 > ^ <`,
      String.raw` /\_/\
( ^.^ )
 > ^ <`,
    ],
    // the grove — a small swarm of works, like fireflies (specimens / work)
    specimens: [
      String.raw`  ✷   ✶
 ✶  ❖  ✷
   ✷  ✶`,
      String.raw` ✶   ✷
✷  ❖   ✶
  ✶   ✷`,
      String.raw`  ✷  ✶
✶   ❖  ✷
 ✷   ✶`,
    ],
    // the pulse — a rippling waveform (instincts / skills)
    instincts: [
      String.raw`∿∿∿∿∿
 ≋≋≋≋
∿∿∿∿∿`,
      String.raw` ≋≋≋≋
∿∿∿∿∿
 ≋≋≋≋`,
      String.raw`∿∿∿∿∿
≋≋≋≋≋
∿∿∿∿∿`,
    ],
    // the wanderer — a migrating bird leaving a dotted trail (migrations / journey)
    migrations: [
      String.raw`· · ·  \v/`,
      String.raw` · · · -v-`,
      String.raw`· · ·  /v\ `,
    ],
    // the spark — a star reaching toward you (signal / contact)
    signal: [
      String.raw`  \ | /
 — ✦ —
  / | \ `,
      String.raw`   \|/
·· ✦ ··
   /|\ `,
      String.raw`  \ | /
 ✦  ✦  ✦
  / | \ `,
    ],
    // the echo — a shy hidden lifeform, revealed only once the others are known
    echo: [
      String.raw` ( ◞ ◟ )
   \ /
    v`,
      String.raw` ( ◡ ◡ )
   \ /
    v`,
    ],
  };

  // decorative section glyph banners
  const DECO = {
    waves: `~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~`,
    dots:  `· · · · · · · · · · · · · · · ·`,
    stars: `· ✦ · · ✧ · · · ✦ · · ✧ · ·`,
  };

  window.ASCII = {
    MASCOT, CAT_AWAKE, CAT_FRAMES, CAT_SLEEP,
    BLOB_FRAMES, SPIRIT_FRAMES, TINY, SPECIMEN_ART, NODE_ART, DECO,
  };
})();
