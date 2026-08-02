import config from '../../config.js';
import createAnthropic from './anthropic.js';
import createOpenAI from './openai.js';
import mockProvider from './mock.js';

// Factory: builds a provider instance by name.
// Supports: mock, anthropic, openai, auto (picks first available real key, else mock).

export function getProvider(name) {
  const ai = config.ai;
  let target = name || ai.activeProvider || 'mock';

  if (target === 'auto') {
    if (ai.anthropic.apiKey) target = 'anthropic';
    else if (ai.openai.apiKey) target = 'openai';
    else target = 'mock';
  }

  if (target === 'anthropic') return createAnthropic(ai.anthropic);
  if (target === 'openai') return createOpenAI(ai.openai);
  return mockProvider;
}

export function availableProviders() {
  const list = [{ id: 'mock', label: 'Demo mode (no key needed)', configured: true }];
  if (config.ai.anthropic.apiKey) list.push({ id: 'anthropic', label: 'Anthropic (Claude)', configured: true });
  else list.push({ id: 'anthropic', label: 'Anthropic (Claude)', configured: false });
  if (config.ai.openai.apiKey) list.push({ id: 'openai', label: 'OpenAI (GPT)', configured: true });
  else list.push({ id: 'openai', label: 'OpenAI (GPT)', configured: false });
  list.push({ id: 'auto', label: 'Auto (best available)', configured: true });
  return list;
}

export default {
  getProvider,
  availableProviders,
  defaultName: config.ai.activeProvider
};
