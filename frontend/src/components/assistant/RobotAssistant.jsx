
import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiCpu,
  FiFileText,
  FiGrid,
  FiSend,
  FiX
} from 'react-icons/fi';

import { FaUniversalAccess } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

import {
  API_BASE_URL,
  buildApiUrl
} from '../../config/api';

import { useLanguage } from '../../context/LanguageContext';

import AccessibilityChat from './AccessibilityChat';
import FloatingRobot from './FloatingRobot';
import { assistantCopy } from './assistantCopy';

import '../../assets/styles/RobotAssistant.css';

function RequestForm({ mode, language, text }) {
  const [status, setStatus] = useState('idle');
  const [reference, setReference] = useState('');

  const controllerRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();

    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    if (status === 'sending') return;

    const form = event.currentTarget;

    const fields = Object.fromEntries(
      new FormData(form)
    );

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus('sending');

    try {
      const response = await fetch(
        buildApiUrl(
          '/api/assistant/requests',
          API_BASE_URL
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...fields,
            type: mode,
            language
          }),
          signal: controller.signal
        }
      );

      if (!response.ok) {
        throw new Error('request-failed');
      }

      const result = await response.json();

      if (!result.id) {
        throw new Error('request-not-saved');
      }

      setReference(String(result.id));
      setStatus('success');

      form.reset();
    } catch (error) {
      if (error.name !== 'AbortError') {
        setStatus('error');
      }
    }
  };

  if (status === 'success') {
    return (
      <div
        className="fstu-ai__success"
        role="status"
      >
        <span className="fstu-ai__success-icon">
          <FiCheck />
        </span>

        <h3>{text.sent}</h3>

        <p>
          {text.saved}{' '}
          <strong>#{reference}</strong>
        </p>

        <button
          type="button"
          className="fstu-ai__submit"
          onClick={() => setStatus('idle')}
        >
          {text.newRequest}
          <FiArrowUpRight />
        </button>
      </div>
    );
  }

  return (
    <form
      className="fstu-ai__request"
      onSubmit={submit}
    >
      <p className="fstu-ai__intro">
        {mode === 'hemis'
          ? text.hemisIntro
          : text.appealIntro}
      </p>

      <label>
        {text.fullName}

        <input
          ref={nameRef}
          name="fullName"
          autoComplete="name"
          required
          minLength={2}
          maxLength={150}
          placeholder={text.namePlaceholder}
        />
      </label>

      <label>
        {text.phone}

        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          pattern="[+0-9\(\)\s\-]{7,30}"
          maxLength={30}
          placeholder="+998 90 123 45 67"
        />
      </label>

      {mode === 'hemis' && (
        <div className="fstu-ai__field-row">
          <label>
            {text.studentId}

            <input
              name="studentId"
              maxLength={50}
              placeholder={text.optional}
            />
          </label>

          <label>
            {text.group}

            <input
              name="group"
              maxLength={80}
              placeholder="12-24"
            />
          </label>
        </div>
      )}

      <label>
        {text.subject}

        <input
          name="subject"
          required
          minLength={3}
          maxLength={200}
          placeholder={
            mode === 'hemis'
              ? text.hemisSubject
              : text.subjectPlaceholder
          }
        />
      </label>

      <label>
        {text.message}

        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={3}
          placeholder={text.messagePlaceholder}
        />
      </label>

      {status === 'error' && (
        <p
          className="fstu-ai__error"
          role="alert"
        >
          {text.sendError}
        </p>
      )}

      <button
        className="fstu-ai__submit"
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending'
          ? text.sending
          : text.send}

        <FiSend />
      </button>
    </form>
  );
}

