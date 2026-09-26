import {
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import './styles/footer.css';

const FOOTER_LINKS = {
  university: [
    {
      label: 'Universitet haqida',
      path: ROUTES.about,
    },
    {
      label: 'Fakultetlar',
      path: ROUTES.faculties,
    },
    {
      label: 'Yangiliklar',
      path: ROUTES.news,
    },
  ],

  useful: [
    {
      label: 'Abituriyentlar',
      path: ROUTES.admissions,
    },
    {
      label: 'Bog‘lanish',
      path: ROUTES.contact,
    },
  ],
};

const CONTACT = {
  phone: '+998 00 000 00 00',
  phoneHref: '+998000000000',
  email: 'info@example.uz',
  address: 'Farg‘ona shahri',
};

export function PublicFooter() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img
            src="/images/logo-white.png"
            alt="Farg‘ona davlat texnika universiteti"
          />

          <p>
            Zamonaviy ta’lim,
            ilm-fan va innovatsiya
            markazi.
          </p>
        </div>

        <div className="footer-column">
          <h3>
            Universitet
          </h3>

          {FOOTER_LINKS.university.map(
            (item) => (
              <Link
                key={item.path}
                to={item.path}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="footer-column">
          <h3>
            Foydali havolalar
          </h3>

          {FOOTER_LINKS.useful.map(
            (item) => (
              <Link
                key={item.path}
                to={item.path}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="footer-column">
          <h3>
            Bog‘lanish
          </h3>

          <a
            href={`tel:${CONTACT.phoneHref}`}
          >
            <Phone
              size={17}
              aria-hidden="true"
            />

            <span>
              {CONTACT.phone}
            </span>
          </a>

          <a
            href={`mailto:${CONTACT.email}`}
          >
            <Mail
              size={17}
              aria-hidden="true"
            />

            <span>
              {CONTACT.email}
            </span>
          </a>

          <div className="footer-address">
            <MapPin
              size={17}
              aria-hidden="true"
            />

            <span>
              {CONTACT.address}
            </span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {currentYear}{' '}
          Farg‘ona davlat texnika universiteti.
          Barcha huquqlar himoyalangan.
        </span>
      </div>
    </footer>
  );
}