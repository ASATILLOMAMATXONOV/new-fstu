// import React from "react";
// import { 
//   Box, Typography, Container, Grid, Card, CardMedia, 
//   CardContent, Stack, Chip, Button, useTheme 
// } from "@mui/material";
// import { motion } from "framer-motion";
// import { 
//   Beaker, Cpu, Zap, Microscope, 
//   ShieldCheck, ArrowRight, Binary 
// } from "lucide-react";

// import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
// import TwoFooter from "../../pages/TwoHome/TwoFooter";
// import ColorModeProvider from "../../components/theme/ColorModeContext";

// // Laboratoriya ma'lumotlari
// const laboratories = [
//   {
//     id: 1,
//     title: "Robototexnika va Mexatronika",
//     description: "Sanoat robotlari, sensorlar va avtomatlashtirilgan tizimlarni loyihalash laboratoriyasi.",
//     image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070",
//     tools: ["Arduino", "KUKA Robots", "3D Printers"],
//     color: "#3f51b5"
//   },
//   {
//     id: 2,
//     title: "Muqobil Energiya Manbalari",
//     description: "Quyosh panellari va shamol energetikasi bo'yicha ilmiy-tadqiqot markazi.",
//     image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?q=80&w=2070",
//     tools: ["Solar Panels", "Inverters", "Energy Meters"],
//     color: "#4caf50"
//   },
//   {
//     id: 3,
//     title: "IT va Kiberxavfsizlik",
//     description: "Yuqori tezlikdagi serverlar va tarmoq xavfsizligini o'rganish xonasi.",
//     image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
//     tools: ["Cisco", "Kali Linux", "Cloud Servers"],
//     color: "#2196f3"
//   },
//   {
//     id: 4,
//     title: "Kimyoviy Texnologiyalar",
//     description: "Moddalarni analiz qilish va yangi polimer materiallar yaratish laboratoriyasi.",
//     image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2074",
//     tools: ["Spectrometers", "Centrifuges", "Distillation"],
//     color: "#e91e63"
//   }
// ];

// const LabCard = ({ lab }) => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   return (
//     <Grid item xs={12} md={6}>
//       <motion.div
//         whileHover={{ y: -10 }}
//         initial={{ opacity: 0, scale: 0.9 }}
//         whileInView={{ opacity: 1, scale: 1 }}
//         viewport={{ once: true }}
//       >
//         <Card sx={{ 
//           borderRadius: "30px", 
//           overflow: "hidden", 
//           bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
//           backdropFilter: "blur(10px)",
//           border: "1px solid",
//           borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
//           boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)"
//         }}>
//           <Box sx={{ position: "relative", height: "280px" }}>
//             <CardMedia
//               component="img"
//               height="100%"
//               image={lab.image}
//               alt={lab.title}
//               sx={{ transition: "0.5s", "&:hover": { transform: "scale(1.1)" } }}
//             />
//             <Box sx={{ 
//               position: "absolute", top: 20, right: 20, 
//               bgcolor: lab.color, p: 1.5, borderRadius: "15px", color: "#fff" 
//             }}>
//               <Microscope size={24} />
//             </Box>
//           </Box>

//           <CardContent sx={{ p: 4 }}>
//             <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: "24px" }}>
//               {lab.title}
//             </Typography>
//             <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.7 }}>
//               {lab.description}
//             </Typography>
            
//             <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
//               {lab.tools.map((tool) => (
//                 <Chip 
//                   key={tool} 
//                   label={tool} 
//                   size="small" 
//                   sx={{ borderRadius: "8px", fontWeight: 600, bgcolor: `${lab.color}15`, color: lab.color }} 
//                 />
//               ))}
//             </Stack>

//             <Button 
//               fullWidth 
//               variant="outlined" 
//               endIcon={<ArrowRight />}
//               sx={{ 
//                 borderRadius: "15px", 
//                 py: 1.5, 
//                 fontWeight: 700,
//                 borderColor: lab.color,
//                 color: lab.color,
//                 "&:hover": { bgcolor: lab.color, color: "#fff", borderColor: lab.color }
//               }}
//             >
//               Batafsil ma'lumot
//             </Button>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </Grid>
//   );
// };

// const LaboratoriesContent = () => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   const pageWrapper = {
//     minHeight: "100vh",
//     backgroundImage: `linear-gradient(${isDark ? 'rgba(10, 10, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'}, ${isDark ? 'rgba(10, 10, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'}), url('https://www.transparenttextures.com/patterns/cubes.png')`,
//     backgroundAttachment: "fixed",
//   };

//   return (
//     <Box sx={pageWrapper}>
//       <TwoNavbar />
      
//       <Container maxWidth="lg" sx={{ py: 15 }}>
//         {/* Header Section */}
//         <Box sx={{ textAlign: "center", mb: 10 }}>
//           <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
//             <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 4 }}>
//               Innovatsion Markazlar
//             </Typography>
//             <Typography variant="h2" sx={{ fontWeight: 900, mt: 2, fontSize: { xs: "32px", md: "48px" } }}>
//               Bizning Laboratoriyalar
//             </Typography>
//             <Box sx={{ width: "80px", height: "5px", bgcolor: "primary.main", mx: "auto", mt: 2, borderRadius: "10px" }} />
//           </motion.div>
//         </Box>

//         {/* Grid System */}
//         <Grid container spacing={4}>
//           {laboratories.map((lab) => (
//             <LabCard key={lab.id} lab={lab} />
//           ))}
//         </Grid>

//         {/* Info Section */}
//         <Box sx={{ mt: 15, p: 6, borderRadius: "40px", bgcolor: "primary.main", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
//           <Zap size={100} style={{ position: "absolute", top: -20, left: -20, opacity: 0.1 }} />
//           <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Ilm-fan cho'qqilarini biz bilan zabt eting!</Typography>
//           <Typography variant="h6" sx={{ opacity: 0.8, mb: 4, maxWidth: "700px", mx: "auto" }}>
//             Laboratoriyalarimiz eng so'nggi texnologiyalar bilan jihozlangan bo'lib, talabalarning amaliy ko'nikmalarini oshirishga xizmat qiladi.
//           </Typography>
//           <Button variant="contained" sx={{ bgcolor: "#fff", color: "primary.main", px: 5, py: 2, borderRadius: "15px", fontWeight: 800, "&:hover": { bgcolor: "#f0f0f0" } }}>
//             Hamkorlik qilish
//           </Button>
//         </Box>
//       </Container>

//       <TwoFooter />
//     </Box>
//   );
// };

// const TwoLaboratories = () => (
//   <ColorModeProvider>
//     <LaboratoriesContent />
//   </ColorModeProvider>
// );

// export default TwoLaboratories;