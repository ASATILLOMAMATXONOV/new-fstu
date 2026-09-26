import {
  ChevronDown,
  Globe2,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaYoutube,
} from 'react-icons/fa';

import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import './styles/topbar.css';

const SOCIALS = [
  {
    label: 'Telegram',
    href: 'https://t.me/',
    icon: FaTelegramPlane,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    icon: FaInstagram,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    icon: FaFacebookF,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/',
    icon: FaYoutube,
  },
];

export function PublicTopbar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-left">
          <span className="topbar-slogan">
            Bilim. Izlanish. Taraqqiyot.
          </span>

          <div className="topbar-socials">
            {SOCIALS.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon
                    size={14}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </div>

        <div className="topbar-actions">
          <Link
            to={ROUTES.admissions}
            className="topbar-link"
          >
            Abituriyentlar uchun
          </Link>

          <div className="language-dropdown">
            <button
              type="button"
              className="language-trigger"
              aria-haspopup="menu"
            >
              <Globe2
                size={14}
                aria-hidden="true"
              />

              <span>O‘zbekcha</span>

              <ChevronDown
                size={14}
                className="language-chevron"
                aria-hidden="true"
              />
            </button>

            <div
              className="language-menu"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="active"
              >
                O‘zbekcha
              </button>

              <button
                type="button"
                role="menuitem"
              >
                Русский
              </button>

              <button
                type="button"
                role="menuitem"
              >
                English
              </button>
            </div>
          </div>

          <Link
            to={ROUTES.admin}
            className="topbar-link"
          >
            Admin panel
          </Link>
        </div>
      </div>
    </div>
  );
}