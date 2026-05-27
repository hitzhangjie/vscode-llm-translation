import { getLlmConfig, validateLlmConfig } from './config';

function buildSystemPrompt(targetLanguage: string): string {
  return [
    'You are a professional translator.',
    `Translate the user's text into ${targetLanguage}.`,
    'Output ONLY the translated text.',
    'Do NOT add explanations, notes, alternatives, or any other content.',
    'Preserve the original formatting, line breaks, and paragraph structure as much as possible.',
  ].join(' ');
}

interface StreamChunkHandler {
  (chunk: string): void;
}

export async function translateTextStream(
  text: string,
  targetLanguage: string,
  onChunk: StreamChunkHandler,
  signal?: AbortSignal
): Promise<void> {
  const llmConfig = getLlmConfig();
  const validationError = validateLlmConfig(llmConfig);
  if (validationError) {
    throw new Error(validationError);
  }

  const url = `${llmConfig.baseURL.replace(/\/$/, '')}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (llmConfig.apiKey) {
    headers.Authorization = `Bearer ${llmConfig.apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: llmConfig.model,
      messages: [
        { role: 'system', content: buildSystemPrompt(targetLanguage) },
        { role: 'user', content: text },
      ],
      stream: true,
      temperature: 0.2,
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `LLM 请求失败 (${response.status} ${response.statusText})${errorBody ? `: ${errorBody}` : ''}`
    );
  }

  if (!response.body) {
    throw new Error('LLM 响应不支持流式输出。');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) {
        continue;
      }

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        return;
      }

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      } catch {
        // Ignore malformed SSE chunks.
      }
    }
  }
}
