/* ============================================================
   audio.js — the habitat's voice  (Web Audio API, no deps)
   A barely-there warm ambient pad + per-species wake tones,
   a bloom chord on entering, a soft descending tone on leaving.
   createAudioEngine() → { resume, setMuted, wake, bloom, leave, ready }
   ============================================================ */

export function createAudioEngine() {
  let ctx = null;
  let master = null;       // overall output gain (mute lives here)
  let padGain = null;      // ambient pad level
  let started = false;     // ambient pad running
  let muted = false;
  let lastWake = 0;        // throttle rapid wake tones

  const TARGET = 0.5;      // unmuted master level

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = muted ? 0 : TARGET;
    master.connect(ctx.destination);

    // ---- ambient pad: detuned triangles → lowpass → slow LFO gain ----
    padGain = ctx.createGain();
    padGain.gain.value = 0.0;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 620;
    lp.Q.value = 0.4;

    padGain.connect(lp);
    lp.connect(master);

    // warm low chord (A2-ish drone with a fifth + soft high shimmer)
    const padFreqs = [110.0, 164.81, 220.0]; // A2, E3, A3
    padFreqs.forEach((f, idx) => {
      const o = ctx.createOscillator();
      o.type = idx === 2 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (idx - 1) * 6; // gentle chorus
      const g = ctx.createGain();
      g.gain.value = idx === 2 ? 0.12 : 0.2;
      o.connect(g); g.connect(padGain);
      o.start();
    });

    // slow LFO breathing the pad volume
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(padGain.gain);
    lfo.start();

    return ctx;
  }

  // a soft plucked tone at `freq` Hz
  function tone(freq, { dur = 1.1, peak = 0.16, type = "sine", when = 0, detune = 0 } = {}) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + when;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    // soft lowpass so tones stay warm, never harsh
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    o.connect(g); g.connect(lp); lp.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  return {
    ready: () => !!ctx,

    // call from the first user gesture (autoplay policy)
    resume() {
      ensure();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      if (!started) {
        started = true;
        // fade the pad in gently
        const t0 = ctx.currentTime;
        padGain.gain.cancelScheduledValues(t0);
        padGain.gain.setValueAtTime(padGain.gain.value, t0);
        padGain.gain.linearRampToValueAtTime(0.22, t0 + 3.0);
      }
    },

    setMuted(m) {
      muted = !!m;
      if (!ctx || !master) return;
      const t0 = ctx.currentTime;
      master.gain.cancelScheduledValues(t0);
      master.gain.setValueAtTime(master.gain.value, t0);
      master.gain.linearRampToValueAtTime(muted ? 0 : TARGET, t0 + 0.4);
    },

    // a lifeform wakes — its own soft note
    wake(freq) {
      if (!ctx || muted) return;
      const now = performance.now();
      if (now - lastWake < 90) return; // throttle
      lastWake = now;
      tone(freq, { dur: 1.0, peak: 0.10, type: "sine" });
      tone(freq * 2, { dur: 0.7, peak: 0.03, type: "sine", detune: 4 });
    },

    // a lifeform blooms — a warm chord rooted on its note
    bloom(freq) {
      if (!ctx || muted) return;
      const root = freq || 261.63;
      tone(root,        { dur: 1.6, peak: 0.14, type: "sine" });
      tone(root * 1.5,  { dur: 1.6, peak: 0.09, type: "sine", when: 0.04 });   // fifth
      tone(root * 2,    { dur: 1.8, peak: 0.07, type: "triangle", when: 0.09 }); // octave
    },

    // drift back to the field — a gentle descending pair
    leave() {
      if (!ctx || muted) return;
      tone(392.0, { dur: 0.9, peak: 0.08, type: "sine" });
      tone(261.63, { dur: 1.2, peak: 0.08, type: "sine", when: 0.12 });
    },
  };
}
