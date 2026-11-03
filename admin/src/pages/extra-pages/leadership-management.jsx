import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel,
  Grid, IconButton, InputAdornment, Paper, Stack, Switch, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography
} from '@mui/material';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
  SaveOutlined, SearchOutlined, UploadOutlined
} from '@ant-design/icons';
import { createContentItem, deleteContentItem, fetchContentList, updateContentItem } from 'api/cms';
import MainCard from 'components/MainCard';
import AdminTablePagination from 'components/AdminTablePagination';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import { getManagedImageHelperText, prepareManagedImageUpload } from 'utils/content-images';

const RESOURCE = 'leadership';
const languages = [{ key: 'uz', label: 'O‘zbekcha' }, { key: 'ru', label: 'Русский' }, { key: 'en', label: 'English' }];
const socialFields = [
  ['telegram', 'Telegram'], ['instagram', 'Instagram'], ['facebook', 'Facebook'],
  ['linkedin', 'LinkedIn'], ['youtube', 'YouTube'], ['website', 'Veb-sayt']
];
const localized = (value = {}) => ({ firstName: '', lastName: '', position: '', receptionTime: '', ...value });
const section = (value = {}) => ({
  ...value,
  id: value.id || uuid(),
  ...Object.fromEntries(languages.map(({ key }) => [key, { title: '', content: '', ...value[key] }]))
});
const emptyForm = () => ({
  id: null, image: '', email: '', phone: '', order: 0, active: true,
  socialLinks: Object.fromEntries(socialFields.map(([key]) => [key, ''])),
  sections: [], uz: localized(), ru: localized(), en: localized()
});
const normalize = (item = {}) => ({
  ...emptyForm(), ...item,
  image: item.image || item.photo || '',
  phone: item.phone || item.phoneNumber || '',
  order: item.order ?? item.sortOrder ?? 0,
  active: item.active !== false,
  socialLinks: Object.fromEntries(socialFields.map(([key]) => [key, item.socialLinks?.[key] || item.socials?.[key] || item[key] || ''])),
  sections: Array.isArray(item.sections) ? item.sections.map(section) : [],
  ...Object.fromEntries(languages.map(({ key }) => {
    const values = item[key] || item.translations?.[key] || {};
    return [key, localized({
      ...values,
      firstName: values.firstName || values.fullName || (key === 'uz' ? item.firstName || item.fullName || item.name || item.title || '' : ''),
      lastName: values.lastName || (key === 'uz' ? item.lastName || '' : ''),
      position: values.position || values.jobTitle || (key === 'uz' ? item.position || item.jobTitle || '' : ''),
      receptionTime: values.receptionTime || values.receptionHours || (key === 'uz' ? item.receptionTime || item.receptionHours || item.reception || '' : '')
    })];
  }))
});
const fullName = (item) => [item.uz?.firstName, item.uz?.lastName].filter(Boolean).join(' ');
const panelStyle = { p: { xs: 2, md: 3 } };

