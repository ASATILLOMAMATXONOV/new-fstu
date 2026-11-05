import React from 'react';
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';
import '../../assets/styles/Footer.css';
import { useLanguage } from '../../context/LanguageContext';
import { getSiteMessages } from '../../locales/site';
import AppLink from '../common/AppLink';
import logo from '../../assets/optimized/logo.webp';

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48598.631766038416!2d71.76371929999998!3d40.42182005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb82d713bba655%3A0xd9b610b729b574fb!2z0KTQtdGA0LPQsNC90YHQutC40Lkg0LPQvtGB0YPQtNCw0YDRgdGC0LLQtdC90L3Ri9C5INGC0LXRhdC90LjRh9C10YHQutC40Lkg0YPQvdC40LLQtdGA0YHQuNGC0LXRgg!5e0!3m2!1sru!2s!4v1793343126202!5m2!1sru!2s';

// The Google Maps embed is heavy, so it is mounted only when the footer nears the viewport.
function FooterMap() {
  const ref = React.useRef(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="footer-map" ref={ref}>
      {shouldLoad && (
        <iframe
          title="Farg‘ona davlat texnika universiteti"
          src={MAP_EMBED_URL}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}

const WWW_UZ_COUNTER_ID = '48101';

const WWW_UZ_COUNTER_LINK =
  `http://www.uz/uz/res/visitor/index?id=${WWW_UZ_COUNTER_ID}`;

const WWW_UZ_COUNTER_FALLBACK_SRC =
  `https://cnt0.www.uz/counter/collect?id=${WWW_UZ_COUNTER_ID}` +
  '&pg=https%3A%2F%2Ffstu.uz%2F&col=F7AE00&t=ffffff&p=0E418F';

// Official social links published on https://fstu.uz/.
const footerSocials = [
  { label: 'Telegram', href: 'https://t.me/ferpolitech', Icon: FaTelegramPlane },
  { label: 'Instagram', href: 'https://www.instagram.com/farpi_press/', Icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/Farpi_press-110544218090177/', Icon: FaFacebookF },
  { label: 'YouTube', href: 'https://www.youtube.com/c/FarpiLive', Icon: FaYoutube }
];

const transportTranslations = {
  uz: {
    title: 'Transport',
    route: 'yo‘nalish',
    bus: 'Avtobus'
  },
  ru: {
    title: 'Транспорт',
    route: 'маршрут',
    bus: 'Автобус'
  },
  en: {
    title: 'Transport',
    route: 'route',
    bus: 'Bus'
  }
};

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="17" rx="3" />
      <path d="M5 9h14M8 13h2M14 13h2M7 20v1M17 20v1" />
    </svg>
  );
}

function Footer() {
  const { currentLanguageCode } = useLanguage();

  const messages = React.useMemo(
    () => getSiteMessages(currentLanguageCode),
    [currentLanguageCode]
  );

  const texts = messages.footer;

  const language = String(currentLanguageCode || 'uz')
    .slice(0, 2)
    .toLowerCase();

  const transport =
    transportTranslations[language] || transportTranslations.uz;

  const [counterSrc, setCounterSrc] = React.useState(
    WWW_UZ_COUNTER_FALLBACK_SRC
  );

  const routes = ['8', '8A', '9', '10', '14'].map(number => ({
    id: `bus-${number}`, number, name: transport.bus, Icon: BusIcon
  }));

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      document.cookie = 'smart_top=1; path=/';

      const encodeValue =
        typeof window.escape === 'function'
          ? window.escape
          : encodeURIComponent;

      const hasCookies = document.cookie ? 'Y' : 'N';

      const javaEnabled =
        typeof navigator.javaEnabled === 'function'
          ? navigator.javaEnabled()
          : false;

      const screenWidth = window.screen?.width || 0;
      const screenHeight = window.screen?.height || 0;

      const pixelDepth =
        window.screen?.pixelDepth ||
        window.screen?.colorDepth ||
        0;

      const query = [
        `id=${WWW_UZ_COUNTER_ID}`,
        `r=${encodeValue(document.referrer || '')}`,
        `pg=${encodeValue(window.location.href)}`,
        `c=${hasCookies}`,
        `j=${javaEnabled ? 'Y' : 'N'}`,
        `wh=${screenWidth}x${screenHeight}`,
        `px=${pixelDepth}`,
        'js=1.3',
        'col=F7AE00',
        't=ffffff',
        'p=0E418F'
      ].join('&');

      setCounterSrc(
        `https://cnt0.www.uz/counter/collect?${query}`
      );
    } catch {
      setCounterSrc(WWW_UZ_COUNTER_FALLBACK_SRC);
    }
  }, []);

  return (
    <footer className="site-footer" id="aloqa">
      <div className="footer-main">
        {/* LOGO VA UNIVERSITET */}

        <div className="footer-brand">
          <AppLink
            href="/"
            className="footer-logo"
            style={{ '--footer-logo-image': `url(${logo})` }}
          >
            <img
              src={logo}
              alt="FSTU logo"
              width="96"
              height="96"
              loading="lazy"
              decoding="async"
            />

            <div className="footer-logo-content">
              <h2>FSTU</h2>
              <p>{texts.universityName}</p>
            </div>
          </AppLink>

          <p className="footer-description">
            {texts.brandDescription}
          </p>

          <div className="footer-socials">
            {footerSocials.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} title={label} target="_blank" rel="noopener noreferrer">
                <Icon aria-hidden="true" focusable="false" />
              </a>
            ))}
          </div>
        </div>

        {/* MENYULAR */}

        <div className="footer-navigation">
          {texts.columns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3>{column.title}</h3>

              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <AppLink href={link.href}>
                      {link.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ALOQA */}

        <div className="footer-contact">
          <h3>{texts.contactTitle}</h3>

          <ul>
            <li>
              <span>{texts.addressLabel}</span>
              <p>{texts.addressValue}</p>
            </li>

            <li>
              <span>{texts.phoneLabel}</span>
              <p><a href="tel:+998732411206">{texts.phoneValue}</a></p>
            </li>

            <li>
              <span>{texts.emailLabel}</span>
              <p><a href="mailto:info@fstu.uz">{texts.emailValue}</a></p>
            </li>

            <li>
              <span>{texts.websiteLabel}</span>
              <p><a href="https://fstu.uz/" target="_blank" rel="noopener noreferrer">fstu.uz</a></p>
            </li>
          </ul>
        </div>

        {/* TRANSPORT */}

        <div className="footer-transport">
          <h3>{transport.title}</h3>

          <div className="footer-transport-list">
            {routes.map(({ id, number, name, Icon }) => (
              <div className="footer-transport-item" key={id}>
                <span className="footer-transport-icon">
                  <Icon />
                </span>

                <div className="footer-route-info">
                  <strong>
                    {number}-{transport.route}
                  </strong>

                  <small>{name}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="footer-rating">
            <a
              href={WWW_UZ_COUNTER_LINK}
              target="_top"
              rel="noreferrer"
            >
              <img
                src={counterSrc}
                width="88"
                height="31"
                alt="Top rating www.uz"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
        </div>

        {/* XARITA */}

        <FooterMap />
      </div>

      <div className="footer-bottom">
        <p>{texts.copyright.replace('{year}', new Date().getFullYear())}</p>

        <div>
          <AppLink href="#privacy">
            {texts.privacy}
          </AppLink>

          <AppLink href="#terms">
            {texts.terms}
          </AppLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
