// Lightweight API client for the VibeDev backend.

async function request(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body && !isForm) headers['content-type'] = 'application/json';
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  info: () => request('/info'),

  // GitHub
  githubAuthUrl: () => request('/github/auth-url'),
  validatePat: (token) => request('/github/validate-pat', { method: 'POST', body: { token } }),
  githubUser: (token) => request('/github/user', { token }),
  githubRepos: (token) => request('/github/repos', { token }),
  createRepo: (token, body) => request('/github/repo', { method: 'POST', body, token }),
  push: (token, body) => request('/github/push', { method: 'POST', body, token }),

  // Project
  newProject: (name) => request('/project/new', { method: 'POST', body: { name } }),
  uploadZip: (id, file) => {
    const fd = new FormData();
    fd.append('zip', file);
    return request(`/project/${id}/upload`, { method: 'POST', body: fd, isForm: true });
  },
  project: (id) => request(`/project/${id}`),
  readFile: (id, path) => request(`/project/${id}/file?path=${encodeURIComponent(path)}`),
  writeFile: (id, path, content) => request(`/project/${id}/file`, { method: 'POST', body: { path, content } }),

  // AI
  chat: (messages, provider) => request('/ai/chat', { method: 'POST', body: { messages, provider } }),
  review: (projectId, provider) => request('/ai/review', { method: 'POST', body: { projectId, provider } }),
  fix: (projectId, provider) => request('/ai/fix', { method: 'POST', body: { projectId, provider } }),
  generate: (description, language, provider) => request('/ai/generate', { method: 'POST', body: { description, language, provider } }),
  generateAdd: (projectId, description, language, provider) => request('/ai/generate/add', { method: 'POST', body: { projectId, description, language, provider } }),
  addMissing: (projectId, name, provider) => request('/ai/add-missing', { method: 'POST', body: { projectId, name, provider } }),

  // Organize
  organize: (projectId, provider) => request(`/project/${projectId}/organize`, { method: 'POST', body: { provider } }),
  applyOrg: (projectId, plan) => request(`/project/${projectId}/organize/apply`, { method: 'POST', body: { plan } }),

  // Terminal (GitBash)
  terminal: (id, command, cwd) => request(`/project/${id}/terminal`, { method: 'POST', body: { command, cwd } }),
  terminalSuggest: (id, intent) => request(`/project/${id}/terminal/suggest`, { method: 'POST', body: { intent } }),

  // Deploy
  deployPlan: (projectId, name, owner) => request('/deploy/plan', { method: 'POST', body: { projectId, name, owner } }),
  deployApply: (projectId, generatedFiles) => request('/deploy/apply', { method: 'POST', body: { projectId, generatedFiles } })
};

export default api;
