/* ============================================================
   creatures.jsx — the living ASCII ecosystem
   A full-viewport ambient layer of companions + a cursor trail.
   exports: window.CreatureLayer
   ============================================================ */

function CreatureLayer({ density }) {
  const layerRef = React.useRef(null);
  const trailRef = React.useRef(null);
  const count = density === "subtle" ? 5 : density === "lively" ? 10 : 16;

  React.useEffect(() => {
    const layer = layerRef.current;
    const trail = trailRef.current;
    if (!layer) return;
    layer.innerHTML = "";
    const A = window.ASCII;
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const creatures = [];

    function makeEl(cls) {
      const el = document.createElement("pre");
      el.className = "creature " + cls;
      layer.appendChild(el);
      return el;
    }

    // ---------- BLOB: free-floating, drifts + bobs, shy of cursor ----------
    function spawnBlob() {
      const el = makeEl("c-blob");
      const c = {
        el, type: "blob",
        x: rand(0.1, 0.9) * W(), y: rand(0.15, 0.85) * H(),
        vx: rand(-0.25, 0.25), vy: rand(-0.18, 0.18),
        bob: rand(0, 6.28), bobSpeed: rand(0.01, 0.022), bobAmt: rand(6, 16),
        frames: A.BLOB_FRAMES, fi: 0,
        cycle() { this.fi = (this.fi + 1) % this.frames.length; el.textContent = this.frames[this.fi]; },
        update(dt, mx, my) {
          // gentle wander
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.bob += this.bobSpeed * dt;
          // soft cursor repulsion
          const dx = this.x - mx, dy = this.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 26000 && d2 > 1) {
            const f = (1 - d2 / 26000) * 0.9;
            const d = Math.sqrt(d2);
            this.vx += (dx / d) * f * 0.12;
            this.vy += (dy / d) * f * 0.12;
          }
          // damping + drift cap
          this.vx *= 0.985; this.vy *= 0.985;
          this.vx += rand(-0.01, 0.01); this.vy += rand(-0.01, 0.01);
          this.vx = Math.max(-0.7, Math.min(0.7, this.vx));
          this.vy = Math.max(-0.7, Math.min(0.7, this.vy));
          // wrap softly at edges
          const m = 80;
          if (this.x < -m) this.x = W() + m; if (this.x > W() + m) this.x = -m;
          if (this.y < -m) this.y = H() + m; if (this.y > H() + m) this.y = -m;
          el.style.transform =
            `translate(${this.x}px, ${this.y + Math.sin(this.bob) * this.bobAmt}px)`;
        },
      };
      el.textContent = c.frames[0];
      return c;
    }

    // ---------- SPIRIT: drifts slowly, fades + flees when cursor near ----------
    function spawnSpirit() {
      const el = makeEl("c-spirit");
      const c = {
        el, type: "spirit",
        x: rand(0.1, 0.9) * W(), y: rand(0.1, 0.9) * H(),
        vx: rand(-0.12, 0.12), vy: rand(-0.16, -0.04),
        op: rand(0.32, 0.55), targetOp: 0.45,
        frames: A.SPIRIT_FRAMES, fi: 0,
        cycle() { this.fi = (this.fi + 1) % this.frames.length; el.textContent = this.frames[this.fi]; },
        update(dt, mx, my) {
          this.x += this.vx * dt; this.y += this.vy * dt;
          const dx = this.x - mx, dy = this.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 34000) {
            this.targetOp = 0.08;
            const d = Math.sqrt(d2) || 1;
            this.vx += (dx / d) * 0.16; this.vy += (dy / d) * 0.16;
          } else {
            this.targetOp = 0.45;
          }
          this.vx *= 0.97; this.vy *= 0.97;
          this.vy -= 0.004 * dt; // gentle upward float
          this.vx = Math.max(-0.9, Math.min(0.9, this.vx));
          this.vy = Math.max(-0.9, Math.min(0.9, this.vy));
          this.op += (this.targetOp - this.op) * 0.06;
          const m = 90;
          if (this.x < -m) this.x = W() + m; if (this.x > W() + m) this.x = -m;
          if (this.y < -m) { this.y = H() + m; this.vy = rand(-0.16, -0.06); }
          el.style.opacity = this.op.toFixed(3);
          el.style.transform = `translate(${this.x}px, ${this.y}px)`;
        },
      };
      el.textContent = c.frames[0];
      return c;
    }

    // ---------- CAT: anchored near edges, sleeps + blinks ----------
    function spawnCat() {
      const el = makeEl("c-cat");
      const sleepy = Math.random() > 0.5;
      const corner = Math.floor(rand(0, 4));
      const px = (corner % 2 === 0) ? rand(0.02, 0.12) : rand(0.78, 0.92);
      const py = (corner < 2) ? rand(0.16, 0.42) : rand(0.58, 0.88);
      const c = {
        el, type: "cat",
        x: px * W(), y: py * H(),
        frames: sleepy ? A.CAT_SLEEP : A.CAT_FRAMES, fi: 0,
        blinkBias: sleepy ? 1 : Math.random(),
        update() {
          el.style.transform = `translate(${this.x}px, ${this.y}px)`;
        },
        cycle() {
          if (this.frames === A.CAT_SLEEP) {
            this.fi = (this.fi + 1) % this.frames.length;
          } else {
            // mostly open eyes, occasional blink
            this.fi = Math.random() < 0.28 ? 1 : 0;
            if (Math.random() < 0.08) this.fi = 3; // happy ^.^
          }
          el.textContent = this.frames[this.fi];
        },
      };
      el.textContent = c.frames[0];
      c.update();
      return c;
    }

    // ---------- distribute population ----------
    const recipe = [];
    for (let i = 0; i < count; i++) {
      const r = i / count;
      if (r < 0.42) recipe.push("blob");
      else if (r < 0.74) recipe.push("spirit");
      else recipe.push("cat");
    }
    recipe.forEach((t) => {
      creatures.push(t === "blob" ? spawnBlob() : t === "spirit" ? spawnSpirit() : spawnCat());
    });

    // ---------- cursor state ----------
    let mx = -9999, my = -9999, lastTrail = 0;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      // paw-print / sparkle trail
      const now = performance.now();
      if (trail && now - lastTrail > 90 && Math.random() < 0.8) {
        lastTrail = now;
        const p = document.createElement("span");
        p.className = "trail-bit";
        p.textContent = pick(["·", "✦", "˖", "✧", A.TINY.paw]);
        p.style.left = mx + rand(-6, 6) + "px";
        p.style.top = my + rand(-6, 6) + "px";
        p.style.fontSize = rand(9, 14) + "px";
        trail.appendChild(p);
        setTimeout(() => p.remove(), 1100);
      }
    };
    window.addEventListener("pointermove", onMove);

    // ---------- loops ----------
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(3, (t - last) / 16.67); last = t;
      for (const c of creatures) c.update(dt, mx, my);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const frameTimer = setInterval(() => {
      for (const c of creatures) if (Math.random() < 0.7) c.cycle();
    }, 720);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(frameTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [count]);

  return (
    <React.Fragment>
      <div className="creature-layer" ref={layerRef}></div>
      <div className="trail-layer" ref={trailRef}></div>
    </React.Fragment>
  );
}

window.CreatureLayer = CreatureLayer;
