import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
// Ikonlar
import SchoolIcon from "@mui/icons-material/School"; // Talabalar (Shapka)
import PeopleIcon from "@mui/icons-material/People"; // Professorlar (Odamlar guruhi)
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Bitiruvchilar (Kubok)
import BookIcon from "@mui/icons-material/Book"; // Kitob fondi (Ochiq kitob)

// ===== COLORS (USLUBLAR) =====
const PRIMARY = "#3f68a5"; // Asosiy ko'k rang (Raqamlar va Ikonka)
const MUTED = "#555"; // Matn rangi
const BORDER = "#e6e6e6"; // Ramka rangi
const BG = "#ffffff"; // Karta foni
const PRIMARY_HOVER = "#0359ca"; // Hover holatidagi asosiy rang

// ===== DATA (Statistika ma'lumotlari) =====
const STATS = [
    { label: "Talabalar", value: 27768, icon: SchoolIcon }, 
    { label: "Professorlar", value: 831, icon: PeopleIcon },
    { label: "Bitiruvchilar", value: 67270, icon: EmojiEventsIcon },
    { label: "Kitob fondi", value: 257800, icon: BookIcon }, 
];

// ===== STAT CARD (To'liq Responsiv) =====
function StatCard({ value, label, icon: IconComponent, start }) {
    const [count, setCount] = useState(0);

    // Raqamlarni o'suvchi animatsiya (Count-Up Effect)
    useEffect(() => {
        if (!start) return;
        let current = 0;
        const duration = 1200; 
        const step = 20; 
        const increment = Math.ceil(value / (duration / step));

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, step);
        return () => clearInterval(timer);
    }, [value, start]);

    return (
        <Box
            sx={{
                // 🔥 RESPONSIV PADDING: Kichik ekranlarda kamroq, katta ekranlarda rasmga mos
                p: { xs: 2, sm: 2.5, md: 3 }, 
                bgcolor: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 2,
                textAlign: "center",
                transition: "0.3s",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                // 🔥 RESPONSIV MIN HEIGHT:
                minHeight: { xs: 140, sm: 150, md: 170 }, 
                
                "&:hover": {
                    borderColor: PRIMARY_HOVER,
                    boxShadow: "0 4px 15px rgba(63,104,165,0.15)", 
                    
                    "& .MuiSvgIcon-root": {
                        transform: "scale(1.08)", 
                    },
                },
            }}
        >
            {/* ICON (To'liq Responsiv) */}
            <Box 
                sx={{ 
                    color: PRIMARY, 
                    // Ikon va raqam orasidagi bo'shliq
                    mb: { xs: 1.5, md: 2 }, 
                }}
            >
                <IconComponent 
                    sx={{ 
                        // 🔥 RESPONSIV ICON O'LCHAMI
                        fontSize: { xs: 40, sm: 48, md: 55 }, 
                        transition: "transform 0.3s ease-in-out", 
                    }} 
                />
            </Box>

            {/* COUNT (To'liq Responsiv) */}
            <Typography
                // 🔥 RESPONSIV RAQAM O'LCHAMI
                fontSize={{ xs: 24, sm: 28, md: 32 }}
                fontWeight={800}
                color={PRIMARY}
                mb={0.5} 
            >
                {count.toLocaleString("uz-UZ")}
            </Typography>

            {/* LABEL (To'liq Responsiv) */}
            <Typography 
                fontSize={{ xs: 13, sm: 14, md: 15 }} 
                color={MUTED}
            >
                {label}
            </Typography>
        </Box>
    );
}

// ===== MAIN KOMPONENT (Responsivlik uchun o'zgartirilgan) =====
export default function UniversityNumbers() {
    const ref = useRef(null);
    const [start, setStart] = useState(false);

    // Ko'rish maydoniga kirganda animatsiyani ishga tushirish
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStart(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 } 
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <Box ref={ref} sx={{ py: { xs: 5, md: 10 } }}> {/* Vertical padding responsiv qilindi */}
            {/* CONTAINER */}
            <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, sm: 2 } }}> {/* Horizontal padding responsiv qilindi */}
                
                {/* HEADER (Sarlavha qismi) */}
                <Box textAlign="center" mb={{ xs: 4, md: 6 }}> {/* Margin bottom responsiv qilindi */}
                    <Typography
                        fontSize={{ xs: 12, sm: 14 }} // Sarlavha matni responsiv
                        letterSpacing={3}
                        color={PRIMARY}
                        fontWeight={700}
                        mb={1}
                    >
                        UNIVERSITET STATISTIKASI
                    </Typography>

                    <Typography
                        fontSize={{ xs: 24, sm: 30, md: 36 }} // Asosiy sarlavha responsiv
                        fontWeight={800}
                        color={PRIMARY}
                        mb={2}
                    >
                        Universitet raqamlarda
                    </Typography>

                    <Typography color={MUTED} maxWidth={600} mx="auto">
                        Ta’lim, ilm-fan va bilimlar bazasining bugungi holati
                    </Typography>
                </Box>

                {/* GRID (To'liq Responsiv) */}
                <Box
                    display="grid"
                    gridTemplateColumns={{
                        xs: "1fr 1fr", // Telefonlarda 2 ustun
                        sm: "repeat(4, 1fr)", // Planshet va kattalarda 4 ustun
                    }}
                    // 🔥 RESPONSIV GAP: Bo'shliqlar moslashtirildi
                    gap={{ xs: 2, md: 3 }} 
                >
                    {STATS.map((item, i) => (
                        <StatCard key={i} {...item} start={start} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}