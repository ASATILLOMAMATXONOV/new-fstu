
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";

// Icons
import EventIcon from "@mui/icons-material/Event";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import CampaignIcon from "@mui/icons-material/Campaign";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


// ================= DATA =================
const mainCategories = [
  { key: "event", label: "TADBIRLAR", icon: <EventIcon /> },
  { key: "news", label: "YANGILIKLAR", icon: <NewspaperIcon /> },
  { key: "announce", label: "E'LONLAR", icon: <CampaignIcon /> },
];

const DATA = [
  {
    title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
    type: "news",
    date: "01 Sentyabr",
    img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
  },
  {
    title: "Yangilik 2: Texnologik innovatsiyalar va zamonaviy ta'lim tendensiyalari haqida konferensiya o'tkazildi",
    type: "news",
    date: "02 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Yangi talabalar uchun qabul jarayonlari boshlanishi va kerakli hujjatlar ro'yxati",
    type: "news",
    date: "04 Sentyabr",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53460aa9",
  },
  {
    title: "Professor-o'qituvchilarning xalqaro grantlarda ishtiroki. Bu matn ancha uzunroq. Qani endi bu qanday ko'rinish berar ekan.",
    type: "news",
    date: "05 Sentyabr",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
  },
  {
    title: "Kelajak kasblari: Dasturlash va sun'iy intellekt bo'yicha seminar",
    type: "event",
    date: "08 Sentyabr",
    img: "https://images.unsplash.com/photo-1547484279-91896173041a",
  },
  {
    title: "Universitet miqyosida sport musobaqalari: Final bosqichi",
    type: "event",
    date: "10 Sentyabr",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  },
  {
    title: "Iqtidorli talabalarga maxsus stipendiya e'lon qilindi",
    type: "announce",
    date: "12 Sentyabr",
    img: "https://images.unsplash.com/photo-1521737609972-5b927a7c9d92",
  },
  {
    title: "Axborot texnologiyalari fakulteti uchun yangi laboratoriya ochilishi",
    type: "announce",
    date: "15 Sentyabr",
    img: "https://images.unsplash.com/photo-1526676101235-5152a4659b85",
  },
];

// ================= STYLES =================
const PRIMARY_BLUE = "#3f68a5";
const SECONDARY_ACCENT = "#6edbfc";
const BORDER_COLOR = "#0359ca";


const navBtn = (pos) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [pos]: { xs: 5, md: -40 },
  minWidth: 40,
  height: 40,
  zIndex: 10,
  bgcolor: PRIMARY_BLUE,
  color: "#fff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    bgcolor: SECONDARY_ACCENT,
    color: PRIMARY_BLUE,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
  },
  display: { xs: "none", sm: "flex" },
  borderRadius: 8,
});

