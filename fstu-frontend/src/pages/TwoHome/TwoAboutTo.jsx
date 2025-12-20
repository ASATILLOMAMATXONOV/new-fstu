import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircleOutline } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";

const admissionFeatures = [
  { title: "Bakalavriat ta’lim yo‘nalishlari", link: "https://fstu.uz/uz/page/bakalavriat" },
  { title: "Magistratura mutaxassisliklari", link: "https://fstu.uz/uz/page/magistratura" },
  { title: "Sirtqi va masofaviy ta’lim", link: "https://fstu.uz/uz/page/sirtqi-talim" },
  { title: "Davlat grantlari va to‘lov-kontrakt", link: "https://fstu.uz/uz/page/qabul" },
  { title: "Xalqaro ta’lim dasturlari", link: "https://fstu.uz/uz/page/xalqaro-aloqalar" },
  { title: "Iqtidorli talabalar uchun stipendiyalar", link: "https://fstu.uz/uz/page/stipendiyalar" },
];

const TwoAboutTo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default, // 🔑 FAQAT RANG
        py: { xs: 6, md: 14 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 6, md: 10 },
          }}
        >
          {/* LEFT CONTENT */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ width: 35, height: 2, bgcolor: '#ff7a00' }} />
                <Typography
                  sx={{
                    color: '#ff7a00',
                    fontWeight: 800,
                    letterSpacing: 2,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  FSTU
                </Typography>
              </Stack>

              <Typography
                sx={{
                  color: theme.palette.text.primary, // 🔑
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '4rem' },
                  lineHeight: 1.1,
                  mb: 3,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Farg‘ona davlat <br />
                <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
                  texnika universiteti
                </span>
              </Typography>

              <Typography
                sx={{
                  color: theme.palette.text.secondary, // 🔑
                  fontSize: '1.05rem',
                  mb: 5,
                  maxWidth: 520,
                  lineHeight: 1.8,
                }}
              >
                Farg‘ona davlat texnika universiteti olinadigan bilim va amaliy
                ko‘nikmalarni birlashtirgan oliy ta’lim muassasasidir. Bu yerda
                talabalar mustahkam akademik bazaga ega bo‘lib, zamonaviy ilm-fan
                va innovatsiyalar yo‘nalishlarida bilim olishadi hamda murakkab
                dunyoda muvaffaqiyatli faoliyat yuritish uchun zarur
                ko‘nikmalarni egallaydilar.
              </Typography>

              {/* FEATURES */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  rowGap: 2,
                  columnGap: 2,
                  mb: 6,
                  width: '100%',
                }}
              >
                {admissionFeatures.map((item, index) => (
                  <Box
                    key={index}
                    component={motion.a}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: { xs: '100%', sm: 'calc(50% - 16px)' },
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover .feature-text': {
                        color: '#ff7a00',
                        fontWeight: 600,
                      },
                      '&:hover .check-icon': {
                        transform: 'scale(1.2)',
                        color: '#ff7a00',
                      },
                    }}
                  >
                    <CheckCircleOutline
                      className="check-icon"
                      sx={{
                        color: '#ff7a00',
                        mr: 1.5,
                        transition: 'all 0.3s ease',
                      }}
                    />

                    <Typography
                      className="feature-text"
                      sx={{
                        color: theme.palette.text.primary, // 🔑
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* RIGHT IMAGE (TEGILMAGAN) */}
          <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 60 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{ position: 'relative' }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '-3%', md: '-6%' },
                  bgcolor: '#ff7a00',
                  clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  zIndex: 0,
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  height: { xs: 260, sm: 360, md: 540 },
                  overflow: 'hidden',
                  clipPath: { xs: 'none', md: 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)' },
                  boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
                  alt="University"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: '1s',
                    '&:hover': { transform: 'scale(1.08)' },
                  }}
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TwoAboutTo;
