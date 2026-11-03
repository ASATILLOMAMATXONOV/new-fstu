import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControlLabel, Grid, IconButton, Paper, Stack, Switch,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs,
  TextField, Tooltip, Typography
} from '@mui/material';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined, UploadOutlined
} from '@ant-design/icons';

import { createContentItem, deleteContentItem, fetchContentList, updateContentItem } from 'api/cms';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { prepareManagedImageUpload } from 'utils/content-images';

const RESOURCE = 'international-department';
const languages = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const emptyLeaderLanguage = () => ({ firstName: '', lastName: '', position: '', receptionTime: '' });
const emptyLeader = () => ({
  id: null,
  entryType: 'leader',
  image: '',
  email: '',
  phone: '',
  telegram: '',
  instagram: '',
  active: true,
  uz: emptyLeaderLanguage(),
  ru: emptyLeaderLanguage(),
  en: emptyLeaderLanguage()
});
const emptyMenuLanguage = () => ({ title: '', content: '' });
const emptyMenu = () => ({
  id: null,
  entryType: 'menu',
  slug: '',
  order: 0,
  active: true,
  uz: emptyMenuLanguage(),
  ru: emptyMenuLanguage(),
  en: emptyMenuLanguage()
});

const normalizeLeader = (item = {}) => ({
  ...emptyLeader(),
  ...item,
  entryType: 'leader',
  image: item.image || item.photo || '',
  ...Object.fromEntries(languages.map(({ key }) => {
    const value = item[key] || item.translations?.[key] || {};
    return [key, {
      ...emptyLeaderLanguage(),
      ...value,
      firstName: value.firstName || (key === 'uz' ? item.firstName || '' : ''),
      lastName: value.lastName || (key === 'uz' ? item.lastName || '' : ''),
      position: value.position || (key === 'uz' ? item.position || '' : ''),
      receptionTime: value.receptionTime || (key === 'uz' ? item.receptionTime || '' : '')
    }];
  }))
});

const normalizeMenu = (item = {}) => ({
  ...emptyMenu(),
  ...item,
  entryType: 'menu',
  order: Number(item.order ?? item.sortOrder ?? 0),
  active: item.active !== false,
  ...Object.fromEntries(languages.map(({ key }) => [key, {
    ...emptyMenuLanguage(),
    ...(item[key] || item.translations?.[key] || {})
  }]))
});

const createSlug = (value = '') => String(value)
  .toLocaleLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[‘’ʻʼ`']/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

function normalizeExternalUrl(value, platform) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (platform === 'telegram' && /^@[a-z\d_]+$/i.test(raw)) return `https://t.me/${raw.slice(1)}`;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
    return parsed.href;
  } catch {
    throw new Error(`${platform === 'telegram' ? 'Telegram' : 'Instagram'} havolasini to‘g‘ri kiriting.`);
  }
}

