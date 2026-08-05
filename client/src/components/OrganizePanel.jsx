import { useState } from 'react';
import api from '../lib/api.js';

export default function OrganizePanel({ provider, project, onProjectLoaded, onToast }) {
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);

  async function planOrg() {
    if (!project) return;
    setBusy(true); setPlan(null); setApplied(false);
    try {
      const r = await api.organize(project.id, provider);
      setPlan(r);
      onToast('Organization plan ready');
    } catch (e) { onToast('❌ ' + e.message); } finally { setBusy(false); }
  }

  async function apply() {
    if (!plan) return;
    setBusy(true);
    try {
      const r = await api.applyOrg(project.id, plan.plan);
      const pr = await api.project(project.id);
      onProjectLoaded({ id: project.id, name: project.name, files: pr.files });
      setApplied(true);
      onToast(`✅ Organized ${r.applied?.length || 0} files`);
    } catch (e) { onToast('❌ ' + e.message); } finally { setBusy(false); }
  }

  const stats = plan?.stats;
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>🧹 Auto-Organizer</h2>
      <p className="muted">
        VibeDev detects your file types and moves them into a clean, conventional structure — source in <b className="mono">src/</b>, tests in <b className="mono">tests/</b>, docs in <b className="mono">docs/</b>, assets in <b className="mono">assets/</b>, config at root. No matter how messy your upload was.
      </p>

      <div className="row" style={{ margin: '16px 0' }}>
        <button className="btn primary" onClick={planOrg} disabled={!project || busy}>{busy ? '…' : plan ? '↻ Re-plan' : '🗂️ Generate plan'}</button>
        {plan && <button className="btn green" onClick={apply} disabled={busy}>{busy ? '…' : applied ? '✅ Applied' : '✔ Apply organization'}</button>}
      </div>

      {stats && (
        <div className="card" style={{ padding: 12 }}>
          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            {[['src', stats.src], ['tests', stats.tests], ['docs', stats.docs], ['assets', stats.assets], ['config', stats.config], ['root', stats.root]].map(([k, v]) => (
              <div key={k} className="small muted"><b style={{ color: 'var(--text)' }}>{v}</b> {k}</div>
            ))}
          </div>
        </div>
      )}

      {plan && (plan.plan || []).map((g, i) => (
        <div className="plan-group" key={i}>
          <h4>{g.folder.startsWith('(') ? g.folder : `📁 ${g.folder}`}</h4>
          <p className="reason">{g.reason}</p>
          {(g.files || []).map(f => <div className="plan-file" key={f}>→ {f}</div>)}
          {(g.files || []).length === 0 && <div className="plan-file muted">(empty)</div>}
        </div>
      ))}

      {!project && <div className="empty-state"><h2>No project yet</h2><p>Upload a zip to organize it.</p></div>}
    </div>
  );
}
