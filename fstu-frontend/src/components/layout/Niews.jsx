import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import { useEffect, useMemo, useRef, useState } from "react";

const news = [
  {
    title:
      "Dasturlash bo‘yicha chempggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggionat yakunlandi: Markaziy Osiyo g'olibi aniqlandi",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    date: "05 May, 2025",
  },
  {
    title:
      "Sun’iy intellekt markazi rasman ishga tushdi va butun O‘zbekiston uchun xizmat qiladi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title:
      "Talabalar uchun yangi stipendiya e’lon qilindi, shartlar soddalashtirildi",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
  {
    title:
      "Sun’iy intellekt markazi rasman ishga tushdi va butun O‘zbekiston uchun xizmat qiladi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title:
      "Talabalar uchun yangi stipendiya e’lon qilindi, shartlar soddalashtirildi",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
  {
    title:
      "Sun’iy intellekt markazi rasman ishga tushdi va butun O‘zbekiston uchun xizmat qiladi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title:
      "Talabalar uchun yangi stipendiya e’lon qilindi, shartlar soddalashtirildi",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
  {
    title:
      "Sun’iy intellekt markazi rasman ishga tushdi va butun O‘zbekiston uchun xizmat qiladi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title:
      "Talabalar uchun yangi stipendiya e’lon qilindi, shartlar soddalashtirildi",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
  {
    title:
      "Sun’iy intellekt markazi rasman ishga tushdi va butun O‘zbekiston uchun xizmat qiladi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title:
      "Talabalar uchun yangi stipendiya e’lon qilindi, shartlar soddalashtirildi",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
];

export default function Niewss() {
  const cardRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [cardWidth, setCardWidth] = useState(0);
  const [animate, setAnimate] = useState(true);

  /* head & tail clone */
  const slides = useMemo(
    () => [news[news.length - 1], ...news, news[0]],
    []
  );

  /* RESPONSIVE WIDTH */
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth + 24);
      }
    });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  /* AUTO LOOP */
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => i + 1);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  /* INFINITE RESET */
useEffect(() => {
  if (index === slides.length - 1) {
    // oxirgi klonga yetdi → real 1-index ga qaytamiz
    setTimeout(() => {
      setAnimate(false);
      setIndex(1);
    }, 700);
  }

  if (index === 0) {
    // bosh klonga yetdi → oxirgi real index ga
    setTimeout(() => {
      setAnimate(false);
      setIndex(slides.length - 2);
    }, 700);
  }
}, [index, slides.length]);


useEffect(() => {
  if (!animate) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });
  }
}, [animate]);


  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 8, bgcolor: "#f4f7fb" }}>
      <Typography variant="h4" fontWeight={600}>
        Yangiliklar
      </Typography>
      <Typography color="text.secondary" mb={4}>
        So‘nggi voqealar
      </Typography>

      <Box display="flex" alignItems="center">
        <IconButton onClick={() => setIndex((i) => i - 1)}>
          <ArrowBackIosNew />
        </IconButton>

        <Box overflow="hidden" width="100%">
<Box
  display="flex"
  gap={3}
  alignItems="flex-start"   // ✅ MUHIM
  sx={{
    transform: `translateX(-${index * cardWidth}px)`,
    transition: animate ? "transform 0.7s ease" : "none",
  }}
>


            {slides.map((item, i) => (
              <Card
                key={i}
                ref={i === 1 ? cardRef : null}
                sx={{
                  width: { xs: 260, sm: 300, md: 320 },
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  boxShadow: 4,
                  transition: ".3s",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <Box position="relative">
                  <CardMedia
                    component="img"
                    height="180"
                    image={item.img}
                  />
                  <Box
                    position="absolute"
                    top={10}
                    left={10}
                    bgcolor="rgba(0,0,0,.65)"
                    color="#fff"
                    px={1}
                    py={0.5}
                    borderRadius={1}
                    fontSize={12}
                  >
                    {item.date}
                  </Box>
                </Box>

                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography
                    fontWeight={600}
                    sx={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: "auto", alignSelf: "flex-end" }}
                  >
                    Batafsil
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <IconButton onClick={() => setIndex((i) => i + 1)}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
}
