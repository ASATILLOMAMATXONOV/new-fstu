import React, { useEffect, useMemo, useState } from 'react';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import { useTablePagination } from 'hooks/useTablePagination';
import { deleteSetting, fetchSetting, saveSetting } from 'api/cms';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const createLangValue = (data = {}) => ({
  uz: data.uz || '',
  ru: data.ru || '',
  en: data.en || '',
});

const getEmptyForm = () => ({
  active: true,
  buttonUrl: '/admission',
  title: createLangValue(),
  content: createLangValue(),
  buttonText: createLangValue()
});

const normalizeAdmissionSetting = (data = {}) => ({
  ...getEmptyForm(),
  ...data,
  active: data.active ?? true,
  buttonUrl: !data.buttonUrl || data.buttonUrl === '#apply' ? '/admission' : data.buttonUrl,
  title: createLangValue(data.title),
  content: createLangValue(data.content),
  buttonText: createLangValue(data.buttonText)
});

function formatUpdatedAt(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function AdmissionCtaManagementPage() {
  const [record, setRecord] = useState(null);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm);
  const tableRecords = record ? [record] : [];
  const tablePagination = useTablePagination(tableRecords);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const item = await fetchSetting('admission-cta');

        if (!cancelled) {
          setRecord(item ? normalizeAdmissionSetting(item) : null);
        }
      } catch (error) {
        console.error('Failed to load admission CTA:', error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const preview = useMemo(() => normalizeAdmissionSetting(form), [form]);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = () => {
    setForm(normalizeAdmissionSetting(record || {}));
    setMode('form');
  };

  const handleLangChange = (section, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [lang]: value
      }
    }));
  };

  const handleDelete = async () => {
    try {
      await deleteSetting('admission-cta');
      setRecord(null);
      setForm(getEmptyForm());
      setMode('table');
    } catch (error) {
      console.error('Failed to delete admission CTA:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const savedItem = await saveSetting('admission-cta', {
        active: form.active,
        buttonUrl: form.buttonUrl.trim() || '/admission',
        title: form.title,
        content: form.content,
        buttonText: form.buttonText
      });

      if (savedItem) {
        const normalized = normalizeAdmissionSetting(savedItem);
        setRecord(normalized);
        setForm(normalized);
      }

      setMode('table');
    } catch (error) {
      console.error('Failed to save admission CTA:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={record ? 'Qabul 2024 blokini tahrirlash' : 'Qabul 2024 blokini qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined />} variant="outlined" onClick={() => setMode('table')}>
            Orqaga
          </Button>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Bosh sahifadagi `Qabul 2024` kartasi title, matn, tugma va linkini 4 tilda boshqaring.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Blok holati
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kartani ko‘rsatish yoki yashirish.
                      </Typography>
                    </Box>

                    <Switch
                      checked={form.active}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          active: !prev.active
                        }))
                      }
                    />
                  </Stack>

                  <Chip
                    sx={{ mt: 2, fontWeight: 800 }}
                    color={form.active ? 'success' : 'default'}
                    label={form.active ? 'Faol' : 'Nofaol'}
                  />
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                    Tugma linki
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Masalan: `/admission` yoki `https://...`
                  </Typography>

                  <TextField
                    fullWidth
                    label="Button URL"
                    value={form.buttonUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        buttonUrl: e.target.value
                      }))
                    }
                    required
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #082e69 0%, #0f4a9d 100%)',
                      color: '#fff'
                    }}
                  >
                    <Typography variant="h5" fontWeight={900}>
                      Preview
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.6 }}>
                      O‘zbekcha preview ko‘rinishi
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3, bgcolor: '#f8fbff' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #082e69 0%, #0f4a9d 60%, #1b67d9 100%)'
                      }}
                    >
                      <Typography variant="h4" fontWeight={900}>
                        {preview.title.uz || 'Qabul 2024'}
                      </Typography>

                      <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.88 }}>
                        {preview.content.uz || 'Matn hali kiritilmagan.'}
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{ mt: 2.5, bgcolor: '#fff', color: '#082e69', fontWeight: 800 }}
                      >
                        {preview.buttonText.uz || 'Batafsil'}
                      </Button>
                    </Paper>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: '#f8fbff',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="h4" fontWeight={900} color="#082e69">
                      Title
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Kartaning asosiy sarlavhasini 4 tilda kiriting.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {langList.map((lang) => (
                        <Grid item xs={12} md={6} key={`title-${lang.key}`}>
                          <TextField
                            fullWidth
                            label={`${lang.label} title`}
                            value={form.title[lang.key]}
                            onChange={(e) => handleLangChange('title', lang.key, e.target.value)}
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: '#f8fbff',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="h4" fontWeight={900} color="#082e69">
                      Matn
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Kartadagi izoh matnini 4 tilda kiriting.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {langList.map((lang) => (
                        <Grid item xs={12} md={6} key={`content-${lang.key}`}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label={`${lang.label} matn`}
                            value={form.content[lang.key]}
                            onChange={(e) => handleLangChange('content', lang.key, e.target.value)}
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: '#f8fbff',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="h4" fontWeight={900} color="#082e69">
                      Tugma matni
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Tugma ustida chiqadigan yozuvni 4 tilda kiriting.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {langList.map((lang) => (
                        <Grid item xs={12} md={6} key={`button-${lang.key}`}>
                          <TextField
                            fullWidth
                            label={`${lang.label} button`}
                            value={form.buttonText[lang.key]}
                            onChange={(e) => handleLangChange('buttonText', lang.key, e.target.value)}
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => setMode('table')}>
                    Bekor qilish
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveOutlined />}
                    sx={{
                      px: 4,
                      bgcolor: '#082e69',
                      '&:hover': { bgcolor: '#061f49' }
                    }}
                  >
                    Saqlash
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Qabul 2024 boshqaruvi"
      secondary={
        !record ? (
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
            Blok qo‘shish
          </Button>
        ) : null
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Bosh sahifadagi qabul kartasi shu yerda saqlanadi va tahrir qilinadi.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Tugma</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Yangilangan</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {record ? (
              tablePagination.paginatedItems.map((item, index) => (
              <TableRow hover key={item.updatedAt || 'admission-cta'}>
                <TableCell>{tablePagination.getRowNumber(index)}</TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.title?.uz || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    RU: {item.title?.ru || '-'} | EN: {item.title?.en || '-'}
                  </Typography>
                </TableCell>
                <TableCell>{item.buttonText?.uz || '-'}</TableCell>
                <TableCell>{item.buttonUrl || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={item.active ? 'success' : 'default'}
                    label={item.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>
                <TableCell>{formatUpdatedAt(item.updatedAt)}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={openEdit}>
                    <EditOutlined />
                  </IconButton>
                  <IconButton color="error" onClick={handleDelete}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Qabul 2024 bloki hali saqlanmagan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={tableRecords.length}
        page={tablePagination.page}
        rowsPerPage={tablePagination.rowsPerPage}
        onPageChange={tablePagination.handlePageChange}
        onRowsPerPageChange={tablePagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
