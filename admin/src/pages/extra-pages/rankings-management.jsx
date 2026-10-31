import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';

import MainCard from 'components/MainCard';
import AdminTablePagination from 'components/AdminTablePagination';
import { useTablePagination } from 'hooks/useTablePagination';
import { fetchSetting, saveSetting } from 'api/cms';
import { fileToDataUrl } from 'utils/file';

const SETTING_KEY = 'university-rankings';
const languages = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];
const textFields = [
  ['title', 'Bo‘lim sarlavhasi'],
  ['titleAccent', 'Sarlavhaning rangli qismi'],
  ['description', 'Sarlavha ostidagi matn'],
  ['heroTitle', 'Chapdagi sarlavha'],
  ['heroTitleAccent', 'Chapdagi sarlavhaning rangli qismi'],
  ['heroDescription', 'Chapdagi matn']
];
const localized = (uz = '') => ({ uz, ru: '', en: '' });

function normalizeLocalized(value) {
  return { ...localized(), ...(typeof value === 'string' ? { uz: value } : value || {}) };
}

function normalizeForm(value = {}) {
  return {
    ...Object.fromEntries(textFields.map(([key]) => [key, normalizeLocalized(value[key])])),
    rankings: (Array.isArray(value.rankings) ? value.rankings : []).filter(Boolean).map((card) => ({
      id: card.id || uuid(),
      title: normalizeLocalized(card.title),
      result: normalizeLocalized(card.result),
      image: card.image || card.logo || '',
      sourceUrl: card.sourceUrl || '',
      active: card.active !== false
    }))
  };
}