const dateBadge = {
  position: "absolute",
  bottom: 0,
  left: 0,
  bgcolor: "rgba(0, 0, 0, 0.7)",
  color: "#fff",
  px: 1.5,
  py: 0.8,
  borderTopRightRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

// ================= COMPONENT =================
export default function HorizontalSliderFinal() {
  const [active, setActive] = useState("news");
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  // Mouse Drag Logic
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  // Avtomatik slaydni to'xtatish uchun state
  const [isScrolling, setIsScrolling] = useState(false);

  const baseItems = DATA.filter(
    (i) => i.type?.trim().toLowerCase() === active
  );

  const originalItemCount = baseItems.length;
  let items = [...baseItems];
  let copiesCount = 1; 

  if (originalItemCount > 0) {
      if (originalItemCount < 5) {
          items = [...baseItems, ...baseItems, ...baseItems];
          copiesCount = 3;
      } else {
          items = [...baseItems, ...baseItems];
          copiesCount = 2;
      }
  }

  const canSlide = originalItemCount > 1;

  // Karta kengligi + gap funksiyasi
  const getCardWidthWithGap = useCallback(() => {
    const currentWidth = window.innerWidth;
    const cardWidth = 
      currentWidth < 600 ? 260 :
      currentWidth < 900 ? 280 : 300;
    const gap = 24; 
    return cardWidth + gap;
  }, []);

  // ==================== SLIDE MEXANIZMI ====================
  const slide = useCallback((dir) => {
    if (!sliderRef.current || !canSlide) return;

    setIsScrolling(true); 

    sliderRef.current.scrollBy({
      left: dir === "left" ? -getCardWidthWithGap() : getCardWidthWithGap(),
      behavior: "smooth",
    });
  }, [canSlide, getCardWidthWithGap]);


  // ==================== CHEKSIZ AYLAMA (LOOP) LOGIKASI ====================
  useEffect(() => {
    if (!canSlide) return;
    const el = sliderRef.current;
    if (!el) return;

    const itemWidth = getCardWidthWithGap();
    const firstCopyEnd = originalItemCount * itemWidth;
    const secondCopyEnd = firstCopyEnd * 2;


    const checkAndReset = () => {
        if (!el) return;

        let resetNeeded = false;
        let newScrollLeft = el.scrollLeft;

        // ➡️ O'ngga harakat: Ikkinchi nusxaning boshiga yetganda (agar 3 nusxa bo'lsa)
        if (copiesCount > 2 && el.scrollLeft >= secondCopyEnd - itemWidth * 0.1) {
             // 2-nusxaning boshiga (1-nusxaning oxiriga) o'tish
            newScrollLeft = el.scrollLeft - firstCopyEnd; 
            resetNeeded = true;
        } 
        // ➡️ O'ngga harakat: Birinchi nusxaning oxiriga yetganda (agar 2 nusxa bo'lsa)
        else if (copiesCount <= 2 && el.scrollLeft >= firstCopyEnd - itemWidth * 0.1) {
             // 1-nusxaning boshiga (asl qismning boshiga) o'tish
             newScrollLeft = el.scrollLeft - firstCopyEnd; 
             resetNeeded = true;
        }
        
        // ⬅️ Chapga harakat: Birinchi nusxaning boshiga yaqinlashganda
        else if (el.scrollLeft < firstCopyEnd - itemWidth * 0.9) { 
            // 2-nusxaning boshiga o'tish
            newScrollLeft = el.scrollLeft + firstCopyEnd;
            resetNeeded = true;
        }

        if (resetNeeded) {
            el.style.scrollBehavior = 'auto';
            el.scrollLeft = newScrollLeft;
            requestAnimationFrame(() => {
                if (el) el.style.scrollBehavior = 'smooth';
            });
        }
        
        setIsScrolling(false);
    };


    const onScroll = () => {
        clearTimeout(el.scrollTimeout);
        el.scrollTimeout = setTimeout(checkAndReset, 50); 
        
        if (!isScrolling) setIsScrolling(true);
    };

    el.addEventListener("scroll", onScroll);
    return () => {
        el.removeEventListener("scroll", onScroll);
        clearTimeout(el.scrollTimeout);
    };
  }, [canSlide, originalItemCount, getCardWidthWithGap, items.length, isScrolling, copiesCount]);


  // ==================== AVTO SLIDER (4 sekundda bir) ====================
  useEffect(() => {
    if (!canSlide || isScrolling) return; 
    
    const timer = setInterval(() => slide("right"), 4000); 
    
    return () => clearInterval(timer);
  }, [active, canSlide, slide, isScrolling]);


  // ==================== BIRINCHI O'RNATISH (RESET) ====================
  useEffect(() => {
    if (sliderRef.current && originalItemCount > 0) {
        const itemWidth = getCardWidthWithGap();
        const startPosition = originalItemCount * itemWidth; 
        
        const el = sliderRef.current;

        el.style.scrollBehavior = 'auto';
        el.scrollLeft = startPosition;
        
        const timer = setTimeout(() => {
            if (el) {
                el.style.scrollBehavior = 'smooth';
            }
        }, 100); 
        
        return () => clearTimeout(timer);
    }
  }, [active, originalItemCount, getCardWidthWithGap]);


  // Handle Drag Events
  const handleMouseDown = (e) => {
    if (!sliderRef.current || !canSlide) return;
    isDown.current = true;
    sliderRef.current.style.scrollBehavior = 'auto';
    setIsScrolling(true);

    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
      if (isDown.current) setIsScrolling(false);
      isDown.current = false;
      if (sliderRef.current) sliderRef.current.style.scrollBehavior = 'smooth';
  }
  const handleMouseUp = () => {
      if (isDown.current) setIsScrolling(false);
      isDown.current = false;
      if (sliderRef.current) sliderRef.current.style.scrollBehavior = 'smooth';
  }
  const handleMouseMove = (e) => {
    if (!isDown.current || !sliderRef.current || !canSlide) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };


  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#f6f9ff" }}>
      {/* HEADER */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 6 } }}>
        <Typography
          variant="h3" 
          component="h2"
          fontWeight={900}
          color={PRIMARY_BLUE}
          sx={{ 
            fontSize: { xs: 26, sm: 36, md: 24}, 
            mb: 1, 
            letterSpacing: 1.5 
          }}
        >
          {mainCategories.find((c) => c.key === active)?.label}
        </Typography>

        <Typography variant="body1" color="#666">
          Universitetimizning so‘nggi voqealari va xabarlari
        </Typography>
      </Box>
      {/* CATEGORIES */}
      <Box display="flex" gap={1} justifyContent="center" mb={6} flexWrap="wrap">
        {mainCategories.map((cat) => (
          <Button
            key={cat.key}
            startIcon={cat.icon}
            onClick={() => setActive(cat.key)}
            sx={{
              p: { xs: "8px 16px", sm: "10px 20px" },
              bgcolor: active === cat.key ? PRIMARY_BLUE : "transparent",
              color: active === cat.key ? "#fff" : PRIMARY_BLUE,
              border: `2px solid ${active === cat.key ? PRIMARY_BLUE : "#ddd"}`,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: active === cat.key ? PRIMARY_BLUE : "#e0e0e0",
                color: active === cat.key ? "#fff" : PRIMARY_BLUE,
              },
            }}
          >
            {cat.label}
          </Button>
        ))}
      </Box>

      {/* SLIDER CONTAINER */}
      <Box sx={{ position: "relative", maxWidth: 1280, mx: "auto" }}>
        {/* Navigatsiya Tugmalari */}
        {canSlide && (
          <>
            <Button onClick={() => slide("left")} sx={navBtn("left")}>
              <ArrowBackIosIcon fontSize="small" />
            </Button>
            <Button onClick={() => slide("right")} sx={navBtn("right")}>
              <ArrowForwardIosIcon fontSize="small" />
            </Button>
          </>
        )}

        {/* DRAG + SCROLL AREA */}
        <Box
          ref={sliderRef}
          sx={{
            display: "flex",
            gap: 3,
            px: 2,
            pb: 4,
            // BALANDLIKNI MATNGA MOSLASH UCHUN MUHIM:
            alignItems: "flex-start", 
            
            overflowX: canSlide ? "auto" : "hidden",
            scrollBehavior: "smooth", 
            scrollSnapType: "x mandatory",
            cursor: (isDown.current && canSlide) ? "grabbing" : (canSlide ? "grab" : "default"), 
            userSelect: "none",
            "&::-webkit-scrollbar": { display: "none" },
            "& .MuiCard-root:hover .card-image": {
                transform: "none",
            },
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {items.map((item, i) => (
            <Card
              key={i}
              sx={{
                width: { xs: 260, sm: 280, md: 300 },
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                scrollSnapAlign: "start",
                borderRadius: 3,
                transition: "box-shadow 0.3s ease", 
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {/* IMAGE CONTAINER */}
              <Box sx={{ height: 180, overflow: "hidden", position: "relative" }}>
                <Box
                  className="card-image"
                  sx={{
                    height: "100%",
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform .5s ease", 
                  }}
                />
                <Box sx={dateBadge}>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {item.date}
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)'
                }} />
              </Box>

              {/* CONTENT */}
              {/* flexGrow: 1 CardContent ni matn uzunligiga qarab cho'zadi va CardActionsni pastga itaradi */}
              <CardContent sx={{ flexGrow: 1, p: 2 }}> 
                <Typography
                  fontWeight={700}
                  fontSize={16}
                  color={PRIMARY_BLUE}
                  sx={{
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </Typography>
              </CardContent>

              <Divider />

              {/* ACTION */}
              <CardActions sx={{ p: 1.5, justifyContent: "flex-end" }}>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/${active}/details/${i % originalItemCount}`)} 
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: PRIMARY_BLUE,
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: SECONDARY_ACCENT,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Batafsil
                </Button>
              </CardActions>
            </Card>
          ))}
          {/* Faqat 1 ta element bo'lsa */}
          {!canSlide && originalItemCount === 1 && (
            <Card
              sx={{
                width: { xs: 260, sm: 280, md: 300 },
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* IMAGE CONTAINER */}
              <Box sx={{ height: 180, overflow: "hidden", position: "relative" }}>
                <Box
                  className="card-image"
                  sx={{
                    height: "100%",
                    backgroundImage: `url(${baseItems[0].img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform .5s ease",
                    "&:hover": {
                        transform: "none",
                    }
                  }}
                />
                <Box sx={dateBadge}>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {baseItems[0].date}
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)'
                }} />
              </Box>
              {/* CONTENT */}
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography fontWeight={700} fontSize={16} color={PRIMARY_BLUE} lineHeight={1.4}>
                  {baseItems[0].title}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 1.5, justifyContent: "flex-end" }}>
                <Button variant="text" endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/${active}/details/0`)} sx={{ textTransform: "none", fontWeight: 600, color: PRIMARY_BLUE }}>
                  Batafsil
                </Button>
              </CardActions>
            </Card>
          )}

          {/* Elementlar yo'q bo'lsa */}
          {originalItemCount === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
              <Typography variant="h6" color="#999">Hozircha {mainCategories.find((c) => c.key === active)?.label} mavjud emas.</Typography>
            </Box>
          )}
        </Box>

        {/* VIEW ALL BUTTON */}
        {originalItemCount > 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
              bgcolor: PRIMARY_BLUE,
              color: "#fff",
              fontWeight: 700,
              p: "10px 30px",
              borderRadius: 50,
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                  bgcolor: SECONDARY_ACCENT,
                  color: BORDER_COLOR,
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              },
              }}
              onClick={() => navigate(`/${active}`)}
            >
              Barcha {mainCategories.find((c) => c.key === active)?.label}ni ko‘rish
            </Button>
            </Box>
        )}
      </Box>
    </Box>
  );
}