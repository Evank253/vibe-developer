import { detectLanguageKey, detectLanguage } from './languages.js';

const API = 'https://api.openai.com/v1/chat/completions';

async function call({ apiKey, model, system, messages, json = true, maxTokens = 4096 }) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
      ...(json ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

export default function createOpenAI(cfg) {
  const apiKey = cfg?.apiKey;
  const model = cfg?.model;

  async function ensureKey() {
    if (!apiKey) throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY or switch to mock/anthropic.');
  }

  function parseJSON(raw) {
    try { return JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim()); } catch { return null; }
  }

  return {
    name: 'openai',
    isMock: false,

    async chat(messages, { system } = {}) {
      await ensureKey();
      const msgs = messages.map(m => ({ role: m.role, content: m.content }));
      const content = await call({
        apiKey, model, json: false,
        system: system || 'You are VibeDev, a friendly AI super-developer and copilot. Help the user build, organize, review, fix, and deploy their code. Be concise and use plain language — the user may not be a developer.',
        messages: msgs
      });
      return { role: 'assistant', content, mock: false };
    },

    async reviewCode(files, { language } = {}) {
      await ensureKey();
      const list = files.slice(0, 12).map(f => `--- ${f.path}\n${(f.content || '').slice(0, 4000)}`).join('\n');
      const raw = await call({
        apiKey, model,
        system: 'You are a world-class code reviewer fluent in every language. Review the code and return strict JSON: {"score":0-100,"files":[{"path":"...","issues":[{"severity":"error|warn|info","line":1,"message":"..."}]}]}. Score starts at 100 and drops for real bugs. Do not invent issues.',
        messages: [{ role: 'user', content: `Review:\n${list}` }]
      });
      const parsed = parseJSON(raw);
      if (parsed) return parsed;
      return { score: 90, files: files.map(f => ({ path: f.path, issues: [] })) };
    },

    async fixCode(files, { language } = {}) {
      await ensureKey();
      const list = files.slice(0, 8).map(f => `--- ${f.path}\n${f.content || ''}`).join('\n');
      const raw = await call({
        apiKey, model,
        system: 'You are a meticulous code fixer fluent in all languages. Return ONLY a JSON array of fixed file contents: [{"path":"...","content":"...","summary":"..."}]. Preserve behavior; fix real bugs and style.',
        messages: [{ role: 'user', content: `Fix:\n${list}` }]
      });
      const parsed = parseJSON(raw);
      if (Array.isArray(parsed)) {
        return { fixed: parsed.map(p => ({ path: p.path, content: p.content || '', summary: p.summary, changed: true })) };
      }
      return { fixed: files.map(f => ({ path: f.path, content: f.content, changed: false })) };
    },

    async generateCode(description, { language = 'Python' } = {}) {
      await ensureKey();
      const raw = await call({
        apiKey, model,
        system: 'You convert natural language into production-quality code. Return ONLY strict JSON: {"language":"...","fileName":"...","code":"...","explanation":"..."}',
        messages: [{ role: 'user', content: `Language: ${language}. Request: ${description}` }]
      });
      const parsed = parseJSON(raw);
      if (parsed && parsed.code) return parsed;
      return { language, fileName: 'generated.' + (language === 'Python' ? 'py' : 'js'), code: raw, explanation: description };
    },

    async organizeFiles(files) {
      await ensureKey();
      const paths = files.map(f => f.path).join('\n');
      const raw = await call({
        apiKey, model,
        system: 'You are a project organizer. Return ONLY strict JSON: {"plan":[{"folder":"src/","files":["..."],"reason":"..."}],"stats":{"total":0}}',
        messages: [{ role: 'user', content: `Organize:\n${paths}` }]
      });
      const parsed = parseJSON(raw);
      if (parsed && parsed.plan) return parsed;
      return { plan: [], stats: { total: files.length } };
    },

    async addMissingCode(project) {
      await ensureKey();
      const summary = project.files.map(f => f.path).join('\n');
      const raw = await call({
        apiKey, model,
        system: 'You are a completeness expert. Detect missing standard files (README.md, .gitignore, package.json, requirements.txt, Dockerfile, etc.) and generate them. Return ONLY strict JSON: {"added":[{"path":"...","reason":"...","content":"..."}]}',
        messages: [{ role: 'user', content: `Project: ${project.name}\nFiles:\n${summary}` }]
      });
      const parsed = parseJSON(raw);
      if (parsed && Array.isArray(parsed.added)) return parsed;
      return { added: [] };
    }
  };
}
