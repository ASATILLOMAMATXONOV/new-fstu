
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import PagesBanner from "../../components/layout/pagesBanner";
import SideMenu from "../../components/layout/SideMenu";


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



/* ================= PAGE ================= */
export default function UniversityManagement() {
  return (
    <>
    <PagesBanner />
    <Box bgcolor="var(--light-gray)">

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
            <SideMenu />
          </Box>

          
        </Stack>
      </Container>
    </Box>
    </>
  );
}
