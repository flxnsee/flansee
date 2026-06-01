/* ============================================================
   sections.jsx — the six environments of HABITAT OS
   exports: window.SECTIONS (meta for rail) + window.Environments
   ============================================================ */

const SECTIONS = [
  { id: "wake",       glyph: "◐", name: "wake",       sub: "boot · intro" },
  { id: "inhabitant", glyph: "❍", name: "inhabitant", sub: "about" },
  { id: "specimens",  glyph: "❖", name: "specimens",  sub: "selected work" },
  { id: "instincts",  glyph: "≋", name: "instincts",  sub: "skills" },
  { id: "migrations", glyph: "↟", name: "migrations", sub: "the journey" },
  { id: "signal",     glyph: "✦", name: "signal",     sub: "say hello" },
];

/* ---------- tiny terminal typer ---------- */
function Typer({ lines, start }) {
  const [done, setDone] = React.useState([]);
  const [cur, setCur] = React.useState("");
  const [li, setLi] = React.useState(0);

  React.useEffect(() => {
    if (!start) return;
    let cancelled = false, _li = 0;
    function nextLine() {
      if (cancelled || _li >= lines.length) return;
      const text = lines[_li].t; let ci = 0;
      function step() {
        if (cancelled) return;
        ci++; setCur(text.slice(0, ci));
        if (ci < text.length) setTimeout(step, 18 + Math.random() * 26);
        else { const lineObj = lines[_li]; setDone((p) => [...p, lineObj]); setCur(""); _li++; setLi(_li); setTimeout(nextLine, 380); }
      }
      step();
    }
    const tmo = setTimeout(nextLine, 400);
    return () => { cancelled = true; clearTimeout(tmo); };
  }, [start]);

  return (
    <div className="body">
      {done.map((l, i) => (
        <div className="term-line" key={i}>
          <span className="pre">{"> "}</span><span className={l.cls || ""}>{l.t}</span>
        </div>
      ))}
      {li < lines.length && (
        <div className="term-line">
          <span className="pre">{"> "}</span><span>{cur}</span><span className="term-cursor"></span>
        </div>
      )}
    </div>
  );
}

/* ---------- WAKE / hero ---------- */
function EnvWake({ booted, go }) {
  return (
    <section className="env" id="env-wake" data-screen-label="wake">
      <div className="hero-wrap">
        <div>
          <div className="kicker reveal d1">◐ habitat.os // inhabitant: artemko_flansee</div>
          <h1 className="hero-name reveal d2">
            Artemko<br /><span className="ln2">Flansee</span>
          </h1>
          <p className="lede hero-sub reveal d3">
            Creative technologist &amp; interface gardener. I grow calm, living
            software — quiet places that breathe, remember, and occasionally
            blink back at you.
          </p>
          <div className="hero-cta reveal d4">
            <button className="btn primary" onClick={() => go("specimens")}>
              wander the habitat <span className="arr">→</span>
            </button>
            <button className="btn" onClick={() => go("signal")}>send a signal</button>
          </div>
        </div>
        <div className="hero-side">
          <div className="panel win hero-term reveal d3">
            <div className="win-bar">
              <span className="lights"><i></i><i></i><i></i></span>
              <span>~/welcome — habitat</span>
            </div>
            <Typer
              start={booted}
              lines={[
                { t: "initializing creative environment ...", cls: "dim" },
                { t: "loading memories ...", cls: "dim" },
                { t: "3 cats are sleeping nearby.", cls: "ok" },
                { t: "welcome to my digital habitat.", cls: "pre" },
              ]}
            />
          </div>
          <pre className="ascii-mascot reveal d4">{window.ASCII.MASCOT}</pre>
        </div>
      </div>
    </section>
  );
}

