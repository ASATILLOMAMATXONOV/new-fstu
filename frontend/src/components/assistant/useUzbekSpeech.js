
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { requestAssistantSpeech } from './assistantApi';

const LANGUAGE_TAGS = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const CONFIG = {
  rate: 1,
  browserRate: 0.97,
  browserPitch: 1,
  volume: 1,
  maxCharacters: 20000,
  segmentLimit: 1800,
  browserSegmentLimit: 450,
  pauseMs: 80,
  requestTimeout: 45000,
};

const VOICE_HINTS = {
  uz: /uzbek|o'zbek|uz-uz|madina/i,
  ru: /svetlana|irina|milena|female|ru-ru/i,
  en: /jenny|aria|samantha|zira|female|en-us/i,
};

const NOTICES = {
  uz: {
    unavailable: 'Ovoz xizmati hozir mavjud emas.',
    openai_speech_unavailable: 'Tabiiy ovoz xizmati hozir mavjud emas. Iltimos, keyinroq urinib ko‘ring.',
    openai_speech_quota_exceeded: 'Ovoz xizmati limiti tugagan. Administratorga murojaat qiling.',
    playback: 'Ovozni ijro etib bo‘lmadi.',
  },
  ru: {
    unavailable: 'Голосовой сервис недоступен.',
    openai_speech_unavailable: 'Естественный голос временно недоступен. Попробуйте позже.',
    openai_speech_quota_exceeded: 'Лимит голосового сервиса исчерпан. Обратитесь к администратору.',
    playback: 'Ошибка воспроизведения голоса.',
  },
  en: {
    unavailable: 'Voice service is unavailable.',
    openai_speech_unavailable: 'Natural voice is temporarily unavailable. Please try again later.',
    openai_speech_quota_exceeded: 'The voice service limit has been reached. Please contact the administrator.',
    playback: 'Unable to play audio.',
  },
};

const UNIVERSITY_NAMES = {
  uz: 'Farg‘ona davlat texnika universiteti',
  ru: 'Ферганский государственный технический университет',
  en: 'Fergana State Technical University',
};

const wait = (ms, signal) =>
  new Promise((resolve) => {
    if (!ms || signal?.aborted) {
      resolve();
      return;
    }

    let timer;

    const finish = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', finish);
      resolve();
    };

    timer = setTimeout(finish, ms);

    signal?.addEventListener('abort', finish, {
      once: true,
    });
  });

