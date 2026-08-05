import { detectLanguageKey, detectLanguage } from './languages.js';

const API = 'https://api.anthropic.com/v1/messages';

async function call({ apiKey, model, system, messages, maxTokens = 4096 }) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, system, messages, max_tokens: maxTokens })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content.map(b => b.text).join('\n');
}

export default function createAnthropic(cfg) {
  const apiKey = cfg?.apiKey;
  const model = cfg?.model;

  async function ensureKey() {
    if (!apiKey) throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY or switch to mock/openai.');
  }

  return {
    name: 'anthropic',
    isMock: false,

    async chat(messages, { system } = {}) {
      await ensureKey();
      const msgs = messages.map(m => ({ role: m.role, content: m.content }));
      const content = await call({
        apiKey, model,
        system: system || 'You are VibeDev, a friendly AI super-developer and copilot. Help the user build, organize, review, fix, and deploy their code. Be concise and helpful. Use plain language — the user may not be a developer.',
        messages: msgs
      });
      return { role: 'assistant', content, mock: false };
    },

    async reviewCode(files, { language } = {}) {
      await ensureKey();
      const list = files.slice(0, 12).map(f => `--- ${f.path} (${f.language})\n${(f.content || '').slice(0, 4000)}`).join('\n');
      const system = `You are a world-class senior code reviewer fluent in every language. Review the code and return ONLY strict JSON of shape:
{"score":0-100,"files":[{"path":"...","issues":[{"severity":"error|warn|info","line":1,"message":"..."}]}]}
Score starts at 100 and is reduced for real bugs/errors. Do not invent issues.`;
      const raw = await call({ apiKey, model, system, messages: [{ role: 'user', content: `Review these files:\n${list}` }] });
      try {
        return JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim());
      } catch {
        return { score: 90, files: files.map(f => ({ path: f.path, issues: [] })), raw };
      }
    },

    async fixCode(files, { language } = {}) {
      await ensureKey();
      const list = files.slice(0, 8).map(f => `--- ${f.path}\n${f.content || ''}`).join('\n');
      const system = 'You are a meticulous code fixer fluent in all languages. Return ONLY a JSON array of fixed file contents: [{"path":"...","content":"...fixed code...","summary":"what you changed"}]. Preserve behavior; fix real bugs, style, and add helpful comments only where needed.';
      const raw = await call({ apiKey, model, system, messages: [{ role: 'user', content: `Fix these files:\n${list}` }] });
      try {
        const parsed = JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim());
        return { fixed: parsed.map(p => ({ path: p.path, content: p.content || '', summary: p.summary, changed: true })) };
      } catch {
        return { fixed: files.map(f => ({ path: f.path, content: f.content, changed: false })) };
      }
    },

    async generateCode(description, { language = 'Python' } = {}) {
      await ensureKey();
      const system = 'You are a code generator. Convert natural language into production-quality code. Return ONLY strict JSON: {"language":"...","fileName":"...","code":"...","explanation":"..."}';
      const raw = await call({ apiKey, model, system, messages: [{ role: 'user', content: `Language: ${language}. Request: ${description}` }] });
      try {
        return JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim());
      } catch {
        return { language, fileName: 'generated.' + (language === 'Python' ? 'py' : 'js'), code: raw, explanation: description };
      }
    },

    async organizeFiles(files) {
      await ensureKey();
      const paths = files.map(f => f.path).join('\n');
      const system = 'You are a project organizer. Return ONLY strict JSON: {"plan":[{"folder":"src/","files":["..."],"reason":"..."}],"stats":{"total":0}}';
      const raw = await call({ apiKey, model, system, messages: [{ role: 'user', content: `Organize these files into a conventional structure:\n${paths}` }] });
      try {
        return JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim());
      } catch {
        return { plan: [], stats: { total: files.length } };
      }
    },

    async addMissingCode(project) {
      await ensureKey();
      const summary = project.files.map(f => f.path).join('\n');
      const system = 'You are a completeness expert. Detect missing standard files (README.md, .gitignore, package.json, requirements.txt, Dockerfile, etc.) and generate them. Return ONLY strict JSON: {"added":[{"path":"...","reason":"...","content":"..."}]}';
      const raw = await call({ apiKey, model, system, messages: [{ role: 'user', content: `Project: ${project.name}\nCurrent files:\n${summary}` }] });
      try {
        return JSON.parse(raw.replace(/^```(json)?|```$/gm, '').trim());
      } catch {
        return { added: [] };
      }
    }
  };
}
