let enginePromise;
let synthesisQueue = Promise.resolve();
const supportedLanguages = new Set(['uz', 'ru', 'en']);

export function prepareLocalSpeechText(value, language = 'uz') {
  const university = language === 'ru' ? 'Ферганский государственный технический университет'
    : language === 'en' ? 'Fergana State Technical University'
      : "Farg'ona davlat texnika universiteti";
  const artificialIntelligence = language === 'ru' ? 'искусственный интеллект' : language === 'en' ? 'artificial intelligence' : "sun'iy idrok";
  return String(value)
    .replace(/\bFSTU\b/gi, university)
    .replace(/\bHEMIS\b/gi, 'Hemis')
    .replace(/\bAI\b/g, artificialIntelligence)
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[•*#_`]/g, ' ')
    .replace(/[‘’ʻʼ]/g, "'")
    .replace(/[<>&]/g, ' ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+([.!?,;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/[,;:]+\s*$/g, '')
    .trim();
}

async function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { default: initialize } = await import('@echogarden/espeak-ng-emscripten');
      const module = await initialize();
      const engine = new module.eSpeakNGWorker();
      const voices = engine.list_voices();
      for (const language of supportedLanguages) {
        if (!voices.some((voice) => voice.languages.some((item) => item.name === language || item.name.startsWith(`${language}-`)))) throw new Error(`local_${language}_voice_missing`);
      }
      return { engine, voices };
    })().catch((error) => { enginePromise = null; throw error; });
  }
  return enginePromise;
}

export function encodePcmWav(pcm, sampleRate = 22050) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function synthesizeLocalSpeech(text, language = 'uz', signal) {
  // The native engine owns a shared audio buffer: serialize requests and copy each chunk.
  const task = synthesisQueue.then(async () => {
    if (signal?.aborted) throw new Error('speech_cancelled');
    const { engine, voices } = await loadEngine();
    if (signal?.aborted) throw new Error('speech_cancelled');
    const selectedLanguage = supportedLanguages.has(language) ? language : 'uz';
    const voice = voices.find((item) => item.languages.some((entry) => entry.name === selectedLanguage || entry.name.startsWith(`${selectedLanguage}-`)));
    engine.set_voice(`${voice.identifier}+f3`);
    engine.set_rate(selectedLanguage === 'uz' ? 165 : selectedLanguage === 'ru' ? 168 : 175);
    engine.set_pitch(52);
    engine.set_range(40);
    const input = prepareLocalSpeechText(text, selectedLanguage);
    const chunks = [];
    engine.synthesize(input, (samples) => {
      if (!samples?.length) return;
      const pcm = Buffer.alloc(samples.length * 2);
      for (let index = 0; index < samples.length; index += 1) pcm.writeInt16LE(samples[index], index * 2);
      chunks.push(pcm);
    });
    if (!chunks.length) throw new Error('empty_local_speech');
    return encodePcmWav(Buffer.concat(chunks));
  });
  synthesisQueue = task.catch(() => {});
  return task;
}

export const synthesizeLocalUzbek = (text, signal) => synthesizeLocalSpeech(text, 'uz', signal);
