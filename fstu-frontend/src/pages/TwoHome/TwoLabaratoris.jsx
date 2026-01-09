import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { 
  Code, PrecisionManufacturing, Biotech, ArrowForward, 
  Terminal, SettingsInputComponent, Science, Hub 
} from '@mui/icons-material';

// --- 1. INTERAKTIV ROBOT (Pick & Place Game) ---
const RobotPickAndPlace = () => {
  const containerRef = useRef(null);
  const [holding, setHolding] = useState(null); // Ushlab turilgan ob'ekt
  const [samples, setSamples] = useState([
    { id: 1, color: '#00e5ff', label: 'H2O', x: '25%', y: '25%' },
    { id: 2, color: '#ff0055', label: 'NaCl', x: '75%', y: '20%' },
  ]);
  const [status, setStatus] = useState('READY');

  const springX = useMotionValue(0);
  const springY = useMotionValue(0);
  const springConfig = { stiffness: 60, damping: 20, mass: 1.2 };
  
  const rotateArm1 = useSpring(useTransform(springX, [-300, 300], [-60, 60]), springConfig);
  const rotateArm2 = useSpring(useTransform(springY, [-250, 250], [0, 110]), springConfig);

  const handleInteraction = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const relX = clickX - rect.width / 2;
      const relY = clickY - rect.height / 2;

      springX.set(relX);
      springY.set(relY);
      setStatus('MOVING');

      setTimeout(() => {
        if (!holding) {
          // Ob'ektni qidirish
          const found = samples.find(s => {
            const sx = parseFloat(s.x) * rect.width / 100;
            const sy = parseFloat(s.y) * rect.height / 100;
            return Math.abs(sx - clickX) < 45 && Math.abs(sy - clickY) < 45;
          });

          if (found) {
            setHolding(found);
            setSamples(samples.filter(s => s.id !== found.id));
            setStatus('GRABBED');
          } else {
            setStatus('READY');
          }
        } else {
          // Ob'ektni yangi joyga qo'yish
          setSamples([...samples, { ...holding, x: `${(clickX / rect.width) * 100}%`, y: `${(clickY / rect.height) * 100}%` }]);
          setHolding(null);
          setStatus('PLACED');
        }
      }, 850);
    }
  };

  return (
    <Box ref={containerRef} onClick={handleInteraction} sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#020617', overflow: 'hidden', cursor: 'crosshair', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', pb: 5 }}>
      {/* Laboratoriya Setkasi */}
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* NAMUNALAR (SAMPLES) */}
      {samples.map(sample => (
        <motion.div key={sample.id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', left: sample.x, top: sample.y, width: 40, height: 40, backgroundColor: sample.color, border: '2px solid white', borderRadius: '6px', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${sample.color}`, zIndex: 5 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>{sample.label}</Typography>
        </motion.div>
      ))}

      {/* ROBOT TUZILMASI */}
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <Box sx={{ width: 220, height: 20, bgcolor: '#1e293b', border: '2px solid #00e5ff', borderRadius: '4px' }} />
        
        <motion.div style={{ width: 24, height: 180, background: 'linear-gradient(to top, #02509e, #00e5ff)', borderRadius: 12, transformOrigin: 'bottom center', rotate: rotateArm1, position: 'absolute', bottom: 20 }}>
          <Box sx={{ position: 'absolute', top: -15, left: -8, width: 40, height: 40, bgcolor: '#020617', border: '4px solid #00e5ff', borderRadius: '50%' }} />
          
          <motion.div style={{ width: 16, height: 160, background: '#f8fafc', borderRadius: 8, transformOrigin: 'bottom center', rotate: rotateArm2, position: 'absolute', top: -145, left: 4 }}>
            {/* Robot "Panjasi" */}
            <Box sx={{ position: 'absolute', top: -35, left: -17, width: 50, height: 40 }}>
              <motion.div animate={{ rotate: holding ? 25 : 0 }} style={{ width: 4, height: 25, background: '#ff0055', position: 'absolute', left: 10, borderRadius: 2 }} />
              <motion.div animate={{ rotate: holding ? -25 : 0 }} style={{ width: 4, height: 25, background: '#ff0055', position: 'absolute', right: 10, borderRadius: 2 }} />
              
              {holding && (
                <Box sx={{ position: 'absolute', top: 5, left: 15, width: 20, height: 20, bgcolor: holding.color, borderRadius: '2px', boxShadow: `0 0 10px ${holding.color}` }} />
              )}
            </Box>
          </motion.div>
        </motion.div>
      </Box>

      {/* DASHBOARD */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, color: '#00e5ff', p: 2, border: '1px solid #00e5ff33', bgcolor: '#000000aa', backdropFilter: 'blur(8px)', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 1, letterSpacing: 1 }}>SYSTEM_AUTO_LAB</Typography>
        <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>STATUS: {status}</Typography>
        <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: holding ? '#ff0055' : '#00e5ff' }}>CARGO: {holding ? holding.label : 'NONE'}</Typography>
      </Box>
    </Box>
  );
};

