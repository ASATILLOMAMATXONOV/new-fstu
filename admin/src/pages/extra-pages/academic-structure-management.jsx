import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Alert,
  Autocomplete,
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
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import AdminTablePagination from 'components/AdminTablePagination';
import { useTablePagination } from 'hooks/useTablePagination';
import { fetchContentList, fetchSetting, saveSetting } from 'api/cms';
import { academicSourceValue, buildAcademicSourceOptions } from 'constants/academic-sources';
import { fileToDataUrl } from 'utils/file';

const SETTING_KEY = 'academic-structure';
const languages = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];
const settingFields = [
  ['title', 'Bo‘lim sarlavhasi'],
  ['description', 'Bo‘lim haqida matn'],
  ['universityName', 'Universitet nomi'],
  ['universitySubtitle', 'Logo ostidagi matn'],
  ['mapTitle', 'Xarita sarlavhasi'],
  ['mapSubtitle', 'Xarita ostidagi matn'],
  ['catalogTitle', 'Katalog sarlavhasi'],
  ['catalogDescription', 'Katalog haqida matn']
];
const localized = (value = '') => ({ uz: '', ru: '', en: '', ...(typeof value === 'string' ? { uz: value } : value || {}) });

function normalizeSetting(value = {}) {
  return {
    ...Object.fromEntries(settingFields.map(([key]) => [key, localized(value[key])])),
    active: value.active !== false,
    logo: value.logo || '',
    image: value.image || '',
    menus: (Array.isArray(value.menus) ? value.menus : []).filter(Boolean).map((item, index) => ({
      id: item.id || uuid(),
      title: localized(item.title),
      subtitle: localized(item.subtitle),
      sourceType: item.sourceType || 'faculty',
      menuId: item.menuId == null ? '' : String(item.menuId),
      order: Number(item.order || index + 1),
      active: item.active !== false
    }))
  };
}

