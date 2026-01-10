import React from 'react';
import {
  Megaphone,
  MessageSquareText,
  Search,
  SquareArrowOutUpRight,
  MapPin,
} from 'lucide-react';
import { useTheme, alpha } from '@mui/material/styles'; // alpha va useTheme import qilindi

const TwoEvent = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const accentColors = '#02509eff'; 
  const accentLight = '#0067ff';    

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
      title: "Ilmiy maqolalar to'plami (FarPI)",
      price: "Nashr etish",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400",
      location: "Ilmiy bo'lim",
    },
    {
      id: 3,
      title: "Talabalar turar joyiga ariza",
      price: "Onlayn ro'yxat",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400",
      location: "TTJ",
    },
  ];

  return (
    <div
      style={{
        padding: '60px 20px',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default, 
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', margin: 0 }}>
            <span style={{ color: accentColors, marginRight: 10 }}>|</span>
            FSTU <span style={{ fontWeight: 300 }}>E'lonlari</span>
          </h2>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Qidirish..."
              style={{
                borderRadius: '10px',
                padding: '10px 15px',
                width: '220px',
                outline: 'none',
                border: '1px solid',
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
              }}
            />
            <Search size={18} color={theme.palette.text.secondary} style={{ position: 'absolute', right: '15px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }} className="main-flex">
          {/* LEFT FEATURED */}
          <div
            style={{
              flex: '0 0 350px',
              borderRadius: '24px',
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'sticky',
              top: '20px',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
            className="featured-card"
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                border: `2px solid ${accentColors}`,
                backgroundColor: isDarkMode ? alpha(accentColors, 0.1) : theme.palette.action.hover,
              }}
              className="pulse-anim"
            >
              <Megaphone size={40} color={accentColors} style={{ transform: 'rotate(-20deg)' }} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>DIQQAT E'LON</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.6',  color: theme.palette.text.secondary }}>
              Farg‘ona davlat texnika universiteti qabul jarayonlari haqida eng so'nggi ma'lumotlar.
            </p>

            <a
              href="https://fstu.uz"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: '#fff',
                padding: '14px 30px',
                borderRadius: '12px',
                fontWeight: '700',
                background: accentLight
              }}
            >
              Batafsil <SquareArrowOutUpRight size={18} />
            </a>
          </div>

          {/* ADS GRID */}
          <div style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  animationDelay: `${index * 0.1}s`,
                }}
                className="ad-card"
              >
                <div style={{ width: '100%', height: '200px', backgroundSize: 'cover', backgroundImage: `url(${ad.image})`, position: 'relative' }}>
                   <div style={{ position: 'absolute', inset: 0, background: isDarkMode ? 'rgba(0,0,0,0.4)' : 'transparent' }} />
                   <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: accentColors, color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>FSTU</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 8px 0', color: theme.palette.text.primary }}>{ad.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                    <MapPin size={13} color={theme.palette.text.secondary} />
                    <span style={{ fontSize: '13px', color: theme.palette.text.secondary }}>{ad.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: accentLight }}>{ad.price}</span>
                    <button className="chat-btn-circle"><MessageSquareText size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ad-card { opacity: 0; animation: fadeInUp 0.6s ease-out forwards; transition: 0.3s; }
        .ad-card:hover { transform: translateY(-8px); border-color: ${accentLight} !important; }
        .pulse-anim { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${alpha(accentColors, 0.4)}; }
          70% { box-shadow: 0 0 0 15px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        .chat-btn-circle {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid ${theme.palette.divider};
          background: transparent; color: ${theme.palette.text.secondary}; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: 0.3s;
        }
        .chat-btn-circle:hover { background: ${accentLight}; color: #fff; border-color: ${accentLight}; }
        @media (max-width: 1024px) { .main-flex { flex-direction: column !important; } .featured-card { width: 100% !important; position: static !important; } }
      `}</style>
    </div>
  );
};

export default TwoEvent;