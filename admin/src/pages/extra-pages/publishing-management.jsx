import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Grid, IconButton, MenuItem, Paper, Stack, Switch, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, FilePdfOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import AdminTablePagination from 'components/AdminTablePagination';
import { useTablePagination } from 'hooks/useTablePagination';
import { createContentItem, deleteContentItem, fetchContentList, updateContentItem } from 'api/cms';
import { fileToDataUrl } from 'utils/file';

const RESOURCE = 'journal-issues';
const emptyForm = () => ({
  id: null, title: '', image: '', pdf: '', fileName: '', quantity: '', number: '',
  year: new Date().getFullYear(), type: 'regular', order: '', active: true
});

export default function PublishingManagementPage() {
  const imageRef = useRef(null);
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState('list');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchContentList(RESOURCE).then(setItems).catch((err) => setError(err.message || 'Ma’lumotlarni yuklab bo‘lmadi.'));
  }, []);

  const sorted = useMemo(() => items
    .filter((item) => !search.trim() || [item.title, item.year, item.number, item.quantity]
      .join(' ').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    .sort((a, b) => Number(b.year) - Number(a.year) || Number(b.number) - Number(a.number)), [items, search]);
  const pagination = useTablePagination(sorted);

  const change = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const uploadImage = async (file) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 1.5 * 1024 * 1024) {
      setError('Rasm PNG, JPG, WEBP yoki GIF formatida va 1.5 MB dan kichik bo‘lishi kerak.');
      return;
    }
    const image = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, image }));
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) {
      setError('Nashr fayli PDF formatida va 5 MB dan kichik bo‘lishi kerak.');
      return;
    }
    const pdf = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, pdf, fileName: file.name }));
  };

  const openForm = (item) => {
    setForm(item ? { ...emptyForm(), ...item } : { ...emptyForm(), order: items.length + 1 });
    setError('');
    setMode('form');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.number || !form.year) {
      setError('Nashr nomi, nashr soni va yilini kiriting.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      title: form.title.trim(),
      quantity: Number(form.quantity) || 0,
      number: Number(form.number),
      year: Number(form.year),
      order: Number(form.order) || items.length + 1
    };
    try {
      const saved = form.id
        ? await updateContentItem(RESOURCE, form.id, payload)
        : await createContentItem(RESOURCE, payload);
      setItems((prev) => form.id ? prev.map((item) => item.id === form.id ? saved : item) : [saved, ...prev]);
      setMode('list');
      setForm(emptyForm());
    } catch (err) {
      setError(err.message || 'Nashrni saqlab bo‘lmadi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContentItem(RESOURCE, deleteTarget.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Nashrni o‘chirib bo‘lmadi.');
    }
  };

  if (mode === 'form') return (
    <MainCard title={form.id ? 'Nashrni tahrirlash' : 'Yangi nashr qo‘shish'} secondary={
      <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={() => setMode('list')}>Orqaga</Button>
    }>
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Nashr rasmi va fayli</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <input ref={imageRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => uploadImage(e.target.files?.[0])} />
                <Box onClick={() => imageRef.current?.click()} sx={{ height: 260, border: '2px dashed', borderColor: form.image ? 'primary.main' : 'divider', borderRadius: 2, cursor: 'pointer', display: 'grid', placeItems: 'center', overflow: 'hidden', bgcolor: '#fafafa' }}>
                  {form.image ? <Box component="img" src={form.image} alt="Nashr muqovasi" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Stack alignItems="center" spacing={1}><UploadOutlined style={{ fontSize: 32 }} /><b>Muqova rasmini yuklash</b><small>PNG, JPG, WEBP yoki GIF</small></Stack>}
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <input ref={fileRef} hidden type="file" accept="application/pdf" onChange={(e) => uploadFile(e.target.files?.[0])} />
                <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
                  <Button size="large" variant="outlined" startIcon={<FilePdfOutlined />} onClick={() => fileRef.current?.click()}>PDF faylni tanlash</Button>
                  {form.pdf ? <Alert severity="success">{form.fileName || 'PDF fayl'} yuklandi</Alert> : <Alert severity="info">Frontendda ko‘rish va yuklab olish uchun PDF fayl kiriting.</Alert>}
                  {form.pdf && <Button color="error" onClick={() => setForm((prev) => ({ ...prev, pdf: '', fileName: '' }))}>Faylni olib tashlash</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Nashr ma’lumotlari</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth required label="Nashr nomi" name="title" value={form.title} onChange={change} /></Grid>
              <Grid item xs={12} sm={6} md={2}><TextField fullWidth required type="number" label="Nashr soni" name="number" value={form.number} onChange={change} inputProps={{ min: 1 }} /></Grid>
              <Grid item xs={12} sm={6} md={2}><TextField fullWidth type="number" label="Nusxalar soni" name="quantity" value={form.quantity} onChange={change} inputProps={{ min: 0 }} /></Grid>
              <Grid item xs={12} sm={6} md={2}><TextField fullWidth required type="number" label="Yili" name="year" value={form.year} onChange={change} inputProps={{ min: 1900, max: 2200 }} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField select fullWidth label="Nashr turi" name="type" value={form.type} onChange={change}><MenuItem value="regular">Asosiy son</MenuItem><MenuItem value="special">Maxsus son</MenuItem></TextField></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Tartib raqami" name="order" value={form.order} onChange={change} /></Grid>
              <Grid item xs={12} sm={6} md={4}><FormControlLabel control={<Switch name="active" checked={form.active} onChange={change} />} label="Frontendda ko‘rsatish" /></Grid>
            </Grid>
          </Paper>
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}><Button variant="outlined" onClick={() => setMode('list')}>Bekor qilish</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</Button></Stack>
        </Stack>
      </Box>
    </MainCard>
  );

  return (
    <MainCard title="Nashriyot" secondary={<Button variant="contained" startIcon={<PlusOutlined />} onClick={() => openForm()}>Yangi nashr</Button>}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField size="small" label="Nashrlarni qidirish" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 320 } }} />
        <TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>Rasm</TableCell><TableCell>Nomi</TableCell><TableCell>Nashr soni</TableCell><TableCell>Nusxalar</TableCell><TableCell>Yili</TableCell><TableCell>Fayl</TableCell><TableCell>Status</TableCell><TableCell align="right">Amallar</TableCell></TableRow></TableHead><TableBody>
          {pagination.paginatedItems.map((item) => <TableRow key={item.id} hover>
            <TableCell>{item.image ? <Box component="img" src={item.image} alt="" sx={{ width: 52, height: 68, objectFit: 'cover', borderRadius: 1 }} /> : '—'}</TableCell>
            <TableCell><Typography fontWeight={700}>{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.type === 'special' ? 'Maxsus son' : 'Asosiy son'}</Typography></TableCell>
            <TableCell>№ {item.number}</TableCell><TableCell>{item.quantity || 0} ta</TableCell><TableCell>{item.year}</TableCell>
            <TableCell>{item.pdf ? <Chip size="small" color="error" variant="outlined" icon={<FilePdfOutlined />} label={item.fileName || 'PDF'} /> : '—'}</TableCell>
            <TableCell><Chip size="small" color={item.active ? 'success' : 'default'} label={item.active ? 'Faol' : 'Nofaol'} /></TableCell>
            <TableCell align="right"><IconButton color="primary" onClick={() => openForm(item)}><EditOutlined /></IconButton><IconButton color="error" onClick={() => setDeleteTarget(item)}><DeleteOutlined /></IconButton></TableCell>
          </TableRow>)}
          {!sorted.length && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>Nashrlar hali kiritilmagan</TableCell></TableRow>}
        </TableBody></Table></TableContainer>
        <AdminTablePagination count={sorted.length} page={pagination.page} rowsPerPage={pagination.rowsPerPage} onPageChange={pagination.handlePageChange} onRowsPerPageChange={pagination.handleRowsPerPageChange} />
      </Stack>
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}><DialogTitle>Nashr o‘chirilsinmi?</DialogTitle><DialogContent>{deleteTarget?.title}</DialogContent><DialogActions><Button onClick={() => setDeleteTarget(null)}>Bekor qilish</Button><Button color="error" variant="contained" onClick={remove}>O‘chirish</Button></DialogActions></Dialog>
    </MainCard>
  );
}