export default function AcademicStructureManagementPage() {
  const [record, setRecord] = useState(normalizeSetting);
  const [siteMenus, setSiteMenus] = useState([]);
  const sourceOptions = useMemo(() => buildAcademicSourceOptions(siteMenus), [siteMenus]);
  const sourceLabel = useCallback(
    (item) => sourceOptions.find((option) => option.value === academicSourceValue(item))?.label || '—',
    [sourceOptions]
  );
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
    Promise.all([fetchSetting(SETTING_KEY), fetchContentList('menus'), fetchContentList('academic-menus')])
      .then(([item, mainMenus, academicMenus]) => {
        if (!cancelled) {
          setRecord(normalizeSetting(item || {}));
          setSiteMenus([...mainMenus, ...academicMenus]);
        }
      })
      .catch((loadFailure) => {
        if (!cancelled) setLoadError(loadFailure.message || 'Ma’lumotlarni yuklab bo‘lmadi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const filteredMenus = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...record.menus]
      .sort((a, b) => a.order - b.order)
      .filter(
        (item) =>
          !query ||
          [...Object.values(item.title), ...Object.values(item.subtitle), sourceLabel(item)].some((value) =>
            String(value || '')
              .toLocaleLowerCase()
              .includes(query)
          )
      );
  }, [record.menus, search, sourceLabel]);
  const pagination = useTablePagination(filteredMenus);
  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };
  const openMenu = (item) => {
    clearFeedback();
    setLanguage('uz');
    setEditing(Boolean(item));
    setForm(
      item
        ? {
            ...item,
            title: localized(sourceOptions.find((option) => option.value === academicSourceValue(item))?.title || item.title),
            subtitle: { ...item.subtitle }
          }
        : {
            id: uuid(),
            title: localized(),
            subtitle: localized(),
            sourceType: '',
            menuId: '',
            order: Math.max(0, ...record.menus.map((menu) => menu.order)) + 1,
            active: true
          }
    );
    setMode('menu');
  };
  const openSettings = () => {
    clearFeedback();
    setLanguage('uz');
    setForm({
      active: record.active,
      logo: record.logo,
      image: record.image,
      ...Object.fromEntries(settingFields.map(([key]) => [key, { ...record[key] }]))
    });
    setMode('settings');
  };
  const closeForm = () => {
    clearFeedback();
    setForm(null);
    setMode('table');
  };
  const changeField = (key, value) => {
    clearFeedback();
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const changeText = (key, value) => {
    clearFeedback();
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [language]: value } }));
  };
  const changeSource = (option) => {
    clearFeedback();
    setForm((prev) => ({ ...prev, sourceType: option?.sourceType || '', menuId: option?.menuId || '', title: localized(option?.title) }));
  };
  const upload = async (key, file) => {
    if (!file) return;
    clearFeedback();
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 1024 * 1024) {
      setError('Rasm JPG, PNG, WEBP yoki GIF formatida va 1 MB dan kichik bo‘lishi kerak.');
      return;
    }
    setUploading(true);
    try {
      changeField(key, await fileToDataUrl(file));
    } catch (uploadFailure) {
      setError(uploadFailure.message || 'Rasmni yuklab bo‘lmadi.');
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
      setRecord(normalizeSetting(item));
      setMode('table');
      setForm(null);
      setSuccess(message);
      return true;
    } catch (saveFailure) {
      setError(saveFailure.message || 'O‘zgarishlarni saqlab bo‘lmadi.');
      return false;
    } finally {
      setSaving(false);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    clearFeedback();
    if (mode === 'settings') {
      await persist({ ...record, ...form }, 'Bo‘lim sozlamalari saqlandi.');
      return;
    }
    const selectedOption = sourceOptions.find((option) => option.value === academicSourceValue(form));
    if (!selectedOption) {
      setError('Biriktiriladigan menyuni tanlang.');
      return;
    }
    const menu = { ...form, title: localized(selectedOption.title), order: Math.max(1, Math.trunc(Number(form.order)) || 1) };
    const menus = editing ? record.menus.map((item) => (item.id === menu.id ? menu : item)) : [...record.menus, menu];
    if (await persist({ ...record, menus }, editing ? 'Menyu yangilandi.' : 'Yangi menyu qo‘shildi.')) {
      setSearch('');
      const index = [...menus].sort((a, b) => a.order - b.order).findIndex((item) => item.id === menu.id);
      pagination.handlePageChange(null, Math.floor(index / pagination.rowsPerPage));
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget || busy) return;
    if (await persist({ ...record, menus: record.menus.filter((item) => item.id !== deleteTarget.id) }, 'Menyu o‘chirildi.')) {
      pagination.handlePageChange(
        null,
        Math.min(pagination.page, Math.max(0, Math.ceil((filteredMenus.length - 1) / pagination.rowsPerPage) - 1))
      );
      setDeleteTarget(null);
    }
  };

  if (loading || loadError)
    return (
      <MainCard title="Akademik tuzilma">
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

  if (mode !== 'table')
    return (
      <MainCard
        title={mode === 'settings' ? 'Akademik tuzilma sozlamalari' : editing ? 'Menyuni tahrirlash' : 'Yangi menyu qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined aria-hidden="true" />} disabled={busy} onClick={closeForm}>
            Orqaga
          </Button>
        }
      >
        <Box component="form" onSubmit={submit}>
          <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Stack spacing={3}>
              <Tabs value={language} onChange={(_event, value) => setLanguage(value)} aria-label="Kontent tili">
                {languages.map((lang) => (
                  <Tab key={lang.key} label={lang.label} value={lang.key} />
                ))}
              </Tabs>
              <Typography variant="body2" color="text.secondary">
                Tarjima kiritilmasa, saytda o‘zbekcha matn ko‘rsatiladi.
              </Typography>
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={2.5}>
                  {mode === 'settings' ? (
                    settingFields.map(([key, label]) => (
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
                    ))
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Menyu nomi"
                          value={form.title[language]}
                          InputProps={{ readOnly: true }}
                          helperText="Tanlangan menyuning nomi avtomatik olinadi."
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Menyu ostidagi matn"
                          value={form.subtitle[language]}
                          onChange={(event) => changeText('subtitle', event.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Autocomplete
                          options={sourceOptions}
                          value={sourceOptions.find((option) => option.value === academicSourceValue(form)) || null}
                          onChange={(_event, option) => changeSource(option)}
                          groupBy={(option) => option.group}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) => option.value === value.value}
                          renderOption={(props, option) => (
                            <li {...props} key={option.value}>
                              {option.label}
                            </li>
                          )}
                          noOptionsText="Menyu topilmadi"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Biriktiriladigan menyu"
                              helperText="Barcha ma’lumot turlari va sayt menyularidan tanlang. Qidirish uchun yozing."
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Tartib"
                          type="number"
                          value={form.order}
                          onChange={(event) => changeField('order', event.target.value)}
                          inputProps={{ min: 1, step: 1 }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="info">
                          Tanlangan menyuning ma’lumotlari saytda o‘ng tomonda ko‘rsatiladi. Menyu nomini alohida yozish shart emas.
                        </Alert>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <FormControlLabel
                      label={mode === 'settings' ? 'Bo‘limni saytda ko‘rsatish' : 'Menyuni saytda ko‘rsatish'}
                      control={<Switch checked={form.active} onChange={(event) => changeField('active', event.target.checked)} />}
                    />
                  </Grid>
                </Grid>
              </Paper>
              {mode === 'settings' && (
                <Grid container spacing={3}>
                  {[
                    ['logo', 'Universitet logosi'],
                    ['image', 'Banner rasmi']
                  ].map(([key, label]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          <Typography variant="h5">{label}</Typography>
                          {form[key] && (
                            <Box
                              component="img"
                              src={form[key]}
                              alt={label}
                              sx={{ width: '100%', height: 140, objectFit: 'contain', bgcolor: 'grey.50', borderRadius: 1 }}
                            />
                          )}
                          <TextField
                            fullWidth
                            label={`${label} manzili`}
                            value={form[key].startsWith('data:') ? '' : form[key]}
                            onChange={(event) => changeField(key, event.target.value)}
                            helperText={
                              form[key].startsWith('data:') ? 'Yuklangan rasm biriktirilgan.' : 'Rasm manzilini kiriting yoki fayl yuklang.'
                            }
                          />
                          <Button component="label" variant="outlined" startIcon={<UploadOutlined aria-hidden="true" />} disabled={busy}>
                            Rasm yuklash
                            <input
                              hidden
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(event) => {
                                upload(key, event.target.files?.[0]);
                                event.target.value = '';
                              }}
                            />
                          </Button>
                          {form[key] && (
                            <Button color="error" onClick={() => changeField(key, '')}>
                              Rasmni olib tashlash
                            </Button>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            JPG, PNG, WEBP yoki GIF. Eng katta hajm: 1 MB.
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
              {error && <Alert severity="error">{error}</Alert>}
              <Divider />
              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" disabled={busy} onClick={closeForm}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="contained" disabled={busy} startIcon={<SaveOutlined aria-hidden="true" />}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </MainCard>
    );

  return (
    <MainCard
      title="Akademik tuzilma"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined aria-hidden="true" />} onClick={() => openMenu()}>
          Menyu qo‘shish
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          “Tuzilma xaritasi” menyulari va ular orqali ochiladigan ma’lumotlarni boshqarish.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <TextField
            size="small"
            label="Qidirish"
            placeholder="Menyu nomi yoki ma’lumot turi"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              pagination.handlePageChange(null, 0);
            }}
            sx={{ width: { xs: '100%', sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined aria-hidden="true" />
                </InputAdornment>
              )
            }}
          />
          <Button variant="outlined" startIcon={<SettingOutlined aria-hidden="true" />} onClick={openSettings}>
            Bo‘lim sozlamalari
          </Button>
        </Stack>
        {!record.active && <Alert severity="info">Akademik tuzilma bo‘limi saytda yashirilgan.</Alert>}
        {error && !deleteTarget && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tuzilma xaritasi menyulari" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {['#', 'Menyu nomi', 'Biriktirilgan ma’lumotlar', 'Tartib', 'Holat'].map((label) => (
                  <TableCell key={label}>{label}</TableCell>
                ))}
                <TableCell align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagination.paginatedItems.map((item, index) => (
                <TableRow hover key={item.id}>
                  <TableCell>{pagination.getRowNumber(index)}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.title.uz || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.subtitle.uz}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      RU: {item.title.ru || '—'} | EN: {item.title.en || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{sourceLabel(item)}</TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <Chip size="small" color={item.active ? 'success' : 'default'} label={item.active ? 'Faol' : 'Nofaol'} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Tahrirlash">
                      <IconButton color="primary" aria-label={`${item.title.uz} — tahrirlash`} onClick={() => openMenu(item)}>
                        <EditOutlined aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O‘chirish">
                      <IconButton
                        color="error"
                        aria-label={`${item.title.uz} — o‘chirish`}
                        onClick={() => {
                          clearFeedback();
                          setDeleteTarget(item);
                        }}
                      >
                        <DeleteOutlined aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredMenus.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    {search.trim() ? 'Qidiruv bo‘yicha menyu topilmadi.' : 'Menyular hali qo‘shilmagan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={filteredMenus.length}
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
        aria-labelledby="delete-structure-menu-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-structure-menu-title">Menyuni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{deleteTarget?.title.uz}” menyusini o‘chirmoqchimisiz? Biriktirilgan fakultet yoki bo‘lim ma’lumotlari saqlanib qoladi.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            disabled={saving}
            onClick={() => {
              setDeleteTarget(null);
              setError('');
            }}
          >
            Bekor qilish
          </Button>
          <Button color="error" variant="contained" disabled={saving} onClick={handleDelete}>
            {saving ? 'O‘chirilmoqda...' : 'O‘chirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
