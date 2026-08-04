import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { execFileSync } from 'child_process';
import config from '../config.js';
import { detectLanguage } from './ai/languages.js';

const MAX_TEXT = 500 * 1024; // don't read huge binary-ish files into memory for AI

function safeJoin(root, p) {
  const full = path.resolve(root, p);
  if (!full.startsWith(path.resolve(root))) throw new Error('Illegal path traversal');
  return full;
}

// Create a fresh, empty project workspace for a new upload
export function createWorkspace() {
  const id = crypto.randomUUID();
  const dir = path.join(config.workspaceRoot, id);
  fs.mkdirSync(dir, { recursive: true });
  // Initialize a git repo so the built-in GitBash works immediately.
  try {
    execFileSync('git', ['init', '-b', 'main'], { cwd: dir, stdio: 'ignore' });
  } catch { /* git may be unavailable in some sandboxes; terminal will still work */ }
  return { id, dir };
}

// Extract a zip buffer into a workspace dir, returning the file list.
export function extractZip(id, zipBuffer) {
  const ws = getWorkspace(id);
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  let skipped = 0;

  // Strip a common single top-level folder wrapper
  const topDirs = new Set();
  for (const e of entries) {
    const seg = e.entryName.split('/')[0];
    if (!e.isDirectory && seg) topDirs.add(seg);
  }
  let stripPrefix = null;
  if (topDirs.size === 1) stripPrefix = [...topDirs][0] + '/';

  for (const e of entries) {
    if (e.isDirectory) continue;
    // skip mac junk & hidden junk
    if (/__MACOSX/.test(e.entryName) || /\.DS_Store$/.test(e.entryName)) { skipped++; continue; }
    let name = e.entryName;
    if (stripPrefix && name.startsWith(stripPrefix)) name = name.slice(stripPrefix.length);
    if (!name) continue;
    const outPath = safeJoin(ws.dir, name);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, e.getData());
  }
  return { files: listFiles(ws.dir), skipped };
}

export function getWorkspace(id) {
  const dir = safeJoin(config.workspaceRoot, id);
  if (!fs.existsSync(dir)) throw new Error('Workspace not found');
  return { id, dir };
}

// Recursively list files with metadata
export function listFiles(dir, base = dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build' || e.name === '.next') continue;
      out.push(...listFiles(full, base));
    } else {
      const rel = path.relative(base, full).split(path.sep).join('/');
      const stat = fs.statSync(full);
      const isText = isProbablyText(full);
      out.push({
        path: rel,
        size: stat.size,
        language: detectLanguage(rel),
        isText,
        contentPreview: isText ? readPreview(full) : ''
      });
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function readFileText(id, relPath) {
  const ws = getWorkspace(id);
  const full = safeJoin(ws.dir, relPath);
  return fs.readFileSync(full, 'utf8');
}

export function writeFileText(id, relPath, content) {
  const ws = getWorkspace(id);
  const full = safeJoin(ws.dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

export function moveFile(id, fromPath, toPath) {
  const ws = getWorkspace(id);
  const src = safeJoin(ws.dir, fromPath);
  const dst = safeJoin(ws.dir, toPath);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (fs.existsSync(dst) && src !== dst) fs.rmSync(dst, { recursive: true, force: true });
  fs.renameSync(src, dst);
}

function isProbablyText(p) {
  const binExts = new Set(['png','jpg','jpeg','gif','webp','ico','bmp','mp4','mp3','wav','ogg','zip','gz','tgz','rar','7z','pdf','woff','woff2','ttf','otf','eot','exe','dll','so','dylib','class','jar','pyc','o','a','db','sqlite','wasm']);
  const ext = path.extname(p).slice(1).toLowerCase();
  if (binExts.has(ext)) return false;
  return true;
}

function readPreview(p) {
  try {
    return fs.readFileSync(p, 'utf8').slice(0, MAX_TEXT);
  } catch {
    return '';
  }
}

export function applyOrganization(id, plan) {
  const applied = [];
  for (const group of plan || []) {
    for (const f of group.files || []) {
      const folder = group.folder && !group.folder.startsWith('(') ? group.folder : '';
      if (!folder) continue;
      const base = path.basename(f);
      const newPath = folder.endsWith('/') ? folder + base : folder + '/' + base;
      if (newPath !== f) {
        try { moveFile(id, f, newPath); applied.push({ from: f, to: newPath }); } catch (e) { /* skip */ }
      }
    }
  }
  return { applied, files: listFiles(getWorkspace(id).dir) };
}

export default {
  createWorkspace, extractZip, getWorkspace, listFiles,
  readFileText, writeFileText, moveFile, applyOrganization
};
