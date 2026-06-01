/* ============================================================
   App.jsx — HABITAT OS orchestrator
   boot  →  the field (RESONANCE nav)  ⇄  a lifeform's interior
   ============================================================ */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ASCII } from "./ascii.js";
import { CreatureLayer } from "./Creatures.jsx";
import { BootSequence } from "./Boot.jsx";
import { CommandPalette } from "./CommandPalette.jsx";
import { ENV_BY_ID } from "./sections.jsx";
import { HabitatField, NODES } from "./Field.jsx";
import { createAudioEngine } from "./audio.js";
import {
  useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakButton,
} from "./tweaks.jsx";

const PALETTES = {
  amber: { a1: "#d8884f", a2: "#e0a662", a3: "#c4763f", glow: "216, 136, 79",  label: "amber" },
  aqua:  { a1: "#5fa3b3", a2: "#83c1c9", a3: "#4d8c9c", glow: "95, 163, 179",  label: "aqua"  },
  mixed: { a1: "#d8884f", a2: "#8fae8d", a3: "#6f9fc0", glow: "216, 136, 79",  label: "pastel"},
  mono:  { a1: "#8a8275", a2: "#a39a89", a3: "#6f685b", glow: "138, 130, 117", label: "mono"  },
};

const NODE_TINT = Object.fromEntries(NODES.map(n => [n.id, n.tint]));
const NODE_NOTE = Object.fromEntries(NODES.map(n => [n.id, n.note]));
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
const NODE_GLOW = Object.fromEntries(NODES.map(n => [n.id, hexToRgb(n.tint)]));

function initialMuted() {
  try { return localStorage.getItem("habitat-muted") === "1"; } catch (e) { return false; }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "amber",
  "density": "lively",
  "grain": true,
  "lightCursor": true,
  "muted": false
}/*EDITMODE-END*/;

const NAMES = { inhabitant: "inhabitant", specimens: "specimens", instincts: "instincts",
  migrations: "migrations", signal: "signal", echo: "echo" };

function loadVisited() {
  try { return JSON.parse(localStorage.getItem("habitat-visited") || "{}") || {}; }
  catch (e) { return {}; }
}

const IS_TOUCH = typeof window !== "undefined"
  && window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

