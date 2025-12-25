import React, { useState } from "react";
import { 
  useTheme, useMediaQuery, Box, Typography, Container, 
  IconButton, Stack, Divider 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, Quote, Instagram, Facebook, 
  Twitter, Linkedin, Send, Clock, 
} from "lucide-react";

import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoFooter from "../../pages/TwoHome/TwoFooter";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import ColorModeProvider from "../../components/theme/ColorModeContext";

// Rasmlar
import RektorImg from "../../assets/images/mamuriyat/rektor.webp";
import P1 from "../../assets/images/mamuriyat/p1.jpg";
import P2 from "../../assets/images/mamuriyat/p2.jpg";
import P3 from "../../assets/images/mamuriyat/p3.jpg";
import P4 from "../../assets/images/mamuriyat/p4.webp";

const administrationData = [
  {
    id: 1,
    name: "Salomov O'ktam Rahimovich",
    role: "Universitet Rektori",
    speech: "Bizning maqsadimiz — nafaqat bilim berish, balki talabalarni global texnologik kelajakning haqiqiy ijodkorlariga aylantirishdir.",
    image: RektorImg,
    email: "rektor@fstu.uz",
    phone: "+99873 241-12-06",
    reception: "Har haftaning chorshanba kuni (15:00 – 17:00)",
    socials: [
      { icon: <Instagram />, color: "#E1306C", link: "#" },
      { icon: <Facebook />, color: "#1877F2", link: "#" },
      { icon: <Linkedin />, color: "#0077B5", link: "#" },
      { icon: <Send />, color: "#229ED9", link: "#" }
    ]
  },
  {
    id: 2,
    name: "Jaxongirov Ilimdorjon Jahongirjonovich",
    role: "O'quv ishlari bo'yicha prorektor",
    speech: "Ta'lim sifatini raqamlashtirish orqali biz xalqaro darajadagi mutaxassislarni tayyorlash tizimini yaratmoqdamiz.",
    image: P2,
    email: "i.jaxongirov@fstu.uz",
    phone: "+99873 241-12-10",
    reception: "Seshanba - Juma (15:00 - 18:00)",
    socials: [
      { icon: <Instagram />, color: "#E1306C", link: "#" },
      { icon: <Twitter />, color: "#1DA1F2", link: "#" },
      { icon: <Linkedin />, color: "#0077B5", link: "#" },
      { icon: <Send />, color: "#229ED9", link: "#" }
    ]
  },
  {
    id: 3,
    name: "Dexkanov Sherzod Abdumutalibovich",
    role: "Yoshlar masalalari va ma'naviy-ma'rifiy ishlar bo'yicha prorektor",
    speech: "Yoshlarning ma'naviy dunyosini boyitish — kuchli jamiyat poydevoridir.",
    image: P1,
    email: "sh.dexqonov@fstu.uz",
    phone: "+99873 241-13-52",
    reception: "Dushanba - Shanba (8:00 - 10:00)",
    socials: [
      { icon: <Instagram />, color: "#E1306C", link: "#" },
      { icon: <Facebook />, color: "#1877F2", link: "#" },
      { icon: <Send />, color: "#229ED9", link: "#" }
    ]
  },
  {
    id: 4,
    name: "Davlyatov Shoxrux Muratovich",
    role: "Ilmiy ishlar va innovatsiyalar bo‘yicha prorektor",
    speech: "Ilmiy tadqiqotlar va innovatsiyalar institutimiz rivojlanishining drayveridir.",
    image: P3,
    email: "sh.davlyatov@fstu.uz",
    phone: "+99873 241-14-10",
    reception: "Dushanba - Shanba (15:00 - 17:00)",
    socials: [
      { icon: <Instagram />, color: "#E1306C", link: "#" },
      { icon: <Facebook />, color: "#1877F2", link: "#" },
      { icon: <Send />, color: "#229ED9", link: "#" }
    ]
  },
  {
    id: 5,
    name: "Salimov Abdumajid Abduvoxobovich",
    role: "Moliya, iqtisod ishlar boʼyicha prorektor",
    speech: "Innovatsiya — bu bugungi kun muammolariga ertangi kun ko'zi bilan qarashdir.",
    image: P4,
    email: "a.salimov@fstu.uz",
    phone: "+99873 241-13-25",
    reception: "Dushanba - Payshanba (14:00 — 18:00)",
    socials: [
      { icon: <Linkedin />, color: "#0077B5", link: "#" },
      { icon: <Twitter />, color: "#1DA1F2", link: "#" },
      { icon: <Send />, color: "#229ED9", link: "#" }
    ]
  }
];