export default function RobotAssistant() {
  const { currentLanguageCode } = useLanguage();

  const language = ['uz', 'ru', 'en'].includes(
    currentLanguageCode
  )
    ? currentLanguageCode
    : 'uz';

  const text = assistantCopy[language];

  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState(null);

  const [
    assistantLanguage,
    setAssistantLanguage
  ] = useState(language);

  const [robotHidden, setRobotHidden] = useState(false);
  const [robotState, setRobotState] = useState('idle');

  const rootRef = useRef(null);
  const launcherRef = useRef(null);
  const closeTimer = useRef(null);

  const restoringFocus = useRef(false);

  const panelText =
    mode === 'accessibility'
      ? assistantCopy[assistantLanguage]
      : text;

  useEffect(() => {
    setAssistantLanguage(language);
  }, [language]);

  const focusLauncher = () => {
    restoringFocus.current = true;

    launcherRef.current?.focus({
      preventScroll: true
    });

    restoringFocus.current = false;
  };

  const close = () => {
    setMode(null);
    setMenuOpen(false);
    setRobotState('idle');

    focusLauncher();
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMode(null);
        setMenuOpen(false);
        setRobotState('idle');
      }
    };

    const onPointer = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);

    return () => {
      clearTimeout(closeTimer.current);

      document.removeEventListener('keydown', onKey);
      document.removeEventListener(
        'pointerdown',
        onPointer
      );
    };
  }, []);

  const chooseMode = (value) => {
    clearTimeout(closeTimer.current);

    setMenuOpen(false);
    setMode(value);

    if (value === 'accessibility') {
      setRobotHidden(false);
    }

    setRobotState(
      value === 'accessibility'
        ? 'greeting'
        : 'guiding'
    );
  };

  const options = [
    {
      id: 'appeal',
      label: text.appeal,
      Icon: FiFileText,
      detail: text.appealHint
    },
    {
      id: 'accessibility',
      label: text.accessibility,
      Icon: FaUniversalAccess,
      detail: text.accessibilityHint
    },
    {
      id: 'hemis',
      label: 'HEMIS',
      Icon: FiGrid,
      detail: text.hemisHint
    }
  ];

  return (
    <aside
      ref={rootRef}
      className={[
        'fstu-ai',
        menuOpen && !mode ? 'is-expanded' : '',
        mode ? 'has-panel' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={text.name}
    >

      {mode === 'accessibility' && !robotHidden && (
        <FloatingRobot
          state={robotState}
          onActivate={() =>
            chooseMode('accessibility')
          }
          onHide={() => {
            setRobotHidden(true);
            setRobotState('idle');
          }}
        />
      )}

      {mode === 'accessibility' && robotHidden && (
        <motion.button
          type="button"
          className="fstu-robot-restore"
          initial={{
            opacity: 0,
            scale: 0.7
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          onClick={() => {
            setRobotHidden(false);
            setRobotState('greeting');
          }}
          aria-label={panelText.robot}
        >
          <FiCpu />
          <span>AI robot</span>
        </motion.button>
      )}

      <AnimatePresence>
        {mode && (
          <motion.section
            className={`fstu-ai__panel${
              mode === 'accessibility'
                ? ' is-chat'
                : ''
            }`}
            role="dialog"
            aria-modal="false"
            aria-labelledby="fstu-ai-title"
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.96
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.97
            }}
            transition={{
              duration: 0.26,
              ease: [0.22, 1, 0.36, 1]
            }}
          >

            <header className="fstu-ai__header">
              <button
                type="button"
                className="fstu-ai__icon-button"
                aria-label={panelText.back}
                onClick={() => {
                  setMode(null);
                  setRobotState('idle');
                  setMenuOpen(true);
                  focusLauncher();
                }}
              >
                <FiArrowLeft />
              </button>

              <div>
                <span className="fstu-ai__eyebrow">
                  fstu<span>AI</span> /{' '}
                  {panelText.online}
                </span>

                <h2 id="fstu-ai-title">
                  {mode === 'hemis'
                    ? text.hemisTitle
                    : mode === 'appeal'
                      ? text.appeal
                      : panelText.chatTitle}
                </h2>
              </div>

              <button
                type="button"
                className="fstu-ai__icon-button"
                onClick={close}
                aria-label={panelText.close}
              >
                <FiX />
              </button>
            </header>

            {mode === 'accessibility' ? (
              <AccessibilityChat
                text={
                  assistantCopy[assistantLanguage]
                }
                language={assistantLanguage}
                onLanguageChange={
                  setAssistantLanguage
                }
                onStateChange={setRobotState}
              />
            ) : (
              <RequestForm
                key={mode}
                mode={mode}
                language={language}
                text={text}
              />
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <div
        className="fstu-ai__orbit"
        onMouseEnter={() => {
          clearTimeout(closeTimer.current);

          if (
            !mode &&
            window.matchMedia?.(
              '(hover: hover)'
            ).matches
          ) {
            setMenuOpen(true);
          }
        }}
        onMouseLeave={() => {
          closeTimer.current = setTimeout(
            () => setMenuOpen(false),
            220
          );
        }}
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget
            )
          ) {
            setMenuOpen(false);
          }
        }}
      >

        <div
          id="fstu-ai-options"
          className="fstu-ai__branches"
          inert={
            !menuOpen || Boolean(mode)
              ? true
              : undefined
          }
        >
          <svg
            className="fstu-ai__connectors"
            viewBox="0 0 360 416"
            aria-hidden="true"
          >
            <path d="M304 304 C348 240 338 57 286 57" />
            <path d="M292 306 C316 240 311 167 286 167" />
            <path d="M269 317 Q303 277 286 277" />
          </svg>

          {options.map(
            ({
              id,
              label,
              Icon,
              detail
            }, index) => (
              <button
                key={id}
                type="button"
                className={`fstu-ai__node is-${id}`}
                style={{
                  '--node-index': index
                }}
                onClick={() => chooseMode(id)}
              >
                <span className="fstu-ai__node-disc">
                  <Icon />

                  <span className="fstu-ai__node-number">
                    0{index + 1}
                  </span>
                </span>

                <span className="fstu-ai__node-copy">
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
              </button>
            )
          )}
        </div>

        <button
          ref={launcherRef}
          type="button"
          className="fstu-ai__launcher"
          aria-label={text.menu}
          aria-expanded={
            menuOpen && !mode
          }
          aria-controls="fstu-ai-options"
          onClick={() => {
            if (mode) {
              close();
            } else {
              setMenuOpen(
                (value) => !value
              );
            }
          }}
          onFocus={(event) => {
            if (
              !mode &&
              !restoringFocus.current &&
              event.currentTarget.matches(
                ':focus-visible'
              )
            ) {
              setMenuOpen(true);
            }
          }}
        >
          <span className="fstu-ai__ring is-outer" />
          <span className="fstu-ai__ring is-inner" />

          <span className="fstu-ai__launcher-disc">
            <span
              className="fstu-ai__sparkle"
              aria-hidden="true"
            >
              ✦
            </span>

            <strong>
              fstu<span>AI</span>
            </strong>

            <small>
              {text.assistant}
            </small>
          </span>

          <span className="fstu-ai__online-dot" />
        </button>
      </div>
    </aside>
  );
}
