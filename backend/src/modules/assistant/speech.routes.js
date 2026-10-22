import { Router } from 'express';
import { synthesizeLocalSpeech } from './local-speech.js';
import { synthesizeNaturalSpeech } from './natural-speech.js';

const escapeXml = (value) => value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));

const cloudVoices = {
  uz: ['uz-UZ-MadinaNeural', 'uz-UZ-SardorNeural'],
  ru: ['ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural'],
  en: ['en-US-JennyNeural', 'en-US-GuyNeural']
};
const languageTags = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

export function buildSpeechSsml(text, language = 'uz', voice) {
  const code = cloudVoices[language] ? language : 'uz';
  const selected = cloudVoices[code].includes(voice) ? voice : cloudVoices[code][0];
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageTags[code]}"><voice name="${selected}"><prosody rate="0%" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;
}
export const buildUzbekSsml = (text, voice) => buildSpeechSsml(text, 'uz', voice);

export function createSpeechRouter({ naturalSpeech = synthesizeNaturalSpeech } = {}) {
  const router = Router();
  router.post('/', async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const language = ['uz', 'ru', 'en'].includes(req.body?.language) ? req.body.language : 'uz';
    if (!text || text.length > 4000) return res.status(400).json({ error: 'invalid_speech_text' });
    const key = process.env.AZURE_SPEECH_KEY?.trim();
    const region = process.env.AZURE_SPEECH_REGION?.trim();
    const controller = new AbortController();
    const onClose = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', onClose);
    try {
      if (process.env.OPENAI_API_KEY?.trim()) {
        const audio = await naturalSpeech(text, language, controller.signal);
        if (controller.signal.aborted || res.destroyed) return;
        if (!audio.length) throw new Error('natural_speech_empty');
        res.set('Cache-Control', 'no-store');
        return res.type('audio/wav').send(audio);
      }
      if (controller.signal.aborted || res.destroyed) return;
      if (key && region && /^[a-z0-9-]+$/.test(region)) {
        const cloudController = new AbortController();
        const onAbort = () => cloudController.abort();
        controller.signal.addEventListener('abort', onAbort, { once: true });
        const timeout = setTimeout(() => cloudController.abort(), 5000);
        try {
          const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST', signal: cloudController.signal,
            headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3', 'User-Agent': 'FSTU-Assistant' },
            body: buildSpeechSsml(text, language, process.env[`AZURE_SPEECH_VOICE_${language.toUpperCase()}`] || process.env.AZURE_SPEECH_VOICE)
          });
          if (response.ok && !controller.signal.aborted) {
            const audio = Buffer.from(await response.arrayBuffer());
            if (audio.length && !res.destroyed) {
              res.set('Cache-Control', 'no-store');
              return res.type('audio/mpeg').send(audio);
            }
          }
        } catch { /* Local Uzbek speech remains available when the cloud is unreachable. */ }
        finally { clearTimeout(timeout); controller.signal.removeEventListener('abort', onAbort); }
      }
      if (controller.signal.aborted || res.destroyed) return;
      const audio = await synthesizeLocalSpeech(text, language, controller.signal);
      if (res.destroyed) return;
      res.set('Cache-Control', 'no-store');
      return res.type('audio/wav').send(audio);
    } catch (error) {
      if (controller.signal.aborted || res.destroyed) return;
      res.set('Cache-Control', 'no-store');
      if (process.env.OPENAI_API_KEY?.trim()) {
        return res.status(503).json({ error: error.message === 'natural_speech_quota_exceeded' ? 'openai_speech_quota_exceeded' : 'openai_speech_unavailable' });
      }
      return res.status(502).json({ error: 'uzbek_voice_unavailable' });
    } finally { res.off('close', onClose); }
  });  return router;
}

export default createSpeechRouter();
