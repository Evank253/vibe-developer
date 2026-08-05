import { useEffect } from 'react';

export default function TopBar({ provider, setProvider, info, github, onConnectGitHub, onValidatePat, busy }) {
  useEffect(() => {
    // Handle OAuth redirect back: /github-connected?token=...&login=...
    const q = new URLSearchParams(window.location.search);
    if (window.location.pathname.startsWith('/github-connected')) {
      const token = q.get('token');
      const login = q.get('login');
      const avatar = q.get('avatar');
      const error = q.get('error');
      if (error) alert('GitHub connect failed: ' + error);
      if (token && login) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_login', login);
        localStorage.setItem('github_avatar', avatar || '');
        onValidatePat(token);
      }
      window.history.replaceState({}, '', '/');
    }
  }, [onValidatePat]);

  return (
    <div className="topbar">
      <h1>VibeDev</h1>
      <span className="sub">AI Super-Developer</span>
      <div className="spacer" />
      <span className={`badge live`}>● copilot ready</span>
      <span className="badge on">{provider || 'auto'}</span>

      <select className="input" style={{ width: 170 }} value={provider} onChange={e => setProvider(e.target.value)} title="AI provider">
        {(info?.providers || []).map(p => (
          <option key={p.id} value={p.id}>
            {p.label}{!p.configured ? ' (needs key)' : ''}
          </option>
        ))}
      </select>

      {github.user ? (
        <div className="row" style={{ gap: 6 }}>
          {github.user.avatar_url && <img src={github.user.avatar_url} width={26} height={26} style={{ borderRadius: '50%' }} alt="" />}
          <span className="badge on">@{github.user.login}</span>
          <button className="btn" style={{ padding: '6px 10px' }} onClick={() => { localStorage.removeItem('github_token'); onValidatePat(''); }}>Disconnect</button>
        </div>
      ) : (
        <button className="btn primary" disabled={busy} onClick={onConnectGitHub}>
          {busy ? '…' : '⌘ Connect GitHub'}
        </button>
      )}
    </div>
  );
}
