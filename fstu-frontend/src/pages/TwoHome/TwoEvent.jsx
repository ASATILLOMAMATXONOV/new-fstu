import React from 'react';
import {
  Megaphone,
  MessageSquareText,
  Search,
  SquareArrowOutUpRight,
  MapPin,
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';

const TwoEvent = () => {
  const theme = useTheme();
  const accentColor = '#ff7a00';

  const ads = [
    {
      id: 1,
      title: "Magistratura qabul – 2025/2026",
      price: "Qabul ochiq",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
      location: "Bosh bino",
    },
    {
      id: 2,
      title:
        "Ilmiy maqolalar to'plamiIlmiy maqolalar to'plamiIlmiy maqolalar to'plami (FarPI)",
      price: "Nashr etish",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
      location: "Ilmiy bo'lim",
    },
    {
      id: 3,
      title: "Talabalar turar joyiga ariza",
      price: "Onlayn ro'yxat",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
      location: "TTJ",
    },
    {
      id: 4,
      title: "Iqtidorli talabalar tanlovi",
      price: "Grantlar",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
      location: "Yoshlar Ittifoqi",
    },
  ];

  return (
    <div
      style={{
        ...pageWrapper,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <div style={container}>
        {/* HEADER */}
        <div style={topHeader}>
          <h2 style={{ ...mainTitle, color: theme.palette.text.primary }}>
            <span style={{ color: accentColor, marginRight: 10 }}>|</span>
            FSTU <span style={{ fontWeight: 300 }}>E'lonlari</span>
          </h2>

          <div style={searchWrapper}>
            <input
              type="text"
              placeholder="Qidirish..."
              style={{
                ...searchInput,
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
              }}
            />
            <Search
              size={18}
              color={theme.palette.text.secondary}
              style={searchIcon}
            />
          </div>
        </div>

        <div style={contentLayout} className="main-flex">
          {/* LEFT FEATURED */}
          <div
            style={{
              ...featuredBox,
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            }}
            className="featured-card"
          >
            <div
              style={{
                ...megaphoneCircle,
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.divider,
              }}
              className="pulse-anim"
            >
              <Megaphone
                size={40}
                color={accentColor}
                strokeWidth={2.5}
                style={{ transform: 'rotate(-20deg)' }}
              />
            </div>

            <h3 style={featuredTitle}>DIQQAT E'LON</h3>

            <p
              style={{
                ...featuredDesc,
                color: theme.palette.text.secondary,
              }}
            >
              Farg‘ona davlat texnika universiteti barcha yo'nalishlar bo'yicha
              hujjatlar qabulini davom ettirmoqda.
            </p>

            <a
              href="https://fstu.uz"
              target="_blank"
              rel="noreferrer"
              style={{ ...featuredBtn, background: accentColor }}

              
            >
              Batafsil <SquareArrowOutUpRight size={18} />
            </a>
          </div>

          {/* RIGHT ADS */}
          <div style={adsGrid}>
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                style={{
                  ...adCard,
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  animationDelay: `${index * 0.1}s`,
                }}
                className="ad-card"
              >
                <div
                  style={{
                    ...adImage,
                    backgroundImage: `url(${ad.image})`,
                  }}
                >
                  <div
                    className="img-overlay"
                    style={{
                      ...imgOverlay,
                      background:
                        theme.palette.mode === 'dark'
                          ? 'rgba(0,0,0,0.35)'
                          : 'rgba(255,255,255,0.25)',
                    }}
                  />
                  <div style={badgeStyle}>FSTU</div>
                </div>

                <div style={adInfo}>
                  <h4
                    style={{
                      ...adItemTitle,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {ad.title}
                  </h4>

                  <div style={locRow}>
                    <MapPin size={13} color={theme.palette.text.secondary} />
                    <span
                      style={{
                        ...adItemLocation,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {ad.location}
                    </span>
                  </div>

                  <div style={priceRow}>
                    <span
                      style={{ ...adItemPrice, color: accentColor }}
                    >
                      {ad.price}
                    </span>
                    <button className="chat-btn-circle">
                      <MessageSquareText size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ad-card {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
          transition: all 0.3s ease-in-out;
          border: 1px solid ${theme.palette.divider};
        }

        .ad-card:hover {
          transform: translateY(-8px);
          border-color: ${accentColor};
          border-color: ${accentColor} !important;
        }

        .featured-card {
          transition: all 0.3s ease-in-out;
          border: 1px solid ${theme.palette.divider};
        }

        .featured-card:hover {
          border-color: ${accentColor};
        }

        .pulse-anim {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,122,0,0.3); }
          100% { box-shadow: 0 0 0 12px rgba(255,122,0,0); }
        }

        .chat-btn-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid ${theme.palette.divider};
          background: transparent;
          color: ${theme.palette.text.secondary};
          cursor: pointer;
          transition: all 0.3s;
        }

        .chat-btn-circle:hover {
          background: ${accentColor};
          color: #fff;
          border-color: ${accentColor};
          
        }

        @media (max-width: 1024px) {
          .main-flex {
            flex-direction: column !important;
          }
          .featured-card {
            width: 100% !important;
            flex: none !important;
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
};

/* === STILLAR (O‘ZGARMAGAN) === */

const pageWrapper = {
marginBottom:'20px',
  padding: '20px 20px',
  fontFamily: "'Inter', sans-serif",
};

const container = { maxWidth: '1200px', margin: '0 auto' };
const topHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '50px',
};

const mainTitle = { fontSize: '30px', fontWeight: '800', margin: 0 };

const searchWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const searchInput = {
  borderRadius: '10px',
  padding: '10px 15px',
  width: '220px',
  outline: 'none',
  border: '1px solid',
};
const searchIcon = { position: 'absolute', right: '15px' };

const contentLayout = { display: 'flex', gap: '30px', alignItems: 'flex-start' };

const featuredBox = {
  flex: '0 0 350px',
  borderRadius: '24px',
  padding: '25px 5px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  position: 'sticky',
  top: '20px',
};

const megaphoneCircle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  border: '1px solid',
};

const featuredTitle = { fontSize: '22px', fontWeight: '900', marginBottom: '15px' };
const featuredDesc = { fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' };

const featuredBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
  color: '#fff',
  padding: '12px 25px',
  borderRadius: '12px',
  fontWeight: '700',
};

const adsGrid = {
  flex: '1',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '20px',
};

const adCard = {
  borderRadius: '20px',
  overflow: 'hidden',
};

const adImage = {
  width: '100%',
  height: '180px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
};

const imgOverlay = { position: 'absolute', inset: 0 };

const badgeStyle = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  backgroundColor: '#ff7a00',
  color: '#fff',
  padding: '3px 10px',
  borderRadius: '5px',
  fontSize: '10px',
  fontWeight: '700',
};

const adInfo = { padding: '20px' };
const adItemTitle = { fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' };
const locRow = { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' };
const adItemLocation = { fontSize: '12px' };
const priceRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const adItemPrice = { fontSize: '18px', fontWeight: '800' };

export default TwoEvent;
