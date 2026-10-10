import React from 'react';
import '../../assets/styles/Footer.css';
import { useLanguage } from '../../context/LanguageContext';
import { getSiteMessages } from '../../locales/site';
import AppLink from '../common/AppLink';
import logo from '../../assets/optimized/logo.png';

const WWW_UZ_COUNTER_ID = '48100';

const WWW_UZ_COUNTER_LINK =
  `http://www.uz/uz/res/visitor/index?id=${WWW_UZ_COUNTER_ID}`;

const WWW_UZ_COUNTER_FALLBACK_SRC =
  `https://cnt0.www.uz/counter/collect?id=${WWW_UZ_COUNTER_ID}` +
  '&pg=http%3A//uzinfocom.uz&col=F7AE00&t=ffffff&p=0E418F';

const transportTranslations = {
  uz: {
    title: 'Transport',
    route: 'yo‘nalish',
    bus: 'Avtobus',
    damas: 'Damas'
  },
  ru: {
    title: 'Транспорт',
    route: 'маршрут',
    bus: 'Автобус',
    damas: 'Дамас'
  },
  en: {
    title: 'Transport',
    route: 'route',
    bus: 'Bus',
    damas: 'Damas'
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

function DamasIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 16V9a2 2 0 0 1 2-2h9.5a2 2 0 0 1 1.6.8L20 13v3" />
      <path d="M3 16h17M16 9h-4v4h7M5 10h4v3H5" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
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
  const brand = messages.navbar.brand;

  const language = String(currentLanguageCode || 'uz')
    .slice(0, 2)
    .toLowerCase();

  const transport =
    transportTranslations[language] || transportTranslations.uz;

  const [counterSrc, setCounterSrc] = React.useState(
    WWW_UZ_COUNTER_FALLBACK_SRC
  );

  const routes = [
    {
      id: 'bus-6',
      number: 6,
      name: transport.bus,
      Icon: BusIcon
    },
    {
      id: 'damas-6',
      number: 6,
      name: transport.damas,
      Icon: DamasIcon
    },
    {
      id: 'bus-9',
      number: 9,
      name: transport.bus,
      Icon: BusIcon
    }
  ];

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
          <AppLink href="/" className="footer-logo">
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
              <p>{brand.sub}</p>
            </div>
          </AppLink>

          <p className="footer-description">
            {texts.brandDescription}
          </p>

          <div className="footer-socials">
            <a href="#telegram" aria-label="Telegram">
              Tg
            </a>

            <a href="#instagram" aria-label="Instagram">
              Ig
            </a>

            <a href="#facebook" aria-label="Facebook">
              Fb
            </a>

            <a href="#youtube" aria-label="YouTube">
              Yt
            </a>
          </div>
        </div>

        {/* MENYULAR */}

        <div className="footer-navigation">
          {texts.columns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3>{column.title}</h3>

              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <AppLink href="#link">
                      {link}
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
              <p>{texts.phoneValue}</p>
            </li>

            <li>
              <span>{texts.emailLabel}</span>
              <p>{texts.emailValue}</p>
            </li>

            <li>
              <span>{texts.hoursLabel}</span>
              <p>{texts.hoursValue}</p>
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

        <div className="footer-map">
          <iframe
            title={texts.mapTitle}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24320.65589568446!2d71.76095963476561!3d40.362706399999986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb85973cd93817%3A0xa7f152773a870be!2sO%27zbekiston%20Koreya%20Xalqaro%20Universiteti%20FSTU!5e0!3m2!1sru!2s!4v1779791595915!5m2!1sru!2s"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="footer-bottom">
        <p>{texts.copyright}</p>

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