function isValidLink(value) {
  if (!value) return true;
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true;
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

export default function RankingsManagementPage() {
  const [record, setRecord] = useState(normalizeForm);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reload, setReload] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const busy = saving || uploading;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    fetchSetting(SETTING_KEY)
      .then((item) => {
        if (!cancelled) setRecord(normalizeForm(item || {}));
      })
      .catch(() => {
        if (!cancelled) setLoadError('Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return record.rankings.filter(
      (card) =>
        !query ||
        [...Object.values(card.title), ...Object.values(card.result), card.sourceUrl].some((value) =>
          String(value || '')
            .toLocaleLowerCase()
            .includes(query)
        )
    );
  }, [record.rankings, search]);
  const pagination = useTablePagination(filteredCards);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };
  const openCard = (card) => {
    clearFeedback();
    setLanguage('uz');
    setEditing(Boolean(card));
    setForm(
      card
        ? {
            ...card,
            title: { ...card.title },
            result: { ...card.result },
            order: record.rankings.findIndex((item) => item.id === card.id) + 1
          }
        : {
            id: uuid(),
            title: localized(),
            result: localized(),
            image: '',
            sourceUrl: '',
            active: true,
            order: record.rankings.length + 1
          }
    );
    setMode('card');
  };
  const openSection = () => {
    clearFeedback();
    setLanguage('uz');
    setForm(Object.fromEntries(textFields.map(([key]) => [key, { ...record[key] }])));
    setMode('section');
  };
  const closeForm = () => {
    clearFeedback();
    setMode('table');
    setForm(null);
  };
  const changeField = (key, value) => {
    clearFeedback();
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const changeText = (key, value) => {
    clearFeedback();
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [language]: value } }));
  };
  const uploadImage = async (file) => {
    if (!file) return;
    clearFeedback();
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 1024 * 1024) {
      setError('Rasm JPG, PNG, WEBP yoki GIF formatida va 1 MB dan kichik bo‘lishi kerak.');
      return;
    }
    setUploading(true);
    try {
      changeField('image', await fileToDataUrl(file));
    } catch {
      setError('Rasmni yuklab bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setUploading(false);
    }
  };
  const persist = async (payload, message) => {
    setSaving(true);
    clearFeedback();
    try {
      const item = await saveSetting(SETTING_KEY, payload);
      if (!item) throw new Error('Backend saqlangan ma’lumotni qaytarmadi.');
      setRecord(normalizeForm(item));
      setMode('table');
      setForm(null);
      setSuccess(message);
      return true;
    } catch (saveError) {
      setError(saveError.message || 'O‘zgarishlarni saqlab bo‘lmadi. Qayta urinib ko‘ring.');
      return false;
    } finally {
      setSaving(false);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    clearFeedback();
    if (mode === 'section') {
      if (!form.title.uz.trim() && !form.titleAccent.uz.trim()) {
        setError('Bo‘lim sarlavhasini o‘zbek tilida kiriting.');
        return;
      }
      await persist({ ...record, ...form }, 'Bo‘lim matnlari saqlandi.');
      return;
    }
    if (!form.title.uz.trim() || !form.result.uz.trim()) {
      setError('Kartochka sarlavhasi va natijasini o‘zbek tilida kiriting.');
      return;
    }
    if (!isValidLink(form.sourceUrl.trim())) {
      setError('Havolani https:// yoki / bilan boshlang.');
      return;
    }
    const { order, ...card } = form;
    const rankings = record.rankings.filter((item) => item.id !== card.id);
    const position = Math.min(Math.max(1, Math.trunc(Number(order)) || 1), rankings.length + 1);
    rankings.splice(position - 1, 0, { ...card, sourceUrl: card.sourceUrl.trim(), image: card.image.trim() });
    if (await persist({ ...record, rankings }, editing ? 'Reyting yangilandi.' : 'Yangi reyting qo‘shildi.')) {
      setSearch('');
      pagination.handlePageChange(null, Math.floor((position - 1) / pagination.rowsPerPage));
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget || busy) return;
    const payload = { ...record, rankings: record.rankings.filter((card) => card.id !== deleteTarget.id) };
    if (await persist(payload, 'Reyting o‘chirildi.')) {
      pagination.handlePageChange(
        null,
        Math.min(pagination.page, Math.max(0, Math.ceil((filteredCards.length - 1) / pagination.rowsPerPage) - 1))
      );
      setDeleteTarget(null);
    }
  };

  if (loading || loadError) {
    return (
      <MainCard title="Reyting ko‘rsatkichlari">
        {loading ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <Typography>Yuklanmoqda...</Typography>
          </Stack>
        ) : (
          <Alert severity="error" action={<Button onClick={() => setReload((prev) => prev + 1)}>Qayta urinish</Button>}>
            {loadError}
          </Alert>
        )}
      </MainCard>
    );
  }

  if (mode !== 'table') {
    return (
      <MainCard
        title={mode === 'section' ? 'Bo‘lim matnlarini tahrirlash' : editing ? 'Reytingni tahrirlash' : 'Yangi reyting qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined aria-hidden="true" />} onClick={closeForm} disabled={busy}>
            Orqaga
          </Button>
        }
      >
        <Box component="form" onSubmit={submit}>
          <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Stack spacing={3}>
              <Tabs value={language} onChange={(_event, value) => setLanguage(value)} aria-label="Kontent tili">
                {languages.map((lang) => (
                  <Tab key={lang.key} value={lang.key} label={lang.label} />
                ))}
              </Tabs>
              <Typography variant="body2" color="text.secondary">
                Tarjima kiritilmasa, saytda o‘zbekcha matn ko‘rsatiladi.
              </Typography>
              {mode === 'section' ? (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h5">Sarlavha va matnlar</Typography>
                    <Grid container spacing={2}>
                      {textFields.map(([key, label]) => (
                        <Grid item xs={12} md={key.toLowerCase().includes('description') ? 12 : 6} key={key}>
                          <TextField
                            fullWidth
                            label={label}
                            value={form[key][language]}
                            onChange={(event) => changeText(key, event.target.value)}
                            multiline={key.toLowerCase().includes('description')}
                            minRows={key.toLowerCase().includes('description') ? 3 : undefined}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
                      <Stack spacing={2.5}>
                        <Typography variant="h5">Reyting ma’lumotlari</Typography>
                        <TextField
                          fullWidth
                          label="Kartochka sarlavhasi"
                          value={form.title[language]}
                          onChange={(event) => changeText('title', event.target.value)}
                          required={language === 'uz'}
                        />
                        <TextField
                          fullWidth
                          label="Natija"
                          placeholder="Masalan, TOP 5"
                          value={form.result[language]}
                          onChange={(event) => changeText('result', event.target.value)}
                          required={language === 'uz'}
                        />
                        <TextField
                          fullWidth
                          label="Havola"
                          placeholder="https://example.com yoki /sahifa"
                          value={form.sourceUrl}
                          onChange={(event) => changeField('sourceUrl', event.target.value)}
                          helperText="Kartochka bosilganda shu manzil ochiladi. Havola barcha tillar uchun umumiy."
                        />
                        <TextField
                          fullWidth
                          label="Tartib"
                          type="number"
                          value={form.order}
                          onChange={(event) => changeField('order', event.target.value)}
                          inputProps={{ min: 1, max: record.rankings.length + (editing ? 0 : 1), step: 1 }}
                          required
                        />
                        <FormControlLabel
                          control={<Switch checked={form.active} onChange={(event) => changeField('active', event.target.checked)} />}
                          label="Saytda ko‘rsatish"
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                      <Stack spacing={2.5}>
                        <Typography variant="h5">Reyting rasmi</Typography>
                        <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1, display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            variant="rounded"
                            src={form.image}
                            alt={form.title[language] || form.title.uz}
                            sx={{
                              width: 112,
                              height: 112,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              '& img': { objectFit: 'contain' }
                            }}
                          >
                            {(form.title[language] || form.title.uz || 'R').slice(0, 2).toUpperCase()}
                          </Avatar>
                        </Box>
                        <TextField
                          fullWidth
                          label="Rasm manzili"
                          value={form.image.startsWith('data:') ? '' : form.image}
                          onChange={(event) => changeField('image', event.target.value)}
                          helperText={
                            form.image.startsWith('data:') ? 'Yuklangan rasm biriktirilgan.' : 'Rasm manzilini kiriting yoki fayl yuklang.'
                          }
                        />
                        <Button component="label" variant="outlined" startIcon={<UploadOutlined aria-hidden="true" />} disabled={busy}>
                          {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                          <input
                            hidden
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => {
                              uploadImage(event.target.files?.[0]);
                              event.target.value = '';
                            }}
                          />
                        </Button>
                        {form.image && (
                          <Button color="error" startIcon={<DeleteOutlined aria-hidden="true" />} onClick={() => changeField('image', '')}>
                            Rasmni olib tashlash
                          </Button>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          JPG, PNG, WEBP yoki GIF. Eng katta hajm: 1 MB.
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              )}
              {error && <Alert severity="error">{error}</Alert>}
              <Divider />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={closeForm} disabled={busy}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveOutlined aria-hidden="true" />} disabled={busy}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Reyting ko‘rsatkichlari"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined aria-hidden="true" />} onClick={() => openCard()}>
          Reyting qo‘shish
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Bosh sahifadagi reyting kartochkalari, rasmlari va havolalarini boshqarish.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <TextField
            size="small"
            label="Qidirish"
            placeholder="Sarlavha, natija yoki havola"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              pagination.handlePageChange(null, 0);
            }}
            sx={{ width: { xs: '100%', sm: 380 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined aria-hidden="true" />
                </InputAdornment>
              )
            }}
          />
          <Button variant="outlined" startIcon={<EditOutlined aria-hidden="true" />} onClick={openSection}>
            Bo‘lim matnlari
          </Button>
        </Stack>
        {error && !deleteTarget && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 900 }} aria-label="Reytinglar jadvali">
            <TableHead>
              <TableRow>
                {['#', 'Rasm', 'Sarlavha', 'Natija', 'Havola', 'Tartib', 'Holat'].map((label) => (
                  <TableCell key={label}>{label}</TableCell>
                ))}
                <TableCell align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagination.paginatedItems.map((card, index) => (
                <TableRow hover key={card.id}>
                  <TableCell>{pagination.getRowNumber(index)}</TableCell>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={card.image}
                      alt=""
                      sx={{ width: 48, height: 48, bgcolor: 'primary.lighter', color: 'primary.main', '& img': { objectFit: 'contain' } }}
                    >
                      {card.title.uz.slice(0, 2).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {card.title.uz || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      RU: {card.title.ru || '—'} | EN: {card.title.en || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{card.result.uz || '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 240, overflowWrap: 'anywhere' }}>{card.sourceUrl || '—'}</TableCell>
                  <TableCell>{record.rankings.findIndex((item) => item.id === card.id) + 1}</TableCell>
                  <TableCell>
                    <Chip size="small" color={card.active ? 'success' : 'default'} label={card.active ? 'Faol' : 'Nofaol'} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Tahrirlash">
                      <IconButton color="primary" aria-label={`${card.title.uz} — tahrirlash`} onClick={() => openCard(card)}>
                        <EditOutlined aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O‘chirish">
                      <IconButton
                        color="error"
                        aria-label={`${card.title.uz} — o‘chirish`}
                        onClick={() => {
                          clearFeedback();
                          setDeleteTarget(card);
                        }}
                      >
                        <DeleteOutlined aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredCards.length && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {search.trim() ? 'Qidiruv bo‘yicha reyting topilmadi.' : 'Reytinglar mavjud emas. Yangi reyting qo‘shing.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={filteredCards.length}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
        />
      </Stack>
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!saving) {
            setDeleteTarget(null);
            setError('');
          }
        }}
        aria-labelledby="delete-ranking-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-ranking-title">Reytingni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>“{deleteTarget?.title.uz}” reytingini o‘chirmoqchimisiz?</DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteTarget(null);
              setError('');
            }}
            disabled={saving}
          >
            Bekor qilish
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={saving}>
            {saving ? 'O‘chirilmoqda...' : 'O‘chirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
