import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Avatar,
  Stack,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

import PagesBanner from "../../components/layout/pagesBanner";
import SideMenu from "../../components/layout/SideMenu";

import MSobirov from "../../assets/images/markaz-bolimlar/M.Sobirov.jpg";


/* ================= MARKAZLAR ================= */
const centersData = [
  {
    type: "markaz",
    title: "Axborot-resurs markazi",
    subtitle: "Kutubxona va elektron resurslar",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Sobirov Muhiddin",
      position: "Axborot-resurs markazi direktori",
      desc:
        "Axborot-resurs markazi talaba va professor-o‘qituvchilarni zamonaviy "
        + "bosma va elektron adabiyotlar bilan ta’minlash, elektron kutubxona "
        + "xizmatlarini rivojlantirish hamda ilmiy izlanishlarni qo‘llab-quvvatlash "
        + "bilan shug‘ullanadi.",
      phone: "+998 90 580 230 03",
      email: "arm@fstu.uz",
      img: MSobirov,
    },
  },
  {
    type: "markaz",
    title: "Raqamli ta’lim texnologiyalari markazi",
    subtitle: "Masofaviy va elektron ta’lim",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Karimova Dilnoza Anvarovna",
      position: "Markaz rahbari",
      desc:
        "Raqamli ta’lim texnologiyalari markazi masofaviy ta’lim platformalarini "
        + "joriy etish, elektron kurslar yaratish va professor-o‘qituvchilarning "
        + "raqamli kompetensiyalarini oshirish bilan shug‘ullanadi.",
      phone: "+998 90 456 78 90",
      email: "digital@fstu.uz",
      img: "/images/leader2.jpg",
    },
  },
  {
    type: "markaz",
    title: "Startap markazi",
    subtitle: "Innovatsion loyihalar va startaplar",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Qudratbek Mahammadjonov Ulug‘bek o‘g‘li",
      position: "Startap markazi rahbari",
      desc:
        "Startap markazi talabalar va yosh tadbirkorlarning innovatsion "
        + "g‘oyalarini qo‘llab-quvvatlash, startap loyihalarni rivojlantirish "
        + "va investorlarga chiqarish bilan shug‘ullanadi.",
      phone: "+9989",
      email: "startup@fstu.uz",
      img: "https://fstu.uz/admin/uploads/global/Moliyaviy/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA2.png",
    },
  },
];

/* ================= BO‘LIMLAR ================= */
const departmentsData = [
  {
    type: "bolim",
    title: "Arxiv",
    subtitle: "Hujjatlarni saqlash va hisobga olish",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Islomov Baxtiyor Sobirjonovich",
      position: "Arxiv bo‘limi boshlig‘i",
      desc:
        "Arxiv bo‘limi institutning buyruqlari, me’yoriy hujjatlari va "
        + "tarixiy materiallarini saqlash, tizimlashtirish hamda ulardan "
        + "foydalanishni tashkil etish bilan shug‘ullanadi.",
      phone: "+998 91 222 33 44",
      email: "arxiv@fstu.uz",
      img: "/images/leader4.jpg",
    },
  },
  {
    type: "bolim",
    title:
      "Jismoniy va yuridik shaxslarning murojaatlari bilan ishlash, nazorat va monitoring bo‘limi",
    subtitle: "Murojaatlar bilan ishlash",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Abdullayeva Mohira Ulug‘bek qizi",
      position: "Bo‘lim boshlig‘i",
      desc:
        "Bo‘lim jismoniy va yuridik shaxslarning murojaatlarini qabul qilish, "
        + "ko‘rib chiqish, ijrosini nazorat qilish hamda monitoring olib borish "
        + "bilan shug‘ullanadi.",
      phone: "+998 99 888 77 66",
      email: "murojaat@fstu.uz",
      img: "/images/leader5.jpg",
    },
  },
  {
    type: "bolim",
    title: "Devonxona",
    subtitle: "Hujjatlar bilan ishlash",
    icon: <BusinessIcon color="primary" />,
    leader: {
      name: "Qodirova Gulnoza Shavkatovna",
      position: "Devonxona mudiri",
      desc:
        "Devonxona institutga kelib tushadigan hujjatlarni ro‘yxatga olish, "
        + "ijrosini nazorat qilish va hujjatlar aylanishini tartibga solish "
        + "bilan shug‘ullanadi.",
      phone: "+998 90 111 22 33",
      email: "devonxona@fstu.uz",
      img: "/images/leader6.jpg",
    },
  },
];

