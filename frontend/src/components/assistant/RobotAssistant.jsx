import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation, useNavigate } from 'react-router-dom';

import { buildApiUrl, API_BASE_URL } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';
import '../../assets/styles/RobotAssistant.css';

const MODEL_URL = '/models/RobotExpressive.glb';
const ACTION_ALIASES = {
  idle: ['Idle', 'idle'],
  waving: ['Wave', 'Waving'],
  talking: ['Talking', 'Talk'],
  listening: ['Standing'],
  thinking: ['Thinking', 'Idle']
};

const copy = {
  uz: { name: 'FSTU AI yordamchisi', welcome: 'Assalomu alaykum! Universitet sayti bo‘yicha yordam beraman.', placeholder: 'Murojaatingizni yozing…', send: 'Yuborish', open: '3D yordamchini ochish', close: 'Yopish', mute: 'Ovozni o‘chirish', unmute: 'Ovozni yoqish', unavailable: 'Bu ma’lumot CMSda topilmadi. Iltimos, aniqroq bo‘lim yoki sahifani so‘rang.', thinking: 'Ma’lumot izlayapman…', speak: 'Ovozli savol', stop: 'To‘xtatish', readPrompt: 'Sahifadagi ma’lumotlarni o‘qib beraymi?', yes: 'Ha, o‘qib bering', no: 'Yo‘q, rahmat', page: 'joriy sahifa' },
  ru: { name: 'Помощник FSTU', welcome: 'Здравствуйте! Я помогу с сайтом университета.', placeholder: 'Напишите вопрос…', send: 'Отправить', open: 'Открыть 3D помощника', close: 'Закрыть', mute: 'Выключить звук', unmute: 'Включить звук', unavailable: 'Эти данные не найдены в CMS. Уточните раздел или страницу.', thinking: 'Ищу информацию…', speak: 'Голосовой вопрос', stop: 'Остановить', readPrompt: 'Прочитать информацию этой страницы?', yes: 'Да, прочитайте', no: 'Нет, спасибо', page: 'текущая страница' },
  en: { name: 'FSTU assistant', welcome: 'Hello! I can help you navigate the university website.', placeholder: 'Ask a question…', send: 'Send', open: 'Open 3D assistant', close: 'Close', mute: 'Mute voice', unmute: 'Unmute voice', unavailable: 'This information was not found in the CMS. Please name a section or page.', thinking: 'Looking for information…', speak: 'Voice question', stop: 'Stop', readPrompt: 'Would you like me to read this page?', yes: 'Yes, read it', no: 'No, thanks', page: 'current page' }
};

function RobotModel({ state }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);
  const bones = useMemo(() => {
    const found = {};
    scene?.traverse((node) => {
      if (!node.isBone) return;
      const name = node.name.toLowerCase();
      if (name.includes('head') || name.includes('neck')) found.head = found.head || node;
      if (name.includes('leftarm') || name.includes('leftshoulder')) found.leftArm = found.leftArm || node;
      if (name.includes('rightarm') || name.includes('rightshoulder')) found.rightArm = found.rightArm || node;
    });
    return found;
  }, [scene]);
  const fit = useMemo(() => {
    if (!scene) return { scale: 1, position: [0, 0, 0] };
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = Math.min(1.6 / Math.max(size.y, 0.01), 1.15);
    return {
      scale,
      position: [-center.x * scale, -center.y * scale - 0.05, -center.z * scale]
    };
  }, [scene]);
  const [hasModelError, setHasModelError] = useState(false);
  const selectedAction = useMemo(() => {
    const names = ACTION_ALIASES[state] || ACTION_ALIASES.idle;
    return names.find((name) => actions?.[name]) || Object.keys(actions || {})[0];
  }, [actions, state]);

  useEffect(() => {
    if (!scene) setHasModelError(true);
  }, [scene]);

  useEffect(() => {
    if (!selectedAction || !actions?.[selectedAction]) return undefined;
    const action = actions[selectedAction];
    action.reset().fadeIn(0.25).play();
    return () => action.fadeOut(0.25);
  }, [actions, selectedAction]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(Date.now() * 0.0018) * 0.025;
    group.current.rotation.y = Math.PI + Math.sin(Date.now() * 0.0012) * (state === 'thinking' ? 0.08 : 0.025);
    const pulse = Math.sin(Date.now() * 0.006);
    if (bones.head) bones.head.rotation.y = state === 'listening' ? pulse * 0.18 : state === 'thinking' ? -0.2 + pulse * 0.04 : pulse * 0.03;
    if (bones.leftArm) bones.leftArm.rotation.z = state === 'talking' ? pulse * 0.18 : state === 'waving' ? pulse * 0.45 : 0;
    if (bones.rightArm) bones.rightArm.rotation.z = state === 'talking' ? -pulse * 0.18 : state === 'waving' ? -pulse * 0.45 : 0;
  });

  if (hasModelError || !scene) return null;
  return <primitive ref={group} object={scene} scale={fit.scale} position={fit.position} />;
}

