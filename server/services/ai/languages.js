// Language registry — lets VibeDev "speak" nearly every major language.
// Maps file extensions to language metadata (comment syntax, config files, runners).

export const LANGUAGE_MAP = {
  js: { name: 'JavaScript', comment: '//', block: ['/*', '*/'], exts: ['js', 'mjs', 'cjs', 'jsx'] },
  ts: { name: 'TypeScript', comment: '//', block: ['/*', '*/'], exts: ['ts', 'tsx'] },
  py: { name: 'Python', comment: '#', exts: ['py', 'pyw'] },
  java: { name: 'Java', comment: '//', block: ['/*', '*/'], exts: ['java'] },
  c: { name: 'C', comment: '//', block: ['/*', '*/'], exts: ['c', 'h'] },
  cpp: { name: 'C++', comment: '//', block: ['/*', '*/'], exts: ['cpp', 'cc', 'cxx', 'hpp', 'hh'] },
  cs: { name: 'C#', comment: '//', block: ['/*', '*/'], exts: ['cs'] },
  go: { name: 'Go', comment: '//', block: ['/*', '*/'], exts: ['go'] },
  rust: { name: 'Rust', comment: '//', block: ['/*', '*/'], exts: ['rs'] },
  rb: { name: 'Ruby', comment: '#', exts: ['rb', 'rake'] },
  php: { name: 'PHP', comment: '//', block: ['/*', '*/'], exts: ['php'] },
  swift: { name: 'Swift', comment: '//', block: ['/*', '*/'], exts: ['swift'] },
  kt: { name: 'Kotlin', comment: '//', block: ['/*', '*/'], exts: ['kt', 'kts'] },
  sql: { name: 'SQL', comment: '--', block: ['/*', '*/'], exts: ['sql'] },
  html: { name: 'HTML', comment: '', block: ['<!--', '-->'], exts: ['html', 'htm'] },
  css: { name: 'CSS', comment: '', block: ['/*', '*/'], exts: ['css', 'scss', 'sass', 'less'] },
  scss: { name: 'SCSS', comment: '', block: ['/*', '*/'], exts: ['scss'] },
  json: { name: 'JSON', comment: '', exts: ['json', 'jsonc'] },
  yml: { name: 'YAML', comment: '#', exts: ['yml', 'yaml'] },
  sh: { name: 'Shell', comment: '#', exts: ['sh', 'bash', 'zsh'] },
  ps1: { name: 'PowerShell', comment: '#', exts: ['ps1'] },
  md: { name: 'Markdown', comment: '', exts: ['md', 'markdown'] },
  dockerfile: { name: 'Dockerfile', comment: '#', exts: ['dockerfile', 'Dockerfile'] },
  toml: { name: 'TOML', comment: '#', exts: ['toml'] },
  xml: { name: 'XML', comment: '', block: ['<!--', '-->'], exts: ['xml', 'svg', 'csproj', 'xaml'] },
  ini: { name: 'INI', comment: ';', exts: ['ini', 'cfg', 'conf'] },
  txt: { name: 'Text', comment: '', exts: ['txt'] },
  r: { name: 'R', comment: '#', exts: ['r', 'R'] },
  dart: { name: 'Dart', comment: '//', block: ['/*', '*/'], exts: ['dart'] },
  lua: { name: 'Lua', comment: '--', exts: ['lua'] },
  perl: { name: 'Perl', comment: '#', exts: ['pl', 'pm'] },
  scala: { name: 'Scala', comment: '//', block: ['/*', '*/'], exts: ['scala'] },
  groovy: { name: 'Groovy', comment: '//', block: ['/*', '*/'], exts: ['groovy', 'gradle'] },
  vb: { name: 'VB.NET', comment: "'", exts: ['vb'] },
  hs: { name: 'Haskell', comment: '--', block: ['{-', '-}'], exts: ['hs'] },
  elixir: { name: 'Elixir', comment: '#', exts: ['ex', 'exs'] },
  clj: { name: 'Clojure', comment: ';', exts: ['clj', 'cljs'] },
  erl: { name: 'Erlang', comment: '%', exts: ['erl', 'hrl'] },
  vue: { name: 'Vue', comment: '//', block: ['<!--', '-->'], exts: ['vue'] },
  svelte: { name: 'Svelte', comment: '//', block: ['<!--', '-->'], exts: ['svelte'] },
  solidity: { name: 'Solidity', comment: '//', block: ['/*', '*/'], exts: ['sol'] },
  graphql: { name: 'GraphQL', comment: '#', exts: ['graphql', 'gql'] },
  plain: { name: 'Text', comment: '', exts: [] }
};

// Detect language from a file path or content signature.
export function detectLanguage(filePath = '', content = '') {
  const lower = (filePath || '').toLowerCase();

  if (/dockerfile/i.test(lower)) return 'dockerfile';
  if (/\.gitignore$/.test(lower)) return 'ini';

  // Known filenames
  const known = {
    'package.json': 'json', 'package-lock.json': 'json', 'tsconfig.json': 'json',
    'composer.json': 'json', 'pom.xml': 'xml', 'build.gradle': 'groovy',
    'build.gradle.kts': 'kt', 'requirements.txt': 'txt', 'Gemfile': 'rb',
    'Makefile': 'sh', 'Cargo.toml': 'toml', 'go.mod': 'go', 'pyproject.toml': 'toml',
    'Pipfile': 'toml', 'setup.py': 'py', 'manage.py': 'py', 'app.py': 'py',
    'Dockerfile': 'dockerfile', 'Procfile': 'sh', 'README.md': 'md',
    'LICENSE': 'txt', '.env.example': 'ini', '.gitignore': 'ini'
  };
  if (known[lower]) return known[lower];

  const ext = lower.split('.').pop();
  for (const lang of Object.values(LANGUAGE_MAP)) {
    if (lang.exts.includes(ext)) return lang.name;
  }
  return 'Text';
}

export function detectLanguageKey(filePath = '', content = '') {
  const lower = (filePath || '').toLowerCase();
  if (/dockerfile/i.test(lower)) return 'dockerfile';
  const known = {
    'package.json': 'json', 'tsconfig.json': 'json', 'requirements.txt': 'txt',
    'Dockerfile': 'dockerfile', 'Makefile': 'sh', 'Cargo.toml': 'toml'
  };
  if (known[lower]) return known[lower];
  const ext = lower.split('.').pop();
  for (const [key, lang] of Object.entries(LANGUAGE_MAP)) {
    if (lang.exts.includes(ext)) return key;
  }
  return 'plain';
}

export const ALL_LANGUAGES = Object.values(LANGUAGE_MAP).map(l => l.name);
export default LANGUAGE_MAP;
