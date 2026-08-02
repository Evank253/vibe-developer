import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Workspace root (where extracted/working projects live)
export const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../workspace');

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',

  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubAppUrl: process.env.GITHUB_APP_URL || '',

  // AI providers (supports multiple + mock)
  ai: {
    activeProvider: process.env.AI_PROVIDER || 'mock', // 'mock' | 'anthropic' | 'openai' | 'auto'
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    }
  },

  // Upload limits (generous for "big zip files")
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '2000', 10) * 1024 * 1024,
    maxFiles: parseInt(process.env.MAX_UPLOAD_FILES || '20', 10)
  },

  // Git identity used for commits if the user hasn't provided one
  gitDefaultUser: process.env.GIT_USER || 'vibedev',
  gitDefaultEmail: process.env.GIT_EMAIL || 'vibedev@localhost',

  workspaceRoot: WORKSPACE_ROOT
};

export default config;
