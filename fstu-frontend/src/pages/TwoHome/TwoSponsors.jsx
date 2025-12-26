import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { useTheme } from '@mui/material/styles';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const TwoSponsors = () => {
  const theme = useTheme();
  const accentColor = '#02509eff';

  const sponsors = [
    { id: 1, name: "Artel", logo: "https://fstu.uz/uploads/links/Wg3EBm8fBP.png", link: "https://artelgroup.org" },
    { id: 2, name: "Uztelecom", logo: "https://fstu.uz/uploads/links/p1_eMIqu7W.png", link: "https://uztelecom.uz" },
    { id: 3, name: "IT Park", logo: "https://fstu.uz/uploads/links/Ih03Fyo4pg.webp", link: "https://it-park.uz" },
    { id: 4, name: "PayMe", logo: "https://fstu.uz/uploads/links/gRXN_OGJ3i.webp", link: "https://payme.uz" },
    { id: 5, name: "Huawei", logo: "https://fstu.uz/uploads/links/XfoBaqKjlL.webp", link: "https://huawei.com" },
    { id: 6, name: "Artel 2", logo: "https://fstu.uz/uploads/links/Wg3EBm8fBP.png", link: "#" },
    { id: 7, name: "Uztelecom 2", logo: "https://fstu.uz/uploads/links/p1_eMIqu7W.png", link: "#" },
  ];

  return (
    <div
      style={{
        ...sectionWrapper,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <div style={container}>
        <div style={headerBox} className="fade-in">
          <h2
            style={{
              ...sectionTitle,
              color: theme.palette.text.primary,
            }}
          >
            Foydali havolalar
          </h2>
          <div
            style={{
              ...underline,
              backgroundColor: accentColor,
            }}
          />
        </div>

        <Swiper
          modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop
          speed={3000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false, // ❌ shadow yo‘q
          }}
          className="sponsors-coverflow-slider"
          style={swiperContainerStyle}
        >
          {sponsors.map((sponsor) => (
            <SwiperSlide key={sponsor.id} style={swiperSlideStyle}>
              <a
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="logo-card-coverflow"
                style={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="sponsor-img-coverflow"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        /* LINEAR HARAKAT */
        .sponsors-coverflow-slider .swiper-wrapper {
          transition-timing-function: linear !important;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sponsors-coverflow-slider .swiper-slide {
          width: 280px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* CARD – FAQAT BORDER */
        .logo-card-coverflow {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${theme.palette.divider};
          border-radius: 20px;
          height: 100%;
          width: 100%;
          text-decoration: none;
          transition: border-color 0.3s, transform 0.3s;
        }

        .logo-card-coverflow:hover {
          border-color: ${accentColor};
          transform: scale(1.05);
          z-index: 10;
        }

        .sponsor-img-coverflow {
          max-width: 70%;
          max-height: 80px;
          object-fit: contain;
          transition: all 0.4s ease;
        }

        @media (max-width: 768px) {
          .sponsors-coverflow-slider .swiper-slide {
            width: 200px;
            height: 110px;
          }
        }
      `}</style>
    </div>
  );
};

/* === STILLAR (O‘ZGARMAGAN) === */

const sectionWrapper = {
  padding: '10px 0',
  overflow: 'hidden',
  fontFamily: 'Inter, sans-serif',
};

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerBox = {
  textAlign: 'center',
  marginBottom: '50px',
};

const sectionTitle = {
  fontSize: '24px',
  fontWeight: '800',
  margin: '0 0 15px 0',
  textTransform: 'uppercase',
};

const underline = {
  width: '80px',
  height: '4px',
  margin: '0 auto',
  borderRadius: '2px',
};

const swiperContainerStyle = {
  width: '100%',
  padding: '40px 0',
};

const swiperSlideStyle = {
  background: 'transparent',
};

export default TwoSponsors;
