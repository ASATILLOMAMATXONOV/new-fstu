import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Mail, Phone, ChevronRight, 
  ArrowLeft, Building2, Info, BookOpen, Microscope, Globe, ExternalLink
} from 'lucide-react';

const TwoDepartments = () => {
  const [selectedFac, setSelectedFac] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const accentColor = '#ff7a00';

  const data = [
    {
      id: 1,
      facName: "Kompyuter injiniringi fakulteti",
      icon: <Building2 size={24} />,
      departments: [
        {
          id: 101,
          name: "Dasturiy injiniring kafedrasi",
          icon: <Users size={20} />,
          fullDesc: "Kafedra zamonaviy dasturlash texnologiyalari, sun'iy intellekt va katta ma'lumotlar (Big Data) bilan ishlash bo'yicha mutaxassislar tayyorlaydi. Kafedrada xalqaro darajadagi 5 ta o'quv laboratoriyasi mavjud.",
          stats: { students: "450+", projects: "12 ta", papers: "85 ta" },
          head: {
            name: "Akramov Anvar Abduqahhorovich",
            role: "Kafedra mudiri, Dotsent",
            email: "anvar.akramov@fpi.uz",
            phone: "+998 90 123 45 67",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400"
          }
        },
        {
          id: 102,
          name: "Axborot texnologiyalari",
          icon: <Users size={20} />,
          fullDesc: "Tizimli tahlil, bulutli texnologiyalar va IT-menejment yo'nalishlarida ta'lim beruvchi yetakchi kafedra. Talabalar Google va Microsoft kabi kompaniyalarda amaliyot o'tashadi.",
          stats: { students: "380+", projects: "8 ta", papers: "110 ta" },
          head: {
            name: "Ergashev Mansur Sodiqovich",
            role: "Kafedra mudiri, PhD",
            email: "m.ergashev@fpi.uz",
            phone: "+998 93 444 55 66",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
          }
        }
      ]
    }
  ];

  return (
    <div style={styles.sectionWrapper}>
      <div style={styles.container}>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <h2 style={styles.title}>Kafedralar <span style={{color: accentColor}}>Portali</span></h2>
          <p style={styles.subtitle}>Barcha ilmiy va amaliy ma'lumotlar bir joyda</p>
        </motion.div>

        <div className="main-layout" style={styles.mainLayout}>
          {/* SIDEBAR */}
          <div className="sidebar" style={styles.sidebar}>
            {data.map((fac, idx) => (
              <motion.div 
                key={fac.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {setSelectedFac(fac); setSelectedDept(null);}}
                style={{
                  ...styles.facCard,
                  borderColor: selectedFac?.id === fac.id ? accentColor : '#222',
                  background: selectedFac?.id === fac.id ? 'rgba(255, 122, 0, 0.1)' : '#0d0d0d',
                  boxShadow: selectedFac?.id === fac.id ? `0 0 20px ${accentColor}33` : 'none'
                }}
              >
                <div style={{...styles.iconBox, color: selectedFac?.id === fac.id ? accentColor : '#555'}}>{fac.icon}</div>
                <span style={styles.facText}>{fac.facName}</span>
                <ChevronRight size={18} />
              </motion.div>
            ))}
          </div>

          {/* ASOSIY PANEL */}
          <div className="content-panel" style={styles.contentPanel}>
            <AnimatePresence mode="wait">
              {!selectedFac ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={styles.emptyState}
                >
                  <Info size={40} style={{marginBottom: '15px', opacity: 0.2}} />
                  <p>Chapdan fakultetni tanlang</p>
                </motion.div>
              ) : !selectedDept ? (
                <motion.div 
                  key="dept-list"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={styles.deptGrid}
                >
                  <h3 style={styles.panelTitle}>{selectedFac.facName} yo'nalishlari:</h3>
                  {selectedFac.departments.map((dept, i) => (
                    <motion.div 
                      key={dept.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 10, background: '#151515' }}
                      onClick={() => setSelectedDept(dept)} 
                      style={styles.deptItem}
                    >
                      <div style={styles.deptIcon}>{dept.icon}</div>
                      <div style={{flex: 1}}>
                         <div style={styles.deptName}>{dept.name}</div>
                         <div style={{fontSize: '12px', color: '#555'}}>Batafsil ko'rish</div>
                      </div>
                      <ChevronRight size={18} color={accentColor} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  style={styles.detailsBox}
                >
                  <button onClick={() => setSelectedDept(null)} style={styles.backBtn}>
                    <ArrowLeft size={16} /> Ro'yxatga qaytish
                  </button>

                  <div className="details-flex" style={styles.flexContainer}>
                    {/* CHAP */}
                    <div className="details-left" style={styles.leftCol}>
                      <motion.div 
                        whileHover={{ y: -10 }}
                        style={styles.imageCard}
                      >
                        <img src={selectedDept.head.image} alt="head" style={styles.headImage} />
                        <div style={{...styles.roleTag, backgroundColor: accentColor}}>{selectedDept.head.role}</div>
                      </motion.div>
                      <div style={styles.contactList}>
                        <div style={styles.contactItem}><Phone size={16} color={accentColor}/> {selectedDept.head.phone}</div>
                        <div style={styles.contactItem}><Mail size={16} color={accentColor}/> {selectedDept.head.email}</div>
                      </div>
                    </div>

                    {/* O'NG */}
                    <div className="details-right" style={styles.rightCol}>
                      <motion.h3 initial={{opacity:0}} animate={{opacity:1}} style={styles.detailName}>{selectedDept.head.name}</motion.h3>
                      <h4 style={styles.deptTitleText}>{selectedDept.name}</h4>
                      
                      <div style={styles.descBox}>
                        <p style={styles.fullDescription}>{selectedDept.fullDesc}</p>
                      </div>

                      <div className="stats-row" style={styles.statsRow}>
                        {[
                          { icon: <Users />, val: selectedDept.stats.students, lab: "Talabalar" },
                          { icon: <Microscope />, val: selectedDept.stats.projects, lab: "Loyihalar" },
                          { icon: <BookOpen />, val: selectedDept.stats.papers, lab: "Maqolalar" }
                        ].map((s, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            style={styles.statBox}
                          >
                            <div style={{color: accentColor}}>{s.icon}</div>
                            <div><div style={styles.sNum}>{s.val}</div><div style={styles.sLab}>{s.lab}</div></div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{...styles.fullDetailBtn, backgroundColor: accentColor}}
                      >
                         Veb-saytga o'tish <ExternalLink size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .main-layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; order: 2; }
          .content-panel { order: 1; padding: 25px !important; margin-bottom: 20px; }
        }
        @media (max-width: 768px) {
          .details-flex { flex-direction: column !important; }
          .details-left { width: 100% !important; margin-bottom: 20px; }
          .stats-row { flex-wrap: wrap; }
          .stat-box { flex: 1 1 40% !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  sectionWrapper: { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '60px 20px', fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { color: '#666', marginTop: '10px' },
  mainLayout: { display: 'flex', gap: '30px' },
  sidebar: { width: '320px', display: 'flex', flexDirection: 'column', gap: '15px' },
  facCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '18px', border: '1px solid', cursor: 'pointer', transition: 'border 0.3s' },
  iconBox: { minWidth: '40px' },
  facText: { flex: 1, fontWeight: '700', fontSize: '14px' },
  contentPanel: { flex: 1, backgroundColor: '#0d0d0d', borderRadius: '30px', padding: '45px', border: '1px solid #222', minHeight: '500px', position: 'relative', overflow: 'hidden' },
  emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '20px' },
  panelTitle: { marginBottom: '30px', fontSize: '22px', fontWeight: '800' },
  deptGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  deptItem: { display: 'flex', alignItems: 'center', gap: '20px', padding: '22px', backgroundColor: '#111', borderRadius: '20px', cursor: 'pointer' },
  deptIcon: { backgroundColor: '#1a1a1a', padding: '12px', borderRadius: '12px', color: '#ff7a00' },
  deptName: { fontWeight: '700', fontSize: '17px' },
  detailsBox: { width: '100%' },
  backBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontWeight: '700' },
  flexContainer: { display: 'flex', gap: '40px' },
  leftCol: { width: '260px', flexShrink: 0 },
  imageCard: { position: 'relative', marginBottom: '25px', cursor: 'pointer' },
  headImage: { width: '100%', height: '320px', objectFit: 'cover', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  roleTag: { position: 'absolute', bottom: '15px', left: '15px', right: '15px', padding: '10px', borderRadius: '15px', textAlign: 'center', fontSize: '11px', fontWeight: '800' },
  contactList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  contactItem: { fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#151515', padding: '12px', borderRadius: '12px' },
  rightCol: { flex: 1 },
  detailName: { fontSize: '32px', fontWeight: '900', marginBottom: '5px' },
  deptTitleText: { fontSize: '18px', color: '#ff7a00', fontWeight: '600', marginBottom: '25px' },
  descBox: { backgroundColor: '#151515', padding: '25px', borderRadius: '20px', marginBottom: '30px', borderLeft: '4px solid #ff7a00' },
  fullDescription: { margin: 0, fontSize: '15px', lineHeight: '1.7', color: '#bbb' },
  statsRow: { display: 'flex', gap: '15px', marginBottom: '35px' },
  statBox: { flex: 1, backgroundColor: '#080808', padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #1a1a1a' },
  sNum: { fontSize: '17px', fontWeight: '900' },
  sLab: { fontSize: '10px', color: '#555', textTransform: 'uppercase' },
  fullDetailBtn: { width: '100%', border: 'none', color: '#fff', padding: '18px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }
};

export default TwoDepartments;