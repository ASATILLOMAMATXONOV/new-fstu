import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Snackbar,
  Switch,
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
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PictureOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';

import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import { getManagedImageHelperText, prepareManagedImageUpload } from 'utils/content-images';
import { buildPublicDirectionUrl } from 'utils/public-site';
import {
  createContentItem,
  deleteContentItem,
  fetchContentList,
  fetchContentOptions,
  updateContentItem
} from 'api/cms';

const langList = [
  { key: 'uz', label: "O'zbekcha" },
  { key: 'ru', label: 'Russkiy' },
  { key: 'en', label: 'English' }
];

const emptyLang = {
  title: '',
  content: ''
};

const createLangs = () => ({
  uz: { ...emptyLang },
  ru: { ...emptyLang },
  en: { ...emptyLang }
});

const getEmptyForm = () => ({
  id: null,
  facultyId: '',
  departmentId: '',
  image: '',
  link: '',
  order: '',
  active: true,
  ...createLangs()
});

const slugifyValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createDepartmentId = (facultyId, department, index) => {
  if (department?.id) {
    return department.id;
  }

  const orderPart = department?.order || index + 1;
  const titlePart =
    slugifyValue(department?.uz?.title || department?.title || department?.en?.title) ||
    `department-${index + 1}`;

  return `${facultyId || 'faculty'}-${titlePart}-${orderPart}`;
};

const normalizeFacultyList = (list = []) =>
  list.map((faculty) => ({
    ...faculty,
    departments: (faculty.departments || []).map((department, index) => ({
      ...department,
      id: createDepartmentId(faculty.id, department, index),
      facultyId: department.facultyId || faculty.id
    }))
  }));

const sortByOrder = (list = []) =>
  [...list].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const getLocalizedTitle = (item) =>
  item?.uz?.title || item?.title || item?.translations?.uz?.title || '';

const normalizeDirectionItem = (item = {}) => ({
  id: item.id || null,
  facultyId: item.facultyId || '',
  departmentId: item.departmentId || '',
  image: item.image || item.imageUrl || '',
  link: String(item.link || '').trim(),
  order: item.order || item.sortOrder || '',
  active: item.active ?? true,
  uz: {
    ...emptyLang,
    ...(item?.uz || item?.translations?.uz || {}),
    title: item?.uz?.title || item?.translations?.uz?.title || item?.title || '',
    content: item?.uz?.content || item?.translations?.uz?.content || ''
  },
  ru: {
    ...emptyLang,
    ...(item?.ru || item?.translations?.ru || {})
  },
  en: {
    ...emptyLang,
    ...(item?.en || item?.translations?.en || {})
  }
});

const prepareDirectionPayload = (form, orderFallback) => ({
  ...form,
  title: form?.uz?.title?.trim() || '',
  link: String(form.link || '').trim(),
  order: form.order ? Number(form.order) : orderFallback,
  active: form.active ?? true
});

