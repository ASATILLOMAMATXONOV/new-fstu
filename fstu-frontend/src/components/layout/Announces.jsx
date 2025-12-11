import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    Typography,
    Button,
    CardContent,
} from "@mui/material";

// CSS faylini import qilish
import "../../assets/styles/style.css"; 

// Icons
import EventIcon from "@mui/icons-material/Event";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import CampaignIcon from "@mui/icons-material/Campaign";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import VisibilityIcon from "@mui/icons-material/Visibility"; 

// ================= DATA (O'zgarishsiz) =================
const mainCategories = [
    { key: "event", label: "TADBIRLAR", icon: <EventIcon />, tag: "Tadbir" },
    { key: "news", label: "YANGILIKLAR", icon: <NewspaperIcon />, tag: "Yangilik" },
    { key: "announce", label: "E'LONLAR", icon: <CampaignIcon />, tag: "E'lon" },
];

const DATA = [
    {
        title: "02.12.2025 sanasida Farg'ona davlat texnika universitetining yoshlar masalalari va maʼnaviy-maʼrifiy ishlar bo‘yicha birinchi prorektori Sh.A.Dexkanov tomonidan O'zbekiston Respublikasi Prezidenti Sh.Mirziyoyevning 03.11.2025 sanasidagi  207-sonli farmoni",
        type: "news",
        date: "10 Dekabr 2025",
        img: "https://fstu.uz/uploads/vqdyM-Z_pp.jpg",
    },
    {
        title: "Texnologik innovatsiyalar va zamonaviy ta'lim tendensiyalari haqida konferensiya o'tkazildi",
        type: "event",
        date: "10 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    },
    {
        title: "Yangi talabalar uchun qabul jarayonlari boshlanishi va kerakli hujjatlar ro'yxati (Bu matn qisqa, balandlikni ko'ramiz)",
        type: "news",
        date: "9 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1542744173-8e7e53460aa9",
    },
    {
        title: "Professor-o'qituvchilarning xalqaro grantlarda ishtiroki. Bu juda uzoq sarlavha, u hatto 4 qatorni ham egallashi mumkin, shunda Card balandligi qanday o'zgarishini ko'rsatish uchun bu matn uzun kiritildi.",
        type: "news",
        date: "9 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    },
    {
        title: "Kelajak kasblari: Dasturlash va sun'iy intellekt bo'yicha seminar",
        type: "event",
        date: "8 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1547484279-91896173041a",
    },
    {
        title: "Universitet miqyosida sport musobaqalari: Final bosqichi",
        type: "event",
        date: "7 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    },
    {
        title: "Iqtidorli talabalarga maxsus stipendiya e'lon qilindi",
        type: "announce",
        date: "6 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1521737609972-5b927a7c9d92",
    },
    {
        title: "Axborot texnologiyalari fakulteti uchun yangi laboratoriya ochilishi (Bu ham o'rta uzunlikdagi matn)",
        type: "announce",
        date: "5 Dekabr 2025",
        img: "https://images.unsplash.com/photo-1526676101235-5152a4659b85",
    },
];


// ================= STYLES =================

const navBtn = (dir) => ({
    minWidth: 45,
    height: 45,
    bgcolor: "var(--border-light)", 
    color: "var(--primary-blue)",
    borderRadius: 2,
    p: 0,
    boxShadow: 'none',
    transition: "all 0.3s ease",
    "&:hover": {
        bgcolor: "var(--primary-blue)",
        color: "var(--card-bg)",
        boxShadow: `0 4px 10px var(--primary-blue)40`,
    },
    "& .MuiButton-startIcon": { mr: 0 },
    "& .MuiButton-endIcon": { ml: 0 },
});

const categoryBadge = {
    position: "absolute",
    top: 15,
    left: 15,
    bgcolor: "var(--primary-blue)",  
    color: "var(--card-bg)", 
    px: 1.5,
    py: 0.5,
    borderRadius: 1, 
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    zIndex: 5,
};

// ================= COMPONENT =================
export default function HorizontalSliderFinal() {
    const [active, setActive] = useState("news");
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    // =============== SLIDER/LOOP LOGIC =================

    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const [isScrolling, setIsScrolling] = useState(false); 

    const baseItems = DATA.filter(
        (i) => i.type?.trim().toLowerCase() === active
    );

    const originalItemCount = baseItems.length;
    let items = [...baseItems];
    let copiesCount = 1;

    // Cheksiz aylanish uchun elementlarni nusxalash (kamida 2 nusxa yaratiladi)
    if (originalItemCount > 0) {
        if (originalItemCount < 5) {
            items = [...baseItems, ...baseItems, ...baseItems];
            copiesCount = 3;
        } else {
            items = [...baseItems, ...baseItems];
            copiesCount = 2;
        }
    }

    const canSlide = originalItemCount > 1;

    const getCardWidthWithGap = useCallback(() => {
        const currentWidth = window.innerWidth;
        const cardWidth =
            currentWidth < 600 ? 260 :
                currentWidth < 900 ? 280 : 300;
        const gap = 24;
        return cardWidth + gap;
    }, []);

    const slide = useCallback((dir) => {
        if (!sliderRef.current || !canSlide) return;
        setIsScrolling(true);
        sliderRef.current.scrollBy({
            left: dir === "left" ? -getCardWidthWithGap() : getCardWidthWithGap(),
            behavior: "smooth",
        });
    }, [canSlide, getCardWidthWithGap]);

    // Loopni boshqarish: chegaraga yetganda scroll pozitsiyasini o'zgartirish
    useEffect(() => {
        if (!canSlide) return;
        const el = sliderRef.current;
        if (!el) return;
        const itemWidth = getCardWidthWithGap();
        const firstCopyEnd = originalItemCount * itemWidth;

        const checkAndReset = () => {
            if (!el) return;
            let resetNeeded = false;
            let newScrollLeft = el.scrollLeft;
            
            // 1. Oxirga yetganda qaytish
            if (el.scrollLeft >= firstCopyEnd * (copiesCount - 1) - itemWidth * 0.1) {
                newScrollLeft = el.scrollLeft - firstCopyEnd;
                resetNeeded = true;
            }
            
            // 2. Boshiga qaytganda qaytish
            else if (el.scrollLeft < itemWidth * 0.1) {
                newScrollLeft = el.scrollLeft + firstCopyEnd;
                resetNeeded = true;
            }

            if (resetNeeded) {
                el.style.scrollBehavior = 'auto'; 
                el.scrollLeft = newScrollLeft;
                requestAnimationFrame(() => {
                    if (el) el.style.scrollBehavior = 'smooth';
                });
            }
            setIsScrolling(false);
        };
        
        const onScroll = () => {
            clearTimeout(el.scrollTimeout);
            el.scrollTimeout = setTimeout(checkAndReset, 50);
            if (!isScrolling) setIsScrolling(true);
        };
        
        el.addEventListener("scroll", onScroll);
        
        // Cleanup function
        return () => {
            el.removeEventListener("scroll", onScroll);
            clearTimeout(el.scrollTimeout);
        };
    }, [canSlide, originalItemCount, getCardWidthWithGap, copiesCount, isScrolling]);

    // Avtomatik aylanish (3 soniya)
    useEffect(() => {
        if (!canSlide || isScrolling) return; 
        const timer = setInterval(() => slide("right"), 3000); 
        return () => clearInterval(timer);
    }, [active, canSlide, slide, isScrolling]);

    // Slider birinchi yuklanganda to'g'ri (ikkinchi) nusxaning boshiga pozitsiyalash
    useEffect(() => {
        if (sliderRef.current && originalItemCount > 0) {
            const itemWidth = getCardWidthWithGap();
            const startPosition = originalItemCount * itemWidth;
            const el = sliderRef.current;
            
            el.style.scrollBehavior = 'auto';
            el.scrollLeft = startPosition;
            
            const timer = setTimeout(() => {
                if (el) {
                    el.style.scrollBehavior = 'smooth';
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [active, originalItemCount, getCardWidthWithGap]);

    // Drag Mantiqi
    const handleMouseDown = (e) => {
        if (!sliderRef.current || !canSlide) return;
        isDown.current = true;
        sliderRef.current.style.scrollBehavior = 'auto';
        setIsScrolling(true);
        startX.current = e.pageX - sliderRef.current.offsetLeft;
        scrollLeft.current = sliderRef.current.scrollLeft;
    };
    const handleMouseLeave = () => {
        if (isDown.current) setIsScrolling(false);
        isDown.current = false;
        if (sliderRef.current) sliderRef.current.style.scrollBehavior = 'smooth';
    }
    const handleMouseUp = () => {
        if (isDown.current) setIsScrolling(false);
        isDown.current = false;
        if (sliderRef.current) sliderRef.current.style.scrollBehavior = 'smooth';
    }
    const handleMouseMove = (e) => {
        if (!isDown.current || !sliderRef.current || !canSlide) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5;
        sliderRef.current.scrollLeft = scrollLeft.current - walk;
    };
    
    // =============== SLIDER/LOOP LOGIC TUGADI =================


    return (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "var(--card-bg)" }}> 
            {/* HEADER + CATEGORIES + NAVIGATION */}
 <Box 
  sx={{ 
    maxWidth: 1280, 
    mx: "auto", 
    px: 2, 
    mb: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2
  }}
>
  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>

    <Typography
      variant="h2"
      component="h2"
      fontWeight={700}
      fontFamily={"Arial, Helvetica, sans-serif"}
      color={"var(--text-dark)"}
      sx={{ fontSize: 28, display: "flex", alignItems: "center" }}
    >
      Latest{" "}
      <Box
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: 24,
          ml: 1,
          px: 2,
          py: 0.5,
          bgcolor: "var(--primary-blue)",
          color: "var(--card-bg)",
          borderRadius: 1,
          display: "inline-block"
        }}
      >
        {mainCategories.find((c) => c.key === active)?.label}
      </Box>
    </Typography>

  </Box>

  {/* Navigation Arrows */}
  {canSlide && (
    <Box sx={{ display: 'flex', gap: 1 }}>
      
      <Button 
        onClick={() => slide("left")} 
        sx={navBtn("left")}
        aria-label="Previous slide"
      >
        <ArrowBackIosIcon fontSize="small" />
      </Button>

      <Button 
        onClick={() => slide("right")} 
        sx={navBtn("right")}
        aria-label="Next slide"
      >
        <ArrowForwardIosIcon fontSize="small" />
      </Button>

    </Box>
  )}
</Box>



            {/* CATEGORIES */}
            <Box display="flex" gap={1.5} justifyContent="flex-start" mb={4} flexWrap="wrap" sx={{ maxWidth: 1280, mx: "auto", px: 2 }}>
                {mainCategories.map((cat) => (
                    <Button
                        key={cat.key}
                        onClick={() => setActive(cat.key)}
                        sx={{
                            p: "6px 14px",
                            bgcolor: active === cat.key ? "var(--primary-blue)" : "var(--border-light)",
                            color: active === cat.key ? "var(--card-bg)" : "var(--text-dark)",
                            border: `1px solid ${active === cat.key ? "var(--primary-blue)" : "var(--border-light)"}`,
                            borderRadius: 1, 
                            fontWeight: 600,
                            fontSize: 14,
                            textTransform: "uppercase",
                            transition: "all 0.3s ease",
                            boxShadow: 'none',
                            "&:hover": {
                                bgcolor: active === cat.key ? "var(--primary-blue)" : "var(--primary-blue)", 
                                color: active === cat.key ? "var(--card-bg)" : "var(--card-bg)",
                                boxShadow: "none",
                            },
                        }}
                    >
                        {cat.label}
                    </Button>
                ))}
            </Box>

            {/* SLIDER CONTAINER */}
            <Box sx={{ position: "relative", maxWidth: 1280, mx: "auto" }}>
                
                {/* DRAG + SCROLL AREA */}
                <Box
                    ref={sliderRef}
                    sx={{
                        display: "flex",
                        gap: 3,
                        px: 2,
                        pb: 4,
                        // ***** O'ZGARTIRILDI: Boshqa cardlar balandligini bir xil qilishni o'chiradi *****
                        alignItems: "flex-start", 
                        // *************************************************************************
                        overflowX: canSlide ? "auto" : "hidden",
                        scrollBehavior: "smooth",
                        scrollSnapType: "x mandatory",
                        cursor: (isDown.current && canSlide) ? "grabbing" : (canSlide ? "grab" : "default"),
                        userSelect: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {/* Elementlarni render qilish (nusxalari bilan) */}
                    {items.map((item, i) => (
                        <Card
                            key={i}
                            sx={{
                                width: { xs: 260, sm: 280, md: 300 },
                                flexShrink: 0,
                                // Card ichidagi kontentni yuqoridan pastga joylashtirish uchun kerak
                                display: "flex", 
                                flexDirection: "column", 
                                scrollSnapAlign: "start",
                                borderRadius: 3, 
                                bgcolor: "var(--card-bg)",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                                transition: "box-shadow 0.3s ease, transform 0.2s ease",
                                "&:hover": {
                                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
                                    transform: "translateY(-3px)",
                                },
                            }}
                        >
                            {/* IMAGE CONTAINER */}
                            <Box sx={{ 
                                height: 180, 
                                overflow: "hidden", 
                                position: "relative", 
                                borderTopLeftRadius: 3, 
                                borderTopRightRadius: 3 
                            }}>
                                <Box
                                    sx={{
                                        height: "100%",
                                        backgroundImage: `url(${item.img})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        transition: "transform 0.5s ease",
                                        "&:hover": { transform: "scale(1.05)" }
                                    }}
                                />
                                {/* Kategoriya Yorig'i */}
                                <Box sx={categoryBadge}>
                                    {mainCategories.find(c => c.key === item.type)?.tag || 'Ma’lumot'}
                                </Box>
                            </Box>

                            {/* CONTENT */}
                            <CardContent 
                                // ***** O'ZGARTIRILDI: flexGrow 1 olib tashlandi, faqat o'z kontentiga mos bo'ladi *****
                                sx={{ p: 2, pb: 2, display: 'flex', flexDirection: 'column' }} 
                            > 
                                
                                <Typography
                                    fontSize={14}
                                    color={"var(--text-muted)"} 
                                    fontWeight={500}
                                    mb={1}
                                >
                                    {item.date}
                                </Typography>
                                
                                <Typography
                                    fontWeight={700}
                                    fontSize={18}
                                    color={"var(--text-dark)"} 
                                    sx={{
                                        lineHeight: 1.3,
                                        mb: 2,
                                        // ***** O'ZGARTIRILDI: flexGrow: 1 olib tashlandi *****
                                    }}
                                >
                                    {item.title}
                                </Typography>

                                {/* Batafsil tugmasi */}
                                <Button
                                    variant="contained"
                                    onClick={() => console.log(`Go to detail for: ${item.title}`)}
                                    sx={{
                                        bgcolor: "var(--primary-blue)",
                                        color: "var(--card-bg)",
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        // ***** O'ZGARTIRILDI: mt: 'auto' olib tashlandi, shuning uchun tugma sarlavhadan keyin darhol joylashadi *****
                                        "&:hover": {
                                            bgcolor: "var(--primary-blue)",
                                            boxShadow: '0 4px 10px var(--primary-blue)60',
                                        }
                                    }}
                                >
                                    Batafsil
                                </Button>
                                
                            </CardContent>
                        </Card>
                    ))}
                    
                    {/* Faqat 1 ta element bo'lsa (Nusxalarsiz renderlash) */}
                    {!canSlide && originalItemCount === 1 && (
                         <Card
                           sx={{
                             width: { xs: 260, sm: 280, md: 300 },
                             flexShrink: 0,
                             display: "flex",
                             flexDirection: "column",
                             borderRadius: 3,
                             bgcolor: "var(--card-bg)",
                             boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                           }}
                         >
                            <Box sx={{ 
                             height: 180, 
                             overflow: "hidden", 
                             position: "relative", 
                             borderTopLeftRadius: 3, 
                             borderTopRightRadius: 3 
                            }}>
                             <Box
                               sx={{
                                 height: "100%",
                                 backgroundImage: `url(${baseItems[0].img})`,
                                 backgroundSize: "cover",
                                 backgroundPosition: "center",
                               }}
                             />
                             <Box sx={categoryBadge}>
                               {mainCategories.find(c => c.key === active)?.tag || 'Ma’lumot'}
                             </Box>
                           </Box>
                           <CardContent sx={{ p: 2, pb: 2, display: 'flex', flexDirection: 'column' }}>
                             <Typography fontSize={14} color={"var(--text-muted)"} fontWeight={500} mb={1}>
                               {baseItems[0].date}
                             </Typography>
                             <Typography fontWeight={700} fontSize={18} color={"var(--text-dark)"} lineHeight={1.3} mb={2}>
                               {baseItems[0].title}
                             </Typography>
                             <Button
                                 variant="contained"
                                 sx={{
                                     bgcolor: "var(--primary-blue)",
                                     color: "var(--card-bg)",
                                     textTransform: 'none',
                                     fontWeight: 600,
                                     boxShadow: 'none',
                                     "&:hover": {
                                         bgcolor: "var(--primary-blue)",
                                         boxShadow: '0 4px 10px var(--primary-blue)60',
                                     }
                                 }}
                             >
                                 Batafsil
                             </Button>
                           </CardContent>
                         </Card>
                    )}

                    {/* Elementlar yo'q bo'lsa */}
                    {originalItemCount === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                            <Typography variant="h6" color="#999">Hozircha {mainCategories.find((c) => c.key === active)?.label} mavjud emas.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* BARCHASINI KO'RISH TUGMASI */}
            <Box sx={{
                textAlign: 'right',
                mt: 4,
                px: 2,
                maxWidth: 1280,
                mx: "auto"
            }}>
                <Button
                    onClick={() => console.log(`Viewing All ${mainCategories.find((c) => c.key === active)?.label}`)}
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    sx={{
                        width: { xs: '100%', sm: 300 },
                        py: 1.5,
                    
                        borderColor: "var(--primary-blue)",
                        color: "var(--primary-blue)",
                        fontWeight: 700,
                        fontSize: 16,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: "var(--primary-blue)",
                            color: "var(--card-bg)",
                            borderColor: "var(--primary-blue)",
                            transform: 'scale(1.03)',
                        }
                    }}
                >
                    Barchasini ko'rish
                </Button>
            </Box>
        </Box>
    );
}