export default function InternationalDepartmentManagementPage() {
  const [searchParams] = useSearchParams();
  const activeSection = searchParams.get('section') === 'menus' ? 'menus' : 'leader';
  const imageInput = useRef(null);
  const [leader, setLeader] = useState(emptyLeader);
  const [menus, setMenus] = useState([]);
  const [leaderLanguage, setLeaderLanguage] = useState('uz');
  const [menuForm, setMenuForm] = useState(emptyMenu);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingLeader, setSavingLeader] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sortedMenus = useMemo(
    () => [...menus].sort((a, b) => Number(a.order) - Number(b.order)),
    [menus]
  );

  useEffect(() => {
    let cancelled = false;
    fetchContentList(RESOURCE)
      .then((items) => {
        if (cancelled) return;
        const leaderItem = items.find((item) => item.entryType === 'leader');
        setLeader(leaderItem ? normalizeLeader(leaderItem) : emptyLeader());
        setMenus(items.filter((item) => item.entryType === 'menu').map(normalizeMenu));
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Ma’lumotlarni yuklab bo‘lmadi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const changeLeader = (key, value) => setLeader((previous) => ({ ...previous, [key]: value }));
  const changeLeaderLanguage = (key, value) => setLeader((previous) => ({
    ...previous,
    [leaderLanguage]: { ...previous[leaderLanguage], [key]: value }
  }));
  const changeMenu = (key, value) => setMenuForm((previous) => ({ ...previous, [key]: value }));
  const changeMenuLanguage = (language, key, value) => setMenuForm((previous) => ({
    ...previous,
    [language]: { ...previous[language], [key]: value }
  }));

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { dataUrl } = await prepareManagedImageUpload(file, RESOURCE);
      changeLeader('image', dataUrl);
    } catch (err) {
      setError(err.message || 'Rasmni tayyorlab bo‘lmadi.');
    } finally {
      setUploading(false);
    }
  };

  const saveLeader = async (event) => {
    event.preventDefault();
    if (!leader.uz.firstName.trim() || !leader.uz.lastName.trim() || !leader.uz.position.trim()) {
      setLeaderLanguage('uz');
      setError('Rahbarning o‘zbekcha ismi, familiyasi va lavozimini kiriting.');
      return;
    }
    setSavingLeader(true);
    setError('');
    try {
      const payload = {
        ...leader,
        telegram: normalizeExternalUrl(leader.telegram, 'telegram'),
        instagram: normalizeExternalUrl(leader.instagram, 'instagram'),
        entryType: 'leader',
        title: `${leader.uz.firstName} ${leader.uz.lastName}`.trim(),
        order: -1,
        ...Object.fromEntries(languages.map(({ key }) => [key, {
          ...leader[key],
          fullName: `${leader[key].firstName} ${leader[key].lastName}`.trim()
        }]))
      };
      const saved = leader.id
        ? await updateContentItem(RESOURCE, leader.id, payload)
        : await createContentItem(RESOURCE, payload);
      setLeader(normalizeLeader(saved));
      setSuccess('Xalqaro bo‘lim rahbari ma’lumotlari saqlandi.');
    } catch (err) {
      setError(err.message || 'Rahbar ma’lumotlarini saqlab bo‘lmadi.');
    } finally {
      setSavingLeader(false);
    }
  };

  const openMenu = (item = null) => {
    setMenuForm(item ? normalizeMenu(item) : {
      ...emptyMenu(),
      order: menus.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1
    });
    setError('');
    setMenuDialogOpen(true);
  };

  const saveMenu = async (event) => {
    event.preventDefault();
    if (!menuForm.uz.title.trim() || !menuForm.uz.content.trim()) {
      setError('Menyu nomi va o‘zbekcha ma’lumotini kiriting.');
      return;
    }
    setSavingMenu(true);
    setError('');
    try {
      const slug = createSlug(menuForm.slug || menuForm.uz.title) || `menu-${Date.now()}`;
      const slugExists = menus.some((item) => String(item.id) !== String(menuForm.id) && item.slug === slug);
      if (slugExists) throw new Error('Bu URL nomi boshqa menyuda ishlatilgan. Boshqa URL nomini kiriting.');
      const payload = {
        ...menuForm,
        entryType: 'menu',
        slug,
        title: menuForm.uz.title.trim(),
        order: Number(menuForm.order) || 0
      };
      const saved = menuForm.id
        ? await updateContentItem(RESOURCE, menuForm.id, payload)
        : await createContentItem(RESOURCE, payload);
      setMenus((previous) => menuForm.id
        ? previous.map((item) => String(item.id) === String(menuForm.id) ? normalizeMenu(saved) : item)
        : [...previous, normalizeMenu(saved)]);
      setMenuDialogOpen(false);
      setSuccess('Xalqaro bo‘lim menyusi saqlandi.');
    } catch (err) {
      setError(err.message || 'Menyuni saqlab bo‘lmadi.');
    } finally {
      setSavingMenu(false);
    }
  };

  const removeMenu = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setError('');
    try {
      await deleteContentItem(RESOURCE, deleteTarget.id);
      setMenus((previous) => previous.filter((entry) => String(entry.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
      setSuccess('Menyu o‘chirildi.');
    } catch (err) {
      setError(err.message || 'Menyuni o‘chirib bo‘lmadi.');
    } finally {
      setDeletingId(null);
    }
  };

  if (menuDialogOpen) {
    return (
      <MainCard
        title={menuForm.id ? 'Menyuni tahrirlash' : 'Yangi menyu qo‘shish'}
        secondary={
          <Button
            variant="outlined"
            startIcon={<ArrowLeftOutlined />}
            disabled={savingMenu}
            onClick={() => { setMenuDialogOpen(false); setError(''); }}
          >
            Orqaga
          </Button>
        }
      >
        <Box component="form" onSubmit={saveMenu}>
          <Stack spacing={3}>
            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa', borderRadius: '6px' }}>
              <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight={800}>Asosiy sozlamalar</Typography>
                <Typography variant="body2" color="text.secondary">Menyu manzili, ko‘rinish tartibi va holatini boshqaring.</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    label="URL nomi"
                    placeholder="xalqaro-loyihalar"
                    value={menuForm.slug}
                    onChange={(event) => changeMenu('slug', createSlug(event.target.value))}
                    helperText={`Frontend manzili: /international/${menuForm.slug || createSlug(menuForm.uz.title) || 'menu-nomi'}`}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Tartib" value={menuForm.order} onChange={(event) => changeMenu('order', event.target.value)} inputProps={{ min: 0 }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel control={<Switch checked={menuForm.active} onChange={(event) => changeMenu('active', event.target.checked)} />} label="Faol" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa', borderRadius: '6px' }}>
              <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight={800}>Menyu nomlari</Typography>
                <Typography variant="body2" color="text.secondary">Har bir til uchun menyu nomini kiriting.</Typography>
              </Stack>
              <Grid container spacing={2}>
                {languages.map((item) => (
                  <Grid item xs={12} key={item.key}>
                    <TextField
                      fullWidth
                      label={`${item.label} nomi`}
                      value={menuForm[item.key].title}
                      required={item.key === 'uz'}
                      onChange={(event) => changeMenuLanguage(item.key, 'title', event.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa', borderRadius: '6px' }}>
              <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight={800}>Sahifa ma’lumotlari</Typography>
                <Typography variant="body2" color="text.secondary">Har bir til uchun menyu bosilganda ochiladigan matnni kiriting.</Typography>
              </Stack>
              <Stack spacing={3}>
                {languages.map((item) => (
                  <Paper key={item.key} variant="outlined" sx={{ overflow: 'hidden', borderRadius: '6px', bgcolor: 'background.paper' }}>
                    <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="h6" fontWeight={800}>{item.label} ma’lumoti</Typography>
                      <Typography variant="caption" color="text.secondary">Shu til uchun sahifa matni</Typography>
                    </Box>
                    <Box sx={{ p: { xs: 2, md: 2.5 }, '& .tox-tinymce': { minHeight: '420px !important', borderRadius: '6px !important' } }}>
                      <TinyMceField
                        label={`${item.label} kontenti`}
                        height={420}
                        value={menuForm[item.key].content}
                        onChange={(value) => changeMenuLanguage(item.key, 'content', value)}
                        disabled={savingMenu}
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
              <Button variant="outlined" disabled={savingMenu} onClick={() => { setMenuDialogOpen(false); setError(''); }}>Bekor qilish</Button>
              <Button type="submit" variant="contained" startIcon={savingMenu ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />} disabled={savingMenu}>
                {savingMenu ? 'Saqlanmoqda…' : 'Saqlash'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={activeSection === 'leader' ? 'Xalqaro bo‘lim rahbari' : 'Xalqaro bo‘lim menyulari'}
      secondary={activeSection === 'menus'
        ? <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => openMenu()}>Menyu qo‘shish</Button>
        : null}
    >
      <Stack spacing={3}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
        {loading && <Alert severity="info">Ma’lumotlar yuklanmoqda…</Alert>}

        {activeSection === 'leader' && <Paper component="form" onSubmit={saveLeader} variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4">Bo‘lim rahbari</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Rahbar kartasi frontendda Xalqaro bo‘lim menyularining yuqorisida chiqadi.
              </Typography>
            </Box>
            <Tabs value={leaderLanguage} onChange={(_, value) => setLeaderLanguage(value)}>
              {languages.map((item) => <Tab key={item.key} value={item.key} label={item.label} />)}
            </Tabs>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <Box sx={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'grid', placeItems: 'center' }}>
                    {leader.image
                      ? <Box component="img" src={leader.image} alt="Rahbar" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Typography color="text.secondary">Rasm tanlanmagan</Typography>}
                  </Box>
                  <input ref={imageInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} />
                  <Button variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadOutlined />} onClick={() => imageInput.current?.click()} disabled={uploading || savingLeader}>
                    {uploading ? 'Tayyorlanmoqda…' : 'Rasm yuklash'}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth required={leaderLanguage === 'uz'} label="Ismi" value={leader[leaderLanguage].firstName} onChange={(e) => changeLeaderLanguage('firstName', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth required={leaderLanguage === 'uz'} label="Familiyasi" value={leader[leaderLanguage].lastName} onChange={(e) => changeLeaderLanguage('lastName', e.target.value)} /></Grid>
                  <Grid item xs={12}><TextField fullWidth required={leaderLanguage === 'uz'} label="Lavozimi" value={leader[leaderLanguage].position} onChange={(e) => changeLeaderLanguage('position', e.target.value)} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Qabul vaqti" value={leader[leaderLanguage].receptionTime} onChange={(e) => changeLeaderLanguage('receptionTime', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth type="email" label="Email" value={leader.email} onChange={(e) => changeLeader('email', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Telefon" value={leader.phone} onChange={(e) => changeLeader('phone', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Telegram" value={leader.telegram} onChange={(e) => changeLeader('telegram', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Instagram" value={leader.instagram} onChange={(e) => changeLeader('instagram', e.target.value)} /></Grid>
                  <Grid item xs={12}><FormControlLabel control={<Switch checked={leader.active} onChange={(e) => changeLeader('active', e.target.checked)} />} label="Rahbarni saytda ko‘rsatish" /></Grid>
                </Grid>
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" startIcon={savingLeader ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />} disabled={savingLeader || uploading || loading}>
                {savingLeader ? 'Saqlanmoqda…' : 'Rahbarni saqlash'}
              </Button>
            </Stack>
          </Stack>
        </Paper>}

        {activeSection === 'menus' && <Paper variant="outlined">
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h4">Bo‘lim menyulari</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Har bir menyu bosilganda o‘z sahifasida kiritilgan ma’lumot ochiladi.</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead><TableRow><TableCell>#</TableCell><TableCell>Menyu nomi</TableCell><TableCell>URL</TableCell><TableCell>Tartib</TableCell><TableCell>Holat</TableCell><TableCell align="right">Amallar</TableCell></TableRow></TableHead>
              <TableBody>
                {sortedMenus.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell><Typography fontWeight={700}>{item.uz.title}</Typography></TableCell>
                    <TableCell>/international/{item.slug}</TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>{item.active ? 'Faol' : 'Yashirilgan'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Tahrirlash"><IconButton onClick={() => openMenu(item)}><EditOutlined /></IconButton></Tooltip>
                      <Tooltip title="O‘chirish"><span><IconButton color="error" disabled={deletingId === item.id} onClick={() => setDeleteTarget(item)}><DeleteOutlined /></IconButton></span></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && sortedMenus.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Hozircha menyu qo‘shilmagan.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>}
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deletingId && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Menyuni o‘chirish</DialogTitle>
        <DialogContent>
          <Typography>“{deleteTarget?.uz?.title}” menyusi va undagi ma’lumot o‘chiriladi.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={Boolean(deletingId)}>Bekor qilish</Button>
          <Button color="error" variant="contained" onClick={removeMenu} disabled={Boolean(deletingId)}>
            {deletingId ? 'O‘chirilmoqda…' : 'O‘chirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
