import { useEffect, useRef, useState } from 'react';
import api from '../lib/api.js';

export default function TerminalPanel({ project, onToast }) {
  const [history, setHistory] = useState([
    { cmd: null, out: 'VibeDev GitBash — safe sandbox for your project.\nTip: type a goal like "show my git status" and the AI agent writes the command.\nTry: git status, npm install, npm run build' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggest, setSuggest] = useState('');
  const body = useRef(null);

  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [history]);

  async function run(cmd) {
    if (!project) { onToast('Upload a project first'); return; }
    setBusy(true);
    const entered = cmd ?? input;
    setInput('');
    setHistory(h => [...h, { cmd: entered, out: null }]);
    try {
      const r = await api.terminal(project.id, entered);
      setHistory(h => [...h, { cmd: null, out: r.output || '(no output)' }]);
    } catch (e) {
      setHistory(h => [...h, { cmd: null, out: '⚠️ ' + e.message }]);
    } finally { setBusy(false); }
  }

  async function askAgent(intent) {
    if (!project) return;
    setSuggest('…');
    try {
      const r = await api.terminalSuggest(project.id, intent);
      setSuggest(r.command);
      setInput(r.command);
    } catch { setSuggest(''); }
  }

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>💻 GitBash Terminal <span className="muted small" style={{ fontWeight: 400 }}>+ AI agent</span></h2>
      <p className="muted">A safe, sandboxed terminal for your project. Ask the AI agent below to write git & build commands for you — then run them here.</p>

      <div className="card" style={{ padding: 12 }}>
        <div className="term">
          <div className="term-head">
            <span className="term-dot" style={{ background: '#ff5c5c' }} />
            <span className="term-dot" style={{ background: '#ffb454' }} />
            <span className="term-dot" style={{ background: '#34d399' }} />
            <span className="muted small" style={{ marginLeft: 8 }}>{project ? `~/project/${project.name}` : 'bash'}</span>
          </div>
          <div className="term-body" ref={body}>
            {history.map((h, i) => (
              <div key={i}>
                {h.cmd && <div><span className="prompt">➜</span> {h.cmd}</div>}
                {h.out !== null && <div className={h.out.includes('⚠️') ? 'err' : ''}>{h.out}</div>}
              </div>
            ))}
          </div>
          <div className="term-input">
            <span className="prompt">➜</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') run(); }}
              placeholder="type a command, e.g. git status"
              disabled={busy}
            />
            <button className="btn" style={{ padding: '6px 10px' }} onClick={() => run()} disabled={busy}>run</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🤖 AI Agent — tell it what to do</h3>
        <div className="row">
          <input
            className="input"
            placeholder='e.g. "install dependencies", "build", "push my changes"'
            onKeyDown={e => { if (e.key === 'Enter') askAgent(e.target.value); }}
          />
          <button className="btn" onClick={e => askAgent(e.target.closest('.row').querySelector('input').value)}>Suggest command</button>
        </div>
        {suggest && (
          <div className="row" style={{ marginTop: 10 }}>
            <code className="mono" style={{ color: 'var(--accent2)', flex: 1 }}>{suggest}</code>
            <button className="btn green" onClick={() => run(suggest)}>▶ Run</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Common Git commands</h3>
        <div className="row">
          {['git status', 'git add -A', 'git commit -m "Update"', 'git log --oneline', 'git push'].map(c => (
            <button key={c} className="chip" onClick={() => run(c)}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
