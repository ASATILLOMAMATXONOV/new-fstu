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
      title:
        "PhD Days in Energetica 2025: research, interdisciplinary dialogue and artificial intelligence for the energy transition",
      date: "20.12.2025",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
      href: "#",
    },
    {
      id: 2,
      category: "RESEARCH & INNOVATION",
      title:
        "Agriculture and agri-food: Politecnico's contribution for the growth of the sector",
      date: "19.12.2025",
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 3,
      category: "RESEARCH & INNOVATION",
      title: "Advanced sensors to increase citizen safety",
      date: "17.12.2025",
      image:
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 4,
      category: "AT_POLITO",
      title: "A delegation from the city of Nagoya visits PoliTO",
      date: "16.12.2025",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
    {
      id: 5,
      category: "RESEARCH & INNOVATION",
      title:
        "Hydrogen to the Renewable Energy Communities: European project H2SCORE kicks off",
      date: "15.12.2025",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
      href: "#",
    },
  ];

  const featured = useMemo(() => newsData.slice(0, 1), [newsData]);
  const sideList = useMemo(() => newsData.slice(1), [newsData]);

  const borderCol =
    theme.palette.mode === "light"
      ? "rgba(0,0,0,0.12)"
      : "rgba(255,255,255,0.12)";

  const softShadow =
    theme.palette.mode === "light"
      ? "0 16px 38px rgba(0,0,0,0.12)"
      : "0 16px 38px rgba(0,0,0,0.35)";

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
              fontSize: { xs: 26, md: 38 },
              fontWeight: 1000,
              letterSpacing: -0.5,
              color: "text.primary",
            }}
          >
            Poliflash news
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
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: 13,
              "&:hover": { color: accent },
            }}
          >
            SEE ALL <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </MuiLink>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
            alignItems: "start",
          }}
        >
          {/* LEFT: Featured (Swiper) */}
          <Box sx={{ position: "relative" }}>
            {/* nav buttons */}
            <Box
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 5,
                display: "flex",
                gap: 1,
              }}
            >
              <IconButton
                className="newsPrev"
                size="small"
                sx={{
                  bgcolor: alpha("#000", 0.35),
                  color: "#fff",
                  "&:hover": { bgcolor: alpha("#000", 0.5) },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                className="newsNext"
                size="small"
                sx={{
                  bgcolor: alpha("#000", 0.35),
                  color: "#fff",
                  "&:hover": { bgcolor: alpha("#000", 0.5) },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              loop
              autoplay={{ delay: 4200, disableOnInteraction: false }}
              navigation={{ nextEl: ".newsNext", prevEl: ".newsPrev" }}
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              {featured.map((n) => (
                <SwiperSlide key={n.id}>
                  <FeaturedCard
                    theme={theme}
                    accent={accent}
                    shadow={softShadow}
                    borderCol={borderCol}
                    item={n}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* RIGHT: list */}
          <Stack spacing={2}>
            {sideList.map((n) => (
              <SideRow
                key={n.id}
                theme={theme}
                accent={accent}
                borderCol={borderCol}
                item={n}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

function FeaturedCard({ theme, accent, shadow, borderCol, item }) {
  return (
    <Paper
      component="a"
      href={item.href}
      elevation={0}
      sx={{
        display: "block",
        textDecoration: "none",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${borderCol}`,
        boxShadow: shadow,
        bgcolor: theme.palette.background.paper,
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(accent, 0.55),
        },
      }}
    >
      {/* image */}
      <Box
        sx={{
          height: { xs: 220, md: 360 },
          backgroundImage: `url(${item.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* content like screenshot (big grey block) */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2.2, md: 2.6 },
          bgcolor: theme.palette.mode === "light" ? "#f4f6f8" : alpha("#fff", 0.06),
        }}
      >
        {/* ✅ category + date */}
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: theme.palette.text.secondary,
            }}
          >
            {item.category}
          </Typography>

          <Box sx={{ width: 6, height: 6, borderRadius: 99, bgcolor: "divider" }} />

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: theme.palette.text.secondary,
            }}
          >
            {item.date}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: { xs: 18, md: 22 },
            fontWeight: 1000,
            lineHeight: 1.2,
            color: "text.primary",
          }}
        >
          {item.title}
        </Typography>
      </Box>
    </Paper>
  );
}

function SideRow({ theme, accent, borderCol, item }) {
  return (
    <Box
      component="a"
      href={item.href}
      sx={{
        display: "grid",
        gridTemplateColumns: "170px 1fr",
        gap: 2,
        textDecoration: "none",
        alignItems: "start",
        borderRadius: 2,
        transition: "0.2s",
        "&:hover .sideTitle": { color: accent },
        "&:hover .thumb": { transform: "scale(1.03)" },
      }}
    >
      {/* thumb */}
      <Box
        sx={{
          borderRadius: 1.5,
          overflow: "hidden",
          border: `1px solid ${borderCol}`,
          height: 92,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box
          className="thumb"
          sx={{
            height: "100%",
            width: "100%",
            backgroundImage: `url(${item.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "0.25s",
          }}
        />
      </Box>

      {/* text */}
      <Box sx={{ pt: 0.2 }}>
        {/* ✅ category + date */}
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 0.6 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 1000,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: theme.palette.text.secondary,
            }}
          >
            {item.category}
          </Typography>

          <Box sx={{ width: 6, height: 6, borderRadius: 99, bgcolor: "divider" }} />

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: theme.palette.text.secondary,
            }}
          >
            {item.date}
          </Typography>
        </Stack>

        <Typography
          className="sideTitle"
          sx={{
            fontSize: 20,
            fontWeight: 1000,
            lineHeight: 1.2,
            color: "text.primary",
          }}
        >
          {item.title}
        </Typography>
      </Box>
    </Box>
  );
}

export default TwoNews;
