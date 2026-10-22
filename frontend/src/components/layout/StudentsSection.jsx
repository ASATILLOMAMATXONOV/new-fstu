
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import '../../assets/styles/StudentsSection.css';

import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';

import {
  getTranslatedField,
  sortContentByNewest
} from '../../utils/cms';

const MAX_STUDENTS = 12;
const AUTO_PLAY_DELAY = 5000;

/* ==========================================
   HELPERS
========================================== */

function cleanText(value) {
  return String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getStudentName(student, fallback) {
  const title = getTranslatedField(
    student,
    'title',
    student.title || ''
  );

  return (
    getTranslatedField(
      student,
      'fullName',
      student.fullName || ''
    ) ||
    student.name ||
    title ||
    fallback ||
    'Talaba'
  );
}

function getStudentDescription(student) {
  const fields = [
    'description',
    'achievement',
    'summary',
    'content'
  ];

  for (const field of fields) {
    const value = getTranslatedField(
      student,
      field,
      student[field] || ''
    );

    const text = cleanText(value);

    if (text) return text;
  }

  return '';
}

// API dagi mavjud ikkinchi rasm maydonlarini tekshiradi.
// Backend endpointini o'zgartirmaydi.
function getSecondImage(student) {
  const candidates = [
    student.secondImage,
    student.secondaryImage,
    student.hoverImage,
    student.image2,
    student.gallery?.[0]?.url,
    student.gallery?.[0]?.image,
    student.images?.[1]?.url,
    student.images?.[1]?.image,
    typeof student.images?.[1] === 'string'
      ? student.images[1]
      : null
  ];

  const firstImage = student.image;

  return candidates.find(
    value =>
      typeof value === 'string' &&
      value.trim() &&
      value !== firstImage
  ) || '';
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  );
}

/* ==========================================
   ARROW ICON
========================================== */

function ArrowIcon({ direction = 'right' }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform:
          direction === 'left'
            ? 'rotate(180deg)'
            : undefined
      }}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ==========================================
   STUDENT IMAGE — TWO IMAGE HOVER
========================================== */

function StudentImage({ src, secondSrc, alt }) {
  const [failedMain, setFailedMain] = useState(null);
  const [failedSecond, setFailedSecond] = useState(null);
  const [secondLoaded, setSecondLoaded] = useState(false);

  useEffect(() => {
    setSecondLoaded(false);
  }, [secondSrc]);

  const hasMain = Boolean(src) && failedMain !== src;

  const hasSecond =
    Boolean(secondSrc) &&
    secondSrc !== src &&
    failedSecond !== secondSrc;

  const canSwitch = hasSecond && secondLoaded;

  return (
    <div
      className={`st-image ${
        canSwitch ? 'has-second-image' : ''
      }`}
    >
      {hasMain ? (
        <img
          className="st-img-primary"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedMain(src)}
        />
      ) : (
        <div className="st-placeholder">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="23"
              r="11"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M12 54c0-11 9-18 20-18s20 7 20 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {hasSecond && (
        <img
          className="st-img-secondary"
          src={secondSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setSecondLoaded(true)}
          onError={() => setFailedSecond(secondSrc)}
        />
      )}

      <span
        className="st-image-overlay"
        aria-hidden="true"
      />

      <span
        className="st-image-shine"
        aria-hidden="true"
      />
    </div>
  );
}

/* ==========================================
   STUDENT CARD
========================================== */

function StudentCard({
  student,
  index,
  detailsText,
  fallbackName
}) {
  const name = getStudentName(student, fallbackName);
  const description = getStudentDescription(student);
  const secondImage = getSecondImage(student);

  const studentUrl = `/students/${student.id}`;

  return (
    <article
      className="st-card"
      style={{ '--st-index': Math.min(index, 5) }}
    >
      <AppLink
        href={studentUrl}
        className="st-card-image-link"
        aria-label={name}
      >
        <StudentImage
          src={student.image}
          secondSrc={secondImage}
          alt={name}
        />
      </AppLink>

      <div className="st-content">
        <h3 title={name}>
          <AppLink href={studentUrl}>
            {name}
          </AppLink>
        </h3>

        {description && (
          <p>{description}</p>
        )}

        <AppLink
          href={studentUrl}
          className="st-details"
        >
          {detailsText || 'Batafsil'}
          <ArrowIcon />
        </AppLink>
      </div>
    </article>
  );
}

/* ==========================================
   MAIN STUDENTS SLIDER
========================================== */

export default function StudentsSection() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () =>
      getSiteMessages(currentLanguageCode)
        .home.studentAnnouncementStats,
    [currentLanguageCode]
  );

  // MAVJUD API
  const {
    items: studentItems,
    loading,
    error
  } = useContentList('students', {
    limit: MAX_STUDENTS,
    orderBy: 'recent',
    revalidate: true
  });

  const students = useMemo(() => {
    return sortContentByNewest(
      Array.isArray(studentItems)
        ? studentItems
        : []
    ).slice(0, MAX_STUDENTS);
  }, [studentItems]);

  const sliderRef = useRef(null);
  const pausedRef = useRef(false);
  const activeRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = Math.max(
    0,
    students.length - visibleCount
  );

  const canSlide = maxIndex > 0;

  // Responsive kartalar soni

