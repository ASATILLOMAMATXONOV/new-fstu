



import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  alpha,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  School,
  Search,
  Info,
  ChevronRight,
  Download,
  User,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Filter as FilterIcon,
  Bell,
  BookOpen,
  Video,
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

 import BannerImg from "../../assets/images/Saty.jpg"; // o'zingizniki

const ACCENT = "#2c546c";

/** =========================
 *  1) MOCK DATA
 *  ========================= */
const PROGRAMS = [
  { id: "mgmt", label: "Menejment muhandisligi" },
  { id: "civil", label: "Qurilish muhandisligi" },
];


const FACULTIES_DB = [
  {
    id: "eng",
    label: "Muhandislik fakulteti",
    departments: [
      {
        id: "me",
        label: "Menejment muhandisligi kafedrasi",
        programs: [
          { id: "mgmt", label: "Menejment muhandisligi" },
          { id: "pm", label: "Loyiha boshqaruvi" },
        ],
      },
      {
        id: "civil_dep",
        label: "Qurilish muhandisligi kafedrasi",
        programs: [
          { id: "civil", label: "Qurilish muhandisligi" },
          { id: "arch", label: "Arxitektura asoslari" },
        ],
      },
    ],
  },
  {
    id: "it",
    label: "Axborot texnologiyalari fakulteti",
    departments: [
      {
        id: "se",
        label: "Dasturiy injiniring kafedrasi",
        programs: [
          { id: "se", label: "Software Engineering" },
          { id: "ds", label: "Data Science" },
        ],
      },
      {
        id: "cs",
        label: "Kompyuter tizimlari kafedrasi",
        programs: [
          { id: "net", label: "Kompyuter tarmoqlari" },
          { id: "sec", label: "Kiberxavfsizlik" },
        ],
      },
    ],
  },
];


const ACADEMIC_YEARS = ["2025/26", "2024/25"];

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Qishki semestr imtihonlari jadvali e’lon qilindi",
    date: "2026-01-10",
    tag: "Imtihon",
    text: "Imtihonlar 20-yanvardan boshlanadi. Jadval bo‘limlar kesimida yangilandi.",
  },
  {
    id: 2,
    title: "Akademik qarzdorlik bo‘yicha konsultatsiya",
    date: "2026-01-08",
    tag: "Konsultatsiya",
    text: "Konsultatsiyalar seshanba/juma kunlari 15:00–17:00 oralig‘ida bo‘lib o‘tadi.",
  },
  {
    id: 3,
    title: "Portal yangilandi: yangi resurslar bo‘limi",
    date: "2026-01-05",
    tag: "Portal",
    text: "Fanlar bo‘yicha sillabus, slayd va video resurslar tartiblandi.",
  },
];

const SYSTEM_INFO = [
  {
    title: "Portal vazifasi",
    text: "Ushbu bo‘limda dars jadvali, fanlar, resurslar va e’lonlar jamlangan.",
  },
  {
    title: "Qanday foydalaniladi?",
    text: "Bakalavriat/Magistratura bo‘limidan kursni tanlang → fanlar jadvali chiqadi → satr ustiga bosib batafsil sahifaga o‘ting.",
  },
  {
    title: "Muammo bo‘lsa",
    text: "Admin bilan bog‘laning: edu-support@example.com (demo).",
  },
];