export default function DirectionsManagementPage() {
  const logoInput = useRef(null);
  const [directions, setDirections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [directionItems, facultyItems] = await Promise.all([
          fetchContentList('directions'),
          fetchContentOptions('faculties')
        ]);

        if (cancelled) {
          return;
        }

        setDirections(directionItems.map(normalizeDirectionItem));
        setFaculties(
          normalizeFacultyList(facultyItems.filter((item) => item.entityType !== 'section'))
        );
      } catch (error) {
        console.error('Failed to load directions:', error);
        if (!cancelled) setError('Yo‘nalishlarni yuklab bo‘lmadi. Sahifani qayta yuklang.');
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const getFacultyById = (facultyId) =>
    faculties.find((faculty) => String(faculty.id) === String(facultyId));

  const getDepartmentById = (facultyId, departmentId) => {
    const faculty = getFacultyById(facultyId);

    return faculty?.departments?.find(
      (department) => String(department.id) === String(departmentId)
    );
  };

  const selectedFaculty = getFacultyById(form.facultyId);
  const departmentOptions = selectedFaculty?.departments || [];
  const sortedDirections = sortByOrder(directions);
  const directionsPagination = useTablePagination(sortedDirections);

  const openCreate = () => {
    setError('');
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (item) => {
    setError('');
    setForm(normalizeDirectionItem(item));
    setMode('form');
  };

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => {
      if (name === 'facultyId') {
        return {
          ...prev,
          facultyId: value,
          departmentId: ''
        };
      }

      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleLangChange = (lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const { dataUrl } = await prepareManagedImageUpload(file, 'directions');
      setForm((previous) => ({ ...previous, image: dataUrl }));
    } catch (uploadError) {
      setError(uploadError.message || 'Logoni yuklab bo‘lmadi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || uploading) return;
    setSaving(true);
    setError('');

    const preparedForm = prepareDirectionPayload(form, directions.length + 1);

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('directions', form.id, preparedForm);
        setDirections((prev) =>
          prev.map((item) =>
            String(item.id) === String(form.id) ? normalizeDirectionItem(updatedItem) : item
          )
        );
      } else {
        const createdItem = await createContentItem('directions', preparedForm);
        setDirections((prev) => [normalizeDirectionItem(createdItem), ...prev]);
      }

      setForm(getEmptyForm());
      setMode('table');
    } catch (error) {
      console.error("Failed to save direction:", error);
      setError(error.message || 'Yo‘nalishni saqlab bo‘lmadi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('directions', id);
      setDirections((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      console.error('Failed to delete direction:', error);
    }
  };

  const handleActiveChange = async (id) => {
    const selectedItem = directions.find((item) => String(item.id) === String(id));

    if (!selectedItem) {
      return;
    }

    try {
      const updatedItem = await updateContentItem(
        'directions',
        id,
        prepareDirectionPayload(
          {
            ...selectedItem,
            active: !selectedItem.active
          },
          selectedItem.order || directions.length + 1
        )
      );

      setDirections((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? normalizeDirectionItem(updatedItem) : item
        )
      );
    } catch (error) {
      console.error('Failed to update direction state:', error);
    }
  };

  const handleCopyLink = async (item) => {
    const url = buildPublicDirectionUrl(item);
    if (!url) return;
    setCopiedId(null);
    setError('');
    let textarea;
    const previousFocus = document.activeElement;

    try {
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch {
          // Older browsers and restricted clipboard permissions use the fallback below.
        }
      }
      if (!copied) {
        textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
      }
      if (!copied) throw new Error('Havolani nusxalab bo‘lmadi. “Ochish” orqali sahifani ochib, manzilni nusxalang.');
      setCopiedId(String(item.id));
    } catch (copyError) {
      setError(copyError.message || 'Havolani nusxalab bo‘lmadi.');
    } finally {
      textarea?.remove();
      previousFocus?.focus({ preventScroll: true });
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? "Yo'nalishni tahrirlash" : "Yangi yo'nalish qo'shish"}
        secondary={
          <Button
            startIcon={<ArrowLeftOutlined />}
            variant="outlined"
            disabled={saving || uploading}
            onClick={() => setMode('table')}
          >
            Orqaga
          </Button>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <fieldset disabled={saving || uploading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Avatar
                    variant="rounded"
                    src={form.image || undefined}
                    alt="Yo‘nalish logosi"
                    sx={{ width: 96, height: 96, bgcolor: 'grey.50', color: 'text.secondary', border: '1px solid', borderColor: 'divider', '& img': { objectFit: 'contain', p: 1 } }}
                  >
                    <PictureOutlined style={{ fontSize: 30 }} />
                  </Avatar>
                  <Stack spacing={1.25}>
                    <Typography variant="h5" fontWeight={800}>Yo‘nalish logosi</Typography>
                    <Typography variant="body2" color="text.secondary">Logo saytdagi yo‘nalish kartochkasi va batafsil ma’lumotlarda ko‘rinadi.</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <input ref={logoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleLogoUpload} />
                      <Button variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadOutlined />} onClick={() => logoInput.current?.click()}>
                        {uploading ? 'Logo tayyorlanmoqda…' : form.image ? 'Logoni almashtirish' : 'Logo yuklash'}
                      </Button>
                      {form.image && <Button color="error" onClick={() => setForm((previous) => ({ ...previous, image: '' }))}>Logoni olib tashlash</Button>}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{getManagedImageHelperText('directions')}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Biriktirish
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"Yo'nalish qaysi fakultet va kafedraga tegishli ekanini tanlang."}
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Fakultet"
                      name="facultyId"
                      value={form.facultyId}
                      onChange={handleBaseChange}
                      required
                    >
                      {faculties.map((faculty) => (
                        <MenuItem key={faculty.id} value={faculty.id}>
                          {getLocalizedTitle(faculty)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Kafedra"
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleBaseChange}
                      required
                      disabled={!form.facultyId}
                    >
                      {departmentOptions.map((department) => (
                        <MenuItem key={department.id} value={department.id}>
                          {getLocalizedTitle(department)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Asosiy sozlamalar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"Link ixtiyoriy. Bo'sh qoldirilsa frontendda oddiy yo'nalish sifatida chiqadi."}
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Link"
                      name="link"
                      value={form.link}
                      onChange={handleBaseChange}
                      placeholder="https://... yoki /pages/12"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tartib"
                      name="order"
                      value={form.order}
                      onChange={handleBaseChange}
                      placeholder="1"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          Holati
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Switch checked={form.active} onChange={handleBaseChange} name="active" />
                          <Typography variant="body2">{form.active ? 'Faol' : 'Nofaol'}</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    {"Yo'nalish nomlari"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"Har bir til uchun yo'nalish nomini kiriting."}
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {langList.map((lang) => (
                    <Grid item xs={12} md={6} key={lang.key}>
                      <TextField
                        fullWidth
                        label={`${lang.label} nomi`}
                        value={form[lang.key].title}
                        onChange={(e) => handleLangChange(lang.key, 'title', e.target.value)}
                        required={lang.key === 'uz'}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    {"Yo'nalish contentlari"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"Har bir til uchun yo'nalish haqida matn kiriting."}
                  </Typography>
                </Stack>

                <Stack spacing={2.5}>
                  {langList.map((lang) => (
                    <Paper
                      key={lang.key}
                      variant="outlined"
                      sx={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                        <Typography fontWeight={700}>{lang.label}</Typography>
                      </Box>

                      <Box sx={{ p: 2 }}>
                        <TinyMceField
                          label={`${lang.label} content`}
                          value={form[lang.key].content}
                          onChange={(nextValue) => handleLangChange(lang.key, 'content', nextValue)}
                          height={320}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setMode('table')}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="contained">
                  {saving ? 'Saqlanmoqda…' : 'Saqlash'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
          </fieldset>
        </form>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Yo'nalishlar boshqaruvi"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          {"Yo'nalish qo'shish"}
        </Button>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>{error}</Alert>}
      <Stack spacing={1} sx={{ mb: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Yo‘nalishlar nomi, logosi va biriktirilgan kafedrasini boshqaring.
        </Typography>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
        <Table sx={{ tableLayout: 'fixed', minWidth: 1040, '& td': { py: 2 }, '& th': { bgcolor: 'grey.50' } }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 64 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 144 }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>Nomi</TableCell>
              <TableCell>Biriktirilgan joy</TableCell>
              <TableCell>Saytdagi havola</TableCell>
              <TableCell align="center">Tartib</TableCell>
              <TableCell>Holat</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {directionsPagination.paginatedItems.map((item) => {
              const faculty = getFacultyById(item.facultyId);
              const department = getDepartmentById(item.facultyId, item.departmentId);
              const publicUrl = buildPublicDirectionUrl(item);

              return (
                <TableRow hover key={item.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar
                        variant="rounded"
                        src={item.image || undefined}
                        alt=""
                        sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: 'grey.50', color: 'text.secondary', border: '1px solid', borderColor: 'divider', '& img': { objectFit: 'contain', p: 0.5 } }}
                      >
                        <PictureOutlined />
                      </Avatar>
                      <Tooltip title={getLocalizedTitle(item)} arrow>
                      <Typography fontWeight={700} sx={{ minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', lineHeight: 1.5 }}>
                        {getLocalizedTitle(item) || '-'}
                      </Typography>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={0.3}>
                      <Tooltip title={getLocalizedTitle(department)} arrow>
                      <Typography fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', lineHeight: 1.5 }}>
                        {getLocalizedTitle(department) || 'Kafedra tanlanmagan'}
                      </Typography>
                      </Tooltip>
                      <Tooltip title={getLocalizedTitle(faculty)} arrow>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {getLocalizedTitle(faculty) || 'Fakultet tanlanmagan'}
                      </Typography>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {publicUrl ? (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Tooltip title={publicUrl} arrow>
                          <Button component="a" href={publicUrl} target="_blank" rel="noopener noreferrer" size="small" variant="outlined" startIcon={<ExportOutlined />} aria-label={`${getLocalizedTitle(item)} — saytda ochish`}>
                            Ochish
                          </Button>
                        </Tooltip>
                        <Tooltip title={copiedId === String(item.id) ? 'Nusxa olindi' : 'Havolani nusxalash'} arrow>
                          <IconButton size="small" color={copiedId === String(item.id) ? 'success' : 'primary'} aria-label={`${getLocalizedTitle(item)} havolasini nusxalash`} onClick={() => handleCopyLink(item)}>
                            {copiedId === String(item.id) ? <CheckOutlined /> : <CopyOutlined />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : <Typography variant="caption" color="text.secondary">Kafedra tanlanmagan</Typography>}
                  </TableCell>

                  <TableCell align="center">{item.order || 0}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color={item.active ? 'success' : 'default'}
                      label={item.active ? 'Faol' : 'Nofaol'}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                      <Switch
                        size="small"
                        checked={item.active}
                        inputProps={{ 'aria-label': `${getLocalizedTitle(item)} holatini o‘zgartirish` }}
                        onChange={() => handleActiveChange(item.id)}
                      />
                      <IconButton color="primary" aria-label="Yo‘nalishni tahrirlash" onClick={() => openEdit(item)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" aria-label="Yo‘nalishni o‘chirish" onClick={() => handleDelete(item.id)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {!sortedDirections.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {"Yo'nalishlar hali qo'shilmagan"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedDirections.length}
        page={directionsPagination.page}
        rowsPerPage={directionsPagination.rowsPerPage}
        onPageChange={directionsPagination.handlePageChange}
        onRowsPerPageChange={directionsPagination.handleRowsPerPageChange}
      />
      <Snackbar open={copiedId !== null} autoHideDuration={2500} onClose={() => setCopiedId(null)}>
        <Alert severity="success" variant="filled" onClose={() => setCopiedId(null)}>Havola nusxalandi</Alert>
      </Snackbar>
    </MainCard>
  );
}
