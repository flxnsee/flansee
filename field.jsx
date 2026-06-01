/* ============================================================
   field.jsx — RESONANCE
   The signature navigation. A living field of ASCII lifeforms
   that answer your light. Approach → they wake. Linger → they bloom.
   exports: window.HabitatField, window.NODES
   ============================================================ */

/* Each lifeform = one section. Positions are fractions of the
   viewport from the centre, so the constellation scales naturally. */
const NODES = [
  { id: "inhabitant", name: "inhabitant", sub: "who lives here", fx: -0.30, fy: -0.19, sp: 0.00042, amp: 13, ph: 0.0 },
  { id: "specimens",  name: "specimens",  sub: "the works",      fx:  0.31, fy: -0.24, sp: 0.00035, amp: 16, ph: 1.7 },
  { id: "instincts",  name: "instincts",  sub: "what it can do", fx: -0.27, fy:  0.27, sp: 0.00048, amp: 12, ph: 3.1 },
  { id: "migrations", name: "migrations", sub: "where it wandered", fx: 0.30, fy: 0.25, sp: 0.00030, amp: 18, ph: 4.6 },
  { id: "signal",     name: "signal",     sub: "say hello",      fx:  0.03, fy: -0.355, sp: 0.00052, amp: 11, ph: 5.5 },
  { id: "echo",       name: "echo",       sub: "·",              fx: -0.44, fy:  0.39, sp: 0.00038, amp: 15, ph: 2.3, hidden: true },
];
window.NODES = NODES;

const REVEAL_OUT = 280;   // px: lifeform starts to notice your light
const REVEAL_IN  = 96;    // px: fully awake
const COMMUNE    = 116;   // px: resonance begins to build
const HOLD_MS    = 920;   // time near to fully bloom
const PARALLAX   = 0.045; // world lean
const MAX_PAN    = 460;   // drag clamp

