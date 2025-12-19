import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  IconButton, Stack, Drawer, List, ListItem, ListItemText,
  Collapse, Divider
} from '@mui/material';
import { 
  KeyboardArrowDown, KeyboardArrowRight, Facebook, 
  X as XIcon, Instagram, Menu as MenuIcon, Close as CloseIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'ASOSIY', active: true, path: '/' },
  { name: 'UNIVERSITET', hasDropdown: true, sub: ['Ma\'muriyat', 'Nizom', 'Galereya'] },
  { 
    name: 'TUZILMA', 
    hasDropdown: true, 
    sub: [
      { name: 'Fakultetlar' },
      { name: 'Kafedralar' },
      { name: 'Markazlar' }
    ] 
  },
  { name: 'TALABALAR', hasDropdown: true, sub: ['HEMIS Student', 'O\'quv rejalar', 'Kutubxona'] },
  { name: 'ALOQA', path: '/contact' },
];

const TwoNavbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0a0a0a', boxShadow: 'none', borderBottom: '1px solid #222', zIndex: 1201 }}>
      <Toolbar disableGutters sx={{ minHeight: { xs: '70px', md: '90px' } }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* 1. LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
            <Box sx={{ bgcolor: '#ff7a00', p: '5px 10px', borderRadius: '0' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', lineHeight: 1 }}>F</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 2, color: 'white', display: 'block' }}>
              STU <Typography component="span" sx={{ color: '#ff7a00', fontWeight: 900 }}>ACADEMY</Typography>
            </Typography>
          </Box>

          {/* 2. DESKTOP NAV LINKS */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, height: '90px' }}>
            {navLinks.map((link) => (
              <Box 
                key={link.name}
                onMouseEnter={() => link.hasDropdown && setActiveMenu(link.name)}
                onMouseLeave={() => setActiveMenu(null)}
                sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Button
                  endIcon={link.hasDropdown ? <KeyboardArrowDown sx={{ 
                    transition: '0.3s', 
                    transform: activeMenu === link.name ? 'rotate(180deg)' : 'none'
                  }} /> : null}
                  sx={{
                    color: link.active || activeMenu === link.name ? '#ff7a00' : 'white',
                    fontWeight: 700, fontSize: '13px', px: 2, height: '100%', borderRadius: 0,
                    letterSpacing: 1, '&:hover': { bgcolor: 'transparent', color: '#ff7a00' }
                  }}
                >
                  {link.name}
                </Button>

                <AnimatePresence>
                  {activeMenu === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      style={{
                        position: 'absolute', top: '90px', left: 0, backgroundColor: '#111',
                        minWidth: '220px', borderTop: '4px solid #ff7a00',
                        boxShadow: '0px 15px 40px rgba(0,0,0,0.6)'
                      }}
                    >
                      {link.sub.map((subItem, idx) => (
                        <Button
                          key={idx}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start', color: '#ccc', p: 2, borderRadius: 0,
                            textTransform: 'none', borderBottom: '1px solid #1a1a1a',
                            '&:hover': { color: '#ff7a00', bgcolor: '#161616', pl: 3 },
                            transition: '0.3s'
                          }}
                        >
                          {subItem.name || subItem}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ))}
          </Stack>

          {/* 3. ACTIONS (Social & Search) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, mr: 2 }}>
              <IconButton sx={{ color: 'white', '&:hover': {color: '#ff7a00'} }}><Facebook fontSize="small" /></IconButton>
              <IconButton sx={{ color: 'white', '&:hover': {color: '#ff7a00'} }}><XIcon fontSize="small" /></IconButton>
              <IconButton sx={{ color: 'white', '&:hover': {color: '#ff7a00'} }}><Instagram fontSize="small" /></IconButton>
            </Box>

            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#ff7a00', color: '#000', borderRadius: 0, px: 3, 
                fontWeight: 900, '&:hover': { bgcolor: '#e66e00' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              QABUL 2026
            </Button>

            <IconButton 
              onClick={handleDrawerToggle}
              sx={{ color: 'white', display: { md: 'none' }, ml: 1, bgcolor: '#1a1a1a', borderRadius: '4px' }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Container>
      </Toolbar>

      {/* 4. MOBILE DRAWER */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: '280px', bgcolor: '#0a0a0a', color: 'white', borderRight: '1px solid #222' } }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>MENU</Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ bgcolor: '#222' }} />
        
        <List sx={{ pt: 0 }}>
          {navLinks.map((link) => (
            <Box key={link.name}>
              <ListItem 
                onClick={() => link.hasDropdown ? setMobileDropdown(mobileDropdown === link.name ? null : link.name) : handleDrawerToggle()}
                sx={{ 
                  py: 2, cursor: 'pointer',
                  borderBottom: '1px solid #1a1a1a',
                  color: link.active ? '#ff7a00' : 'white'
                }}
              >
                <ListItemText primary={link.name} primaryTypographyProps={{ fontWeight: 700, fontSize: '15px' }} />
                {link.hasDropdown && (mobileDropdown === link.name ? <KeyboardArrowDown sx={{color: '#ff7a00'}}/> : <KeyboardArrowRight />)}
              </ListItem>
              
              <Collapse in={mobileDropdown === link.name} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: '#111' }}>
                  {link.sub && link.sub.map((sub, i) => (
                    <ListItem key={i} button sx={{ pl: 4, py: 1.5, borderBottom: '1px solid #0a0a0a' }}>
                      <ListItemText 
                        primary={sub.name || sub} 
                        primaryTypographyProps={{ fontSize: '14px', color: '#aaa' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>

        <Box sx={{ p: 3, mt: 'auto' }}>
          <Button fullWidth variant="contained" sx={{ bgcolor: '#ff7a00', color: '#000', fontWeight: 900, borderRadius: 0 }}>
            TIZIMGA KIRISH
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default TwoNavbar;