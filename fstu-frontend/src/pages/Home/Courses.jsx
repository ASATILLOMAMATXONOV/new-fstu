// Fully responsive & structured version
// Improvements:
// - Clear layout order (mobile → desktop)
// - Image/card responsiveness
// - Aside becomes bottom drawer-style on mobile
// - Consistent spacing & typography

import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";



import bannerImg from "../../assets/images/DJI_0025.JPG";

/* ================= DATA ================= */
const leaders = [
  {
    id: 1,
    name: "Salomov O'ktam Rahimovich",
    role: "Farg'ona davlat texnika universiteti rektori",
    img: "https://fstu.uz/admin/uploads/global/rahbariyat/rahbariyat/rektor.webp",
    desc: "Universitet strategiyasi va umumiy rivojlanishiga mas’ul bosh yetakchi.",
    email: "rektor@fstu.uz",
    reception: "Dushanba - Shanba (8:00 - 10:00)",
    phone: "+99873 241-12-06",
  },
  {
    id: 2,
    name: "Jaxongirov Ilimdorjon Jahongirjonovich",
    role: "O‘quv ishlari bo‘yicha prorektor",
    img: "https://fstu.uz/admin/uploads/global/rahbariyat/DSC06838%20%281%29.jpg",
    desc: "O‘quv jarayonlari va ta’lim sifati uchun javobgar.",
    email: "prorektor.oquv@univer.uz",
    reception: "Seshanba - Juma (15:00 - 18:00)",
    phone: "+99873 241-12-10",
  },
  {
    id: 3,
    name: "Davlyatov Shoxrux Muratovich",
    role: "Ilmiy ishlar va innovatsiyalar bo‘yicha prorektor",
    img: "https://fstu.uz/admin/uploads/global/2024/eee/DSC0686211.jpg",
    desc: "Ilmiy tadqiqotlar va innovatsiyalar uchun mas’ul.",
    email: "sh.davlyatov@fstu.uz",
    reception: "Dushanba - Shanba (15:00 - 17:00)",
    phone: "+99873 241-14-10",
  },
    {
    id: 4,
    name: "Dexkanov Sherzod Abdumutalibovich",
    role: "Yoshlar masalalari, ma'naviy-ma'rifiy ishlar bo’yicha birinchi prorektor",
    img: "https://fstu.uz/admin/uploads/global/rahbariyat/DSC06856.jpg",
    desc: "Talabalar va yoshlar siyosati, ma'naviy-ma'rifiy ishlar uchun javobgar.",
    email: "sh.dexqonov@fstu.uz",
    reception: " Dushanba - Shanba (8:00 - 10:00)",
    phone: "+99873 241-13-52",
  },
    {
    id: 5,
    name: "Salimov Abdumajid Abduvoxobovich",
    role: "Moliya, iqtisod ishlar boʼyicha prorektor",
    img: "https://fstu.uz/admin/uploads/global/rahbariyat/rahbariyat/moliya.webp",
    desc: "Moliya va iqtisodiy masalalar bo’yicha javobgar.",
    email: "a.salimov@fstu.uz",
    reception: " Dushanba Payshanba: (14:00 — 18:00)",
    phone: "+99873 241-13-25",
  },
];

/* ================= IMAGE ================= */
const AnimatedImage = ({ src, alt }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{
      duration: 0.4,        // 🔥 sekinroq
      ease: "easeOut",      // 🔥 yumshoq chiqish
    }}
  >
    <Box
      sx={{
        width: { xs: "100%", sm: 250 },
        height: { xs: 260, sm: 300 },
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "var(--light-blue)",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.4s ease-out", // 🔥 img ham silliq
        }}
      />
    </Box>
  </motion.div>
);

/* ================= LEADER CARD ================= */
const LeaderCard = ({ leader }) => (
  <Paper
    sx={{
      p: { xs: 2.5, sm: 4 },
      display: "flex",
      gap: 3,
      flexDirection: { xs: "column", sm: "row" },
      alignItems: "center",
      bgcolor: "var(--card-bg)",
      border: "1px solid var(--border-light)",
      transition: "0.3s",
      '&:hover': {
        borderColor: 'var(--primary-blue)',
        boxShadow: '0 12px 28px rgba(63,104,165,.25)',
      },
    }}
  >
    <AnimatedImage src={leader.img} alt={leader.name} />

    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography fontWeight={900}color="var(--primary-blue)">{leader.name}</Typography>
      <Typography fontWeight={600} >
        {leader.role}
      </Typography>

      <Typography mt={1} color="var(--text-muted)">
        {leader.desc}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={0.7} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        <InfoRow icon={<AccessTimeIcon />} text={leader.reception} />
        <InfoRow icon={<MailOutlineIcon />} text={leader.email} />
        <InfoRow icon={<PhoneIcon />} text={leader.phone} />
      </Stack>
    </Box>
  </Paper>
);

const InfoRow = ({ icon, text }) => (
  <Box display="flex" alignItems="center" gap={1}>
    {icon}
    <Typography variant="body2">{text}</Typography>
  </Box>
);

/* ================= ASIDE ================= */


const quickLinks = [
  { label: "Fakultetlar", to: "/fakultetlar" },
  { label: "Kafedralar", to: "/kafedralar" },
  { label: "Markaz va bo'limlar", to: "/markazlar" },
  { label: "Me'yoriy hujjatlar", to: "/hujjatlar" },
  { label: "Axborot sotlari", to: "/axborot" },
  { label: "Ilm fan 2022", to: "/ilm-fan-2022" },
];

