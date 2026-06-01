/* ============================================================
   boot.jsx — animated boot-up sequence
   exports: window.BootSequence
   ============================================================ */

const BOOT_LINES = [
  { t: "HABITAT OS  ·  v2.6  ·  warm kernel", cls: "pre", d: 320 },
  { t: "initializing creative environment ...", cls: "", d: 420 },
  { t: "mounting /home/artemko ............ ok", cls: "ok", d: 300 },
  { t: "loading memories .................. ok", cls: "ok", d: 300 },
  { t: "waking sleepy cats ............ 3 found", cls: "ok", d: 280 },
  { t: "releasing floating blobs .......... ok", cls: "ok", d: 240 },
  { t: "summoning terminal spirits ........ ok", cls: "ok", d: 260 },
  { t: "calibrating warm light ............ ok", cls: "ok", d: 240 },
  { t: "ecosystem stable. temperature: cozy", cls: "dim", d: 340 },
  { t: "welcome to my digital habitat.", cls: "pre", d: 500 },
];

function BootSequence({ onDone, skippable = true }) {
  const [lines, setLines] = React.useState([]);
  const [typed, setTyped] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [leaving, setLeaving] = React.useState(false);
  const doneRef = React.useRef(false);

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(() => onDone && onDone(), 720);
  }, [onDone]);

  React.useEffect(() => {
    let cancelled = false;
    let li = 0;
    function nextLine() {
      if (cancelled) return;
      if (li >= BOOT_LINES.length) { setTimeout(finish, 560); return; }
      const line = BOOT_LINES[li];
      let ci = 0;
      function typeChar() {
        if (cancelled) return;
        ci++;
        setTyped(line.t.slice(0, ci));
        setProgress(Math.min(100, Math.round(((li + ci / line.t.length) / BOOT_LINES.length) * 100)));
        if (ci < line.t.length) {
          setTimeout(typeChar, 11 + Math.random() * 16);
        } else {
          setLines((prev) => [...prev, line]);
          setTyped("");
          li++;
          setTimeout(nextLine, line.d * 0.5);
        }
      }
      typeChar();
    }
    const start = setTimeout(nextLine, 360);
    return () => { cancelled = true; clearTimeout(start); };
  }, [finish]);

  React.useEffect(() => {
    function onKey(e) {
      if (skippable && (e.key === "Enter" || e.key === "Escape" || e.key === " ")) finish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, skippable]);

  const LOGO = String.raw`   __  __     ______     ______     __     ______   ______     ______
  /\ \_\ \   /\  __ \   /\  == \   /\ \   /\__  _\ /\  __ \   /\__  _\
  \ \  __ \  \ \  __ \  \ \  __<   \ \ \  \/_/\ \/ \ \  __ \  \/_/\ \/
   \ \_\ \_\  \ \_\ \_\  \ \_____\  \ \_\    \ \_\  \ \_\ \_\    \ \_\
    \/_/\/_/   \/_/\/_/   \/_____/   \/_/     \/_/   \/_/\/_/     \/_/`;

  return (
    <div className={"boot " + (leaving ? "leaving" : "")} onClick={skippable ? finish : undefined}>
      <div className="boot-inner">
        <pre className="boot-logo">{LOGO}</pre>
        <div className="boot-console">
          {lines.map((l, i) => (
            <div key={i} className="term-line">
              <span className="dim">{">"} </span>
              <span className={l.cls}>{l.t}</span>
            </div>
          ))}
          {!doneRef.current && (
            <div className="term-line">
              <span className="dim">{">"} </span>
              <span>{typed}</span>
              <span className="term-cursor"></span>
            </div>
          )}
        </div>
        <div className="boot-bar"><i style={{ width: progress + "%" }}></i></div>
        <div className="boot-foot">
          <span>{progress}%</span>
          {skippable && <span className="boot-skip">press any key to skip →</span>}
        </div>
      </div>
    </div>
  );
}

window.BootSequence = BootSequence;
