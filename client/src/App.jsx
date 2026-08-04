import { useCallback, useEffect, useRef, useState } from 'react';
import api from './lib/api.js';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import ChatCopilot from './components/ChatCopilot.jsx';
import HomePanel from './components/HomePanel.jsx';
import CodePanel from './components/CodePanel.jsx';
import OrganizePanel from './components/OrganizePanel.jsx';
import TerminalPanel from './components/TerminalPanel.jsx';
import DeployPanel from './components/DeployPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

const TAB_ACTIONS = {
  'Organize my project': 'organize',
  'Review my code': 'code',
  'Fix the issues': 'code',
  'Add missing files': 'code',
  'Generate an app': 'home',
  'Deploy this free': 'deploy'
};

export default function App() {
  const [info, setInfo] = useState(null);
  const [provider, setProvider] = useState('mock');
  const [tab, setTab] = useState('home');
  const [project, setProject] = useState(null);
  const [github, setGithub] = useState({ token: '', user: null });
  const [toast, setToast] = useState('');
  const [githubBusy, setGithubBusy] = useState(false);
  const toastTimer = useRef(null);

  // Load server info + stored github
  useEffect(() => {
    api.info().then(i => { setInfo(i); setProvider(i.activeProvider || 'mock'); }).catch(() => {});
    const token = localStorage.getItem('github_token');
    const login = localStorage.getItem('github_login');
    const avatar = localStorage.getItem('github_avatar');
    if (token) setGithub({ token, user: { login: login || '', avatar_url: avatar || '' } });
  }, []);

  const showToast = useCallback((m) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }, []);

  const validatePat = useCallback(async (token) => {
    if (!token) { setGithub({ token: '', user: null }); return; }
    setGithubBusy(true);
    try {
      const u = await api.githubUser(token);
      setGithub({ token, user: u });
    } catch (e) {
      setGithub({ token: '', user: null });
      showToast('GitHub token invalid: ' + e.message);
    } finally { setGithubBusy(false); }
  }, [showToast]);

  const onConnectGitHub = useCallback(async () => {
    try {
      const r = await api.githubAuthUrl();
      if (r.url) window.location.href = r.url;
      else showToast(r.message || 'OAuth not configured — use a token in Settings');
    } catch (e) { showToast(e.message); }
  }, [showToast]);

  const onRequireGitHub = useCallback(() => {
    setTab('settings');
    showToast('Connect GitHub first (Settings tab) to push & deploy.');
  }, [showToast]);

  const onProjectLoaded = useCallback((p) => setProject(p), []);

  function handleChatAction(action) {
    const t = TAB_ACTIONS[action];
    if (t) setTab(t);
  }

  return (
    <div className="app">
      <Sidebar tab={tab} setTab={setTab} />
      <div className="center">
        <TopBar
          provider={provider} setProvider={setProvider} info={info}
          github={github} onConnectGitHub={onConnectGitHub} onValidatePat={validatePat} busy={githubBusy}
        />
        {tab === 'home' && <HomePanel provider={provider} project={project} onProjectLoaded={onProjectLoaded} onToast={showToast} />}
        {tab === 'code' && <CodePanel provider={provider} project={project} onProjectLoaded={onProjectLoaded} onToast={showToast} />}
        {tab === 'organize' && <OrganizePanel provider={provider} project={project} onProjectLoaded={onProjectLoaded} onToast={showToast} />}
        {tab === 'terminal' && <TerminalPanel project={project} onToast={showToast} />}
        {tab === 'deploy' && <DeployPanel provider={provider} project={project} github={github} onProjectLoaded={onProjectLoaded} onToast={showToast} onRequireGitHub={onRequireGitHub} />}
        {tab === 'settings' && <SettingsPanel provider={provider} setProvider={setProvider} info={info} github={github} onValidatePat={validatePat} onToast={showToast} />}
      </div>
      <ChatCopilot provider={provider} project={project} onAction={handleChatAction} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
