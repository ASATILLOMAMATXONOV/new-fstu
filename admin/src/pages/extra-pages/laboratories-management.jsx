import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import {
  Alert,
  Box,
  Button,
  Chip,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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

import { createContentItem, deleteContentItem, fetchContentList, updateContentItem } from 'api/cms';
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import { getManagedImageHelperText, prepareManagedImageDataUrl, prepareManagedImageUpload } from 'utils/content-images';

const RESOURCE = 'laboratories';
const languages = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];
const emptyLanguage = { title: '', direction: '', location: '', manager: '' };
const localize = (value = {}) => ({ ...emptyLanguage, ...(value || {}) });
const emptyPanelLanguage = { title: '', content: '' };
const localizePanel = (value = {}) => ({ ...emptyPanelLanguage, ...(value || {}) });

const createPanel = (value = {}, index = 0) => ({
  id: value.id || uuid(),
  order: Number(value.order || index + 1),
  active: value.active !== false,
  uz: localizePanel(value.uz),
  ru: localizePanel(value.ru),
  en: localizePanel(value.en)
});

const emptyForm = () => ({
  id: null,
  image: '',
  order: '',
  active: true,
  panels: [],
  uz: localize(),
  ru: localize(),
  en: localize()
});

const normalizeLaboratory = (item = {}) => ({
  ...emptyForm(),
  ...item,
  image: item.image || '',
  order: item.order ?? item.sortOrder ?? '',
  active: item.active !== false,
  panels: (Array.isArray(item.panels) ? item.panels : []).map(createPanel),
  uz: localize({ ...item.uz, title: item.uz?.title || item.title || '' }),
  ru: localize(item.ru),
  en: localize(item.en)
});

