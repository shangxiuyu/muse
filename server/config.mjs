import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const rootDir = fileURLToPath(new URL('../', import.meta.url));

export function readConfig(env = process.env) {
  const api = env.MUSE_API || 'openai-completions';
  if (!['anthropic-messages', 'openai-completions', 'openai-responses'].includes(api)) throw new Error('MUSE_API 配置无效。');
  const anthropic = api === 'anthropic-messages';
  // Ambient CLI credentials must not silently change the Studio's provider.
  const baseUrl = env.MUSE_BASE_URL || (anthropic ? env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com' : 'https://api.deepseek.com');
  if (!['http:', 'https:'].includes(new URL(baseUrl).protocol)) throw new Error('模型地址必须使用 HTTP 或 HTTPS。');
  const deepseek = new URL(baseUrl).hostname === 'api.deepseek.com';
  const key = env.MUSE_API_KEY || (deepseek ? env.DEEPSEEK_API_KEY : anthropic ? env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN : env.OPENAI_API_KEY) || '';
  const model = env.MUSE_FLASH_MODEL || env.MUSE_MODEL || (deepseek ? 'deepseek-v4-flash' : anthropic ? env.ANTHROPIC_MODEL : env.OPENAI_MODEL) || '';
  const textModel = env.MUSE_TEXT_MODEL || env.MUSE_MODEL || (deepseek ? 'deepseek-v4-pro' : model);
  return {
    rootDir, dataDir: resolve(env.MUSE_DATA_DIR || resolve(rootDir, '.muse/studio')),
    vaultDir: env.MUSE_VAULT_DIR ? resolve(env.MUSE_VAULT_DIR.replace(/^~(?=\/|$)/, homedir())) : join(homedir(), 'Documents', 'Muse'),
    vaultConfigured: Boolean(env.MUSE_VAULT_DIR),
    port: bounded(env.PORT, 4173, 1, 65535), host: '127.0.0.1',
    publicUrl: publicOrigin(env.MUSE_PUBLIC_URL),
    api, key, model, textModel, baseUrl, deepseek, configured: Boolean(key && model && textModel),
    bearer: env.MUSE_AUTH_TYPE === 'bearer' || (anthropic && !env.MUSE_API_KEY && !env.ANTHROPIC_API_KEY && Boolean(env.ANTHROPIC_AUTH_TOKEN)),
    vision: env.MUSE_VISION !== 'false',
    contextWindow: bounded(env.MUSE_CONTEXT_WINDOW, deepseek ? 1000000 : 128000, 16000, 1000000),
    maxTokens: bounded(env.MUSE_MAX_TOKENS, 16000, 1024, 64000),
    timeoutMs: bounded(env.MUSE_TIMEOUT_MS, 300000, 1000, 900000),
    maxTurns: bounded(env.MUSE_MAX_TURNS, 24, 2, 30),
    browserExecutable: env.MUSE_BROWSER_EXECUTABLE || undefined,
    imageKey: env.MUSE_IMAGE_API_KEY || '', imageModel: env.MUSE_IMAGE_MODEL || '',
    imageBaseUrl: env.MUSE_IMAGE_BASE_URL || 'https://api.openai.com/v1',
  };
}

export function configForMedia(config, type) {
  const model = type === 'text' ? config.textModel || config.model : config.model;
  return { ...config, model, vision: config.vision && !(config.deepseek && model.includes('pro')) };
}

function bounded(value, fallback, min, max) {
  if (!value) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error('服务配置中的数字超出允许范围。');
  return number;
}

function publicOrigin(value) {
  if (!value) return '';
  let url;
  try { url = new URL(value); } catch { throw new Error('MUSE_PUBLIC_URL 必须是完整的 HTTP 或 HTTPS 站点地址。'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('MUSE_PUBLIC_URL 只能包含协议、域名和可选端口，不能包含路径、账号或查询参数。');
  }
  return url.origin;
}

export function publicConfig(config) {
  return { configured: config.configured, model: config.model, textModel: config.textModel || config.model, engine: 'Pi',
    modelNote: config.deepseek && config.model === 'deepseek-v4-flash' ? 'V4 Flash 旧标识由 DeepSeek 官方转接至 V4.1 Flash。' : '',
    imageGeneration: Boolean(config.imageKey && config.imageModel),
    message: config.configured ? '创作引擎已配置' : '请先在服务端 .env 中填写 DEEPSEEK_API_KEY。' };
}