const AsideMenu = () => (
  <Paper
    sx={{
      p: 3,
      bgcolor: "var(--card-bg)",
      border: "1px solid var(--border-light)",
      position: { md: "sticky" },
      top: 120,
      transition: "0.3s",
      "&:hover": {
        borderColor: "var(--primary-blue)",
        boxShadow: "0 12px 28px rgba(63,104,165,.25)",
      },
    }}
  >
    {/* Qidiruv */}
    <Typography fontWeight={800} mb={1.5}>
      Qidiruv
    </Typography>

    <Box sx={{ display: "flex", mb: 3 }}>
      <TextField fullWidth size="small" placeholder="Qidiruv" />
      <Button
        sx={{
          ml: 1,
          minWidth: 44,
          bgcolor: "var(--primary-blue)",
          color: "#fff",
          "&:hover": { bgcolor: "#2f4f8f" },
        }}
      >
        <SearchIcon />
      </Button>
    </Box>

    {/* Tezkor havolalar */}
    <Typography fontWeight={800} mb={1.5}>
      Tezkor havolalar
    </Typography>

    <Stack spacing={0.5} mb={3}>
      {quickLinks.map((item) => (
        <Button
          key={item.to}
          component={Link}
          to={item.to}
          disableRipple
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            borderRadius: 2,
            px: 1.5,
            py: 1.2,
            color: "var(--text-dark)",
            position: "relative",
            overflow: "hidden",

            /* pastki chiziq */
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "0%",
              height: "2px",
              backgroundColor: "var(--primary-blue)",
              transition: "width 0.3s ease",
            },

            "&:hover": {
              color: "var(--primary-blue)",
              backgroundColor: "rgba(63,104,165,0.05)",
            },

            "&:hover::after": {
              width: "100%",
            },

            /* icon animatsiya */
            "& svg": {
              opacity: 0,
              transform: "translateX(-6px)",
              transition: "0.3s",
            },

            "&:hover svg": {
              opacity: 1,
              transform: "translateX(0)",
            },
          }}
        >
          {item.label}
          <ChevronRightIcon />
        </Button>
      ))}
    </Stack>

    {/* Interaktiv xizmatlar */}
    <Typography fontWeight={800} mb={1.5}>
      Interaktiv xizmatlar
    </Typography>

    <Button
      fullWidth
      component={Link}
      to="/housing-application"
      endIcon={<ChevronRightIcon />}
      sx={{
        justifyContent: "space-between",
        textTransform: "none",
        borderRadius: 2,
        px: 2,
        py: 1.4,
        fontWeight: 600,
        bgcolor: "rgba(63,104,165,0.08)",
        color: "var(--primary-blue)",
        "&:hover": {
          bgcolor: "rgba(63,104,165,0.15)",
        },
      }}
    >
      Talabalar turar joyi uchun ariza berish
    </Button>
  </Paper>
);







/* ================= PAGE ================= */
export default function UniversityManagement() {
  return (
    <Box bgcolor="var(--light-gray)">

      {/* ===== BANNER / HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "20vh", md: "50vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            overflow: "hidden",

            /* 🔒 BACKGROUND IMAGE — QIMIRLAMAYDI */
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(0,0,0,0.55),
                rgba(0,0,0,0.35)
              ),
              url(${bannerImg})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* ===== FLOATING DECOR ELEMENTS ===== */}

          {/* O‘NG TOMON KATTA */}
          <motion.div
            animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-25%",
                right: "-15%",
                width: 320,
                height: 320,
                bgcolor: "var(--light-blue)",
                opacity: 0.2,
                borderRadius: "50%",
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* CHAP PAST */}
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: "-30%",
                left: "-20%",
                width: 260,
                height: 260,
                bgcolor: "var(--primary-blue)",
                opacity: 0.18,
                borderRadius: "50%",
                filter: "blur(22px)",
              }}
            />
          </motion.div>

          {/* KICHIK FLOAT */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "30%",
                left: "18%",
                width: 90,
                height: 90,
                bgcolor: "#fff",
                opacity: 0.12,
                borderRadius: "50%",
              }}
            />
          </motion.div>

          {/* ===== CONTENT ===== */}
          <Box sx={{ position: "relative", zIndex: 2, px: 2 }}>
            {/* ICON */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <AccountBalanceIcon
                sx={{
                  fontSize: { xs: 44, md: 56 },
                  mb: 2,
                }}
              />
            </motion.div>

            {/* TITLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: 1,
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                }}
              >
                Universitet Rahbariyati
              </Typography>
            </motion.div>

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography
                sx={{
                  mt: 1.5,
                  color: "var(--light-gray)",
                  maxWidth: 600,
                  mx: "auto",
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                }}
              >
                Boshqaruv kengashining asosiy a’zolari
              </Typography>
            </motion.div>
          </Box>
        </Box>
      </motion.div>




      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={5}
          alignItems="flex-start"
        >
          <Box flex={1} order={{ xs: 1, md: 1 }}>
            <Stack spacing={4}>
              {leaders.map(l => (
                <LeaderCard key={l.id} leader={l} />
              ))}
            </Stack>
          </Box>

          <Box width={{ xs: '100%', md: 300 }} order={{ xs: 2, md: 2 }}>
            <AsideMenu />
          </Box>

          
        </Stack>
      </Container>
    </Box>
  );
}