export default function LaboratoriesManagementPage() {
  const imageInputRef = useRef(null);
  const [laboratories, setLaboratories] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(emptyForm);
  const [language, setLanguage] = useState('uz');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const imageHelperText = getManagedImageHelperText(RESOURCE);

  const loadLaboratories = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchContentList(RESOURCE);
      setLaboratories(items.map(normalizeLaboratory));
    } catch (loadError) {
      setError(loadError.message || 'Laboratoriyalarni yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaboratories();
  }, []);

  const filteredLaboratories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...laboratories]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .filter((item) => {
        if (!query) return true;
        const values = [
          ...languages.flatMap(({ key }) => [item[key].title, item[key].direction, item[key].location, item[key].manager]),
          ...item.panels.flatMap((panel) => languages.map(({ key }) => panel[key].title))
        ];
        return values.some((value) =>
          String(value || '')
            .toLocaleLowerCase()
            .includes(query)
        );
      });
  }, [laboratories, search]);
  const pagination = useTablePagination(filteredLaboratories);

  const openCreate = () => {
    setForm(emptyForm());
    setLanguage('uz');
    setError('');
    setSuccess('');
    setMode('form');
  };

  const openEdit = (item) => {
    setForm(normalizeLaboratory(item));
    setLanguage('uz');
    setError('');
    setSuccess('');
    setMode('form');
  };

  const closeForm = () => {
    if (saving) return;
    setMode('table');
    setForm(emptyForm());
    setError('');
  };

  const changeBase = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const changeLocalized = (key, value) =>
    setForm((previous) => ({
      ...previous,
      [language]: { ...previous[language], [key]: value }
    }));

  const addPanel = () =>
    setForm((previous) => ({
      ...previous,
      panels: [...previous.panels, createPanel({}, previous.panels.length)]
    }));

  const removePanel = (panelId) =>
    setForm((previous) => ({
      ...previous,
      panels: previous.panels.filter((panel) => panel.id !== panelId).map((panel, index) => ({ ...panel, order: index + 1 }))
    }));

  const changePanel = (panelId, key, value) =>
    setForm((previous) => ({
      ...previous,
      panels: previous.panels.map((panel) =>
        panel.id === panelId
          ? key === 'active'
            ? { ...panel, active: value }
            : { ...panel, [language]: { ...panel[language], [key]: value } }
          : panel
      )
    }));

  const uploadImage = async (file) => {
    if (!file) return;
    setError('');
    try {
      const { dataUrl } = await prepareManagedImageUpload(file, RESOURCE);
      changeBase('image', dataUrl);
    } catch (uploadError) {
      setError(uploadError.message || 'Rasmni yuklab bo‘lmadi.');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    setSuccess('');

    if (!form.uz.title.trim()) {
      setLanguage('uz');
      setError('Laboratoriya nomini o‘zbekcha kiriting.');
      return;
    }
    if (!form.image.trim()) {
      setError('Laboratoriya rasmini kiriting yoki yuklang.');
      return;
    }
    const invalidPanel = form.panels.findIndex((panel) => !panel.uz.title.trim());
    if (invalidPanel !== -1) {
      setLanguage('uz');
      setError(`${invalidPanel + 1}-panel nomini o‘zbekcha kiriting.`);
      return;
    }

    setSaving(true);
    try {
      const image = await prepareManagedImageDataUrl(form.image, RESOURCE);
      const payload = {
        title: form.uz.title.trim(),
        image,
        order: Math.max(1, Math.trunc(Number(form.order)) || laboratories.length + 1),
        active: form.active,
        panels: form.panels.map((panel, index) => ({
          ...panel,
          order: index + 1,
          uz: { title: panel.uz.title.trim(), content: panel.uz.content },
          ru: { title: panel.ru.title.trim(), content: panel.ru.content },
          en: { title: panel.en.title.trim(), content: panel.en.content }
        })),
        uz: { ...form.uz, title: form.uz.title.trim() },
        ru: { ...form.ru, title: form.ru.title.trim() },
        en: { ...form.en, title: form.en.title.trim() }
      };
      const saved = form.id ? await updateContentItem(RESOURCE, form.id, payload) : await createContentItem(RESOURCE, payload);
      const normalized = normalizeLaboratory(saved);
      setLaboratories((previous) =>
        form.id ? previous.map((item) => (item.id === form.id ? normalized : item)) : [normalized, ...previous]
      );
      setMode('table');
      setForm(emptyForm());
      setSearch('');
      setSuccess(form.id ? 'Laboratoriya yangilandi.' : 'Yangi laboratoriya qo‘shildi.');
    } catch (saveError) {
      setError(saveError.message || 'Laboratoriyani saqlab bo‘lmadi.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setError('');
    try {
      await deleteContentItem(RESOURCE, deleteTarget.id);
      setLaboratories((previous) => previous.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccess('Laboratoriya o‘chirildi.');
    } catch (deleteError) {
      setError(deleteError.message || 'Laboratoriyani o‘chirib bo‘lmadi.');
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Laboratoriyani tahrirlash' : 'Yangi laboratoriya qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined />} disabled={saving} onClick={closeForm}>
            Orqaga
          </Button>
        }
      >
        <Box component="form" onSubmit={submit}>
          <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Stack spacing={3}>
              <Tabs value={language} onChange={(_event, value) => setLanguage(value)} aria-label="Laboratoriya tili">
                {languages.map((item) => (
                  <Tab key={item.key} value={item.key} label={item.label} />
                ))}
              </Tabs>

              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                    <Stack spacing={2}>
                      <Typography variant="h5">Laboratoriya rasmi</Typography>
                      <Box
                        onClick={() => imageInputRef.current?.click()}
                        sx={{
                          height: 250,
                          display: 'grid',
                          placeItems: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px dashed',
                          borderColor: form.image ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          bgcolor: 'grey.50'
                        }}
                      >
                        {form.image ? (
                          <Box
                            component="img"
                            src={form.image}
                            alt="Laboratoriya"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography color="text.secondary">Rasm tanlanmagan</Typography>
                        )}
                      </Box>
                      <input
                        ref={imageInputRef}
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          uploadImage(event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                      <Button component="label" variant="outlined" startIcon={<UploadOutlined />}>
                        Rasm yuklash
                        <input
                          hidden
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => {
                            uploadImage(event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                      </Button>
                      <TextField
                        fullWidth
                        label="Rasm manzili"
                        value={form.image.startsWith('data:') ? '' : form.image}
                        onChange={(event) => changeBase('image', event.target.value)}
                        helperText={form.image.startsWith('data:') ? 'Yuklangan rasm biriktirilgan.' : imageHelperText}
                      />
                      {form.image && (
                        <Button color="error" onClick={() => changeBase('image', '')}>
                          Rasmni olib tashlash
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                    <Stack spacing={2}>
                      <Typography variant="h5">Asosiy ma’lumotlar — {languages.find((item) => item.key === language)?.label}</Typography>
                      <TextField
                        fullWidth
                        required={language === 'uz'}
                        label="Title"
                        value={form[language].title}
                        onChange={(event) => changeLocalized('title', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Yo‘nalish / kategoriya"
                        value={form[language].direction}
                        onChange={(event) => changeLocalized('direction', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Joylashuvi"
                        value={form[language].location}
                        onChange={(event) => changeLocalized('location', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Mas’ul xodim"
                        value={form[language].manager}
                        onChange={(event) => changeLocalized('manager', event.target.value)}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Tartib"
                            value={form.order}
                            onChange={(event) => changeBase('order', event.target.value)}
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Switch checked={form.active} onChange={(event) => changeBase('active', event.target.checked)} />}
                            label={form.active ? 'Saytda ko‘rsatiladi' : 'Saytda yashiriladi'}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
                    <Box>
                      <Typography variant="h5">Pastki panellar ({form.panels.length})</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Laboratoriya sahifasida rasm va title ostida chiqadigan komponentlar.
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<PlusOutlined />} onClick={addPanel}>
                      Panel qo‘shish
                    </Button>
                  </Stack>

                  {!form.panels.length && <Alert severity="info">Hozircha panel qo‘shilmagan.</Alert>}
                  {form.panels.map((panel, index) => (
                    <Paper key={panel.id} variant="outlined" sx={{ p: 2.5, bgcolor: '#fafafa' }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`${index + 1}-panel`} color="primary" variant="outlined" />
                            <Switch checked={panel.active} onChange={(event) => changePanel(panel.id, 'active', event.target.checked)} />
                          </Stack>
                          <Tooltip title="Panelni o‘chirish">
                            <IconButton color="error" aria-label={`${index + 1}-panelni o‘chirish`} onClick={() => removePanel(panel.id)}>
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <TextField
                          fullWidth
                          required={language === 'uz'}
                          label={`Panel title — ${languages.find((item) => item.key === language)?.label}`}
                          value={panel[language].title}
                          onChange={(event) => changePanel(panel.id, 'title', event.target.value)}
                        />
                        <TinyMceField
                          value={panel[language].content}
                          onChange={(value) => changePanel(panel.id, 'content', value)}
                          height={260}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>

              {error && <Alert severity="error">{error}</Alert>}
              <Divider />
              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" disabled={saving} onClick={closeForm}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="contained" disabled={saving} startIcon={<SaveOutlined />}>
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
      title="Laboratoriyalar"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          Laboratoriya qo‘shish
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Laboratoriya title, rasm va pastki panellarini boshqarish.
        </Typography>
        <TextField
          size="small"
          label="Qidirish"
          placeholder="Laboratoriya yoki panel nomi"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            pagination.handlePageChange(null, 0);
          }}
          sx={{ width: { xs: '100%', sm: 420 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
          }}
        />
        {loading && <Alert severity="info">Yuklanmoqda...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Laboratoriyalar jadvali" sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Rasm</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Panellar</TableCell>
                <TableCell>Tartib</TableCell>
                <TableCell>Holat</TableCell>
                <TableCell align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagination.paginatedItems.map((item, index) => (
                <TableRow hover key={item.id}>
                  <TableCell>{pagination.getRowNumber(index)}</TableCell>
                  <TableCell>
                    <Box sx={{ width: 96, height: 62, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
                      {item.image ? (
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.uz.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                          <Typography variant="caption">Rasm yo‘q</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={800}>{item.uz.title || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      RU: {item.ru.title || '—'} · EN: {item.en.title || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={`${item.panels.length} ta`} />
                  </TableCell>
                  <TableCell>{item.order || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" color={item.active ? 'success' : 'default'} label={item.active ? 'Faol' : 'Nofaol'} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Tahrirlash">
                      <IconButton color="primary" aria-label={`${item.uz.title} — tahrirlash`} onClick={() => openEdit(item)}>
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O‘chirish">
                      <IconButton color="error" aria-label={`${item.uz.title} — o‘chirish`} onClick={() => setDeleteTarget(item)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !filteredLaboratories.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    {search ? 'Qidiruv bo‘yicha topilmadi.' : 'Laboratoriyalar hali qo‘shilmagan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={filteredLaboratories.length}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
        />
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !saving && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Laboratoriyani o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>“{deleteTarget?.uz?.title}” laboratoriyasi va uning panellari o‘chirilsinmi?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setDeleteTarget(null)}>
            Bekor qilish
          </Button>
          <Button color="error" variant="contained" disabled={saving} onClick={confirmDelete}>
            {saving ? 'O‘chirilmoqda...' : 'O‘chirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