/* ================= SECTION TITLE ================= */
const SectionTitle = ({ title }) => (
 <Box sx={{ mb: 6, textAlign: "center" }}>
     <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
       <Box sx={{ flex: 1, height: "2px", background: "linear-gradient(90deg, transparent, #0062ff)" }} />
       <Stack direction="row" spacing={1} alignItems="center">
         <Typography fontWeight={600} variant="p" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
           {title}
         </Typography>
       </Stack>
       <Box sx={{ flex: 1, height: "2px", background: "linear-gradient(90deg, #0062ff, transparent)" }} />
     </Box>
   </Box>
);

/* ================= PAGE ================= */
export default function Centers() {
  const renderAccordion = (item, index) => (
    <Accordion
      key={index}
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        "&:before": { display: "none" },
        bgcolor: "#fff",
      }}
    >
      <AccordionSummary
        expandIcon={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid #2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <ChevronRightIcon />
          </Box>
        }
        sx={{
          minHeight: 90,
          px: 3,
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 2,
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: "rgba(37,99,235,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {item.icon}
        </Box>

        <Box>
          <Typography fontWeight={700} fontSize={18}>
            {item.title}
          </Typography>
          <Typography color="text.secondary" fontSize={14}>
            {item.subtitle}
          </Typography>
        </Box>
      </AccordionSummary>

<AccordionDetails
  sx={{
    px: { xs: 2, md: 4 },
    pb: 4,
  }}
>
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", lg: "row" }, // 🔥 MUHIM
      gap: 4,
      alignItems: "center",
    }}
  >
    {/* IMAGE */}
    <Box
      sx={{
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src={item.leader.img}
        alt={item.leader.name}
        sx={{
          width: "100%",
          height: { xs: 220, sm: 260, lg: 280 },
          objectFit: "cover",
          borderRadius: 3,
          bgcolor: "#f1f5f9",
        }}
      />
    </Box>

    {/* CONTENT */}
    <Box sx={{ flex: 1 }}>
      <Typography
        fontWeight={800}
        fontSize={{ xs: 18, lg: 24 }}
        mb={1}
        textAlign={{ xs: "center", lg: "left" }}
      >
        {item.leader.name}
      </Typography>

      <Typography
        color="primary.main"
        mb={2}
        textAlign={{ xs: "center", lg: "left" }}
      >
        {item.leader.position}
      </Typography>

      <Typography
        color="text.secondary"
        mb={3}
        textAlign={{ xs: "center", lg: "left" }}
      >
        {item.leader.desc}
      </Typography>

      <Stack
        spacing={2}
        mb={3}
        alignItems={{ xs: "center", lg: "flex-start" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon color="primary" />
          <Typography>{item.leader.phone}</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon color="primary" />
          <Typography>{item.leader.email}</Typography>
        </Stack>
      </Stack>

      <Box textAlign={{ xs: "center", lg: "left" }}>
        <Button
          variant="contained"
          endIcon={<ChevronRightIcon />}
          sx={{
            textTransform: "none",
            px: 4,
            width: { xs: "100%", sm: "auto" },
            maxWidth: 320,
          }}
        >
          {item.type === "bolim"
            ? "Bo‘lim haqida to‘liq ma’lumot"
            : "Markaz haqida to‘liq ma’lumot"}
        </Button>
      </Box>
    </Box>
  </Box>
</AccordionDetails>


    </Accordion>
  );

  return (
    <>
      <PagesBanner title="Markazlar va bo‘limlar" />

    
    <Box sx={{ bgcolor: "#f4f7fa", py: 10 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
          
          {/* ASOSIY KONTENT */}
          <Box flex={1}>
            <SectionTitle title="MARKAZLAR" />
            {centersData.map(renderAccordion)}

            <SectionTitle title="BO‘LIMLAR" />
            {departmentsData.map(renderAccordion)}
          </Box>

          {/* O'NG TOMON: ASIDE MENU */}
          <Box sx={{ width: { md: 320 } }}>
            <SideMenu />
          </Box>

        </Stack>
      </Container>
    </Box>
    </>
  );
}
