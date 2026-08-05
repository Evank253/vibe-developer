import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const WORKSPACE_ROOT =
  process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../workspace');

/**
 * Validate environment at startup.
 * Missing optional keys are fine; invalid combinations fail fast.
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];

  const port = parseInt(process.env.PORT || '4000', 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a valid port number (got "${process.env.PORT}")`);
  }

  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (!['mock', 'anthropic', 'openai', 'auto'].includes(provider)) {
    errors.push(`AI_PROVIDER must be mock|anthropic|openai|auto (got "${provider}")`);
  }

  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    errors.push('AI_PROVIDER=anthropic requires ANTHROPIC_API_KEY');
  }
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    errors.push('AI_PROVIDER=openai requires OPENAI_API_KEY');
  }
  if (provider === 'auto') {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      warnings.push('AI_PROVIDER=auto but no API keys set — falling back to mock');
    }
  }

  if (process.env.GITHUB_CLIENT_ID && !process.env.GITHUB_CLIENT_SECRET) {
    warnings.push('GITHUB_CLIENT_ID set without GITHUB_CLIENT_SECRET — OAuth will fail');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGIN) {
      warnings.push('CORS_ORIGIN not set in production — defaulting to same-origin only');
    }
  }

  return { errors, warnings };
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',

  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubAppUrl: process.env.GITHUB_APP_URL || '',

  ai: {
    activeProvider: process.env.AI_PROVIDER || 'mock',
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    }
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '2000', 10) * 1024 * 1024,
    maxFiles: parseInt(process.env.MAX_UPLOAD_FILES || '20', 10)
  },

  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10)
  },

  gitDefaultUser: process.env.GIT_USER || 'vibedev',
  gitDefaultEmail: process.env.GIT_EMAIL || 'vibedev@localhost',

  workspaceRoot: WORKSPACE_ROOT
};

export default config;
