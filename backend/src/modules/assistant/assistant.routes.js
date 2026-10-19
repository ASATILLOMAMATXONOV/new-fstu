import { Router } from 'express';
import { listEntries } from '../content/content.service.js';

const router = Router();

router.post('/chat', async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    const language = String(req.body?.language || 'uz').slice(0, 5);

    if (!message) return res.status(400).json({ error: 'message_required' });
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'assistant_not_configured' });
    }

    const resources = ['news', 'announcements', 'faculties', 'directions', 'pages', 'menus'];
    const context = (await Promise.all(resources.map(async (resource) => {
      try { return { resource, items: await listEntries(resource, { activeOnly: true, summaryOnly: true, language }) }; }
      catch { return { resource, items: [] }; }
    }))).filter((entry) => entry.items?.length);

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_ASSISTANT_MODEL || 'gpt-4.1-mini',
        input: [{ role: 'system', content: `You are the FSTU university website assistant. Answer only from the CMS context below. If the answer is not in it, say that the information is unavailable. Respond in ${language}. CMS context: ${JSON.stringify(context)}` }, { role: 'user', content: message }],
        max_output_tokens: 500
      })
    });

    if (!response.ok) return res.status(502).json({ error: 'assistant_provider_error' });
    const data = await response.json();
    const answer = data.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    return res.json({ answer: answer || null });
  } catch (error) {
    return next(error);
  }
});

export default router;
