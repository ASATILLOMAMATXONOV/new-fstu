import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Send,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';

const TwoFooter = () => {
  const theme = useTheme();
  const accentColor = '#0067ff';
  const accentColors = '#02509eff';
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        ...footerWrapper,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <div style={container}>
        <div style={grid}>
          {/* 1. Institut haqida */}
          <div style={section}>
            <h3 style={logoText}>
              <span style={{ color: accentColors }}>FSTU</span>
            </h3>

            <p
              style={{
                ...description,
                color: theme.palette.text.secondary,
              }}
            >
              Farg‘ona davlat texnika universiteti — kelajak muhandislarini
              tayyorlaydigan yetakchi ta'lim maskani. Biz bilan innovatsiyalar
              sari intiling.
            </p>

            <div style={socialLinks}>
              <a href="#" style={socialIcon} className="social-hover">
                <Facebook size={20} />
              </a>
              <a href="#" style={socialIcon} className="social-hover">
                <Instagram size={20} />
              </a>
              <a href="#" style={socialIcon} className="social-hover">
                <Send size={20} />
              </a>
              <a href="#" style={socialIcon} className="social-hover">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* 2. Foydali havolalar */}
          <div style={section}>
            <h4 style={heading}>Foydali havolalar</h4>
            <ul style={list}>
              {[
                "Universitet tarixi",
                "Bakalavriat",
                "Magistratura",
                "Ilmiy faoliyat",
                "Bog'lanish",
              ].map((item, i) => (
                <li key={i} className="list-item">
                  <ArrowRight size={14} color={accentColor} />
                  <a
                    href="#"
                    style={{
                      ...link,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Kontaktlar */}
          <div style={section}>
            <h4 style={heading}>Kontaktlar</h4>

            <div style={contactItem}>
              <MapPin size={20} color={accentColor} />
              <span
                style={{
                  ...contactText,
                  color: theme.palette.text.secondary,
                }}
              >
                Farg'ona sh., Farg'ona ko'chasi, 86-uy
              </span>
            </div>

            <div style={contactItem}>
              <Phone size={20} color={accentColor} />
              <span
                style={{
                  ...contactText,
                  color: theme.palette.text.secondary,
                }}
              >
                +998 (73) 244-11-22
              </span>
            </div>

            <div style={contactItem}>
              <Mail size={20} color={accentColor} />
              <span
                style={{
                  ...contactText,
                  color: theme.palette.text.secondary,
                }}
              >
                info@fstu.uz
              </span>
            </div>
          </div>
        </div>

        {/* Pastki qism */}
        <div
          style={{
            ...bottomBar,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <p
            style={{
              ...copyright,
              color: theme.palette.text.secondary,
            }}
          >
            <span style={{ color: accentColor }}>©</span> {currentYear} Farg‘ona
            davlat texnika universiteti. Barcha huquqlar himoyalangan.
          </p>

          <div style={bottomLinks}>
            <a
              href="#"
              style={{
                ...bottomLink,
                color: theme.palette.text.secondary,
              }}
            >
              Maxfiylik siyosati
            </a>
            <a
              href="#"
              style={{
                ...bottomLink,
                color: theme.palette.text.secondary,
              }}
            >
              Foydalanish shartlari
            </a>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .social-hover {
          transition: 0.3s;
          color: ${theme.palette.text.secondary};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-hover:hover {
          color: ${accentColor};
          transform: translateY(-3px);
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          transition: 0.3s;
        }

        .list-item:hover {
          padding-left: 8px;
        }

        @media (max-width: 768px) {
          footer {
            text-align: center;
          }
          .social-hover {
            justify-content: center;
          }
          .list-item {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

/* === STILLAR (O‘ZGARMAGAN) === */

const footerWrapper = {
  padding: '80px 0 20px 0',
  fontFamily: 'Inter, sans-serif',
};

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  marginBottom: '60px',
};

const section = {
  display: 'flex',
  flexDirection: 'column',
};

const logoText = {
  fontSize: '28px',
  fontWeight: '800',
  marginBottom: '20px',
  letterSpacing: '1px',
};

const description = {
  lineHeight: '1.7',
  fontSize: '15px',
  marginBottom: '25px',
};

const socialLinks = {
  display: 'flex',
  gap: '15px',
};

const socialIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'transparent',
  border: '1px solid',
};

const heading = {
  fontSize: '18px',
  fontWeight: '700',
  marginBottom: '25px',
};

const list = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const link = {
  textDecoration: 'none',
  fontSize: '15px',
  transition: '0.3s',
};

const contactItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '15px',
  marginBottom: '20px',
};

const contactText = {
  fontSize: '15px',
  lineHeight: '1.5',
};

const bottomBar = {
  paddingTop: '30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
};

const copyright = {
  fontSize: '14px',
  margin: 0,
};

const bottomLinks = {
  display: 'flex',
  gap: '25px',
};

const bottomLink = {
  textDecoration: 'none',
  fontSize: '14px',
  transition: '0.3s',
};

export default TwoFooter;
