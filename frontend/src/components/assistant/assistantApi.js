import { API_BASE_URL_CANDIDATES, buildApiUrl } from '../../config/api';

let connectedBaseUrl;
async function postAssistant(path, body, signal) {
  const candidates = [...new Set([connectedBaseUrl, ...API_BASE_URL_CANDIDATES].filter(Boolean))];
  let lastResponse;
  let lastError;
  for (const baseUrl of candidates) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    try {
      const response = await fetch(buildApiUrl(path, baseUrl), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify(body)
      });
      if ([404, 502, 503].includes(response.status)) {
        if (path === '/api/assistant/speech') {
          const data = await response.clone?.().json().catch(() => null);
          if (['openai_speech_quota_exceeded', 'openai_speech_unavailable'].includes(data?.error)) {
            connectedBaseUrl = baseUrl;
            return response;
          }
        }
        lastResponse = response;
        continue;
      }
      connectedBaseUrl = baseUrl;
      return response;
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError || new Error('assistant-server-unavailable');
}

export async function askAssistant({ message, language, path, page, history, signal }) {
  const response = await postAssistant('/api/assistant/chat', { message, language, path, page, history }, signal);
  if (!response.ok) throw new Error('assistant-unavailable');
  const data = await response.json();
  if (!data.answer) throw new Error('assistant-empty');
  return data.answer;
}

export function requestAssistantSpeech({ text, language, signal }) {
  return postAssistant('/api/assistant/speech', { text, language }, signal);
}
