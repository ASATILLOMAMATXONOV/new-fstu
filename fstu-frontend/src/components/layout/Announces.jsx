import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  CardContent,
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
    title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
    type: "news",
    date: "02 Sentyabr",
    img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
  },
  {
    title: "Yangilik 2",
    type: "news",
    date: "03 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
    type: "news",
    date: "02 Sentyabr",
    img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
  },
  {
    title: "Yangilik 2",
    type: "news",
    date: "03 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
    type: "news",
    date: "02 Sentyabr",
    img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
  },
  {
    title: "Yangilik 2",
    type: "news",
    date: "03 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
    type: "news",
    date: "02 Sentyabr",
    img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
  },
  {
    title: "Yangilik 2",
    type: "news",
    date: "03 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 1",
    type: "event",
    date: "05 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 2",
    type: "event",
    date: "07 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 1",
    type: "event",
    date: "05 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 2",
    type: "event",
    date: "07 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 1",
    type: "event",
    date: "05 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "Tadbir 2",
    type: "event",
    date: "07 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 1",
    type: "announce",
    date: "10 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 2",
    type: "announce",
    date: "12 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 1",
    type: "announce",
    date: "10 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 2",
    type: "announce",
    date: "12 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 1",
    type: "announce",
    date: "10 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    title: "E'lon 2",
    type: "announce",
    date: "12 Sentyabr",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
];

// ================= COMPONENT =================
export default function HorizontalSliderFinal() {
  const [active, setActive] = useState("news");
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const items = DATA.filter(
    (i) => i.type?.trim().toLowerCase() === active
  );

  const canSlide = items.length > 1;

  const getCardWidth = () =>
    window.innerWidth < 600 ? 280 :
    window.innerWidth < 900 ? 300 : 320;

  // ===== ARROW SLIDE =====
  const slide = (dir) => {
    if (!sliderRef.current || !canSlide) return;

    sliderRef.current.scrollBy({
      left: dir === "left" ? -getCardWidth() : getCardWidth(),
      behavior: "smooth",
    });
  };

  // ===== AUTO SLIDER =====
  useEffect(() => {
    if (!canSlide) return;
    const timer = setInterval(() => slide("right"), 4000);
    return () => clearInterval(timer);
  }, [active]);

  // ===== LOOP (INFINITE) =====
  useEffect(() => {
    if (!canSlide) return;
    const el = sliderRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollLeft = 0;
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [active, canSlide]);

  return (
    <Box sx={{ py: 8, bgcolor: "#f6f9ff" }}>
      {/* HEADER */}
      <Typography align="center" fontSize={26} fontWeight={800}>
        {mainCategories.find((c) => c.key === active)?.label}
      </Typography>

      <Typography align="center" mb={4} color="#666">
        So‘nggi voqealar
      </Typography>

      {/* CATEGORIES */}
      <Box display="flex" gap={2} justifyContent="center" mb={4} flexWrap="wrap">
        {mainCategories.map((cat) => (
          <Button
            key={cat.key}
            startIcon={cat.icon}
            onClick={() => setActive(cat.key)}
            sx={{
              bgcolor: active === cat.key ? "#3f68a5" : "transparent",
              color: active === cat.key ? "#fff" : "#333",
              border: "1px solid #ddd",
              fontWeight: 600,
            }}
          >
            {cat.label}
          </Button>
        ))}
      </Box>

      {/* SLIDER */}
      <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
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

        {/* DRAG + SCROLL */}
        <Box
          ref={sliderRef}
          sx={{
            display: "flex",
            gap: 3,
            px: 2,
            pb: 3,
            alignItems: "flex-start",
            overflowX: canSlide ? "auto" : "hidden",
            scrollBehavior: "smooth",
            scrollSnapType: "x mandatory",
            cursor: isDown.current ? "grabbing" : "grab",
            userSelect: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
          onMouseDown={(e) => {
            isDown.current = true;
            startX.current = e.pageX - sliderRef.current.offsetLeft;
            scrollLeft.current = sliderRef.current.scrollLeft;
          }}
          onMouseLeave={() => (isDown.current = false)}
          onMouseUp={() => (isDown.current = false)}
          onMouseMove={(e) => {
            if (!isDown.current) return;
            const x = e.pageX - sliderRef.current.offsetLeft;
            const walk = (x - startX.current) * 1.2;
            sliderRef.current.scrollLeft = scrollLeft.current - walk;
          }}
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
                border: "1px solid #e0e0e0",
                "&:hover .card-image": {
                  transform: "scale(1.08) translateY(-4px)",
                },
              }}
            >
              {/* IMAGE */}
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
                  <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {item.date}
                </Box>
              </Box>

              {/* CONTENT */}
              <CardContent sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  fontWeight={700}
                  mb={2}
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </Typography>

              <Button
  variant="text"
  endIcon={<ArrowForwardIcon />}
  onClick={() => navigate(`/${active}`)}
  sx={{
    // mt: "auto",
    p: 0,
    minWidth: "unset",
    alignSelf: "flex-start",
    textTransform: "none",
    fontWeight: 600,
    color: "#3f68a5",
    position: "relative",

    // ⬇️ underline (yashirin holat)
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: -2,
      width: "0%",
      height: "2px",
      backgroundColor: "#3f68a5",
      transition: "width 0.3s ease",
    },

    // ⬅️➡️ icon animatsiya
    "& .MuiButton-endIcon": {
      marginLeft: "6px",
      transition: "transform 0.3s ease",
    },

    // ✅ HOVER
    "&:hover": {
      backgroundColor: "transparent",

      "&::after": {
        width: "100%", // ✅ chiziq o‘ngga chiqadi
      },

      "& .MuiButton-endIcon": {
        transform: "translateX(6px)", // ✅ icon siljiydi
      },
    },
  }}
>
  Batafsil
</Button>

              </CardContent>
            </Card>
          ))}
        </Box>

        {/* VIEW ALL */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 600, textTransform: "none" }}
            onClick={() => navigate(`/${active}`)}
          >
            Barchasini ko‘rish
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ================= STYLES =================
const navBtn = (pos) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [pos]: { xs: 5, md: -40 },
  minWidth: 40,
  height: 40,
  zIndex: 10,
});

const dateBadge = {
  position: "absolute",
  top: 10,
  right: 10,
  bgcolor: "#fff",
  px: 1,
  py: 0.5,
  borderRadius: 1,
  fontSize: 12,
  display: "flex",
  alignItems: "center",
};
