import { Box, Container, Grid, Typography, Link, IconButton } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import TelegramIcon from "@mui/icons-material/Telegram";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const PRIMARY_BLUE = "#3f68a5";
const LIGHT_GRAY = "#e0e4ec";

export default function UniversityFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: PRIMARY_BLUE, color: "white", pt: 8, pb: 2}}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* Aloqa Maʼlumotlari */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
  variant="h3" 
  component="h3"
  gutterBottom 
  sx={{ 
    fontWeight: 700, 
    color: LIGHT_GRAY,
    fontSize: 20  // H3 bo‘lsa ham footerdagi dizayn buzilmaydi
  }}
>
  Aloqa
</Typography>

            <Box>
              <Link
                href="https://maps.google.com/?q=Farg'ona+ko'chasi+86,+Farg'ona"
                target="_blank"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  150100, Farg‘ona sh., Farg‘ona ko‘chasi 86-uy
                </Typography>
              </Link>

              <Link
                href="tel:+998732411206"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">+998 73 241-12-06</Typography>
              </Link>

              <Link
                href="mailto:info@fstu.uz"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">info@fstu.uz</Typography>
              </Link>
            </Box>
          </Grid>

          {/* Tezkor Havolalar */}
          <Grid item xs={12} sm={6} md={3}>
      <Typography
  variant="h3"
  component="h3"
  gutterBottom
  sx={{ fontWeight: 700, color: LIGHT_GRAY, fontSize: 20 }}
>
  Tashkiliy havolalar
</Typography>

            <Link href="/" color="inherit" underline="hover" display="block" mb={0.5}>
              Bosh sahifa
            </Link>
            <Link href="/yangiliklar" color="inherit" underline="hover" display="block" mb={0.5}>
              Yangiliklar
            </Link>
            <Link href="/tadbirlar" color="inherit" underline="hover" display="block" mb={0.5}>
              Tadbirlar
            </Link>
            <Link href="/aloqa" color="inherit" underline="hover">
              Bog‘lanish
            </Link>
          </Grid>

          {/* Tashkiliy Havolalar */}
          <Grid item xs={12} sm={6} md={3}>
           <Typography
  variant="h3"
  component="h3"
  gutterBottom
  sx={{ fontWeight: 700, color: LIGHT_GRAY, fontSize: 20 }}
>
  Tashkiliy havolalar
</Typography>
            <Link href="https://gov.uz/" target="_blank" color="inherit" underline="hover" display="block" mb={0.5}>
              O‘zbekiston Respublikasi Hukumat portali
            </Link>
            <Link href="https://edu.uz/" target="_blank" color="inherit" underline="hover" display="block">
              Oliy ta’lim vazirligi
            </Link>
          </Grid>

          {/* Ijtimoiy Tarmoqlar */}
          <Grid item xs={12} sm={6} md={3}>
                 <Typography
  variant="h3"
  component="h3"
  gutterBottom
  sx={{ fontWeight: 700, color: LIGHT_GRAY, fontSize: 20 }}
>
            </Typography>
           <Box sx={{ "& > *": { mr: 1, mb: 1, color: "white" } }}>

  <IconButton 
    href="https://facebook.com/fstu.uz" 
    target="_blank" 
    aria-label="Facebook sahifamiz"
  >
    <FacebookIcon />
  </IconButton>

  <IconButton 
    href="https://t.me/fstu_uz" 
    target="_blank" 
    aria-label="Telegram kanalimiz"
  >
    <TelegramIcon />
  </IconButton>

  <IconButton 
    href="https://instagram.com/fstu.uz" 
    target="_blank" 
    aria-label="Instagram sahifamiz"
  >
    <InstagramIcon />
  </IconButton>

  <IconButton 
    href="https://youtube.com/c/fstu" 
    target="_blank" 
    aria-label="YouTube kanalimiz"
  >
    <YouTubeIcon />
  </IconButton>

</Box>

          </Grid>

        </Grid>

        {/* Copyright */}
        <Box sx={{ borderTop: `1px solid ${LIGHT_GRAY}40`, mt: 4, pt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ opacity: 1 }}>
  © {new Date().getFullYear()} Farg‘ona davlat texnika universiteti.
</Typography>

        </Box>
      </Container>
    </Box>
  );
}