export function spokenText(value, language = 'uz') {
  const university =
    UNIVERSITY_NAMES[language] || UNIVERSITY_NAMES.uz;

  let text = String(value ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*#_~>|]/g, ' ')
    .replace(/\bFSTU\b/gi, university)
    .replace(/\bHEMIS\b/gi, 'Hemis')
    .replace(/([!?.,])(?=[^\s\d])/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();

  if (language === 'uz') {
    text = text
      .replace(/([oO])['ʻʼ‘’`]/g, '$1‘')
      .replace(/([gG])['ʻʼ‘’`]/g, '$1‘');
  }

  return text;
}

export const spokenUzbek = (value) =>
  spokenText(value, 'uz');

export function splitSpeechText(input, limit = 1800) {
  const chunks = [];
  let remaining = String(input ?? '').trim();

  if (!remaining) return chunks;

  const safeLimit = Math.max(1, Math.floor(limit));

  while (remaining.length > safeLimit) {
    const candidate = remaining.slice(0, safeLimit + 1);

    const sentences = [
      ...candidate.matchAll(/[.!?…](?=\s|$)/g),
    ];

    let boundary = sentences.length
      ? sentences[sentences.length - 1].index + 1
      : 0;

    if (boundary < safeLimit * 0.45) {
      boundary = candidate.lastIndexOf(' ', safeLimit);
    }

    if (boundary <= 0) {
      boundary = safeLimit;
    }

    chunks.push(remaining.slice(0, boundary).trim());

    remaining = remaining.slice(boundary).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

export function chooseBrowserVoice(
  voices = [],
  language = 'uz'
) {
  const tag =
    LANGUAGE_TAGS[language] || LANGUAGE_TAGS.uz;

  const prefix = tag.split('-')[0].toLowerCase();

  const matching = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith(prefix)
  );

  return (
    matching.find((voice) =>
      VOICE_HINTS[language]?.test(voice.name || '')
    ) ||
    matching.find((voice) => voice.localService) ||
    matching[0] ||
    null
  );
}

export default function useUzbekSpeech({
  muted = false,
  onStateChange,
  language = 'uz',
} = {}) {
  const [notice, setNotice] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const controllerRef = useRef(null);
  const utteranceRef = useRef(null);

  const generationRef = useRef(0);
  const mountedRef = useRef(false);
  const stateChangeRef = useRef(onStateChange);
  const speechPromiseRef = useRef(null);
  const speakingRef = useRef(false);

  useEffect(() => {
    stateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const updateState = useCallback((state) => {
    if (!mountedRef.current) return;

    stateChangeRef.current?.(state);

    const speaking = state === 'talking';

    if (speakingRef.current !== speaking) {
      speakingRef.current = speaking;
      setIsSpeaking(speaking);
    }
  }, []);

  const clearAudio = useCallback(() => {
    const audio = audioRef.current;
    const url = audioUrlRef.current;

    audioRef.current = null;
    audioUrlRef.current = null;

    if (audio) {
      audio.pause();
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
    }

    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;

    controllerRef.current?.abort();
    controllerRef.current = null;

    clearAudio();

    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }

    utteranceRef.current = null;
    speechPromiseRef.current = null;

    updateState('idle');
  }, [clearAudio, updateState]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (muted) {
      stop();
    }
  }, [muted, stop]);

  const getBrowserVoice = useCallback(async (signal) => {
    const synth = window.speechSynthesis;

    if (!synth) {
      return null;
    }

    let voices = synth.getVoices();

    if (!voices.length) {
      await new Promise((resolve) => {
        let finished = false;
        let timer;

        const finish = () => {
          if (finished) return;
          finished = true;

          clearTimeout(timer);
          synth.removeEventListener(
            'voiceschanged',
            finish
          );
          signal?.removeEventListener('abort', finish);

          resolve();
        };

        synth.addEventListener('voiceschanged', finish);
        signal?.addEventListener('abort', finish, {
          once: true,
        });

        timer = setTimeout(finish, 1200);

        if (signal?.aborted) finish();
      });

      voices = synth.getVoices();
    }

    return chooseBrowserVoice(voices, language);
  }, [language]);

  const playBrowserSpeech = useCallback(
    async (text, signal, isCurrent) => {
      if (
        typeof window === 'undefined' ||
        !window.speechSynthesis ||
        !window.SpeechSynthesisUtterance
      ) {
        throw new Error('browser-speech-unavailable');
      }

      const synth = window.speechSynthesis;
      const voice = await getBrowserVoice(signal);

      if (!voice) {
        throw new Error('language-voice-unavailable');
      }

      const chunks = splitSpeechText(
        text,
        CONFIG.browserSegmentLimit
      );

      for (const chunk of chunks) {
        if (!isCurrent() || signal.aborted) return;

        await new Promise((resolve, reject) => {
          const utterance =
            new window.SpeechSynthesisUtterance(chunk);

          utteranceRef.current = utterance;

          utterance.voice = voice;
          utterance.lang =
            LANGUAGE_TAGS[language] || LANGUAGE_TAGS.uz;
          utterance.rate = CONFIG.browserRate;
          utterance.pitch = CONFIG.browserPitch;
          utterance.volume = CONFIG.volume;

          let finished = false;

          const cleanup = () => {
            signal.removeEventListener(
              'abort',
              handleAbort
            );

            utterance.onstart = null;
            utterance.onend = null;
            utterance.onerror = null;

            if (utteranceRef.current === utterance) {
              utteranceRef.current = null;
            }
          };

          const complete = (error) => {
            if (finished) return;

            finished = true;
            cleanup();

            if (error) reject(error);
            else resolve();
          };

          const handleAbort = () => {
            synth.cancel();
            complete();
          };

          signal.addEventListener('abort', handleAbort, {
            once: true,
          });

          utterance.onstart = () => {
            if (isCurrent()) {
              updateState('talking');
            }
          };

          utterance.onend = () => complete();

          utterance.onerror = (event) => {
            if (signal.aborted || !isCurrent()) {
              complete();
              return;
            }

            complete(
              new Error(event.error || 'speech-error')
            );
          };

          if (signal.aborted) {
            handleAbort();
            return;
          }

          synth.speak(utterance);
        });

        if (isCurrent()) {
          await wait(CONFIG.pauseMs, signal);
        }
      }
    },
    [getBrowserVoice, language, updateState]
  );

  const prepareSpeech = useCallback(
    async (text, signal) => {
      const timeoutController = new AbortController();

      const abort = () => timeoutController.abort();

      signal.addEventListener('abort', abort, {
        once: true,
      });

      const timeout = setTimeout(
        abort,
        CONFIG.requestTimeout
      );

      try {
        if (signal.aborted) abort();

        const response = await requestAssistantSpeech({
          text,
          language,
          signal: timeoutController.signal,
        });

        const contentType =
          response.headers?.get('content-type') || '';

        if (!response.ok) {
          const data = await response.json?.().catch(() => null);
          const error = new Error(`tts-http-${response.status}`);
          if (['openai_speech_quota_exceeded', 'openai_speech_unavailable'].includes(data?.error)) {
            error.code = data.error;
          }
          throw error;
        }

        if (!contentType.toLowerCase().startsWith('audio/')) {
          throw new Error('invalid-audio-response');
        }

        const blob = await response.blob();

        if (!blob.size) {
          throw new Error('empty-audio');
        }

        return blob;
      } finally {
        clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
      }
    },
    [language]
  );

  const playAudio = useCallback(
    async (blob, signal, isCurrent) => {
      if (!isCurrent()) return;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audioUrlRef.current = url;
      audioRef.current = audio;

      audio.preload = 'auto';
      audio.volume = CONFIG.volume;
      audio.playbackRate = CONFIG.rate;

      try {
        await new Promise((resolve, reject) => {
          let finished = false;

          const cleanup = () => {
            signal.removeEventListener(
              'abort',
              handleAbort
            );

            audio.onplaying = null;
            audio.onended = null;
            audio.onerror = null;
          };

          const complete = (error) => {
            if (finished) return;

            finished = true;
            cleanup();

            if (error) reject(error);
            else resolve();
          };

          const handleAbort = () => {
            audio.pause();
            complete();
          };

          signal.addEventListener('abort', handleAbort, {
            once: true,
          });

          audio.onplaying = () => {
            if (isCurrent()) {
              updateState('talking');
            }
          };

          audio.onended = () => complete();

          audio.onerror = () => {
            complete(
              new Error('audio-playback-failed')
            );
          };

          if (signal.aborted) {
            handleAbort();
            return;
          }

          Promise.resolve(audio.play()).catch(complete);
        });
      } finally {
        if (audioRef.current === audio) {
          clearAudio();
        }
      }
    },
    [clearAudio, updateState]
  );

  const speak = useCallback(
    async (value, greeting = false) => {
      stop();

      if (muted || !mountedRef.current) {
        return;
      }

      const text = spokenText(value, language).slice(
        0,
        CONFIG.maxCharacters
      );

      if (!text) return;

      setNotice('');

      const controller = new AbortController();
      controllerRef.current = controller;

      const generation = generationRef.current;

      const isCurrent = () =>
        mountedRef.current &&
        generationRef.current === generation &&
        !controller.signal.aborted;

      updateState(greeting ? 'waving' : 'preparing');

      const segments = splitSpeechText(
        text,
        CONFIG.segmentLimit
      );

      const safeTask = (task) =>
        task.then(
          (blob) => ({ blob }),
          (error) => ({ error })
        );

      let segmentIndex = 0;
      let currentTask = null;

      try {
        currentTask = safeTask(
          prepareSpeech(segments[0], controller.signal)
        );

        speechPromiseRef.current = currentTask;

        for (
          segmentIndex = 0;
          segmentIndex < segments.length;
          segmentIndex += 1
        ) {
          const result = await currentTask;

          if (!isCurrent()) return;

          if (result.error) {
            throw result.error;
          }

          const nextIndex = segmentIndex + 1;

          currentTask =
            nextIndex < segments.length
              ? safeTask(
                  prepareSpeech(
                    segments[nextIndex],
                    controller.signal
                  )
                )
              : null;

          speechPromiseRef.current = currentTask;

          await playAudio(
            result.blob,
            controller.signal,
            isCurrent
          );

          if (!isCurrent()) return;

          if (nextIndex < segments.length) {
            await wait(CONFIG.pauseMs, controller.signal);
          }
        }
      } catch (error) {
        if (!isCurrent()) return;

        if (error.code) {
          setNotice(NOTICES[language]?.[error.code] || NOTICES.uz[error.code]);
          return;
        }

        console.warn(
          '[AI Speech] Server TTS failed:',
          error.message
        );

        clearAudio();
        updateState('preparing');

        try {
          const remaining = segments
            .slice(segmentIndex)
            .join(' ');

          await playBrowserSpeech(
            remaining,
            controller.signal,
            isCurrent
          );
        } catch (fallbackError) {
          if (isCurrent()) {
            console.error(
              '[AI Speech] Browser fallback failed:',
              fallbackError
            );

            setNotice(
              NOTICES[language]?.unavailable ||
                NOTICES.uz.unavailable
            );
          }
        }
      } finally {
        if (isCurrent()) {
          controllerRef.current = null;
          speechPromiseRef.current = null;
          updateState('idle');
        }
      }
    },
    [
      language,
      muted,
      stop,
      updateState,
      clearAudio,
      prepareSpeech,
      playAudio,
      playBrowserSpeech,
    ]
  );

  return {
    speak,
    stop,
    notice,
    isSpeaking,
  };
}
