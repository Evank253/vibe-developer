import { useState } from 'react';
import api from '../lib/api.js';

export default function DeployPanel({ provider, project, github, onProjectLoaded, onToast, onRequireGitHub }) {
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);
  const [repoName, setRepoName] = useState(project?.name || 'my-app');
  const [pushBusy, setPushBusy] = useState(false);

  async function makePlan() {
    if (!project) return;
    setBusy(true); setPlan(null); setApplied(false);
    try {
      const r = await api.deployPlan(project.id, project.name, github?.user?.login);
      setPlan(r);
      onToast('Deploy plan ready — free options found');
    } catch (e) { onToast('❌ ' + e.message); } finally { setBusy(false); }
  }

  async function apply() {
    if (!plan) return;
    setBusy(true);
    try {
      await api.deployApply(project.id, plan.generatedFiles);
      const pr = await api.project(project.id);
      onProjectLoaded({ id: project.id, name: project.name, files: pr.files });
      setApplied(true);
      onToast(`✅ Wrote ${plan.generatedFiles.length} deploy config files`);
    } catch (e) { onToast('❌ ' + e.message); } finally { setBusy(false); }
  }

  async function pushToGitHub() {
    if (!github?.token) { onRequireGitHub(); return; }
    if (!project) return;
    setPushBusy(true);
    try {
      const name = repoName.trim() || 'my-app';
      const res = await api.push(github.token, {
        projectId: project.id, repoName: name, owner: github.user.login,
        message: 'Built with VibeDev',
        gitUser: github.user.login, gitEmail: github.user.email || `${github.user.login}@users.noreply.github.com`
      });
      onToast(`🚀 Pushed to GitHub: ${res.pushedTo}`);
      window.open(res.pushedTo, '_blank');
    } catch (e) { onToast('❌ ' + e.message); } finally { setPushBusy(false); }
  }

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>🚀 Deploy — free server & domain</h2>
      <p className="muted">Generate configs for free hosting (Render, GitHub Pages, Netlify, Docker), apply them, push to GitHub, and get a live URL.</p>

      <div className="row" style={{ margin: '16px 0' }}>
        <button className="btn primary" onClick={makePlan} disabled={!project || busy}>{busy ? '…' : plan ? '↻ Re-analyze' : '🧭 Generate deploy plan'}</button>
        {plan && <button className="btn green" onClick={apply} disabled={busy}>{busy ? '…' : applied ? '✅ Applied' : '📄 Write config files'}</button>}
      </div>

      {plan && (
        <>
          <div className="card">
            <h3>Free options for your project</h3>
            {(plan.options || []).map(o => (
              <div className="issue" key={o.id}>
                <div>🚀</div>
                <div>
                  <b>{o.label}</b> <span className="muted small">— <a href={o.url} target="_blank" rel="noreferrer">open</a></span>
                  <div className="small" style={{ marginTop: 4 }}>{o.note}</div>
                </div>
              </div>
            ))}
            <div className="small muted" style={{ marginTop: 8 }}>Detected project type: <b className="mono">{plan.type}</b></div>
          </div>

          <div className="card">
            <h3>🚀 Push to GitHub (then pick a host)</h3>
            {github?.user ? (
              <div className="row">
                <input className="input" value={repoName} onChange={e => setRepoName(e.target.value)} style={{ maxWidth: 260 }} />
                <span className="small muted">github.com/{github.user.login}/</span>
                <button className="btn green" onClick={pushToGitHub} disabled={pushBusy}>{pushBusy ? 'Pushing…' : '⬆ Push & create repo'}</button>
              </div>
            ) : (
              <button className="btn primary" onClick={onRequireGitHub}>Connect GitHub to push</button>
            )}
            <p className="small muted" style={{ marginBottom: 0 }}>
              After pushing, click a host above (e.g. Render) → connect the repo → it auto-deploys free with a free domain. Custom domains connect free.
            </p>
          </div>
        </>
      )}

      {!project && <div className="empty-state"><h2>No project yet</h2><p>Upload a zip to deploy it.</p></div>}
    </div>
  );
}