function RobotCanvas({ state, onModelError }) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 3.4], fov: 38 }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      onError={onModelError}
      aria-label="Animatsiyali 3D robot"
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} color="#dffaf6" />
      <directionalLight position={[-3, 1, 1]} intensity={1.1} color="#8db9ff" />
      <Suspense fallback={null}>
        <RobotModel state={state} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.3} maxPolarAngle={1.8} />
    </Canvas>
  );
}

class RobotCanvasBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function RobotAssistant() {
  const { currentLanguageCode } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const language = currentLanguageCode === 'ru' ? 'ru' : currentLanguageCode === 'en' ? 'en' : 'uz';
  const text = copy[language];
  const [open, setOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [walking, setWalking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [state, setState] = useState('idle');
  const [modelError, setModelError] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: text.welcome }]);
  const [loading, setLoading] = useState(false);
  const [pagePrompt, setPagePrompt] = useState(null);
  const askedPathRef = useRef('');
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages((current) => current.length === 1 ? [{ role: 'assistant', content: text.welcome }] : current);
  }, [text.welcome]);

  useEffect(() => {
    if (!location.pathname || location.pathname === '/' || askedPathRef.current === location.pathname) return;
    askedPathRef.current = location.pathname;
    setOpen(true);
    setPagePrompt(location.pathname);
    setMessages((current) => [...current, { role: 'assistant', content: text.readPrompt, prompt: true }]);
  }, [location.pathname, text.readPrompt]);

  const speak = (value) => {
    if (muted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US';
    utterance.onstart = () => setState('talking');
    utterance.onend = () => setState('idle');
    window.speechSynthesis.speak(utterance);
  };

  const toggleAssistant = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    setChoiceOpen(nextOpen);
    if (!nextOpen) { setMode(null); setWalking(false); }
  };

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setChoiceOpen(false);
    setOpen(true);
    if (nextMode === 'accessibility') {
      setWalking(true);
      speak('Mas’uliyati cheklangan foydalanuvchilar uchun yordamchi yoqildi. Sizni eshitishga tayyorman.');
      window.setTimeout(() => startListening(), 700);
    } else {
      speak(text.welcome);
    }
  };

  const answerFromSite = (question) => {
    const value = question.toLowerCase();
    const routes = [
      { words: ['yangilik', 'news', 'новост'], path: '/news', label: language === 'uz' ? 'Yangiliklar bo‘limiga o‘tishingiz mumkin.' : language === 'ru' ? 'Откройте раздел новостей.' : 'Open the news section.' },
      { words: ['fakultet', 'faculty', 'факультет'], path: '/faculties', label: language === 'uz' ? 'Fakultetlar bo‘limini ochdim.' : language === 'ru' ? 'Открываю раздел факультетов.' : 'Opening faculties.' },
      { words: ['qabul', 'admission', 'прием'], path: '/admission', label: language === 'uz' ? 'Qabul bo‘limini ochdim.' : language === 'ru' ? 'Открываю раздел приёма.' : 'Opening admissions.' },
      { words: ['rektor', 'rector', 'ректор'], path: '/rektor', label: language === 'uz' ? 'Rektor murojaati sahifasini ochdim.' : language === 'ru' ? 'Открываю обращение ректора.' : 'Opening the rector page.' }
    ];
    return routes.find((route) => route.words.some((word) => value.includes(word)));
  };

  const readCurrentPage = async () => {
    setPagePrompt(null);
    setLoading(true);
    setState('thinking');
    try {
      const response = await fetch(buildApiUrl('/api/assistant/chat', API_BASE_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Men ${location.pathname} sahifasidaman. Shu sahifadagi CMS ma'lumotlarini qisqa va tushunarli qilib o'zbek tilida o'qib ber.`, language })
      });
      if (!response.ok) throw new Error('assistant-api-unavailable');
      const data = await response.json();
      const answer = data.answer || text.unavailable;
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      speak(answer);
    } catch {
      const answer = text.unavailable;
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      speak(answer);
    } finally {
      setLoading(false);
      setState('idle');
    }
  };

  const submit = async (event) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', content: question }]);
    setState('listening');
    setLoading(true);
    try {
      const route = answerFromSite(question);
      let answer = route?.label;
      if (route) navigate(route.path);
      if (!answer) {
        setState('thinking');
        const response = await fetch(buildApiUrl('/api/assistant/chat', API_BASE_URL), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, language }) });
        if (!response.ok) throw new Error('assistant-api-unavailable');
        const data = await response.json();
        answer = data.answer || text.unavailable;
      }
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      speak(answer);
    } catch {
      const answer = text.unavailable;
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      speak(answer);
    } finally {
      setLoading(false);
      setState('idle');
    }
  };

  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { inputRef.current?.focus(); return; }
    const recognition = new Recognition();
    recognition.lang = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setState('listening');
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onerror = () => setState('idle');
    recognition.onend = () => setState('idle');
    recognition.start();
  };

  return (
    <aside className={`robot-assistant${open ? ' is-open' : ''}${walking ? ' is-walking' : ''}${modelError ? ' has-fallback' : ''}`} aria-label={text.name}>
      <button type="button" className="robot-assistant__launcher" onClick={toggleAssistant} aria-expanded={open} aria-label={open ? text.close : text.open}>
        {modelError ? <span className="robot-assistant__fallback-icon" aria-hidden="true">✦</span> : <RobotCanvasBoundary onError={() => setModelError(true)}><RobotCanvas state={state} onModelError={() => setModelError(true)} /></RobotCanvasBoundary>}
        <span className="robot-assistant__status" aria-hidden="true" />
      </button>
      {open && choiceOpen && (
        <section className="robot-assistant__choice" aria-label="Yordam turini tanlang">
          <strong>Qanday yordam kerak?</strong>
          <button type="button" onClick={() => chooseMode('accessibility')}>Mas’uliyati cheklanganlar uchun</button>
          <button type="button" onClick={() => chooseMode('appeal')}>Murojaatlar uchun</button>
        </section>
      )}
      {open && !choiceOpen && (
        <section className="robot-assistant__panel" aria-live="polite">
          <header className="robot-assistant__header">
            <div><strong>{text.name}</strong><span>{mode === 'accessibility' ? 'Maxsus yordam rejimi' : mode === 'appeal' ? 'Murojaatlar bo‘limi' : state === 'thinking' ? text.thinking : state}</span></div>
            <div className="robot-assistant__actions">
              <button type="button" onClick={() => { setMuted((value) => !value); window.speechSynthesis?.cancel(); }} aria-label={muted ? text.unmute : text.mute}>{muted ? '🔇' : '🔊'}</button>
              <button type="button" onClick={() => setOpen(false)} aria-label={text.close}>×</button>
            </div>
          </header>
          <div className="robot-assistant__messages">
            {messages.map((message, index) => (
              <React.Fragment key={`${message.role}-${index}`}>
                <p className={`robot-assistant__message is-${message.role}`}>{message.content}</p>
                {message.prompt && pagePrompt && (
                  <div className="robot-assistant__prompt-actions">
                    <button type="button" onClick={readCurrentPage}>{text.yes}</button>
                    <button type="button" onClick={() => setPagePrompt(null)}>{text.no}</button>
                  </div>
                )}
              </React.Fragment>
            ))}
            {loading && <p className="robot-assistant__message is-assistant is-loading">•••</p>}
          </div>
          <form className="robot-assistant__form" onSubmit={submit}>
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={text.placeholder} aria-label={text.placeholder} />
            <button type="button" onClick={startListening} aria-label={text.speak}>⌕</button>
            <button type="submit" aria-label={text.send}>→</button>
          </form>
          <button type="button" className="robot-assistant__stop" onClick={() => { window.speechSynthesis?.cancel(); setState('idle'); }} aria-label={text.stop}>{text.stop}</button>
        </section>
      )}
    </aside>
  );
}
