import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiMic, FiPlay, FiSend, FiSquare, FiVolume2, FiVolumeX } from 'react-icons/fi';
import useUzbekSpeech from './useUzbekSpeech';
import { askAssistant } from './assistantApi';
import { pageReadingAnswer, readCurrentPage, waitForReadablePage } from './pageReader';
import { pageCommandReply, resolvePageCommand } from './pageCommands';
import { isCmsContentLoading } from '../../api/cms';

const speechTags = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

export default function AccessibilityChat({ text, language = 'uz', onLanguageChange, onStateChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: text.welcome }]);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activity, setActivity] = useState('walking');
  const [voiceError, setVoiceError] = useState('');
  const [pagePrompt, setPagePrompt] = useState(false);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const requestRef = useRef(null);
  const busyRef = useRef(false);
  const greetingRef = useRef(null);
  const aliveRef = useRef(true);
  const previousPath = useRef(location.pathname);
  const presentingRef = useRef(false);
  const turnRef = useRef(0);
  const locationRef = useRef(location);
  locationRef.current = location;
  const readingAfterNavigationRef = useRef(false);
  const currentAddress = () => `${locationRef.current.pathname}${locationRef.current.search || ''}${locationRef.current.hash || ''}`;

  const changeState = useCallback((value) => {
    if (!aliveRef.current) return;

    setActivity(value);

    const stateMap = {
      idle: 'idle',
      walking: 'walking',
      waving: 'greeting',
      listening: 'listening',
      thinking: 'thinking',
      preparing: 'thinking',
      talking: 'speaking',
      guiding: 'guiding',
      explaining: 'speaking'
    };

    onStateChange?.(stateMap[value] || 'idle');
    if (value === 'idle') presentingRef.current = false;
  }, [onStateChange]);

  const { speak, stop: stopSpeech, notice: speechNotice } = useUzbekSpeech({ muted, language, onStateChange: changeState });
  const speakRef = useRef(speak);
  speakRef.current = speak;

  useEffect(() => {
    aliveRef.current = true;
    inputRef.current?.focus();
    changeState('walking');
    greetingRef.current = setTimeout(() => {
      changeState('waving');
      speakRef.current(text.welcome, true);
    }, 1600);
    return () => {
      aliveRef.current = false;
      turnRef.current += 1;
      clearTimeout(greetingRef.current);
      requestRef.current?.abort();
      recognitionRef.current?.abort();
      stopSpeech();
    };
  }, [changeState, text.welcome, stopSpeech]);

  useEffect(() => {
    turnRef.current += 1;
    requestRef.current?.abort();
    busyRef.current = false;
    setLoading(false);
    setMessages([{ role: 'assistant', content: text.welcome }]);
    setInput('');
    setVoiceError('');
  }, [language, text.welcome]);

  useEffect(() => {
    messagesRef.current?.scrollTo?.({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      setPagePrompt(!readingAfterNavigationRef.current);
    }
  }, [location.pathname]);

  const submitQuestion = async (question, readPage = false) => {
    question = question.trim();
    if (!question || busyRef.current) return;
    clearTimeout(greetingRef.current);
    busyRef.current = true;
    const turn = ++turnRef.current;
    const isCurrent = () => aliveRef.current && turnRef.current === turn;
    recognitionRef.current?.abort();
    stopSpeech();
    setInput('');
    setVoiceError('');
    setMessages((current) => [...current, { role: 'user', content: readPage ? text.read : question }]);
    setLoading(true);
    changeState('thinking');
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const page = readCurrentPage();
      const command = readPage ? { type: 'read' } : resolvePageCommand(question, { language });
      let answer;
      if (command?.type === 'navigate') {
        readingAfterNavigationRef.current = Boolean(command.read);
        setPagePrompt(false);
        navigate(command.path);
        if (!command.read) answer = pageCommandReply(command, language);
      } else if (command?.type === 'missing') answer = pageCommandReply(command, language);
      if (command?.type === 'read' || command?.read) {
        const loadedPage = await waitForReadablePage({
          target: command.path || currentAddress(), getLocation: currentAddress,
          isLoading: isCmsContentLoading, signal: controller.signal
        });
        answer = pageReadingAnswer(loadedPage, language);
      }
      if (!answer) {
        answer = await askAssistant({ message: question, language, path: location.pathname, page, history: messages.slice(-12), signal: controller.signal });
      }
      if (!isCurrent()) return;
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      presentingRef.current = true;
      speakRef.current(answer);
    } catch (error) {
      if (error.name === 'AbortError' && (!isCurrent() || !controller.signal.aborted)) return;
      if (isCurrent()) {
        const answer = error.message === 'page-not-ready'
          ? (language === 'ru' ? 'Страница ещё загружается. Попросите прочитать её немного позже.' : language === 'en' ? 'The page is still loading. Please ask me to read it again shortly.' : 'Sahifa hali yuklanmoqda. Birozdan keyin matnni o‘qishni qayta so‘rang.')
          : text.unavailable;
        setMessages((current) => [...current, { role: 'assistant', content: answer }]);
        presentingRef.current = true;
        speakRef.current(answer);
      }
    } finally {
      clearTimeout(timeout);
      if (isCurrent()) { busyRef.current = false; readingAfterNavigationRef.current = false; setLoading(false); }
    }
  };

  const startListening = () => {
    if (busyRef.current) return;
    clearTimeout(greetingRef.current);
    if (activity === 'listening') { recognitionRef.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setVoiceError(text.voiceUnavailable); inputRef.current?.focus(); return; }
    stopSpeech();
    setVoiceError('');
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = speechTags[language] || speechTags.uz;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => changeState('listening');
    recognition.onresult = (event) => {
      if (!aliveRef.current) return;
      const results = Array.from(event.results);
      const finalText = results.filter(result => result.isFinal !== false).map(result => result[0].transcript).join(' ').trim();
      if (finalText) submitQuestion(finalText);
      else setInput(results.map(result => result[0].transcript).join(' '));
    };
    recognition.onerror = (event) => {
      if (aliveRef.current && event.error !== 'aborted') { setVoiceError(text.voiceError); changeState('idle'); }
    };
    recognition.onend = () => { if (!busyRef.current) changeState('idle'); };
    try { recognition.start(); } catch { setVoiceError(text.voiceError); changeState('idle'); }
  };

  const readPage = () => {
    setPagePrompt(false);
    submitQuestion(text.read, true);
  };
  const stopActivity = () => {
    clearTimeout(greetingRef.current);
    recognitionRef.current?.abort();
    requestRef.current?.abort();
    turnRef.current += 1;
    busyRef.current = false;
    readingAfterNavigationRef.current = false;
    setLoading(false);
    stopSpeech();
    changeState('idle');
  };
  const status = activity === 'thinking' ? text.thinking : activity === 'preparing' ? 'Ovoz tayyorlanmoqda…' : activity === 'listening' ? text.listening : activity === 'talking' ? text.talking : text.ready;

  return <>
    <div className="fstu-ai__languages" role="group" aria-label="Suhbat tili">
      {[['uz', 'O‘Z'], ['ru', 'RU'], ['en', 'EN']].map(([code, label]) => <button key={code} type="button" className={language === code ? 'is-active' : ''} aria-pressed={language === code} onClick={() => onLanguageChange?.(code)}>{label}</button>)}
    </div>
    <div className="fstu-ai__chat-status" role="status"><span />{status}<button type="button" className="fstu-ai__icon-button" aria-label={muted ? text.unmute : text.mute} aria-pressed={muted} onClick={() => { setMuted((value) => !value); stopSpeech(); changeState('idle'); }}>{muted ? <FiVolumeX /> : <FiVolume2 />}</button></div>
    <div ref={messagesRef} className="fstu-ai__messages" role="log" aria-live="polite" aria-relevant="additions" aria-busy={loading}>
      {messages.map((message, index) => <p key={index} className={`fstu-ai__message is-${message.role}`}>{message.content}</p>)}
      {loading && <span className="fstu-ai__typing" aria-label={text.thinking}><i /><i /><i /></span>}
      {pagePrompt && <div className="fstu-ai__page-prompt"><p>{text.readPrompt}</p><button type="button" onClick={readPage} disabled={loading}>{text.yes}</button><button type="button" onClick={() => setPagePrompt(false)}>{text.no}</button></div>}
    </div>
    {voiceError && <p className="fstu-ai__voice-error" role="status">{voiceError}</p>}
    {speechNotice && <p className="fstu-ai__voice-error" role="status">{speechNotice}</p>}
    <form className="fstu-ai__chat-form" onSubmit={(event) => { event.preventDefault(); submitQuestion(input); }}>
      <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={4000} placeholder={text.placeholder} aria-label={text.placeholder} />
      <button type="button" className={`fstu-ai__icon-button${activity === 'listening' ? ' is-listening' : ''}`} onClick={startListening} aria-label={text.speak} aria-pressed={activity === 'listening'} disabled={loading}><FiMic /></button>
      <button type="submit" className="fstu-ai__chat-send" disabled={loading || !input.trim()} aria-label={text.send}><FiSend /></button>
    </form>
    <div className="fstu-ai__chat-tools">
      <button type="button" onClick={readPage} disabled={loading}><FiBookOpen />{text.read}</button>
      <button type="button" disabled={loading || muted} onClick={() => { clearTimeout(greetingRef.current); const answer = [...messages].reverse().find((message) => message.role === 'assistant'); if (answer) { presentingRef.current = true; speakRef.current(answer.content); } }}><FiPlay />Javobni tinglash</button>
      <button type="button" onClick={stopActivity}><FiSquare />{text.stop}</button>
    </div>
    <p className="fstu-ai__voice-caption">{language === 'ru' ? 'Русский разговор · Синтезированный голос' : language === 'en' ? 'English conversation · Synthesized voice' : 'O‘zbekcha suhbat · Sun’iy ovoz'}</p>
  </>;
}
