import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay,  } from 'swiper/modules';
import { useTheme } from '@mui/material/styles';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';


const TwoNews = () => {
  const theme = useTheme();
  const accentColor = '#0067ff';
  const accentColors = '#02509eff';

  const newsData = [
    {
      id: 1,
      title: "Iqtisodiy o'sish sur'atlari",
      date: "20.12.2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
    },
    {
      id: 2,
      title: "Yangi ta'lim tizimi",
      date: "19.12.2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
    },
    {
      id: 3,
      title: "Ekologiya va biz",
      date: "17.12.2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
    },
    {
      id: 4,
      title: "Koinot sirlari",
      date: "16.12.2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: '80px 0',
      }}
    >
      <div style={container}>
        {/* HEADER */}
        <div style={headerRow}>
          <h2 style={sectionTitle}>
            <span style={{ color: accentColors, marginRight: 10 }}>|</span>
            So‘nggi yangiliklar
          </h2>

          <div style={navButtons}>
            <button className="news-prev" style={navBtnStyle}>❮</button>
            <button className="news-next" style={navBtnStyle}>❯</button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{ nextEl: '.news-next', prevEl: '.news-prev' }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {newsData.map((news) => (
            <SwiperSlide key={news.id}>
              <div
                style={{
                  ...cardStyle,
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
                className="news-card"
              >
                {/* IMAGE */}
                <div style={imageWrapper}>
                  <img
                    src={news.image}
                    alt={news.title}
                    loading="lazy"
                    style={imageStyle}
                  />
                  <div
                    style={{
                      ...imgOverlay,
                      background:
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))'
                          : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.85))',
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div style={contentStyle}>
                  <span style={{ ...dateStyle, color: accentColor }}>
                    {news.date}
                  </span>

                  <h3 style={{ ...itemTitle, color: theme.palette.text.primary }}>
                    {news.title}
                  </h3>

                  <a
                    href="#"
                    style={{ ...linkStyle, color: accentColor }}
                  >
                    Batafsil o‘qish →
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* CSS */}
      <style>{`
        .news-card {
          transition: all 0.3s ease;
        }
        .news-card:hover {
          transform: translateY(-6px);
          border-color: ${accentColor};
        }
      `}</style>
    </div>
  );
};

/* ===== STILLAR ===== */

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px',
};

const sectionTitle = {
  fontSize: '26px',
  fontWeight: 700,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
};

const navButtons = { display: 'flex', gap: 12 };

const navBtnStyle = {
  background: 'transparent',
  border: '1px solid #333',
  color: '#888',
  width: 40,
  height: 40,
  borderRadius: '50%',
  cursor: 'pointer',
};

const cardStyle = {
  borderRadius: 14,
  overflow: 'hidden',
  border: '1px solid',
};

const imageWrapper = {
  position: 'relative',
  width: '100%',
  height: 220,
  overflow: 'hidden',
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const imgOverlay = {
  position: 'absolute',
  inset: 0,
};

const contentStyle = {
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const dateStyle = {
  fontSize: 12,
  fontWeight: 600,
};

const itemTitle = {
  fontSize: 18,
  margin: 0,
  fontWeight: 600,
  lineHeight: 1.4,
};

const linkStyle = {
  marginTop: 6,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};

export default TwoNews;
