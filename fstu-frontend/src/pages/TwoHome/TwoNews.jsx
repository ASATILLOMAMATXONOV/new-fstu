import React, { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  IconButton,
  Link as MuiLink,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const TwoNews = () => {
  const theme = useTheme();
  const accent = "#02509eff";

  const newsData = [
    {
      id: 1,
      category: "AT_POLITO",
      title: "PhD Days in Energetica 2025: research, interdisciplinary dialogue and artificial intelligence for the energy transition",
      date: "20.12.2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
      href: "#",
    },
    {
      id: 2,
      category: "RESEARCH & INNOVATION",
      title: "Agriculture and agri-food: Politecnico's contribution for the growth of the sector",
      date: "19.12.2025",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 3,
      category: "RESEARCH & INNOVATION",
      title: "Advanced sensors to increase citizen safety",
      date: "17.12.2025",
      image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 4,
      category: "AT_POLITO",
      title: "A delegation from the city of Nagoya visits PoliTO",
      date: "16.12.2025",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 5,
      category: "RESEARCH & INNOVATION",
      title: "Hydrogen to the Renewable Energy Communities: European project H2SCORE kicks off",
      date: "15.12.2025",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
  ];

  // Swiper uchun barcha yangiliklarni ishlatamiz yoki bir qismini
  const featured = useMemo(() => newsData.slice(0, 3), [newsData]);
  const sideList = useMemo(() => newsData.slice(3), [newsData]);

  const borderCol = theme.palette.divider;

  return (
    <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            pb: 1.5,
            borderBottom: `1px solid ${borderCol}`,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 20, md: 28 },
              fontWeight: 800,
              color: "#02509eff",
            }}
          >
            So'ngi yangiliklar
          </Typography>

          <MuiLink
            href="#"
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 900,
              color: "text.primary",
              fontSize: 13,
              "&:hover": { color: accent },
            }}
          >
            SEE ALL <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </MuiLink>
        </Box>

        {/* CONTENT GRID */}
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
          }}
        >
          {/* LEFT: Swiper Section */}
          <Box sx={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
            {/* Navigation Buttons */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 10,
              }}
            >
              <IconButton
                className="news-prev-btn"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "#000",
                  "&:hover": { bgcolor: "#fff", color: accent },
                  "&.swiper-button-disabled": { opacity: 0.5 },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                className="news-next-btn"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "#000",
                  "&:hover": { bgcolor: "#fff", color: accent },
                  "&.swiper-button-disabled": { opacity: 0.5 },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                nextEl: ".news-next-btn",
                prevEl: ".news-prev-btn",
              }}
              autoplay={{ delay: 5000 }}
              loop={true}
              style={{ width: "100%", height: "100%" }}
            >
              {featured.map((item) => (
                <SwiperSlide key={item.id}>
                  <FeaturedCard item={item} accent={accent} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* RIGHT: List Section */}
          <Stack spacing={3}>
            {sideList.map((item) => (
              <SideRow key={item.id} item={item} accent={accent} borderCol={borderCol} />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

function FeaturedCard({ item, accent }) {
  const theme = useTheme();
  return (
    <Paper
      component="a"
      href={item.href}
      elevation={0}
      sx={{
        display: "block",
        textDecoration: "none",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: accent,
          "& .featured-img": { transform: "scale(1.05)" },
        },
      }}
    >
      <Box sx={{ overflow: "hidden", height: { xs: 250, md: 400 } }}>
        <Box
          className="featured-img"
          sx={{
            height: "100%",
            backgroundImage: `url(${item.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
          }}
        />
      </Box>

      <Box sx={{ p: 3, bgcolor: theme.palette.mode === "light" ? "#f8f9fa" : alpha("#fff", 0.03) }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#02509eff", letterSpacing: 1 }}>
            {item.category}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "divider" }} />
          <Typography sx={{ fontSize: 12,fontWeight: 800, color: "#02509eff" }}>{item.date}</Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontSize: 18,fontWeight: 600, color: "text.primary",  }}>
          {item.title}
        </Typography>
      </Box>
    </Paper>
  );
}

function SideRow({ item, accent, borderCol }) {
  return (
    <Box
      component="a"
      href={item.href}
      sx={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 2,
        textDecoration: "none",
        p: 1,
        borderRadius: 2,
        border: "1px solid transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: borderCol,
          bgcolor: alpha(accent, 0.02),
          "& .side-img": { transform: "scale(1.1)" },
          "& .side-title": { color: accent },
        },
      }}
    >
      <Box sx={{ height: 90, borderRadius: 2, overflow: "hidden" }}>
        <Box
          className="side-img"
          sx={{
            height: "100%",
            backgroundImage: `url(${item.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.4s ease",
          }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#02509eff", mb: 0.5 }}>
          {item.category} • {item.date}
        </Typography>
        <Typography
          className="side-title"
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.2,
            transition: "color 0.2s",
          }}
        >
          {item.title}
        </Typography>
      </Box>
    </Box>
  );
}

export default TwoNews;