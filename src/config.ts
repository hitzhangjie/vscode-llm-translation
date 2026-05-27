import * as vscode from 'vscode';

export type Provider = 'ollama' | 'deepseek';

export interface LlmConfig {
  provider: Provider;
  baseURL: string;
  model: string;
  apiKey: string;
}

const PROVIDER_DEFAULTS: Record<Provider, { baseURL: string; model: string }> = {
  ollama: {
    baseURL: 'http://localhost:11434/v1',
    model: 'gpt-oss:20b',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-v4-flash',
  },
};

export function getLlmConfig(): LlmConfig {
  const config = vscode.workspace.getConfiguration('llmTranslation');
  const provider = (config.get<string>('provider') ?? 'ollama') as Provider;
  const defaults = PROVIDER_DEFAULTS[provider] ?? PROVIDER_DEFAULTS.ollama;

  const modelSetting = config.get<string>('model')?.trim();
  const apiKey = config.get<string>('apiKey')?.trim() ?? '';

  return {
    provider,
    baseURL: defaults.baseURL,
    model: modelSetting || defaults.model,
    apiKey,
  };
}

export function validateLlmConfig(config: LlmConfig): string | null {
  if (config.provider === 'deepseek' && !config.apiKey) {
    return '使用 DeepSeek 时需要配置 API Key。请在设置中搜索 "LLM Translation" 并填写 llmTranslation.apiKey。';
  }
  if (!config.model) {
    return '请配置模型名称 (llmTranslation.model)。';
  }
  return null;
}
