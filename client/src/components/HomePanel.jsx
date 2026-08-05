import { useState, useRef } from 'react';
import api from '../lib/api.js';

export default function HomePanel({ provider, project, onProjectLoaded, onToast }) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [genLang, setGenLang] = useState('Python');
  const [genDesc, setGenDesc] = useState('');
  const [genBusy, setGenBusy] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(file) {
    setBusy(true);
    onToast('Uploading & extracting zip…');
    try {
      let id = project?.id;
      if (!id) {
        const np = await api.newProject(file.name.replace(/\.zip$/i, ''));
        id = np.id;
      }
      const res = await api.uploadZip(id, file);
      const pr = await api.project(id);
      onProjectLoaded({ id, name: res.name || file.name.replace(/\.zip$/i, ''), files: res.files });
      onToast(`✅ Imported ${res.files.length} files (${res.skipped ? res.skipped + ' junk files skipped' : ''})`);
    } catch (e) {
      onToast(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!genDesc.trim()) return;
    setGenBusy(true);
    onToast('Generating code from your words…');
    try {
      let id = project?.id;
      if (!id) { const np = await api.newProject(genDesc.slice(0, 30)); id = np.id; }
      const res = await api.generateAdd(id, genDesc, genLang, provider);
      const pr = await api.project(id);
      onProjectLoaded({ id, name: res.fileName.replace(/\.[^.]+$/, ''), files: pr.files });
      onToast(`✅ Generated ${res.fileName}`);
    } catch (e) { onToast(`❌ ${e.message}`); } finally { setGenBusy(false); }
  }

  return (
    <div className="panel">
      <div className="empty-state" style={{ justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <h2 style={{ textAlign: 'center' }}>Drop in any project. Zip it, or let VibeDev build it.</h2>
        <p style={{ textAlign: 'center' }}>
          VibeDev reviews and fixes your code in every language, adds anything missing, organizes your files to a perfect score, and pushes to GitHub + deploys free — all through the copilot on the right.
        </p>
      </div>

      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <div className="big">🗜️</div>
        <p>{busy ? 'Working…' : <><b>Click or drop</b> a <b>.zip</b> here — big files welcome</>}</p>
        <p className="small muted">Supports huge zips. We strip junk (__MACOSX, .DS_Store) and unwrap single-folder zips automatically.</p>
        <input ref={fileRef} type="file" accept=".zip" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>✍️ Build from plain language</h3>
        <div className="row">
          <input className="input" placeholder='e.g. "a to-do list web app with a login page"' value={genDesc} onChange={e => setGenDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()} />
          <select className="input" style={{ width: 150 }} value={genLang} onChange={e => setGenLang(e.target.value)}>
            {['Python', 'JavaScript', 'TypeScript', 'Java', 'HTML', 'React', 'Go', 'C++', 'Ruby', 'PHP', 'C', 'Rust', 'Swift', 'SQL'].map(l => <option key={l}>{l}</option>)}
          </select>
          <button className="btn primary" onClick={generate} disabled={genBusy || !genDesc.trim()}>{genBusy ? '…' : '⚡ Generate'}</button>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {project ? 'Code will be added to the current project.' : 'A new project will be created.'} Open <b>Code & Review</b> to see it.
        </p>
      </div>
    </div>
  );
}
