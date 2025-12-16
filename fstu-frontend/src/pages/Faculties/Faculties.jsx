import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  useTheme,
} from "@mui/material";

import ComputerIcon from "@mui/icons-material/Computer";
import BoltIcon from "@mui/icons-material/Bolt";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { motion } from "framer-motion";
import logo from "../../assets/images/fakultet-logo/A va Q.png";

/* ================= DATA ================= */
const YOUTUBE_ID = "3J92WpCAaNs";

const faculties = [
     {
    id: 1,
    title: "Mexanika-mashinasozlik fakulteti",
    desc: "Mexanika va mashinasozlik yo‘nalishlari.",
    icon: <ArchitectureIcon />,
    points: ["Bakalavriat", "Magistratura",],
  },
  {
    id: 2,
    title: "Axborot texnologiyalari va telekommunikatsiya fakulteti",
    desc: "Dasturlash, sun’iy intellekt, ma’lumotlar tahlili va zamonaviy IT yo‘nalishlari.",
    icon: <ComputerIcon />,
    points: ["Zamonaviy IT kasblar", "Katta kompaniyalarda stajirovka"],
  },
  {
    id: 3,
    title: "Energetika muhandisligi fakulteti",
    desc: "Elektr energetikasi va qayta tiklanuvchi energiya manbalari.",
    icon: <BoltIcon />,
    points: ["Yashil energiya", "Global loyihalar"],
  },
  {
    id: 4,
    title: "Arxitektura va qurilish fakulteti",
    desc: "Arxitektura, shaharsozlik va qurilish texnologiyalari yo‘nalishlari.",
    icon: <ArchitectureIcon />,
    points: ["Innovatsion texnologiyalar", "Xalqaro tajriba"],
  },
  {
    id: 5,
    title: "Yengil sanoat va to'qimachilik fakulteti",
    desc: "Yengil sanoat va to'qimachilik yo‘nalishlari.",
    icon: <ArchitectureIcon />,
    points: ["Innovatsion texnologiyalar", "Xalqaro tajriba"],
  },
  {
    id: 6,
    title: "Ishlab chiqarishda boshqaruv fakulteti",
    desc: "ishlab chiqarish va sanoat boshqaruvi yo‘nalishlari.",
    icon: <ArchitectureIcon />,
    points: ["Innovatsion texnologiyalar", "Xalqaro tajriba"],
  },
  {
    id: 7,
    title: "Kimyo texnologiya fakulteti",
    desc: "Kimyo texnologiyasi yo‘nalishlari.",
    icon: <ArchitectureIcon />,
    points: ["Innovatsion texnologiyalar", "Xalqaro tajriba"],
  },
 

];

/* ================= ANIMATION ================= */
const AnimatedSection = ({ children, from = "left", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: from === "left" ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

//  ================= SECTION TITLE =================
const SectionTitle = ({ title }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: { xs: 4, md: 6 },
    }}
  >
    <Box sx={{ flex: 1, height: 2, bgcolor: "primary.main" }} />
    <Typography
      fontWeight={600}
      sx={{
        whiteSpace: "nowrap",
        color: "text.primary",
        fontSize: { xs: 14, md: 16 },
      }}
    >
      {title}
    </Typography>
    <Box sx={{ flex: 1, height: 2, bgcolor: "primary.main" }} />
  </Box>
);



/* ================= PAGE ================= */
export default function FacultiesWithVideo() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#fff" }}>
      <Container maxWidth="lg">
   {faculties.map((item, index) => (
  <Box key={item.id}>
    {/* ===== YUQORI SARLAVHA ===== */}
    <SectionTitle title={item.title} />

    <Grid
      container
      spacing={4}
      alignItems="center"
      sx={{ mb: { xs: 8, md: 10 } }}
      direction={{
        xs: "column",
        md: index % 2 === 0 ? "row" : "row-reverse",
      }}
    >
            {/* ===== TEXT ===== */}
            <Grid item xs={12} md={6}>
              <AnimatedSection from="left" delay={0.15}>
                <Box>
                     <Box mb={1}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Universitet logotipi"
                        sx={{
                        height: 100,
                        width: "auto",
                        objectFit: "contain",
                        }}
                    />
                    </Box>


                  <Typography
                    fontWeight={800}
                    fontSize={{ xs: 20, md: 24 }}
                    mb={2}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={15}
                    mb={3}
                    maxWidth={520}
                  >
                    {item.desc}
                  </Typography>

                  <Grid container spacing={1.5} mb={3}>
                    {item.points.map((p, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleIcon color="primary" fontSize="small" />
                          <Typography fontWeight={500}>{p}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>

                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ChevronRightIcon />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Batafsil ma’lumot
                  </Button>
                </Box>
              </AnimatedSection>
            </Grid>




            {/* ===== VIDEO ===== */}
            <Grid item xs={12} md={6}>
              <AnimatedSection from="right" delay={0.25}>
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 220, sm: 280, md: 340 },
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 14px 36px rgba(0,0,0,.15)",
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </Box>
              </AnimatedSection>
            </Grid>
            
          </Grid>
    </Box>
        ))}
      </Container>
    </Box>
  );
}

