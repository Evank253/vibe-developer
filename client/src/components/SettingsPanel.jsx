import { useState } from 'react';
import api from '../lib/api.js';

export default function SettingsPanel({ provider, setProvider, info, github, onValidatePat, onToast }) {
  const [pat, setPat] = useState('');
  const [busy, setBusy] = useState(false);

  async function usePat() {
    if (!pat.trim()) return;
    setBusy(true);
    try {
      const r = await api.validatePat(pat.trim());
      localStorage.setItem('github_token', pat.trim());
      localStorage.setItem('github_login', r.login);
      if (r.avatar_url) localStorage.setItem('github_avatar', r.avatar_url);
      onValidatePat(pat.trim());
      onToast(`✅ Connected as @${r.login}`);
      setPat('');
    } catch (e) { onToast('❌ ' + e.message); } finally { setBusy(false); }
  }

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>⚙️ Settings</h2>

      <div className="card">
        <h3>🤖 AI Provider</h3>
        <label className="field">
          Active provider
          <select className="input" value={provider} onChange={e => setProvider(e.target.value)}>
            {(info?.providers || []).map(p => (
              <option key={p.id} value={p.id}>{p.label}{!p.configured ? ' (needs key)' : ''}</option>
            ))}
          </select>
        </label>
        <p className="small muted" style={{ marginBottom: 0 }}>
          <b>Demo mode</b> works instantly with no key. For real AI, set keys in the server's <b className="mono">.env</b>: <b className="mono">ANTHROPIC_API_KEY</b>, <b className="mono">OPENAI_API_KEY</b>, and <b className="mono">AI_PROVIDER</b> (anthropic | openai | auto).
        </p>
      </div>

      <div className="card">
        <h3>🔗 GitHub Connection</h3>
        {github.user ? (
          <p className="small" style={{ marginBottom: 0 }}>
            Connected as <b>@{github.user.login}</b> <span className="badge on">✓</span>. You can create repos, push projects, and deploy.
          </p>
        ) : (
          <>
            <p className="small muted">Two ways to connect:</p>
            <div className="row" style={{ marginBottom: 12 }}>
              <button className="btn primary" onClick={() => api.githubAuthUrl().then(r => r.url ? window.location.href = r.url : onToast(r.message))}>⌘ Connect with GitHub OAuth</button>
              <span className="muted small">or paste a token:</span>
              <input className="input" style={{ maxWidth: 260, flex: 1 }} placeholder="ghp_… Personal Access Token" value={pat} onChange={e => setPat(e.target.value)} />
              <button className="btn" onClick={usePat} disabled={busy}>{busy ? '…' : 'Use token'}</button>
            </div>
            <p className="small muted" style={{ marginBottom: 0 }}>
              Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">github.com/settings/tokens</a> with <b className="mono">repo</b> scope.
            </p>
          </>
        )}
      </div>

      <div className="card">
        <h3>ℹ️ Server</h3>
        <p className="small" style={{ marginBottom: 0 }}>
          App: <b>{info?.app}</b> v{info?.version}<br />
          GitHub OAuth configured: <b>{info?.githubOAuthConfigured ? 'Yes' : 'No (use PAT)'}</b><br />
          Active provider on server: <b>{info?.activeProvider}</b>
        </p>
      </div>
    </div>
  );
}
