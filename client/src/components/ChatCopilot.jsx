import { useState, useRef, useEffect } from 'react';
import api from '../lib/api.js';

const QUICK = [
  'Organize my project',
  'Review my code',
  'Fix the issues',
  'Add missing files',
  'Generate an app',
  'Deploy this free'
];

export default function ChatCopilot({ provider, project, onAction }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hey! I'm your **VibeDev copilot**. 👋 Upload a zip (or drop a folder) and I'll organize it, review & fix the code, add anything missing, and even deploy it — no coding needed. What are we building today?" }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef(null);

  useEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages, busy]);

  function renderMd(text) {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // bold
    return esc.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', content: userText }];
    setMessages(next);
    setBusy(true);
    try {
      // Attach project context so the AI can reason about it
      const ctx = project ? `\n\n[Project: ${project.name}, ${project.files?.length || 0} files. File paths: ${(project.files || []).slice(0, 30).map(f => f.path).join(', ')}]` : '';
      const res = await api.chat([...next.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })), { role: 'user', content: userText + ctx }], provider);
      setMessages(m => [...m, { role: 'bot', content: res.content }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', content: `⚠️ ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chatcol">
      <div className="chathead">🤖 Copilot <span className="muted small" style={{ fontWeight: 400 }}>— vibe & organize & develop</span></div>
      <div className="suggest-row">
        {QUICK.map(q => (
          <button key={q} className="chip" onClick={() => { if (project) onAction(q); else send(q); }}>{q}</button>
        ))}
      </div>
      <div className="chatmsgs" ref={scroll}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`} dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
        ))}
        {busy && <div className="msg bot"><span className="spin">◌</span> thinking…</div>}
      </div>
      <div className="chatinput">
        <input
          className="input"
          placeholder={project ? "Ask VibeDev about your project…" : "Upload a project first, or type what to build…"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
        />
        <button className="btn primary" onClick={() => send()} disabled={busy}>➤</button>
      </div>
    </div>
  );
}