function HabitatField({ visited, onEnter, hintDone, onHintDone, lightCursor, paused }) {
  const fieldRef   = React.useRef(null);
  const heartRef   = React.useRef(null);
  const lightRef   = React.useRef(null);
  const coreRef    = React.useRef(null);
  const threadsRef = React.useRef(null);
  const nodeRefs   = React.useRef([]);
  const innerRefs  = React.useRef([]);
  const artRefs    = React.useRef([]);
  const ringFills  = React.useRef([]);
  const ghostLines = React.useRef([]);
  const liveLines  = React.useRef([]);
  const pips       = React.useRef([]);

  // live, mutable runtime (kept out of React state for 60fps)
  const rt = React.useRef(NODES.map(() => ({ res: 0, cool: false, frame: 0, sx: 0, sy: 0 })));
  const mouse = React.useRef({ x: -9999, y: -9999 });
  const light = React.useRef({ x: -9999, y: -9999 });
  const cam = React.useRef({ x: 0, y: 0 });
  const drag = React.useRef(null);
  const visitedRef = React.useRef(visited);
  visitedRef.current = visited;
  const pausedRef = React.useRef(paused);
  pausedRef.current = paused;
  const enteredOnce = React.useRef(false);

  const unlocked = NODES.filter(n => !n.hidden).every(n => visited[n.id]);
  const unlockedRef = React.useRef(unlocked);
  unlockedRef.current = unlocked;

  const A = window.ASCII;
  const RING_R = 50;
  const RING_C = 2 * Math.PI * RING_R;

  // ---------- pointer ----------
  React.useEffect(() => {
    function onMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (drag.current) {
        if (e.buttons === 0) { drag.current = null; if (coreRef.current) coreRef.current.classList.remove("grabbing"); return; }
        const d = drag.current;
        cam.current.x = clamp(d.cx + (e.clientX - d.x), -MAX_PAN, MAX_PAN);
        cam.current.y = clamp(d.cy + (e.clientY - d.y), -MAX_PAN, MAX_PAN);
        if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6) d.moved = true;
        if (coreRef.current) coreRef.current.classList.add("grabbing");
      }
    }
    function onDown(e) {
      if (pausedRef.current) return;
      // only pan from empty space (not from a lifeform)
      if (e.target.closest && e.target.closest(".fnode")) return;
      drag.current = { x: e.clientX, y: e.clientY, cx: cam.current.x, cy: cam.current.y, moved: false };
    }
    function onUp() {
      drag.current = null;
      if (coreRef.current) coreRef.current.classList.remove("grabbing");
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // ---------- frame swap (creatures breathe) ----------
  React.useEffect(() => {
    const t = setInterval(() => {
      NODES.forEach((n, i) => {
        const r = rt.current[i];
        const frames = A.NODE_ART[n.id];
        if (!frames) return;
        // when awake, lean toward the friendly frame
        if (r.reveal > 0.55 && frames.length > 2 && Math.random() < 0.5) r.frame = frames.length - 1;
        else r.frame = (r.frame + 1) % frames.length;
        if (artRefs.current[i]) artRefs.current[i].textContent = frames[r.frame];
      });
    }, 680);
    return () => clearInterval(t);
  }, []);

  // ---------- main loop ----------
  React.useEffect(() => {
    let raf;
    let firstRevealSeen = false;
    function frame() {
      const W = window.innerWidth, H = window.innerHeight;
      const cx = W / 2, cy = H / 2;
      const t = performance.now();

      // your light (smoothed)
      const m = mouse.current, l = light.current;
      if (m.x < -5000) { /* no pointer yet */ }
      else {
        l.x += (m.x - l.x) * 0.18;
        l.y += (m.y - l.y) * 0.18;
        if (lightRef.current) lightRef.current.style.transform = `translate(${l.x}px, ${l.y}px)`;
        if (coreRef.current)  coreRef.current.style.transform  = `translate(${l.x}px, ${l.y}px)` + (drag.current ? " scale(.7)" : "");
      }

      const par = { x: m.x > -5000 ? -(m.x - cx) * PARALLAX : 0, y: m.y > -5000 ? -(m.y - cy) * PARALLAX : 0 };
      const offX = cam.current.x + par.x;
      const offY = cam.current.y + par.y;

      // heart
      const hx = cx + offX, hy = cy + offY;
      if (heartRef.current) heartRef.current.style.transform = `translate(${hx}px, ${hy}px)`;

      let anyReveal = 0;

      NODES.forEach((n, i) => {
        const node = nodeRefs.current[i];
        const inner = innerRefs.current[i];
        if (!node) return;
        const r = rt.current[i];
        const isHidden = n.hidden && !unlockedRef.current;

        if (isHidden) { node.style.display = "none"; return; }
        node.style.display = "";

        const drift = {
          x: Math.sin(t * n.sp + n.ph) * n.amp,
          y: Math.cos(t * n.sp * 0.8 + n.ph) * n.amp * 0.7,
        };
        const baseX = cx + n.fx * W + offX + drift.x;
        const baseY = cy + n.fy * H + offY + drift.y;

        // distance from your light to the lifeform
        const dx = (m.x > -5000 ? m.x : -9999) - baseX;
        const dy = (m.y > -5000 ? m.y : -9999) - baseY;
        const dist = Math.hypot(dx, dy);

        const reveal = clamp((REVEAL_OUT - dist) / (REVEAL_OUT - REVEAL_IN), 0, 1);
        r.reveal = reveal;
        anyReveal = Math.max(anyReveal, reveal);

        // lifeform leans toward your light as it wakes
        const lean = reveal * 0.10;
        const sx = baseX + dx * lean;
        const sy = baseY + dy * lean;
        r.sx = sx; r.sy = sy;

        node.style.transform = `translate(${sx}px, ${sy}px)`;
        const scale = 1 + reveal * 0.16;
        if (inner) inner.style.transform = `translate(-50%, -50%) scale(${scale})`;
        node.style.setProperty("--reveal", reveal.toFixed(3));
        node.classList.toggle("bonded", !!visitedRef.current[n.id]);

        // resonance
        if (!pausedRef.current && dist < COMMUNE && !r.cool) {
          r.res = Math.min(1, r.res + 16.67 / HOLD_MS);
        } else {
          r.res = Math.max(0, r.res - 16.67 / (HOLD_MS * 0.7));
          if (!pausedRef.current && dist > COMMUNE) r.cool = false;
        }
        const fill = ringFills.current[i];
        if (fill) {
          fill.style.strokeDasharray = RING_C;
          fill.style.strokeDashoffset = (RING_C * (1 - r.res)).toFixed(2);
          fill.style.opacity = r.res > 0.01 ? 1 : 0;
        }
        if (r.res >= 1 && !r.cool) {
          r.cool = true; r.res = 0;
          fireEnter(i);
        }

        if (reveal > 0.6 && !firstRevealSeen) {
          firstRevealSeen = true;
          if (!hintDone && onHintDone) onHintDone();
        }
      });

      // field warmth (heart brightens as you near anything)
      if (fieldRef.current) fieldRef.current.classList.toggle("warmed", anyReveal > 0.35);

      // threads
      NODES.forEach((n, i) => {
        if (n.hidden && !unlockedRef.current) {
          [ghostLines.current[i], liveLines.current[i], pips.current[i]].forEach(e => e && (e.style.display = "none"));
          return;
        }
        const r = rt.current[i];
        const g = ghostLines.current[i], lv = liveLines.current[i], p = pips.current[i];
        const bonded = !!visitedRef.current[n.id];
        if (g) { g.style.display = bonded ? "none" : ""; setLine(g, hx, hy, r.sx, r.sy); }
        if (lv) { lv.style.display = bonded ? "" : "none"; setLine(lv, hx, hy, r.sx, r.sy); }
        if (p)  { p.style.display = bonded ? "" : "none"; p.setAttribute("cx", r.sx); p.setAttribute("cy", r.sy); }
      });

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line

  function setLine(el, x1, y1, x2, y2) {
    el.setAttribute("x1", x1); el.setAttribute("y1", y1);
    el.setAttribute("x2", x2); el.setAttribute("y2", y2);
  }

  function fireEnter(i) {
    const n = NODES[i];
    const r = rt.current[i];
    if (onEnter) onEnter(n.id, { x: r.sx, y: r.sy });
  }

  function onNodeClick(i, e) {
    e.stopPropagation();
    if (pausedRef.current) return;
    if (drag.current && drag.current.moved) return; // was a pan, not a touch
    const r = rt.current[i];
    if (r.cool) return;
    r.cool = true; r.res = 0;
    fireEnter(i);
  }

  return (
    <div className={"field" + (lightCursor ? "" : " no-light")} ref={fieldRef}>
      <svg className="field-threads" ref={threadsRef}>
        {NODES.map((n, i) => (
          <g key={n.id}>
            <line className="thread-ghost" ref={el => (ghostLines.current[i] = el)} />
            <line className="thread-live"  ref={el => (liveLines.current[i] = el)} />
            <circle className="thread-pip" r="2.4" ref={el => (pips.current[i] = el)} />
          </g>
        ))}
      </svg>

      <div className="field-heart" ref={heartRef}>
        <div className="heart-inner">
          <pre className="heart-art">{A.MASCOT}</pre>
          <div className="heart-name">Artemko <em>Flansee</em></div>
          <div className="heart-sub">interface gardener · a living habitat</div>
          <div className="heart-pulse">
            known: <b>{NODES.filter(n => !n.hidden && visited[n.id]).length}</b> / {NODES.filter(n => !n.hidden).length} lifeforms
          </div>
        </div>
      </div>

      {NODES.map((n, i) => (
        <div
          className={"fnode" + (visited[n.id] ? " bonded" : "")}
          key={n.id}
          ref={el => (nodeRefs.current[i] = el)}
          onClick={(e) => onNodeClick(i, e)}
        >
          <div className="fnode-inner" ref={el => (innerRefs.current[i] = el)}>
            <div className="fnode-core">
              <div className="fnode-glow"></div>
              <svg className="fnode-ring" width="120" height="120" viewBox="0 0 120 120">
                <circle className="ring-track" cx="60" cy="60" r={RING_R} />
                <circle className="ring-fill" cx="60" cy="60" r={RING_R}
                  ref={el => (ringFills.current[i] = el)}
                  style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C }} />
              </svg>
              <pre className="fnode-art" ref={el => (artRefs.current[i] = el)}>
                {A.NODE_ART[n.id] ? A.NODE_ART[n.id][0] : n.glyph}
              </pre>
            </div>
            <div className="fnode-name">
              {n.id === "echo" ? "echo" : n.name}
              <span className="nsub">{n.id === "echo" ? "you found it" : n.sub}</span>
            </div>
          </div>
        </div>
      ))}

      {lightCursor && <div className="you-light" ref={lightRef}></div>}
      {lightCursor && <div className="you-core" ref={coreRef}></div>}

      {!hintDone && (
        <div className="field-hint">
          everything here is alive — bring your light <b>close</b> to what stirs, and <b>linger</b> to enter
        </div>
      )}
    </div>
  );
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

window.HabitatField = HabitatField;