// --- BOSHQA LABORATORIYALAR ---
const ITScreen = () => (
  <Box sx={{ height: '100%', width: '100%', bgcolor: '#000', p: 3, display: 'flex', gap: 2 }}>
    <Box sx={{ flex: 1.5, border: '1px solid #1a1a1a', p: 2, overflow: 'hidden', borderRadius: 2 }}>
      <Terminal sx={{ color: '#27c93f', mb: 1 }} />
      {[...Array(10)].map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
          style={{ height: 4, width: `${Math.random() * 80 + 10}%`, backgroundColor: '#27c93f', marginBottom: 8 }} />
      ))}
    </Box>
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Hub sx={{ fontSize: 100, color: '#02509e', opacity: 0.4 }} /></Box>
  </Box>
);

const MechatronicsScreen = () => (
  <Box sx={{ height: '100%', width: '100%', bgcolor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
      <SettingsInputComponent sx={{ fontSize: 180, color: '#facc15', opacity: 0.1 }} />
    </motion.div>
    <Typography variant="h6" sx={{ position: 'absolute', color: '#facc15', fontWeight: 900, fontFamily: 'monospace' }}>ENGINE_SYNC_v2</Typography>
  </Box>
);

const BiotechScreen = () => (
  <Box sx={{ height: '100%', width: '100%', bgcolor: '#021a12', overflow: 'hidden' }}>
    {[...Array(15)].map((_, i) => (
      <motion.div key={i} animate={{ y: [600, -100], x: [0, Math.random() * 20] }} transition={{ duration: 4 + i, repeat: Infinity }}
        style={{ position: 'absolute', left: `${Math.random() * 100}%`, width: 10, height: 10, bgcolor: '#27c93f', borderRadius: '50%', opacity: 0.3 }} />
    ))}
    <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Science sx={{ fontSize: 120, color: '#27c93f', filter: 'blur(1px)' }} /></Box>
  </Box>
);

// --- ASOSIY KOMPONENT ---
const labData = [
  { id: 1, title: "Robototexnika", icon: <PrecisionManufacturing />, component: <RobotPickAndPlace />, desc: "Laboratoriya namunalarini ushlang va ularni tahlil qilish uchun ko'chiring." },
  { id: 2, title: "IT-Akademiya", icon: <Code />, component: <ITScreen />, desc: "Dasturlash, kiberxavfsizlik va bulutli texnologiyalar laboratoriyasi." },
  { id: 3, title: "Mexatronika", icon: <SettingsInputComponent />, component: <MechatronicsScreen />, desc: "Mexanik tizimlarni elektron boshqaruv bilan integratsiya qilish." },
  { id: 4, title: "Biotexnologiya", icon: <Biotech />, component: <BiotechScreen />, desc: "Molekulyar biologiya va genetik tadqiqotlar markazi." },
];

const TwoLabaratoris = () => {
  const [activeTab, setActiveTab] = useState(labData[0]);

  return (
    <Box sx={{ bgcolor: '#f1f5f9', py: 10 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 6, fontSize: '2rem', color: '#0f172a' }}>
          O'QUV LABORATORIYALARI
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          {/* MENU */}
          <Box sx={{ flex: 0.7, width: '100%' }}>
            <Stack spacing={2}>
              {labData.map((tab) => (
                <Box key={tab.id} onClick={() => setActiveTab(tab)} sx={{ p: 3, cursor: 'pointer', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: activeTab.id === tab.id ? '#02509e' : 'white', color: activeTab.id === tab.id ? 'white' : '#64748b', boxShadow: activeTab.id === tab.id ? '0 15px 35px rgba(2,80,158,0.25)' : '0 4px 6px rgba(0,0,0,0.02)', transition: '0.4s' }}>
                  <Stack direction="row" spacing={2} alignItems="center">{tab.icon} <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{tab.title.toUpperCase()}</Typography></Stack>
                  <ArrowForward sx={{ fontSize: 18, opacity: 0.5 }} />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* DISPLAY AREA */}
          <Box sx={{ flex: 2, width: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }}>
                <Box sx={{ height: { xs: 300, md: 650 }, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.12)', border: '10px solid white', bgcolor: 'white' }}>
                  <Box sx={{ height: '75%' }}>{activeTab.component}</Box>
                  <Box sx={{ p: 4, bgcolor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <Box><Typography variant="h5" sx={{ fontWeight: 900 }}>{activeTab.title}</Typography><Typography variant="body2" sx={{ color: '#64748b' }}>{activeTab.desc}</Typography></Box>
                    <Button variant="contained" sx={{ bgcolor: '#02509e', borderRadius: '14px', px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}>Boshlash</Button>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default TwoLabaratoris;