function normalizeSocialUrl(value, platform) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (platform === 'telegram' && /^@[a-z\d_]+$/i.test(raw)) return `https://t.me/${raw.slice(1)}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) throw new Error('Ijtimoiy havolalar http:// yoki https:// bilan boshlanishi kerak.');
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error();
    return url.href;
  } catch {
    throw new Error('Ijtimoiy tarmoq havolasini to‘g‘ri kiriting.');
  }
}

export default function LeadershipManagementPage() {
  const imageInput = useRef(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchContentList(RESOURCE)
      .then((data) => { if (!cancelled) setItems(data.map(normalize)); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Ma’lumotlarni yuklab bo‘lmadi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => items.filter((item) =>
    `${fullName(item)} ${item.uz?.position} ${item.email}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ).sort((a, b) => Number(a.order) - Number(b.order)), [items, search]);
  const pagination = useTablePagination(filtered);
  const change = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const changeLanguage = (key, value) => setForm((previous) => ({
    ...previous, [language]: { ...previous[language], [key]: value }
  }));
  const changeSection = (id, key, value) => setForm((previous) => ({
    ...previous, sections: previous.sections.map((item) => item.id === id
      ? { ...item, [language]: { ...item[language], [key]: value } } : item)
  }));

  const openEditor = (item) => {
    setForm(item ? normalize(item) : { ...emptyForm(), order: items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1 });
    setLanguage('uz');
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { dataUrl } = await prepareManagedImageUpload(file, RESOURCE);
      change('image', dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.uz.firstName.trim() || !form.uz.lastName.trim() || !form.uz.position.trim()) {
      setLanguage('uz');
      setError('O‘zbekcha ism, familiya va lavozimni kiriting.');
      return;
    }
    setSaving(true);
    try {
      const socialLinks = Object.fromEntries(socialFields.map(([key]) => [key, normalizeSocialUrl(form.socialLinks[key], key)]));
      const payload = {
        ...form, socialLinks, order: Number(form.order),
        title: fullName(form).trim(),
        ...Object.fromEntries(languages.map(({ key }) => [key, {
          ...form[key], fullName: [form[key].firstName.trim(), form[key].lastName.trim()].filter(Boolean).join(' ')
        }]))
      };
      const saved = form.id
        ? await updateContentItem(RESOURCE, form.id, payload)
        : await createContentItem(RESOURCE, payload);
      if (!saved) throw new Error('Saqlangan ma’lumot qaytarilmadi. Qayta yuklab tekshiring.');
      setItems((previous) => form.id ? previous.map((item) => item.id === form.id ? normalize(saved) : item) : [...previous, normalize(saved)]);
      setEditing(false);
      setSuccess('Ma’muriyat ma’lumotlari saqlandi.');
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteContentItem(RESOURCE, deleteTarget.id);
      setItems((previous) => previous.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccess('Ma’lumot o‘chirildi.');
    } catch (err) {
      setError(err.message || 'O‘chirishda xatolik yuz berdi.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainCard
      title={editing ? (form.id ? 'Rahbarni tahrirlash' : 'Yangi rahbar qo‘shish') : 'Ma’muriyat'}
      secondary={editing
        ? <Button startIcon={<ArrowLeftOutlined />} disabled={saving || uploading} onClick={() => { setEditing(false); setError(''); }}>Orqaga</Button>
        : <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => openEditor()} disabled={loading}>Rahbar qo‘shish</Button>}
    >
        <Stack spacing={2.5}>
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
          {editing ? (
            <Box component="form" onSubmit={save}>
              <fieldset disabled={saving || uploading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <Stack spacing={3}>
                  <Tabs value={language} onChange={(_, value) => setLanguage(value)} aria-label="Ma’muriyat ma’lumotlari tili">
                    {languages.map(({ key, label }) => <Tab key={key} value={key} label={label} />)}
                  </Tabs>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ ...panelStyle, height: '100%' }}>
                        <Stack spacing={2}>
                          <Typography variant="h5">Rahbar rasmi</Typography>
                          <Box sx={{ width: '100%', aspectRatio: '1 / 1', border: '2px dashed', borderColor: form.image ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: 'grey.50', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                            {form.image ? <Box component="img" src={form.image} alt="Rahbar rasmi" sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                              : <Typography color="text.secondary">Rasm tanlanmagan</Typography>}
                          </Box>
                          <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadImage} />
                          <Button variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadOutlined />} onClick={() => imageInput.current?.click()}>
                            {uploading ? 'Rasm tayyorlanmoqda…' : 'Rasm yuklash'}
                          </Button>
                          {form.image && <Button color="error" size="small" onClick={() => change('image', '')}>Rasmni olib tashlash</Button>}
                          <Typography variant="caption" color="text.secondary">{getManagedImageHelperText(RESOURCE)}</Typography>
                          <Divider />
                          <TextField label="Ko‘rinish tartibi" type="number" value={form.order} onChange={(e) => change('order', e.target.value)} inputProps={{ min: 0, step: 1 }} required fullWidth />
                          <FormControlLabel control={<Switch checked={form.active} onChange={(e) => change('active', e.target.checked)} />} label="Saytda ko‘rsatish" />
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Paper variant="outlined" sx={panelStyle}>
                        <Stack spacing={2.5}>
                          <Typography variant="h5">Asosiy ma’lumotlar — {languages.find((item) => item.key === language)?.label}</Typography>
                          <Typography variant="caption" color="text.secondary">O‘zbekcha ma’lumotlar majburiy. Boshqa tillar ixtiyoriy.</Typography>
                          <Grid container spacing={2}>
                            {[
                              ['firstName', 'Ismi'], ['lastName', 'Familiyasi'],
                              ['position', 'Lavozimi'], ['receptionTime', 'Qabul vaqti']
                            ].map(([key, label]) => (
                              <Grid item xs={12} sm={key === 'position' || key === 'receptionTime' ? 12 : 6} key={key}>
                                <TextField fullWidth label={label} value={form[language][key]} required={language === 'uz' && key !== 'receptionTime'}
                                  multiline={key === 'receptionTime'} minRows={key === 'receptionTime' ? 2 : undefined}
                                  placeholder={key === 'receptionTime' ? 'Dushanba, chorshanba: 14:00 – 16:00' : undefined}
                                  onChange={(e) => changeLanguage(key, e.target.value)} />
                              </Grid>
                            ))}
                          </Grid>
                          <Divider />
                          <Typography variant="h5">Bog‘lanish</Typography>
                          <TextField fullWidth label="Elektron pochta" type="email" value={form.email} onChange={(e) => change('email', e.target.value)} />
                          <TextField fullWidth label="Telefon (ixtiyoriy)" type="tel" value={form.phone} onChange={(e) => change('phone', e.target.value)} />
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Paper variant="outlined" sx={panelStyle}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Ijtimoiy tarmoqlar</Typography>
                    <Grid container spacing={2}>
                      {socialFields.map(([key, label]) => <Grid item xs={12} sm={6} md={4} key={key}>
                        <TextField fullWidth label={label} placeholder={key === 'telegram' ? '@username yoki https://t.me/…' : 'https://…'}
                          value={form.socialLinks[key]} onChange={(e) => change('socialLinks', { ...form.socialLinks, [key]: e.target.value })} />
                      </Grid>)}
                    </Grid>
                  </Paper>
                  <Paper variant="outlined" sx={panelStyle}>
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ sm: 'center' }}>
                        <Box>
                          <Typography variant="h5">Ixtiyoriy matnlar</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Kartochka bosilganda pastida ochiladi. Masalan: tarjimai hol, faoliyat yoki vazifalar.</Typography>
                        </Box>
                        <Button variant="outlined" startIcon={<PlusOutlined />} onClick={() => change('sections', [...form.sections, section()])}>Matn qo‘shish</Button>
                      </Stack>
                      {form.sections.length === 0 && <Alert severity="info">Hozircha qo‘shimcha matn qo‘shilmagan.</Alert>}
                      {form.sections.map((item, index) => <Paper variant="outlined" key={item.id} sx={{ p: 2.5, bgcolor: 'grey.50' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="subtitle1">{index + 1}. Matn bloki · {languages.find((entry) => entry.key === language).label}</Typography>
                          <Tooltip title="Matn blokini olib tashlash"><IconButton color="error" aria-label={`${index + 1}-matnni olib tashlash`} onClick={() => change('sections', form.sections.filter((entry) => entry.id !== item.id))}><DeleteOutlined /></IconButton></Tooltip>
                        </Stack>
                        <TextField fullWidth label="Sarlavha (ixtiyoriy)" value={item[language].title} onChange={(e) => changeSection(item.id, 'title', e.target.value)} sx={{ mb: 2 }} />
                        <TinyMceField key={`${item.id}-${language}`} label="Matn" height={320} disabled={saving || uploading} value={item[language].content} onChange={(value) => changeSection(item.id, 'content', value)} />
                      </Paper>)}
                    </Stack>
                  </Paper>
                  <Stack direction="row" justifyContent="flex-end" spacing={2}>
                    <Button variant="outlined" onClick={() => setEditing(false)}>Bekor qilish</Button>
                    <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}>
                      {saving ? 'Saqlanmoqda…' : 'Saqlash'}
                    </Button>
                  </Stack>
                </Stack>
              </fieldset>
            </Box>
          ) : <>
            <Typography variant="body2" color="text.secondary">Universitet ma’muriyati, qabul vaqti va qo‘shimcha ma’lumotlarni boshqarish.</Typography>
            <TextField size="small" label="Qidirish" placeholder="Ism, lavozim yoki email" value={search}
              onChange={(event) => { setSearch(event.target.value); pagination.handlePageChange(null, 0); }}
              sx={{ width: { xs: '100%', sm: 420 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} />
            {loading && <Alert severity="info">Yuklanmoqda...</Alert>}
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="Ma’muriyat jadvali" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Rasm</TableCell>
                    <TableCell>Ism-familiya</TableCell>
                    <TableCell>Lavozimi</TableCell>
                    <TableCell>Qabul vaqti</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tartib</TableCell>
                    <TableCell>Holat</TableCell>
                    <TableCell align="right">Amallar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagination.paginatedItems.map((item, index) => <TableRow hover key={item.id}>
                    <TableCell>{pagination.getRowNumber(index)}</TableCell>
                    <TableCell>
                      <Box sx={{ width: 64, height: 80, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100', display: 'grid', placeItems: 'center' }}>
                        {item.image ? <Box component="img" src={item.image} alt={fullName(item)} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                          : <Typography variant="caption" color="text.secondary">Rasm yo‘q</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell><Typography fontWeight={600}>{fullName(item) || '—'}</Typography></TableCell>
                    <TableCell>{item.uz.position || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line' }}>{item.uz.receptionTime || '—'}</TableCell>
                    <TableCell>{item.email || '—'}</TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell><Chip size="small" color={item.active ? 'success' : 'default'} label={item.active ? 'Faol' : 'Nofaol'} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Tahrirlash"><IconButton color="primary" aria-label={`${fullName(item)} — tahrirlash`} onClick={() => openEditor(item)}><EditOutlined /></IconButton></Tooltip>
                      <Tooltip title="O‘chirish"><IconButton color="error" aria-label={`${fullName(item)} — o‘chirish`} onClick={() => setDeleteTarget(item)}><DeleteOutlined /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>)}
                  {!loading && !filtered.length && <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      {error ? 'Ma’lumotlarni yuklab bo‘lmadi.' : search ? 'Qidiruv bo‘yicha topilmadi.' : 'Rahbarlar hali qo‘shilmagan.'}
                    </TableCell>
                  </TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
            <AdminTablePagination count={pagination.totalCount} page={pagination.page} rowsPerPage={pagination.rowsPerPage}
              onPageChange={pagination.handlePageChange} onRowsPerPageChange={pagination.handleRowsPerPageChange} />
          </>}
        </Stack>
      <Dialog open={Boolean(deleteTarget)} onClose={() => { if (!deleting) setDeleteTarget(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Rahbar ma’lumotini o‘chirish</DialogTitle>
        <DialogContent><DialogContentText>«{deleteTarget && fullName(deleteTarget)}» ma’lumotlari saytdan ham olib tashlanadi. O‘chirilsinmi?</DialogContentText></DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
          <Button disabled={deleting} color="error" variant="contained" onClick={remove}>{deleting ? 'O‘chirilmoqda…' : 'O‘chirish'}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