useEffect(() => {
  function updateVisibleCount() {
    const width = window.innerWidth;

    if (width <= 560) {
      setVisibleCount(1);
    } else if (width <= 800) {
      setVisibleCount(2);
    } else if (width <= 1199) {
      setVisibleCount(3);
    } else if (width < 1700) {
      setVisibleCount(4);
    } else {
      setVisibleCount(5);
    }
  }

  updateVisibleCount();

  window.addEventListener(
    'resize',
    updateVisibleCount
  );

  return () => {
    window.removeEventListener(
      'resize',
      updateVisibleCount
    );
  };
}, []);


  // Kartani ko'rsatish
  const goTo = useCallback(
    (index, instant = false) => {
      const slider = sliderRef.current;

      if (!slider) return;

      const cards = slider.querySelectorAll('.st-slide');

      if (!cards.length) return;

      const targetIndex = Math.max(
        0,
        Math.min(index, maxIndex)
      );

      const left =
        cards[targetIndex].offsetLeft -
        cards[0].offsetLeft;

      slider.scrollTo({
        left,
        behavior:
          instant || prefersReducedMotion()
            ? 'instant'
            : 'smooth'
      });

      activeRef.current = targetIndex;
      setActiveIndex(targetIndex);
    },
    [maxIndex]
  );

  const nextSlide = useCallback(() => {
    const next =
      activeRef.current >= maxIndex
        ? 0
        : activeRef.current + 1;

    goTo(next);
  }, [goTo, maxIndex]);

  const prevSlide = useCallback(() => {
    const prev =
      activeRef.current <= 0
        ? maxIndex
        : activeRef.current - 1;

    goTo(prev);
  }, [goTo, maxIndex]);

  // Autoplay
  useEffect(() => {
    if (!canSlide || isPaused || prefersReducedMotion()) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (!pausedRef.current) {
        const next =
          activeRef.current >= maxIndex
            ? 0
            : activeRef.current + 1;

        goTo(next);
      }
    }, AUTO_PLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [canSlide, isPaused, maxIndex, goTo]);

  // Swipe / scroll holatini aniqlash
  const handleScroll = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards = slider.querySelectorAll('.st-slide');

    if (!cards.length) return;

    const first = cards[0].offsetLeft;
    const scrollLeft = slider.scrollLeft;

    let nearest = 0;
    let distance = Infinity;

    for (let index = 0; index <= maxIndex; index++) {
      const card = cards[index];
      if (!card) break;

      const currentDistance = Math.abs(
        card.offsetLeft - first - scrollLeft
      );

      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    }

    activeRef.current = nearest;
    setActiveIndex(nearest);
  }, [maxIndex]);

  // Ekran o'lchami o'zgarganda
  useEffect(() => {
    const index = Math.min(activeRef.current, maxIndex);
    goTo(index, true);
  }, [visibleCount, maxIndex, goTo]);

  // Til o'zgarganda slider birinchi kartadan boshlanadi
  useEffect(() => {
    goTo(0, true);
  }, [currentLanguageCode, goTo]);

  // Hover va klaviatura focus paytida to'xtatish
  function pauseSlider() {
    pausedRef.current = true;
    setIsPaused(true);
  }

  function resumeSlider() {
    pausedRef.current = false;
    setIsPaused(false);
  }

  return (
    <section
      className="st-section"
      onMouseEnter={pauseSlider}
      onMouseLeave={resumeSlider}
      onFocusCapture={pauseSlider}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          resumeSlider();
        }
      }}
    >
      <div className="st-container">

        {/* HEADER */}
        <div className="st-header">
          <div className="st-heading">
            <span
              className="st-heading-line"
              aria-hidden="true"
            />

            <h2>{texts.studentsTitle}</h2>
          </div>

          <div className="st-header-actions">

            {canSlide && (
              <div className="st-navigation">
                <button
                  type="button"
                  className="st-nav-btn"
                  onClick={prevSlide}
                  aria-label="Oldingi talabalar"
                >
                  <ArrowIcon direction="left" />
                </button>

                <button
                  type="button"
                  className="st-nav-btn"
                  onClick={nextSlide}
                  aria-label="Keyingi talabalar"
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>
            )}

            <AppLink
              href="/students"
              className="st-see-all"
            >
              {texts.seeAll}
              <span aria-hidden="true">↗</span>
            </AppLink>
          </div>
        </div>

        {/* LOADING */}
        {loading && students.length === 0 && (
          <div className="st-status" role="status">
            Talabalar yuklanmoqda...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && students.length === 0 && (
          <div className="st-status" role="alert">
            Talabalarni yuklashda xatolik yuz berdi.
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && students.length === 0 && (
          <div className="st-status">
            <h3>{texts.studentsEmptyTitle}</h3>
            <p>{texts.studentsEmptyText}</p>
          </div>
        )}

        {/* SLIDER */}
        {students.length > 0 && (
          <>
            <div
              className="st-slider"
              ref={sliderRef}
              onScroll={handleScroll}
              onTouchStart={pauseSlider}
              onTouchEnd={resumeSlider}
              onTouchCancel={resumeSlider}
              aria-label="Talabalar slayderi"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  nextSlide();
                }

                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  prevSlide();
                }
              }}
            >
              {students.map((student, index) => (
                <div
                  className="st-slide"
                  key={student.id ?? index}
                >
                  <StudentCard
                    student={student}
                    index={index}
                    detailsText={texts.details}
                    fallbackName={texts.studentsTitle}
                  />
                </div>
              ))}
            </div>

            {/* SLIDER CONTROLS */}
            {canSlide && (
              <div className="st-slider-footer">

                <div className="st-dots">
                  {Array.from({
                    length: maxIndex + 1
                  }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`st-dot ${
                        activeIndex === index ? 'active' : ''
                      }`}
                      onClick={() => goTo(index)}
                      aria-label={`${index + 1}-slayd`}
                      aria-current={
                        activeIndex === index
                          ? 'true'
                          : undefined
                      }
                    />
                  ))}
                </div>

                <div className="st-progress">
                  <span
                    style={{
                      width: `${
                        ((activeIndex + 1) /
                          (maxIndex + 1)) * 100
                      }%`
                    }}
                  />
                </div>

                <span className="st-counter">
                  {String(activeIndex + 1).padStart(2, '0')}
                  {' / '}
                  {String(maxIndex + 1).padStart(2, '0')}
                </span>

              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