export default function App() {
  const [t, setTweak] = useTweaks({ ...TWEAK_DEFAULTS, muted: initialMuted() });
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState(null);          // null = field, else node id (interior)
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [interiorOpen, setInteriorOpen] = useState(false);
  const [visited, setVisited] = useState(loadVisited);
  const [hintDone, setHintDone] = useState(() => { try { return localStorage.getItem("habitat-hint") === "1"; } catch (e) { return false; } });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [spec, setSpec] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const closeTimer = useRef(null);
  const audioRef = useRef(null);

  const [showBoot, setShowBoot] = useState(() => {
    try { return sessionStorage.getItem("habitat-booted") !== "1"; } catch (e) { return true; }
  });

  // ---- audio engine (created lazily, resumed on first gesture) ----
  if (!audioRef.current) audioRef.current = createAudioEngine();
  useEffect(() => {
    audioRef.current.setMuted(t.muted);
    try { localStorage.setItem("habitat-muted", t.muted ? "1" : "0"); } catch (e) {}
  }, [t.muted]);
  useEffect(() => {
    const go = () => { if (!t.muted) audioRef.current.resume(); };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [t.muted]);

  // ---- palette + chrome ----
  useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.amber;
    const r = document.documentElement.style;
    r.setProperty("--a1", p.a1); r.setProperty("--a2", p.a2);
    r.setProperty("--a3", p.a3); r.setProperty("--a-glow", p.glow);
  }, [t.palette]);
  useEffect(() => { document.body.classList.toggle("no-grain", !t.grain); }, [t.grain]);
  useEffect(() => { document.body.classList.toggle("no-light-cursor", !t.lightCursor || IS_TOUCH); }, [t.lightCursor]);

  // ---- boot ----
  const onBootDone = useCallback(() => {
    setShowBoot(false); setBooted(true);
    try { sessionStorage.setItem("habitat-booted", "1"); } catch (e) {}
  }, []);
  useEffect(() => { if (!showBoot) setBooted(true); }, []); // eslint-disable-line

  // ---- toast ----
  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // ---- enter / leave a lifeform ----
  const enter = useCallback((id, org) => {
    if (!ENV_BY_ID[id]) return;
    clearTimeout(closeTimer.current);
    setOrigin(org || { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setMode(id);
    setInteriorOpen(false);
    if (audioRef.current) audioRef.current.bloom(NODE_NOTE[id]);
    setVisited((v) => {
      if (v[id]) return v;
      const next = { ...v, [id]: Date.now() };
      try { localStorage.setItem("habitat-visited", JSON.stringify(next)); } catch (e) {}
      const core = NODES.filter(n => !n.hidden);
      if (id !== "echo" && core.every(n => next[n.id])) {
        setTimeout(() => flash("✦  the habitat opens a hidden layer — find the echo at the edge"), 700);
      }
      return next;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => setInteriorOpen(true)));
  }, [flash]);

  const leave = useCallback(() => {
    setInteriorOpen(false);
    if (audioRef.current) audioRef.current.leave();
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMode(null), 600);
  }, []);

  // ---- reveal interior content once it has bloomed ----
  useEffect(() => {
    if (!mode || !interiorOpen) return;
    const id = window.setTimeout(() => {
      document.querySelectorAll(".interior .reveal").forEach((el) => el.classList.add("in"));
    }, 90);
    return () => window.clearTimeout(id);
  }, [mode, interiorOpen]);

  // ---- hint persistence ----
  const finishHint = useCallback(() => {
    setHintDone(true);
    try { localStorage.setItem("habitat-hint", "1"); } catch (e) {}
  }, []);

  // ---- wake tone passthrough ----
  const onWake = useCallback((note) => {
    if (audioRef.current) audioRef.current.wake(note);
  }, []);

  // ---- paw rain ----
  const pawRain = useCallback(() => {
    const layer = document.querySelector(".trail-layer");
    if (!layer) return;
    for (let i = 0; i < 44; i++) {
      setTimeout(() => {
        const p = document.createElement("span");
        p.className = "trail-bit";
        p.textContent = ["🐾", "✦", "·", "✧"][Math.floor(Math.random() * 4)];
        p.style.left = Math.random() * window.innerWidth + "px";
        p.style.top = "-20px";
        p.style.fontSize = 10 + Math.random() * 8 + "px";
        p.style.animation = "pawFall " + (2 + Math.random() * 1.6) + "s linear forwards";
        layer.appendChild(p);
        setTimeout(() => p.remove(), 3800);
      }, i * 52);
    }
    flash("🐾  a soft rain of paws");
  }, [flash]);

  // ---- keyboard: ⌘K + esc ----
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
      if (e.key === "Escape") {
        if (paletteOpen) return;
        if (spec) { setSpec(null); return; }
        if (mode) { leave(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, spec, paletteOpen, leave]);

  // ---- command palette entries ("the call") ----
  const coreNodes = NODES.filter(n => !n.hidden);
  const allKnown = coreNodes.every(n => visited[n.id]);
  const navCommands = NODES
    .filter(n => !n.hidden || allKnown)
    .map((n) => ({
      id: "go-" + n.id, group: "wander to", glyph: n.id === "echo" ? "◞◟" : "→",
      label: n.name === "echo" ? "the echo" : n.name, hint: n.sub,
      keywords: n.sub, run: () => enter(n.id, { x: window.innerWidth / 2, y: window.innerHeight / 2 }),
    }));
  const commands = [
    ...navCommands,
    { id: "field", group: "wander to", glyph: "◍", label: "back to the open field", hint: "home",
      keywords: "home field back", run: () => { if (mode) leave(); } },
    { id: "pet", group: "habitat", glyph: "=^.^=", label: "pet the nearest cat", hint: "purr",
      keywords: "cat pet purr", run: () => flash("( =^.^= )   *a soft purr fills the room*") },
    { id: "summon", group: "habitat", glyph: "ᗤ", label: "summon a terminal spirit", hint: "ooo",
      keywords: "spirit ghost summon", run: () => flash("ᗤ  a spirit drifts up from the console ...") },
    { id: "rain", group: "habitat", glyph: "🐾", label: "make it rain paws", hint: "secret",
      keywords: "rain paws secret fun", run: pawRain },
    { id: "sound", group: "system", glyph: t.muted ? "🔇" : "♪", label: (t.muted ? "unmute" : "mute") + " the habitat", hint: "audio",
      keywords: "sound audio mute unmute music", run: () => setTweak("muted", !t.muted) },
    { id: "creatures", group: "system", glyph: "❍", label: "cycle creature density", hint: t.density,
      keywords: "creatures toggle density", run: () => setTweak("density", t.density === "maximal" ? "subtle" : t.density === "lively" ? "maximal" : "lively") },
    { id: "light", group: "system", glyph: "◌", label: (t.lightCursor ? "hide" : "show") + " your light", hint: "cursor",
      keywords: "light cursor glow", run: () => setTweak("lightCursor", !t.lightCursor) },
    { id: "grain", group: "system", glyph: "▒", label: (t.grain ? "disable" : "enable") + " film grain",
      hint: "texture", keywords: "grain noise texture", run: () => setTweak("grain", !t.grain) },
    { id: "forget", group: "system", glyph: "↺", label: "let the habitat forget you", hint: "reset",
      keywords: "reset forget memory clear", run: () => { try { localStorage.removeItem("habitat-visited"); localStorage.removeItem("habitat-hint"); } catch (e) {} setVisited({}); setHintDone(false); flash("↺  the habitat forgets — every lifeform is a stranger again"); } },
    { id: "reboot", group: "system", glyph: "↻", label: "replay boot sequence", hint: "reboot",
      keywords: "reboot restart boot", run: () => { try { sessionStorage.removeItem("habitat-booted"); } catch (e) {} setBooted(false); setShowBoot(true); } },
  ];

  const Interior = mode ? ENV_BY_ID[mode] : null;
  const companionArt = mode && ASCII.NODE_ART[mode] ? ASCII.NODE_ART[mode][0] : "";
  const interiorTint = mode ? NODE_TINT[mode] : null;
  const interiorGlow = mode ? NODE_GLOW[mode] : null;

  return (
    <React.Fragment>
      <div className="habitat-bg"></div>
      <div className="habitat-grid"></div>

      {!showBoot && <CreatureLayer density={t.density} />}

      {/* ---- the field: signature navigation ---- */}
      {!showBoot && (
        <HabitatField
          visited={visited}
          onEnter={enter}
          onWake={onWake}
          hintDone={hintDone}
          onHintDone={finishHint}
          lightCursor={t.lightCursor && !IS_TOUCH}
          paused={!!mode}
          touch={IS_TOUCH}
        />
      )}

      {/* ---- a lifeform's interior ---- */}
      {!showBoot && mode && Interior && (
        <div
          className={"interior" + (interiorOpen ? " open" : "")}
          style={{ "--ox": origin.x + "px", "--oy": origin.y + "px", "--a-interior": interiorTint, "--a-interior-rgb": interiorGlow }}
        >
          <div className="interior-head">
            <span className="ih-here">inside <b>{NAMES[mode] || mode}</b></span>
            <span className="ih-back" onClick={leave}><span className="gl">←</span> the field</span>
          </div>
          <div className="interior-inner">
            {mode === "specimens"  && <Interior onOpen={setSpec} />}
            {mode === "echo"       && <Interior onRain={pawRain} onReturn={leave} />}
            {mode !== "specimens" && mode !== "echo" && <Interior />}
          </div>
          <pre className="interior-companion" onClick={leave} style={{ pointerEvents: "auto", cursor: "pointer" }}>{companionArt}</pre>
        </div>
      )}

      {/* ---- hidden "call" affordance ---- */}
      {!showBoot && (
        <div className="call-dot" onClick={() => setPaletteOpen(true)} title="call (⌘K)">
          <i></i> call · ⌘K
        </div>
      )}

      {/* ---- boot ---- */}
      {showBoot && <BootSequence onDone={onBootDone} />}

      {/* ---- command palette ---- */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />

      {/* ---- specimen modal ---- */}
      {spec && (
        <div className="spec-scrim" onClick={() => setSpec(null)}>
          <div className="spec-modal" onClick={(e) => e.stopPropagation()}>
            <div className="win-bar">
              <span className="lights"><i></i><i></i><i></i></span>
              <span>{spec.id} — specimen</span>
              <span className="sm-close" onClick={() => setSpec(null)}>[ esc ]</span>
            </div>
            <pre className="sm-art">{ASCII.SPECIMEN_ART[spec.art]}</pre>
            <div className="sm-body">
              <div className="sm-title">{spec.title}</div>
              <div className="sm-desc">{spec.desc}</div>
              <div className="sm-tags">{spec.tags.map((x) => <span key={x}>#{x}</span>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ---- toast ---- */}
      <div className={"toast " + (toast ? "show" : "")}>{toast}</div>

      {/* ---- tweaks ---- */}
      <TweaksPanel>
        <TweakSection label="Palette" />
        <TweakRadio label="Accent" value={t.palette} options={["amber", "aqua", "mixed", "mono"]}
          onChange={(v) => setTweak("palette", v)} />
        <TweakSection label="The field" />
        <TweakToggle label="Sound" value={!t.muted} onChange={(v) => setTweak("muted", !v)} />
        <TweakToggle label="Your light (cursor)" value={t.lightCursor} onChange={(v) => setTweak("lightCursor", v)} />
        <TweakRadio label="Ambient creatures" value={t.density} options={["subtle", "lively", "maximal"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Film grain" value={t.grain} onChange={(v) => setTweak("grain", v)} />
        <TweakSection label="Memory" />
        <TweakButton label="Let the habitat forget me" onClick={() => { try { localStorage.removeItem("habitat-visited"); localStorage.removeItem("habitat-hint"); } catch (e) {} setVisited({}); setHintDone(false); }} />
        <TweakButton label="Replay boot" onClick={() => { try { sessionStorage.removeItem("habitat-booted"); } catch (e) {} setBooted(false); setShowBoot(true); }} />
      </TweaksPanel>
    </React.Fragment>
  );
}

// keyframe for paw rain (injected once)
(function () {
  const s = document.createElement("style");
  s.textContent = "@keyframes pawFall{0%{opacity:0;transform:translateY(0) rotate(0)}10%{opacity:.85}100%{opacity:0;transform:translateY(105vh) rotate(40deg)}}";
  document.head.appendChild(s);
})();