const TwoAdministrations = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Container maxWidth="lg" sx={{ py: 10 }}>
        {/* Sarlavha Qismi */}
        <Box sx={{ mb: 12, textAlign: "center", position: "relative" }}>
          <Box sx={{
            position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
            width: "200px", height: "200px",
            background: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,62,0.05)'} 0%, transparent 70%)`,
            filter: "blur(40px)", zIndex: -1
          }} />

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant="h2" sx={{
              fontWeight: 900, color: isDark ? "#fff" : "#00003E", letterSpacing: -1,
              fontSize: { xs: '34px', md: '48px' }, fontFamily: 'Arial, Helvetica, sans-serif',
              position: "relative", display: "inline-block", mb: 2,
              '&::after': {
                content: '""', position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
                width: "60px", height: "4px", borderRadius: "10px", bgcolor: theme.palette.primary.main
              }
            }}>
              Ma'muriyat
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, color: isDark ? "grey.300" : "grey.700" }}>
              Farg'ona davlat texnika universitetining strategik rahbariyati bilan tanishing
            </Typography>
          </motion.div>
        </Box>

        {/* Rahbarlar Ro'yxati */}
        <Stack spacing={15}>
          {administrationData.map((leader, index) => (
            <LeaderSection 
              key={leader.id} 
              leader={leader} 
              index={index} 
              isDark={isDark} 
              isMobile={isMobile}
              accentColor={theme.palette.primary.main}
            />
          ))}
        </Stack>
      </Container>
      <TwoFooter />
    </Box>
  );
};

const LeaderSection = ({ leader, index, isDark, isMobile, accentColor }) => {
  const isEven = index % 2 === 0;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      sx={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : (isEven ? "row" : "row-reverse"),
        gap: { xs: 6, md: 10 },
        alignItems: "center"
      }}
    >
      {/* RASM KONTEYNERI */}
      <Box sx={{ flex: 1, width: "100%", position: "relative" }}>
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          style={{ position: "relative" }}
        >
          <Box sx={{ 
            borderRadius: "5px", overflow: "hidden", height: "550px", position: "relative",
            boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,62,0.15)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
          }}>
            <img src={leader.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={leader.name} />
            
            {/* IJTIMOIY TARMOQLAR - RASM USTIDA O'NG PASTDA */}
            <Stack 
              direction="row" spacing={1}
              sx={{ 
                position: "absolute", bottom: 20, right: 20, zIndex: 3,
                bgcolor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)", p: 1, borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              {leader.socials.map((soc, i) => (
                <IconButton 
                  key={i} href={soc.link} size="small"
                  sx={{ color: isDark ? "#fff" : "#00003E", "&:hover": { color: soc.color, transform: "scale(1.2)" }, transition: "0.3s" }}
                >
                  {React.cloneElement(soc.icon, { size: 20 })}
                </IconButton>
              ))}
            </Stack>

          
          </Box>
        </motion.div>
      </Box>

      {/* MA'LUMOTLAR QISMI */}
      <Box sx={{ flex: 1.2, pt: 2 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" sx={{ color: accentColor, fontWeight: 800, letterSpacing: 3 }}>
              {leader.role}
            </Typography>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, mt: 1, fontSize: '32px', 
              fontFamily: 'Arial, Helvetica, sans-serif', 
              color: isDark ? "#fff" : "#00003E" 
            }}>
              {leader.name}
            </Typography>
          </Box>

          <Box sx={{ position: "relative" }}>
            <Quote size={50} style={{ position: "absolute", top: -20, left: -20, opacity: 0.1 }} color={accentColor} />
            <Typography sx={{ fontSize: "1.2rem", fontStyle: "italic", color: "text.secondary", lineHeight: 1.6 }}>
              "{leader.speech}"
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2}>
            <ContactBox icon={<Clock size={20} />} label="Qabul vaqti" val={leader.reception} href={`Qabul:${leader.reception}`}  color="#FF9800" />
            <ContactBox icon={<Phone size={20} />} label="Aloqa" val={leader.phone} href={`Coll:${leader.phone}`} color={accentColor} />
            <ContactBox icon={<Mail size={20} />} label="Elektron pochta" val={leader.email} href={`Email:${leader.email}`} color={accentColor} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

const ContactBox = ({ icon, label, val, href, color }) => (
  <Box 
    component={href ? motion.a : "div"} href={href} 
    whileHover={href ? { x: 10 } : {}}
    sx={{ 
      display: "flex", alignItems: "center", gap: 3, textDecoration: "none", color: "inherit",
      p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider"
    }}
  >
    <Box sx={{ color: color, bgcolor: `${color}10`, p: 1.5, borderRadius: "12px", display: "flex" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5, textTransform: "uppercase" }}>{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>{val}</Typography>
    </Box>
  </Box>
);

const TwoAdministration = () => (
  <ColorModeProvider>
    <TwoAdministrations />
  </ColorModeProvider>
);

export default TwoAdministration;