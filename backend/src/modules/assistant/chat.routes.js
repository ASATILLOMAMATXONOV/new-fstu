import { Router } from 'express';
import { listEntries } from '../content/content.service.js';
import { assistantSystemPrompt, smallTalkAnswer } from './uzbek.js';
import { plainText, siteAnswer, siteDocuments } from './site-answer.js';

const resources = ['news', 'announcements', 'faculties', 'directions', 'pages', 'menus', 'students', 'advantages', 'statistics'];

export function createChatRouter({ listContent = listEntries, fetchResponse = (...args) => fetch(...args) } = {}) {
  const router = Router();
  router.post('/', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 4000) return res.status(400).json({ error: message ? 'message_too_long' : 'message_required' });
    const language = ['uz', 'ru', 'en'].includes(req.body?.language) ? req.body.language : 'uz';
    const page = {
      path: typeof req.body?.path === 'string' ? req.body.path.slice(0, 300) : '/',
      title: typeof req.body?.page?.title === 'string' ? plainText(req.body.page.title).slice(0, 200) : '',
      text: typeof req.body?.page?.text === 'string' ? req.body.page.text.slice(0, 20000) : ''
    };
    const greeting = smallTalkAnswer(message, language);
    if (greeting) return res.json({ answer: greeting, mode: 'site' });
    const controller = new AbortController();
    const onClose = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', onClose);
    let timeout;
    try {
      const context = await Promise.all(resources.map(async resource => {
        try { return { resource, items: await listContent(resource, { activeOnly: true, summaryOnly: true, imageMode: 'separate', language }) }; }
        catch { return { resource, items: [] }; }
      }));
      if (controller.signal.aborted) return;
      const fallback = () => res.json({ answer: siteAnswer(message, context, page, language), mode: 'site' });
      const key = process.env.OPENAI_API_KEY?.trim();
      if (!key) return fallback();
      const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12)
        .filter(item => ['user', 'assistant'].includes(item?.role) && typeof item.content === 'string')
        .map(item => ({ role: item.role, content: item.content.slice(0, 4000) })) : [];
      timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetchResponse('https://api.openai.com/v1/responses', {
          method: 'POST', signal: controller.signal,
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OPENAI_ASSISTANT_MODEL || 'gpt-4.1-mini',
            input: [{ role: 'system', content: assistantSystemPrompt([{ resource: 'current_page', items: [{ path: page.path }] },
              { resource: 'website_text', items: siteDocuments(context, page, language).slice(0, 100) }], language) }, ...history, { role: 'user', content: message }],
            max_output_tokens: 700
          })
        });
        if (res.destroyed) return;
        if (!response.ok) return fallback();
        const data = await response.json();
        const answer = data.output?.flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
        return answer ? res.json({ answer, mode: 'ai' }) : fallback();
      } catch {
        if (!res.destroyed) return fallback();
      }
    } finally {
      clearTimeout(timeout);
      res.off('close', onClose);
    }
  });
  return router;
}
