/* ============================================================
   palette.jsx — tasteful ⌘K command palette
   exports: window.CommandPalette
   ============================================================ */

function CommandPalette({ open, onClose, commands }) {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ(""); setSel(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) =>
      (c.label + " " + (c.hint || "") + " " + (c.keywords || "")).toLowerCase().includes(s)
    );
  }, [q, commands]);

  React.useEffect(() => { setSel(0); }, [q]);

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(filtered.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const c = filtered[sel]; if (c) { c.run(); onClose(); } }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  }

  if (!open) return null;

  // group by section
  const groups = {};
  filtered.forEach((c, i) => { (groups[c.group || "Actions"] = groups[c.group || "Actions"] || []).push({ ...c, _i: i }); });

  return (
    <div className="palette-scrim" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <span className="pi-glyph">{">"}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="type a command — jump, summon, toggle…"
            spellCheck={false}
          />
          <span className="pi-esc">esc</span>
        </div>
        <div className="palette-list">
          {filtered.length === 0 && (
            <div className="palette-empty">no commands found · the habitat is quiet here  ( =^.^= )</div>
          )}
          {Object.keys(groups).map((g) => (
            <div className="palette-group" key={g}>
              <div className="pg-label">{g}</div>
              {groups[g].map((c) => (
                <div
                  key={c.id}
                  className={"palette-item " + (c._i === sel ? "sel" : "")}
                  onMouseEnter={() => setSel(c._i)}
                  onClick={() => { c.run(); onClose(); }}
                >
                  <span className="pi-icon">{c.glyph}</span>
                  <span className="pi-label">{c.label}</span>
                  {c.hint && <span className="pi-hint">{c.hint}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><b>↑↓</b> navigate</span>
          <span><b>↵</b> run</span>
          <span className="pf-tip">tip: there are a few secrets in here</span>
        </div>
      </div>
    </div>
  );
}

window.CommandPalette = CommandPalette;
