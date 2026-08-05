import { useEffect, useState } from 'react';
import api from '../lib/api.js';

const ICO = { js: '🟨', ts: '🟦', py: '🐍', java: '☕', html: '🌐', css: '🎨', json: '🧾', md: '📝', sh: '🖥️' };

export default function CodePanel({ provider, project, onProjectLoaded, onToast }) {
  const [active, setActive] = useState(null);
  const [content, setContent] = useState('');
  const [review, setReview] = useState(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [fixBusy, setFixBusy] = useState(false);
  const [missingBusy, setMissingBusy] = useState(false);

  useEffect(() => {
    if (project && project.files?.length && !active) {
      const first = project.files.find(f => f.isText);
      if (first) openFile(first.path);
    }
  }, [project]);

  async function openFile(path) {
    setActive(path);
    try { const r = await api.readFile(project.id, path); setContent(r.content); }
    catch (e) { setContent('// ' + e.message); }
  }

  function langIcon(path) {
    const ext = path.split('.').pop();
    return ICO[ext] || '📄';
  }

  async function doReview() {
    if (!project) return;
    setReviewBusy(true); setReview(null);
    try { setReview(await api.review(project.id, provider)); onToast('Review complete'); }
    catch (e) { onToast('❌ ' + e.message); } finally { setReviewBusy(false); }
  }

  async function doFix() {
    if (!project) return;
    setFixBusy(true);
    try {
      await api.fix(project.id, provider);
      const pr = await api.project(project.id);
      onProjectLoaded({ id: project.id, name: project.name, files: pr.files });
      if (active) { const r = await api.readFile(project.id, active); setContent(r.content); }
      onToast('✅ Fixed & applied');
    } catch (e) { onToast('❌ ' + e.message); } finally { setFixBusy(false); }
  }

  async function doMissing() {
    if (!project) return;
    setMissingBusy(true);
    try {
      const r = await api.addMissing(project.id, project.name, provider);
      const pr = await api.project(project.id);
      onProjectLoaded({ id: project.id, name: project.name, files: pr.files });
      onToast(`✅ Added missing files: ${(r.added || []).map(a => a.path).join(', ') || 'none needed'}`);
    } catch (e) { onToast('❌ ' + e.message); } finally { setMissingBusy(false); }
  }

  const score = review?.score;

  return (
    <div className="panel">
      <div className="tabs">
        <button className="tab active">Files</button>
      </div>
      <div className="row" style={{ marginBottom: 16, justifyContent: 'space-between' }}>
        <div className="row">
          <button className="btn" onClick={doReview} disabled={!project || reviewBusy}>{reviewBusy ? '…' : '🔍 Review & Score'}</button>
          <button className="btn" onClick={doFix} disabled={!project || fixBusy}>{fixBusy ? '…' : '🛠️ Fix code'}</button>
          <button className="btn" onClick={doMissing} disabled={!project || missingBusy}>{missingBusy ? '…' : '➕ Add missing files'}</button>
        </div>
        {score !== undefined && (
          <div className="row" style={{ gap: 12 }}>
            <div className="score-ring" style={{ '--v': score }}><span>{score}</span></div>
            <div className="small muted">
              <b style={{ color: score >= 90 ? 'var(--ok)' : score >= 70 ? 'var(--warn)' : 'var(--err)' }}>
                {score >= 90 ? 'Perfect / Ready' : score >= 70 ? 'Good' : 'Needs work'}
              </b><br />
              quality score
            </div>
          </div>
        )}
      </div>

      {review && (
        <div className="card">
          <h3>📋 Review results</h3>
          {(review.files || []).filter(f => (f.issues || []).length).length === 0 && <p className="muted">No issues found. Looks clean! 🎉</p>}
          {(review.files || []).filter(f => (f.issues || []).length).map(f => (
            <div className="fileblock" key={f.path}>
              <h4>📄 {f.path}</h4>
              {(f.issues || []).map((iss, i) => (
                <div className="issue" key={i}>
                  <span className={`sev ${iss.severity}`}>{iss.severity}</span>
                  <div><div className="path">line {iss.line}</div>{iss.message}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {project ? (
        <div className="card" style={{ padding: 12 }}>
          <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
            <div className="tree" style={{ width: 240, flexShrink: 0 }}>
              <div className="small muted" style={{ margin: '4px 8px 8px' }}>📁 {project.name} — {project.files?.length} files</div>
              {(project.files || []).map(f => (
                <div key={f.path} className={`tree-item ${active === f.path ? 'selected' : ''}`} onClick={() => openFile(f.path)}>
                  <span>{langIcon(f.path)}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</span>
                  <span className="muted">{f.size < 1024 ? `${f.size}B` : `${(f.size / 1024).toFixed(1)}KB`}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {active ? (
                <>
                  <div className="small muted" style={{ marginBottom: 6 }}>📄 {active}</div>
                  <pre className="term mono" style={{ padding: 12, whiteSpace: 'pre-wrap', minHeight: 200 }}>{content}</pre>
                </>
              ) : <p className="muted">Select a file to view its code.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state"><h2>No project yet</h2><p>Upload a zip on the Home tab or generate code from text.</p></div>
      )}
    </div>
  );
}