/* ---------- INHABITANT / about ---------- */
function EnvInhabitant() {
  const chips = ["TypeScript", "WebGL / GLSL", "Canvas", "Framer Motion", "Three.js", "p5.js", "Rust", "Figma", "Tailwind"];
  const stats = [
    { k: "based in", v: "Lisbon — usually drifting" },
    { k: "focus", v: "Creative tooling, motion & generative ASCII" },
    { k: "currently", v: "Tending Loom, a weaving editor for ideas" },
    { k: "open to", v: "Collaborations & odd little commissions" },
  ];
  return (
    <section className="env" id="env-inhabitant" data-screen-label="inhabitant">
      <div className="env-tag reveal"><span className="num">01</span> inhabitant — who lives here</div>
      <div className="about-grid">
        <div>
          <p className="about-lead reveal d1">
            I build interfaces that feel less like tools and more like{" "}
            <em>habitats</em> — small worlds you actually want to spend time inside.
          </p>
          <p className="lede reveal d2" style={{ marginTop: 22 }}>
            For a decade I've lived at the seam between design and engineering,
            chasing the moment an interface stops feeling mechanical and starts
            feeling <em>alive</em>. Lately that means generative ASCII creatures,
            soft motion, and tools that remember you fondly.
          </p>
          <div className="meta-row reveal d3">
            {chips.map((c) => <span className="chip" key={c}>{c}</span>)}
          </div>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {stats.map((s, i) => (
            <div className={"panel statcard reveal d" + (i + 1)} key={s.k}>
              <div className="k">{s.k}</div>
              <div className="v">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SPECIMENS / projects ---------- */
const SPECIMENS = [
  { id: "SP-001", art: "loom",  title: "Loom",  status: "live", desc: "A node-based editor for arranging ideas like fabric — pull a thread and watch the whole piece re-weave.", tags: ["webgl", "editor", "2025"] },
  { id: "SP-002", art: "drift", title: "Drift", status: "live", desc: "Generative ambient soundscapes that follow your cursor. The quieter you are, the more it plays.", tags: ["audio", "generative"] },
  { id: "SP-003", art: "glade", title: "Glade", status: "wip",  desc: "A spatial notebook where notes grow into little trees. Old thoughts become a forest you can walk.", tags: ["canvas", "notes"] },
  { id: "SP-004", art: "ember", title: "Ember", status: "live", desc: "A gentle daily-streak companion that lives in your menubar and keeps one small fire burning.", tags: ["macos", "habit"] },
  { id: "SP-005", art: "relay", title: "Relay", status: "wip",  desc: "Peer-to-peer messaging built entirely on doodles. No words allowed — only drawings between minds.", tags: ["p2p", "play"] },
  { id: "SP-006", art: "seed",  title: "Seed",  status: "live", desc: "A procedural creature generator. Every cat, blob and spirit roaming this site was grown in Seed.", tags: ["ascii", "toy"] },
];
function EnvSpecimens({ onOpen }) {
  return (
    <section className="env" id="env-specimens" data-screen-label="specimens">
      <div className="env-tag reveal"><span className="num">02</span> specimens — selected work · a small field guide</div>
      <div className="specimen-grid">
        {SPECIMENS.map((s, i) => (
          <div className={"panel specimen reveal d" + ((i % 2) + 1)} key={s.id} onClick={() => onOpen(s)}>
            <div className="sp-head">
              <span className="sp-id">{s.id}</span>
              <span className={"sp-status " + (s.status === "wip" ? "wip" : "")}>{s.status === "wip" ? "growing" : "alive"}</span>
            </div>
            <pre className="sp-art">{window.ASCII.SPECIMEN_ART[s.art]}</pre>
            <div className="sp-body">
              <div className="sp-title">{s.title}</div>
              <div className="sp-desc">{s.desc}</div>
              <div className="sp-tags">{s.tags.map((t) => <span key={t}>#{t}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- INSTINCTS / skills ---------- */
const INSTINCTS = [
  { name: "interface design",       lvl: 94, note: "the shape of calm" },
  { name: "motion & animation",     lvl: 90, note: "soft, organic, alive" },
  { name: "frontend engineering",   lvl: 92, note: "react · ts · the web" },
  { name: "creative coding",        lvl: 82, note: "shaders · canvas · noise" },
  { name: "generative systems",     lvl: 80, note: "things that grow" },
  { name: "type & layout",          lvl: 86, note: "breathing whitespace" },
];
function EnvInstincts() {
  return (
    <section className="env" id="env-instincts" data-screen-label="instincts">
      <div className="env-tag reveal"><span className="num">03</span> instincts — what the inhabitant is good at</div>
      <div className="instinct-grid">
        {INSTINCTS.map((s, i) => (
          <div className={"instinct reveal d" + ((i % 3) + 1)} key={s.name}>
            <div className="ins-top">
              <span className="ins-name">{s.name}</span>
              <span className="ins-lvl">{s.lvl} / 100</span>
            </div>
            <div className="bar"><i style={{ "--w": s.lvl + "%" }}></i></div>
            <div className="ins-glyphs">{s.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- MIGRATIONS / experience ---------- */
const MIGRATIONS = [
  { when: "2024 — now", role: "Independent Creative Technologist", org: "self-directed · the habitat", desc: "Building small living tools and taking on odd interface commissions. This site is one of the residents." },
  { when: "2021 — 2024", role: "Lead Interface Engineer", org: "Studio Aurora", desc: "Led motion and design-systems work for experimental product teams. Taught a lot of pixels how to breathe." },
  { when: "2019 — 2021", role: "Product Designer / Developer", org: "Northlight Labs", desc: "Designed and shipped data tools end-to-end — and quietly fell in love with generative art on the side." },
  { when: "2017 — 2019", role: "The self-taught loop", org: "long nights · canvas · coffee", desc: "Where it began: shaders, sketches, and far too much curiosity about what an interface could feel like." },
];
function EnvMigrations() {
  return (
    <section className="env" id="env-migrations" data-screen-label="migrations">
      <div className="env-tag reveal"><span className="num">04</span> migrations — where the inhabitant has wandered</div>
      <div className="migrations">
        {MIGRATIONS.map((m, i) => (
          <div className={"mig reveal d" + ((i % 3) + 1)} key={m.role}>
            <div className="m-when">{m.when}</div>
            <div className="m-role">{m.role}</div>
            <div className="m-org">{m.org}</div>
            <div className="m-desc">{m.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- SIGNAL / contact ---------- */
const LINKS = [
  { glyph: "@", label: "email", val: "hello@artemko.studio", href: "mailto:hello@artemko.studio" },
  { glyph: "⌥", label: "github", val: "github.com/artemko", href: "#" },
  { glyph: "✦", label: "x / twitter", val: "@artemkodraws", href: "#" },
  { glyph: "❖", label: "are.na", val: "are.na/artemko", href: "#" },
];
function EnvSignal() {
  return (
    <section className="env" id="env-signal" data-screen-label="signal">
      <div className="env-tag reveal"><span className="num">05</span> signal — send something into the habitat</div>
      <div className="signal-wrap">
        <div>
          <div className="signal-big reveal d1">Let's grow<br />something <em>alive</em>.</div>
          <p className="lede reveal d2" style={{ marginTop: 20 }}>
            Got a strange idea, a tool that should feel warmer, or a creature that
            needs a home? The door is open and the kettle is on.
          </p>
          <p className="mono-note reveal d3" style={{ marginTop: 18 }}>
            ( =^.^= )  ~ a cat will let me know you stopped by.
          </p>
        </div>
        <div className="signal-links">
          {LINKS.map((l, i) => (
            <a className={"sig-link reveal d" + (i + 1)} href={l.href} key={l.label}
               target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              <span className="si-glyph">{l.glyph}</span>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span className="si-label">{l.label}</span>
                <span className="si-val">{l.val}</span>
              </span>
              <span className="si-arr">→</span>
            </a>
          ))}
        </div>
      </div>
      <div className="signal-foot reveal" style={{ marginTop: 54, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)" }}>
        {window.ASCII.DECO.stars} <br />
        habitat.os — handcrafted with warm light · {new Date().getFullYear()} · press ⌘K anytime
      </div>
    </section>
  );
}

/* ---------- ECHO / the secret heart ---------- */
function EnvEcho({ onRain, onReturn }) {
  return (
    <section className="env" id="env-echo" data-screen-label="echo">
      <div className="echo-wrap">
        <pre className="echo-art reveal d1">{String.raw`   ( ◞ ◟ )
    \   /
     \ /
      v`}</pre>
        <div className="echo-title reveal d2">you went <em>looking</em>.</div>
        <p className="echo-body reveal d3">
          Most people only meet the five. You wandered the edges until the
          habitat trusted you with a sixth — the echo. It doesn't hold a résumé
          line or a project. It's just here to say: thank you for being curious.
          That instinct is the whole reason this place exists.
        </p>
        <p className="mono-note reveal d3" style={{ marginTop: 18 }}>
          ( =^.^= )  ~ the cats noticed you too.
        </p>
        <div className="echo-actions reveal d4">
          <button className="btn primary" onClick={onRain}>let it rain paws <span className="arr">🐾</span></button>
          <button className="btn" onClick={onReturn}>drift back to the field</button>
        </div>
      </div>
    </section>
  );
}

window.SECTIONS = SECTIONS;
window.Environments = { EnvWake, EnvInhabitant, EnvSpecimens, EnvInstincts, EnvMigrations, EnvSignal, EnvEcho };
window.ENV_BY_ID = { inhabitant: EnvInhabitant, specimens: EnvSpecimens, instincts: EnvInstincts, migrations: EnvMigrations, signal: EnvSignal, echo: EnvEcho };

/* Memoized so App re-renders (scroll active-state, clock, tweaks) never strip
   the imperatively-added `.in` reveal classes from these nodes. */
const Sections = React.memo(function Sections({ booted, go, onOpen }) {
  return (
    <React.Fragment>
      <EnvWake booted={booted} go={go} />
      <EnvInhabitant />
      <EnvSpecimens onOpen={onOpen} />
      <EnvInstincts />
      <EnvMigrations />
      <EnvSignal />
    </React.Fragment>
  );
});
window.Sections = Sections;
