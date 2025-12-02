import { useState } from "react";
import { 
    Box, 
    Card, 
    Typography, 
    Button,
    CardContent,
    alpha,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Ikonalar
import EventIcon from '@mui/icons-material/Event';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Animatsiya
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Ranglar va Kategoriyalar
const CATEGORY_STYLES = {
    event: { primary: "#5e72e4", secondary: "#825ee4" },     // Tadbirlar (Ko'k/Binafsha)
    news: { primary: "#2dce89", secondary: "#2dcecc" },      // Yangiliklar (Yashil)
    announce: { primary: "#fb6340", secondary: "#fbb140" },  // E'lonlar (To'q sariq)
};

const mainCategories = [
    { key: "event", label: "TADBIRLAR", icon: <EventIcon /> },
    { key: "news", label: "YANGILIKLAR", icon: <NewspaperIcon /> },
    { key: "announce", label: "E'LONLAR", icon: <CampaignIcon /> },
];

// Example Data (Endi faqat title muhim)
const combinedData = [
  // --- Tadbirlar ---
  { title: "Veb Dizayn Konferensiyasi: Eng So'nggi Trendlar Va Texnologiyalar", type: "event", date: "10 Avgust", year: "2024", img: "https://images.unsplash.com/photo-1541746972966-d98188406564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
  { title: "Dasturlash Seminari Va Sun'iy Intellekt Sohasidagi Yangiliklar", type: "event", date: "05 Sentyabr", year: "2024", img: "https://images.unsplash.com/photo-1498050108023-c5249f4cd085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
  
  // --- Yangiliklar ---
  { title: "Yangi IT Markazi Ochildi: Universitet Kengashining Qarori Va Innovatsiyalar", type: "news", date: "01 Sentyabr", year: "2024", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
  { title: "Talabatttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttlar Xalqaro Dasturlash Tanlovida Faxrli O'rinni Qo'lga Kiritishdi", type: "news", date: "25 Avgust", year: "2024", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
  
  // --- E'lonlar ---
  { title: "Iqtidorli Talabalar Uchun Yangi Stipendiya Dasturiga Arizalar Qabul Qilinmoqda (30 Sentyabr)", type: "announce", date: "15 Avgust", year: "2024", img: "https://images.unsplash.com/photo-1523050854805-d9181f62309f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
  { title: "Bo‘sh Ish O‘rinlari E'lon Qilindi: Axborot Xavfsizligi Mutaxassislari Taklif Qilinadi", type: "announce", date: "10 Avgust", year: "2024", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" },
];

export default function HorizontalSliderFullTitle() {
  const [active, setActive] = useState("event"); 
  const filteredData = combinedData.filter(item => item.type === active);

  const getItemStyle = (type) => {
    return CATEGORY_STYLES[type] || CATEGORY_STYLES.event;
  };
  
  // Slider nav tugmalari
  const renderNavButtons = () => (
      <>
          <Button sx={sliderNavButtonStyle(0, 'left')}><ArrowBackIosIcon fontSize="small" /></Button>
          <Button sx={sliderNavButtonStyle(0, 'right')}><ArrowForwardIosIcon fontSize="small" /></Button>
      </>
  );

  const sliderNavButtonStyle = (index, position) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [position]: { xs: 0, md: -50 },
    zIndex: 10,
    minWidth: 40,
    width: 40,
    height: 40,
    borderRadius: '50%',
    bgcolor: 'white',
    boxShadow: 2,
    color: '#1e2a3b',
    '&:hover': {
        bgcolor: '#f0f0f0',
        boxShadow: 4,
    }
  });


  return (
    <Box
      sx={{
        py: 8,
        bgcolor: "#f6f9ff",
        minHeight: "100vh",
        overflowX: 'hidden', 
        position: 'relative',
      }}
    >
      {/* HEADER va KATEGORIYALAR */}
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Typography 
            variant="h4" 
            textAlign="center" 
            mb={1} 
            fontWeight={800} 
            sx={{ color: "#1e2a3b" }}
        >
            {mainCategories.find(c => c.key === active)?.label}
        </Typography>
        <Typography 
            variant="body1" 
            textAlign="center" 
            color="#555" 
            mb={6}
        >
            Soʻnggi voqealar
        </Typography>

        {/* Category Tabs Bar */}
        <Box display="flex" justifyContent="center" gap={{ xs: 1, sm: 3 }} mb={6} maxWidth={1000} mx="auto">
            {mainCategories.map((item) => {
                const isActive = active === item.key;
                const style = getItemStyle(item.key);
                return (
                    <Button
                        key={item.key}
                        onClick={() => setActive(item.key)}
                        variant={isActive ? "contained" : "text"}
                        size="large"
                        startIcon={item.icon}
                        sx={{
                            textTransform: 'uppercase', 
                            fontWeight: 700, 
                            borderRadius: 1, 
                            py: 1,
                            px: 2,
                            color: isActive ? 'white' : '#4a5568',
                            bgcolor: isActive ? style.primary : 'transparent',
                            '&:hover': {
                                bgcolor: isActive ? style.secondary : alpha(style.primary, 0.1),
                                color: isActive ? 'white' : style.primary,
                            }
                        }}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </Box>
      </Box>

      {/* HORIZONTAL SLIDER / SCROLLABLE CONTENT */}
      <Box 
        sx={{
          position: 'relative', 
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        {/* Navigatsiya tugmalari */}
        {filteredData.length > 0 && renderNavButtons()}
        
        <Box 
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap', 
              gap: 3, 
              overflowX: 'scroll', 
              padding: { xs: '0 16px', md: '0 40px' }, 
              pb: 4, 
              alignItems: 'stretch', // Teng balandlik
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
            key={active}
        >
          
          {filteredData.map((item, idx) => {
            const style = getItemStyle(item.type);

            return (
              <Card
                key={item.title + idx}
                sx={{
                  // Bir xil kenglik
                  minWidth: { xs: 260, sm: 280, md: 300 }, 
                  maxWidth: { xs: 260, sm: 280, md: 300 },
                  
                  borderRadius: 3,
                  boxShadow: "0px 6px 20px rgba(0,0,0,0.08)",
                  transition: ".3s ease-in-out",
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column', 
                  flexShrink: 0,
                  
                  // Animatsiya
                  animation: `${slideUp} 0.5s ease forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0, 

                  "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0px 10px 30px ${alpha(style.primary, 0.3)}`,
                  },
                }}
              >
                  {/* 1. Rasm Sektori */}
                  <Box 
                      sx={{
                          height: 180, 
                          backgroundImage: `url(${item.img})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-end',
                          
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: alpha(style.primary, 0.2),
                            transition: '0.3s'
                          }
                      }}
                  >
                      {/* Sana/Vaqt */}
                      <Box 
                          sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              right: 10, 
                              bgcolor: 'white', 
                              color: '#1e2a3b', 
                              px: 1, 
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: 12,
                              fontWeight: 600,
                              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                      >
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                          {item.date} {item.year}
                      </Box>
                  </Box>
                  
                  {/* 2. Ma'lumot Sektori */}
                  <CardContent 
                      sx={{
                          p: 2,
                          flexGrow: 1, // Karta balandligi avtomatik kengayishi uchun
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          background: 'white',
                          borderBottom: `8px solid ${style.primary}`, 
                      }}
                  >
                      <Box>
                          <Typography 
                              variant="body1" 
                              fontWeight={700} 
                              sx={{ color: '#1e2a3b' }} // Matn qisqartirilmaydi
                              mb={2} // Faqat sarlavha qolgani uchun pastki masofa kattalashtirildi
                          >
                              {item.title}
                          </Typography>
                          {/* META Olib tashlandi */}
                      </Box>
                      
                      {/* Batafsil Tugmasi */}
                      <Button 
                          variant="contained" 
                          fullWidth
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                              textTransform: 'uppercase', 
                              fontWeight: 700,
                              bgcolor: style.primary,
                              py: 1,
                              borderRadius: 2,
                              '&:hover': {
                                  bgcolor: style.secondary,
                              }
                          }}
                      >
                          Batafsil
                      </Button>
                  </CardContent>
              </Card>
            );
          })}
          
          {/* Kontent yo'q bo'lsa */}
          {filteredData.length === 0 && (
              <Box textAlign="center" py={5} width="100%" color="#7f8c8d" sx={{ flexShrink: 0, ml: 'auto', mr: 'auto' }}>
                  <Typography variant="h5">Hozircha **{active.toUpperCase()}** bo'yicha ma'lumotlar mavjud emas.</Typography>
              </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}