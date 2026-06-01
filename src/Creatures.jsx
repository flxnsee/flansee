/* ============================================================
   Creatures.jsx — the living ASCII ecosystem  (v2 — clean)
   Single-line symbols + sine-wave orbits = smooth, non-overlapping.
   ============================================================ */
import React from "react";

/* ---- clean single-line creature art ---- */
const CREATURE_ART = {
  cat: [
    ["=^.^=", "=^-^=", "=^.^=", "=^ᵕ^="],
    ["=^o^=", "=^.^=", "=^o^=", "=^ᵕ^="],
  ],
  blob: [
    ["(°ᴥ°)", "(•ᴥ•)", "(°ᴥ°)", "(ᵔᴥᵔ)"],
    ["(o . o)", "(- . -)", "(o . o)", "(^ . ^)"],
  ],
  spirit: [
    ["ʕ·ᴥ·ʔ", "ʕ-ᴥ-ʔ", "ʕ·ᴥ·ʔ"],
    ["( ˘ᵕ˘ )", "( -ᵕ- )", "( ˘ᵕ˘ )"],
  ],
};

/* Evenly space N creatures across the canvas using a stratified grid,
   then jitter each within its cell — guarantees no two home positions
   are closer than cellSize, so orbits don't intersect. */
function buildHomePositions(n, W, H, margin = 0.12) {
  const cols = Math.ceil(Math.sqrt(n * W / H));
  const rows = Math.ceil(n / cols);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells.length < n) cells.push([c, r, cols, rows]);
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const mx = margin, my = margin;
  return cells.map(([c, r, nc, nr]) => {
    const cellW = (1 - 2 * mx) / nc;
    const cellH = (1 - 2 * my) / nr;
    const jx = (Math.random() * 0.6 + 0.2) * cellW;
    const jy = (Math.random() * 0.6 + 0.2) * cellH;
    return {
      hx: (mx + c * cellW + jx) * W,
      hy: (my + r * cellH + jy) * H,
    };
  });
}

export function CreatureLayer({ density }) {
  const layerRef = React.useRef(null);
  const trailRef = React.useRef(null);
  const count = density === "subtle" ? 5 : density === "lively" ? 8 : 12;

  React.useEffect(() => {
    const layer = layerRef.current;
    const trail = trailRef.current;
    if (!layer) return;
    layer.innerHTML = "";

    const W = window.innerWidth;
    const H = window.innerHeight;
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const types = [];
    for (let i = 0; i < count; i++) {
      const r = i / count;
      types.push(r < 0.35 ? "cat" : r < 0.70 ? "blob" : "spirit");
    }

    const homes = buildHomePositions(count, W, H);

    const creatures = homes.map(({ hx, hy }, i) => {
      const type = types[i];
      const el = document.createElement("pre");
      el.className = "creature c-" + type;
      layer.appendChild(el);

      const variants = CREATURE_ART[type];
      const frames = pick(variants);

      return {
        el, type, frames, fi: 0, hx, hy,
        ax: rand(14, 30), ay: rand(10, 22),
        fx: rand(0.00018, 0.00034), fy: rand(0.00022, 0.00038),
        px: rand(0, 6.28), py: rand(0, 6.28),
        op: 1, targetOp: 1,
      };
    });

    creatures.forEach(c => { c.el.textContent = c.frames[0]; });

    let mx = -9999, my = -9999, lastTrail = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      const now = performance.now();
      if (trail && now - lastTrail > 110 && Math.random() < 0.65) {
        lastTrail = now;
        const p = document.createElement("span");
        p.className = "trail-bit";
        p.textContent = pick(["·", "✦", "˖", "✧"]);
        p.style.left = mx + rand(-5, 5) + "px";
        p.style.top  = my + rand(-5, 5) + "px";
        p.style.fontSize = rand(9, 13) + "px";
        trail.appendChild(p);
        setTimeout(() => p.remove(), 1100);
      }
    };
    window.addEventListener("pointermove", onMove);

    let raf;
    const tick = (t) => {
      creatures.forEach(c => {
        const x = c.hx + Math.sin(t * c.fx + c.px) * c.ax;
        const y = c.hy + Math.cos(t * c.fy + c.py) * c.ay;
        c.el.style.transform = `translate(${x}px, ${y}px)`;

        if (c.type === "spirit") {
          const dx = x - mx, dy = y - my;
          const near = dx * dx + dy * dy < 28000;
          c.targetOp = near ? 0.15 : 1;
          c.op += (c.targetOp - c.op) * 0.055;
          c.el.style.opacity = c.op.toFixed(3);
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const frameTimer = setInterval(() => {
      creatures.forEach(c => {
        if (Math.random() > 0.35) return;
        c.fi = (c.fi + 1) % c.frames.length;
        c.el.textContent = c.frames[c.fi];
      });
    }, 900);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(frameTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [count]);

  return (
    <React.Fragment>
      <div className="creature-layer" ref={layerRef}></div>
      <div className="trail-layer"   ref={trailRef}></div>
    </React.Fragment>
  );
}

export default CreatureLayer;