const SUBJECTS_DB = {
  bachelor: {
    1: [
      {
        id: "01AQG",
        name: "Iqtisodiy tahlil",
        teacher: "L. Abrardi",
        credits: 8,
        ssd: "SECS-P/06",
        lang: "🇮🇹",
        period: "1",
        type: "Ma'ruza",
        room: "A-102",
        description:
          "Makro va mikro ko‘rsatkichlar asosida iqtisodiy jarayonlarni tahlil qilish, indikatorlar bilan ishlash va natijalarni interpretatsiya qilish.",
        schedule: { day: "Seshanba", time: "14:00", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "01BQC",
        name: "Sanoat iqtisodiyoti",
        teacher: "G. Scellato",
        credits: 8,
        ssd: "ING-IND/35",
        lang: "🇺🇿",
        period: "1",
        type: "Amaliyot",
        room: "B-205",
        description:
          "Sanoat tizimlari, ishlab chiqarish strukturalari, raqobat va bozor mexanizmlarini real keyslar orqali o‘rganish.",
        schedule: { day: "Payshanba", time: "10:30", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "01CXV",
        name: "Matematik modellashtirish",
        teacher: "A. Rossi",
        credits: 6,
        ssd: "MAT/09",
        lang: "🇮🇹",
        period: "2",
        type: "Laboratoriya",
        room: "C-301",
        description:
          "Chiziqli/nochiziqli modellar, optimallashtirish, regressiya va modellashtirishning amaliy qo‘llanmalari.",
        schedule: { day: "Dushanba", time: "16:00", duration: "120 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "01DTR",
        name: "Akademik yozuv (Academic Writing)",
        teacher: "S. Karimova",
        credits: 4,
        ssd: "L-LIN/12",
        lang: "🇺🇿",
        period: "2",
        type: "Seminar",
        room: "D-110",
        description:
          "Ilmiy maqola va hisobot tuzilishi, manbalar bilan ishlash, iqtibos va bibliografiya (APA/IEEE) amaliyoti.",
        schedule: { day: "Chorshanba", time: "11:00", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
    2: [
      {
        id: "02WER",
        name: "Strategik boshqaruv",
        teacher: "M. Bianchi",
        credits: 10,
        ssd: "SECS-P/08",
        lang: "🇮🇹",
        period: "1",
        type: "Ma'ruza",
        room: "A-404",
        description:
          "Strategiya, raqobat ustunligi, SWOT/PESTEL, portfel tahlili va strategik qaror qabul qilish.",
        schedule: { day: "Juma", time: "09:00", duration: "120 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "02KLP",
        name: "Operatsion menejment",
        teacher: "D. Rinaldi",
        credits: 8,
        ssd: "ING-IND/17",
        lang: "🇮🇹",
        period: "1",
        type: "Amaliyot",
        room: "B-210",
        description:
          "Ta’minot zanjiri, ishlab chiqarish rejalashtirish, KPI va jarayonlarni optimallashtirish.",
        schedule: { day: "Seshanba", time: "09:30", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "02PRJ",
        name: "Loyiha boshqaruvi (Project Management)",
        teacher: "N. Usmonov",
        credits: 6,
        ssd: "ING-IND/15",
        lang: "🇺🇿",
        period: "2",
        type: "Seminar",
        room: "C-205",
        description:
          "PMBOK asoslari, scope/time/cost, risk management, Gantt, Agile/Scrum tushunchalari.",
        schedule: { day: "Payshanba", time: "14:30", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
    3: [
      {
        id: "03DSA",
        name: "Ma’lumotlar tahlili (Data Analytics)",
        teacher: "F. Conti",
        credits: 8,
        ssd: "INF/01",
        lang: "🇮🇹",
        period: "1",
        type: "Laboratoriya",
        room: "LAB-2",
        description:
          "Python, statistik tahlil, vizualizatsiya, data cleaning va oddiy ML modellari.",
        schedule: { day: "Dushanba", time: "13:00", duration: "120 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "03FIN",
        name: "Moliyaviy menejment",
        teacher: "O. Yusupov",
        credits: 6,
        ssd: "SECS-P/09",
        lang: "🇺🇿",
        period: "2",
        type: "Ma'ruza",
        room: "A-210",
        description:
          "NPV/IRR, investitsiya baholash, budjetlash, moliyaviy hisobotlar bilan ishlash.",
        schedule: { day: "Chorshanba", time: "15:00", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
    4: [
      {
        id: "04THS",
        name: "Bitiruv malakaviy ishi (Thesis)",
        teacher: "Komissiya",
        credits: 12,
        ssd: "THESIS",
        lang: "🇺🇿",
        period: "1-2",
        type: "Mustaqil",
        room: "—",
        description:
          "Thesis mavzusi bo‘yicha tadqiqot, natijalar, himoya uchun prezentatsiya va yakuniy hisobot tayyorlash.",
        schedule: { day: "—", time: "—", duration: "Semestr davomida" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "04INT",
        name: "Amaliyot (Internship)",
        teacher: "Kafedra",
        credits: 6,
        ssd: "INTERNSHIP",
        lang: "🇺🇿",
        period: "2",
        type: "Amaliyot",
        room: "Tashkilot",
        description:
          "Korxonada amaliyot o‘tash, haftalik hisobot, yakuniy prezentatsiya va baholash mezonlari.",
        schedule: { day: "—", time: "—", duration: "6–8 hafta" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
  },
  master: {
    1: [
      {
        id: "M1RSC",
        name: "Ilmiy tadqiqot metodologiyasi",
        teacher: "A. Gʻaniyev",
        credits: 6,
        ssd: "METH/01",
        lang: "🇺🇿",
        period: "1",
        type: "Ma'ruza",
        room: "A-502",
        description:
          "Tadqiqot dizayni, metodlar, ilmiy etik, maqola yozish, survey/experiment, data interpretation.",
        schedule: { day: "Seshanba", time: "18:00", duration: "90 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
      {
        id: "M1ADV",
        name: "Advanced Management Engineering",
        teacher: "P. Ferrero",
        credits: 8,
        ssd: "ING-IND/35",
        lang: "🇮🇹",
        period: "2",
        type: "Seminar",
        room: "B-402",
        description:
          "Advanced case studies, strategy & operations integration, leadership and digital transformation.",
        schedule: { day: "Payshanba", time: "17:00", duration: "120 daqiqa" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
    2: [
      {
        id: "M2THS",
        name: "Magistrlik dissertatsiyasi (Thesis)",
        teacher: "Ilmiy rahbar",
        credits: 20,
        ssd: "THESIS-M",
        lang: "🇺🇿",
        period: "1-2",
        type: "Mustaqil",
        room: "—",
        description:
          "Dissertatsiya mavzusi, adabiyotlar tahlili, metod, natijalar va himoya hujjatlari.",
        schedule: { day: "—", time: "—", duration: "Yil davomida" },
        resources: {
          syllabusUrl: "#",
          slidesUrl: "#",
          videoUrl: "#",
        },
      },
    ],
  },
};

/** =========================
 *  2) SUBJECT DETAIL CARD
 *  ========================= */
const SubjectDetailCard = ({ subject, onBack }) => {
  const scheduleText = `${subject.schedule?.day || "—"}, ${subject.schedule?.time || "—"}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: "20px",
          border: "1px solid #eee",
          position: "relative",
        }}
      >
        <Button
          startIcon={<ChevronRight style={{ transform: "rotate(180deg)" }} />}
          onClick={onBack}
          sx={{ mb: 3, textTransform: "none", fontWeight: 800 }}
        >
          Orqaga qaytish
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: ACCENT, mb: 1 }}>
              {subject.name}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
              <Chip label={subject.ssd} size="small" sx={{ fontWeight: 700 }} />
              <Chip label={`${subject.credits} Kredit`} color="primary" size="small" sx={{ fontWeight: 800 }} />
              <Chip label={subject.type} variant="outlined" size="small" />
              <Chip label={`Period: ${subject.period}`} size="small" sx={{ bgcolor: alpha(ACCENT, 0.08) }} />
            </Stack>

            <Typography variant="body1" sx={{ color: "#666", lineHeight: 1.9, mb: 3 }}>
              {subject.description}
            </Typography>

            <Grid container spacing={2}>
              {[
                { icon: <User size={20} />, label: "Professor", val: subject.teacher },
                { icon: <Clock size={20} />, label: "Davomiyligi", val: subject.schedule?.duration || "—" },
                { icon: <MapPin size={20} />, label: "Auditoriya", val: subject.room },
                { icon: <Calendar size={20} />, label: "Dars vaqti", val: scheduleText },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: "#f0f4f8", borderRadius: "8px", color: ACCENT }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {item.val}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                bgcolor: "#f8faff",
                borderRadius: "16px",
                border: "1px solid #e3e9f0",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
                Resurslar
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Download size={18} />}
                  href={subject.resources?.syllabusUrl || "#"}
                  sx={{ bgcolor: ACCENT, borderRadius: "10px", textTransform: "none", fontWeight: 800 }}
                >
                  Sillabus yuklash
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  href={subject.resources?.slidesUrl || "#"}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 800 }}
                >
                  Prezentatsiyalar
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Video size={18} />}
                  href={subject.resources?.videoUrl || "#"}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 800 }}
                >
                  Video darslar
                </Button>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <BookOpen size={18} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#444" }}>
                    Til: <span style={{ fontSize: 18 }}>{subject.lang}</span>
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

/** =========================
 *  3) MAIN PAGE
 *  ========================= */
const TwoDepartmentsContent = () => {
  const [mainTab, setMainTab] = useState(0); // 0=Qidiruv, 1=Bakalavr, 2=Magistr
  const [subTab, setSubTab] = useState(0); // sidebar index
  const [selectedSubject, setSelectedSubject] = useState(null);

const [searchFilter, setSearchFilter] = useState({
  year: "2025/26",
  faculty: "",
  department: "",
  program: "",
  level: "bachelor",
  course: 1,
});

const selectedFaculty = useMemo(
  () => FACULTIES_DB.find((f) => f.id === searchFilter.faculty),
  [searchFilter.faculty]
);

const departments = selectedFaculty?.departments || [];

const selectedDepartment = useMemo(
  () => departments.find((d) => d.id === searchFilter.department),
  [departments, searchFilter.department]
);

const programs = selectedDepartment?.programs || [];


  const [showSearchResults, setShowSearchResults] = useState(false);

  const menuConfig = useMemo(
    () => [
      {
        title: "Qidiruv",
        icon: <Search size={20} />,
        items: ["Dars jadvali filtr", "Oxirgi e'lonlar", "Tizim haqida"],
      },
      {
        title: "Bakalavriat",
        icon: <GraduationCap size={20} />,
        items: ["1-Kurs", "2-Kurs", "3-Kurs", "4-Kurs"],
      },
      {
        title: "Magistratura",
        icon: <School size={20} />,
        items: ["1-Kurs", "2-Kurs"],
      },
    ],
    []
  );

  const currentSubjects = useMemo(() => {
    if (mainTab === 1) return SUBJECTS_DB.bachelor[subTab + 1] || [];
    if (mainTab === 2) return SUBJECTS_DB.master[subTab + 1] || [];
    // Qidiruv sahifasida natijalar filterdan keladi
    return [];
  }, [mainTab, subTab]);

  const searchSubjects = useMemo(() => {
    const db = searchFilter.level === "bachelor" ? SUBJECTS_DB.bachelor : SUBJECTS_DB.master;
    return db[searchFilter.course] || [];
  }, [searchFilter.level, searchFilter.course]);

  const handleTabChange = (_, v) => {
    setMainTab(v);
    setSubTab(0);
    setSelectedSubject(null);
    setShowSearchResults(false);

    // Qidiruvda default holat
    if (v === 0) {
      setSearchFilter((p) => ({ ...p, level: "bachelor", course: 1 }));
    }
  };

  const handleSidebarClick = (index) => {
    setSubTab(index);
    setSelectedSubject(null);
    setShowSearchResults(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f9" }}>
      <TwoNavbar />

      {/* BANNER (IMAGE) */}
<Box
  sx={{
    position: "relative",
    overflow: "hidden",
    color: "white",
    // borderBottomLeftRadius: { xs: 0, md: 28 },
    // borderBottomRightRadius: { xs: 0, md: 28 },
  }}
>
  {/* IMAGE BACKGROUND (animatsiyali zoom) */}
  <motion.div
    initial={{ scale: 1.05 }}
    animate={{ scale: [1.05, 1.12, 1.05] }}
    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${BannerImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "contrast(1.05) saturate(1.1)",
      zIndex: 0,
    }}
  />

  {/* DARK OVERLAY */}
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(210deg, rgba(44,84,108,0.92) 0%, rgba(26,58,77,0.75) 50%, rgba(0,0,0,0.45) 100%)",
      zIndex: 1,
    }}
  />

  {/* SHIMMER (yengil yorug'lik o'tishi) */}
  <motion.div
    animate={{ x: ["-30%", "130%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "40%",
      height: "100%",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
      transform: "skewX(-18deg)",
      zIndex: 2,
      pointerEvents: "none",
    }}
  />

  {/* ANIMATED BLOBS */}
  <motion.div
    animate={{ y: [0, -20, 0], opacity: [0.12, 0.22, 0.12] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    style={{
      position: "absolute",
      top: "-25%",
      right: "-10%",
      width: 520,
      height: 520,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.9)",
      filter: "blur(110px)",
      zIndex: 2,
      pointerEvents: "none",
    }}
  />
  <motion.div
    animate={{ y: [0, 25, 0], x: [0, 18, 0], opacity: [0.08, 0.16, 0.08] }}
    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    style={{
      position: "absolute",
      bottom: "-30%",
      left: "-15%",
      width: 520,
      height: 520,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.8)",
      filter: "blur(120px)",
      zIndex: 2,
      pointerEvents: "none",
    }}
  />

  {/* CONTENT */}
  <Box
    sx={{
      position: "relative",
      zIndex: 3,
      px: { xs: 2, md: 6 },
      pt: { xs: 9, md: 12 },
      pb: { xs: 9, md: 12 },
    }}
  >
    <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Typography variant="overline" sx={{ letterSpacing: 5, fontWeight: 800, opacity: 0.9 }}>
          Portal 2026
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            textShadow: "0 6px 18px rgba(0,0,0,0.35)",
            lineHeight: 1.08,
            fontSize: { xs: 36, md: 56 },
          }}
        >
          O'quv Bo'limi Markazi
        </Typography>

        <Typography sx={{ mt: 2, maxWidth: 720, opacity: 0.9, lineHeight: 1.8 }}>
          Dars jadvali, fanlar resurslari, e'lonlar va akademik ma'lumotlar — barchasi bitta joyda.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "white",
              color: ACCENT,
              fontWeight: 900,
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255,255,255,0.92)" },
            }}
          >
            Jadvalni ko‘rish
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.6)",
              color: "white",
              fontWeight: 900,
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: "none",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            Resurslar
          </Button>
        </Stack>
      </motion.div>
    </Box>
  </Box>
</Box>


      {/* TOP TABS */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 1000 }}>
        <Box sx={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Tabs
            value={mainTab}
            onChange={handleTabChange}
            centered
            sx={{ "& .MuiTab-root": { py: 3, px: 6, fontWeight: 900, fontSize: "15px" } }}
          >
            {menuConfig.map((menu, i) => (
              <Tab key={i} icon={menu.icon} iconPosition="start" label={menu.title} />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* LAYOUT */}
      <Box sx={{ maxWidth: "1400px", margin: "0 auto", py: 5, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start",
          }}
        >
          {/* SIDEBAR */}
          <Box sx={{ width: { xs: "100%", md: "300px" }, flexShrink: 0, position: { md: "sticky" }, top: 100 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "5px",
                border: "1px solid #eee",
                overflow: "hidden",
                bgcolor: "white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              }}
            >
              <Box sx={{ p: 2.5, bgcolor: alpha(ACCENT, 0.04), borderBottom: "1px solid #f0f0f0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: ACCENT }}>
                  MENU: {menuConfig[mainTab].title}
                </Typography>
              </Box>

              <List sx={{ p: 1 }}>
                {menuConfig[mainTab].items.map((item, index) => (
                  <ListItemButton
                    key={index}
                    selected={subTab === index}
                    onClick={() => handleSidebarClick(index)}
                    sx={{
                      // borderRadius: "12px",
                      mb: 0.5,
                      py: 1.5,
                      "&.Mui-selected": { bgcolor: alpha(ACCENT, 0.08), color: ACCENT },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: subTab === index ? ACCENT : "#999" }}>
                      <ChevronRight size={18} />
                    </ListItemIcon>
                    <ListItemText primary={item} primaryTypographyProps={{ fontWeight: 800, fontSize: "14px" }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Box>

          {/* CONTENT */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {selectedSubject ? (
                <SubjectDetailCard subject={selectedSubject} onBack={() => setSelectedSubject(null)} />
              ) : (
                <motion.div
                  key={`${mainTab}-${subTab}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* ===== QIDIRUV ===== */}
                  {mainTab === 0 && subTab === 0 && (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: "5px", border: "1px solid #eee" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <FilterIcon size={24} color={ACCENT} />
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          Dars jadvalini qidirish
                        </Typography>
                      </Stack>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
                            O'QUV YILI
                          </Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={searchFilter.year}
                              onChange={(e) => setSearchFilter((p) => ({ ...p, year: e.target.value }))}
                            >
                              {ACADEMIC_YEARS.map((y) => (
                                <MenuItem key={y} value={y}>
                                  {y} O'quv yili
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* FAKULTET */}
<Grid item xs={12} md={4}>
  <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
    FAKULTET
  </Typography>
  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
    <Select
      value={searchFilter.faculty}
      displayEmpty
      onChange={(e) => {
        const faculty = e.target.value;
        setSearchFilter((p) => ({
          ...p,
          faculty,
          department: "", // reset
          program: "",    // reset
        }));
      }}
    >
      <MenuItem value="" disabled>
        Fakultet tanlang
      </MenuItem>
      {FACULTIES_DB.map((f) => (
        <MenuItem key={f.id} value={f.id}>
          {f.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

{/* KAFEDRA */}
<Grid item xs={12} md={4}>
  <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
    KAFEDRA
  </Typography>
  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
    <Select
      value={searchFilter.department}
      displayEmpty
      disabled={!searchFilter.faculty}
      onChange={(e) => {
        const department = e.target.value;
        setSearchFilter((p) => ({
          ...p,
          department,
          program: "", // reset
        }));
      }}
    >
      <MenuItem value="" disabled>
        Kafedra tanlang
      </MenuItem>
      {departments.map((d) => (
        <MenuItem key={d.id} value={d.id}>
          {d.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

{/* YO'NALISH */}
<Grid item xs={12} md={4}>
  <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
    YO'NALISH
  </Typography>
  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
    <Select
      value={searchFilter.program}
      displayEmpty
      disabled={!searchFilter.department}
      onChange={(e) => setSearchFilter((p) => ({ ...p, program: e.target.value }))}
    >
      <MenuItem value="" disabled>
        Yo‘nalish tanlang
      </MenuItem>
      {programs.map((p) => (
        <MenuItem key={p.id} value={p.id}>
          {p.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>


                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
                            DARAJA
                          </Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={searchFilter.level}
                              onChange={(e) => {
                                const level = e.target.value;
                                setSearchFilter((p) => ({
                                  ...p,
                                  level,
                                  course: 1,
                                }));
                              }}
                            >
                              <MenuItem value="bachelor">Bakalavr</MenuItem>
                              <MenuItem value="master">Magistr</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" sx={{ fontWeight: 800, ml: 1 }}>
                            KURS
                          </Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={searchFilter.course}
                              onChange={(e) => setSearchFilter((p) => ({ ...p, course: Number(e.target.value) }))}
                            >
                              {(searchFilter.level === "bachelor" ? [1, 2, 3, 4] : [1, 2]).map((c) => (
                                <MenuItem key={c} value={c}>
                                  {c}-Kurs
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 1 }}>
                          
                          
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => setShowSearchResults(true)}
                            sx={{
                              bgcolor: ACCENT,
                              fontWeight: 900,
                              py: 1.5,
                              borderRadius: "5px",
                              textTransform: "none",
                            }}
                          >
                            Qidirish
                          </Button>
                        </Grid>
                      </Grid>

                      {showSearchResults && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: ACCENT }}>
                            Natijalar: {searchFilter.year} •{" "}
                            {PROGRAMS.find((p) => p.id === searchFilter.program)?.label} •{" "}
                            {searchFilter.level === "bachelor" ? "Bakalavr" : "Magistr"} • {searchFilter.course}-kurs
                          </Typography>

                          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #eee" }}>
                            <Table>
                              <TableHead sx={{ bgcolor: "#f8faff" }}>
                                <TableRow>
                                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                                    Kod
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 900 }}>Fan nomi</TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                                    Kredit
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                                    Til
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 900 }}>O'qituvchi</TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                                    Batafsil
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {searchSubjects.map((row) => (
                                  <TableRow
                                    key={row.id}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => setSelectedSubject(row)}
                                  >
                                    <TableCell align="center" sx={{ fontWeight: 800, color: ACCENT }}>
                                      {row.id}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                                    <TableCell align="center">
                                      <Chip label={row.credits} size="small" sx={{ fontWeight: 900, bgcolor: "#e3f2fd" }} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontSize: "18px" }}>
                                      {row.lang}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "13px" }}>{row.teacher}</TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSubject(row);
                                        }}
                                      >
                                        <Info size={18} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {searchSubjects.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#777" }}>
                                      Hozircha ma’lumot yo‘q (mock data). SUBJECTS_DB ni to‘ldiring.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Paper>
                  )}

                  {/* ===== E'LONLAR ===== */}
                  {mainTab === 0 && subTab === 1 && (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #eee" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Bell size={24} color={ACCENT} />
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          Oxirgi e'lonlar
                        </Typography>
                      </Stack>

                      <Stack spacing={2}>
                        {ANNOUNCEMENTS.map((a) => (
                          <Paper
                            key={a.id}
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: "16px",
                              border: "1px solid #f0f0f0",
                              bgcolor: "white",
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                              <Box>
                                <Typography sx={{ fontWeight: 900, color: ACCENT }}>{a.title}</Typography>
                                <Typography variant="caption" sx={{ color: "#666" }}>
                                  Sana: {a.date}
                                </Typography>
                              </Box>
                              <Chip label={a.tag} size="small" sx={{ fontWeight: 800, bgcolor: alpha(ACCENT, 0.1) }} />
                            </Stack>

                            <Typography sx={{ mt: 1, color: "#555", lineHeight: 1.8 }}>{a.text}</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* ===== TIZIM HAQIDA ===== */}
                  {mainTab === 0 && subTab === 2 && (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #eee" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Info size={24} color={ACCENT} />
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          Tizim haqida
                        </Typography>
                      </Stack>

                      <Stack spacing={2}>
                        {SYSTEM_INFO.map((s, idx) => (
                          <Box key={idx}>
                            <Typography sx={{ fontWeight: 900, color: ACCENT, mb: 0.5 }}>{s.title}</Typography>
                            <Typography sx={{ color: "#555", lineHeight: 1.9 }}>{s.text}</Typography>
                            {idx !== SYSTEM_INFO.length - 1 && <Divider sx={{ my: 2 }} />}
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* ===== BAKALAVR / MAGISTR JADVAL ===== */}
                  {(mainTab === 1 || mainTab === 2) && (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: ACCENT }}>
                        {menuConfig[mainTab].items[subTab]} - Dars jadvali
                      </Typography>

                      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "20px", border: "1px solid #eee", overflow: "hidden" }}>
                        <Table>
                          <TableHead sx={{ bgcolor: "#f8faff" }}>
                            <TableRow>
                              <TableCell align="center" sx={{ fontWeight: 900 }}>
                                Kod
                              </TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>Fan nomi</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 900 }}>
                                Kredit
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 900 }}>
                                Til
                              </TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>O'qituvchi</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 900 }}>
                                Batafsil
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {currentSubjects.map((row) => (
                              <TableRow
                                key={row.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => setSelectedSubject(row)}
                              >
                                <TableCell align="center" sx={{ fontWeight: 900, color: ACCENT }}>
                                  {row.id}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                                <TableCell align="center">
                                  <Chip label={row.credits} size="small" sx={{ fontWeight: 900, bgcolor: "#e3f2fd" }} />
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: "18px" }}>
                                  {row.lang}
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px" }}>{row.teacher}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubject(row);
                                    }}
                                  >
                                    <Info size={18} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}

                            {currentSubjects.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#777" }}>
                                  Bu kurs uchun hozircha fanlar yo‘q (mock data). SUBJECTS_DB ni to‘ldiring.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      <TwoFooter />
    </Box>
  );
};

const TwoDepartments = () => (
  <ColorModeProvider>
    <TwoDepartmentsContent />
  </ColorModeProvider>
);

export default TwoDepartments;
