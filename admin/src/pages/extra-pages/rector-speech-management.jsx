import React, { useEffect, useRef, useState } from 'react';

// material-ui
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

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons';

// project import
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import { deleteSetting, fetchSetting, saveSetting } from 'api/cms';
import { fileToDataUrl } from 'utils/file';

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
  image: '',
  imageFile: null,
  active: true,
  rectorName: createLangValue(),
  position: createLangValue(),
  title: createLangValue(),
  content: createLangValue()
});

const normalizeRectorSpeechSetting = (data = {}) => ({
  ...getEmptyForm(),
  ...data,
  image: data.image || '',
  imageFile: null,
  active: data.active ?? true,
  rectorName: createLangValue(data.rectorName),
  position: createLangValue(data.position),
  title: createLangValue(data.title),
  content: createLangValue(data.content)
});

const prepareRectorSpeechPayload = (data = {}) => {
  const normalized = normalizeRectorSpeechSetting(data);

  return {
    image: normalized.image,
    active: normalized.active,
    rectorName: normalized.rectorName,
    position: normalized.position,
    title: normalized.title,
    content: normalized.content
  };
};

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

export default function RectorSpeechManagementPage() {
  const fileInputRef = useRef(null);

  const [rectorSpeech, setRectorSpeech] = useState(null);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm);
  const tableRecords = rectorSpeech ? [rectorSpeech] : [];
  const tablePagination = useTablePagination(tableRecords);

  useEffect(() => {
    let cancelled = false;

    const loadSettingData = async () => {
      try {
        const item = await fetchSetting('rector-speech');

        if (!cancelled) {
          setRectorSpeech(item ? normalizeRectorSpeechSetting(item) : null);
        }
      } catch (error) {
        console.error('Failed to load rector speech:', error);
      }
    };

    loadSettingData();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = () => {
    setForm(normalizeRectorSpeechSetting(rectorSpeech || {}));
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

  const setImageFile = async (file) => {
    if (!file) return;

    const imageUrl = await fileToDataUrl(file);

    setForm((prev) => ({
      ...prev,
      image: imageUrl,
      imageFile: file
    }));
  };

  const handleImageUpload = async (e) => {
    await setImageFile(e.target.files?.[0]);
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    await setImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDelete = async () => {
    try {
      await deleteSetting('rector-speech');
      setRectorSpeech(null);
      setForm(getEmptyForm());
      setMode('table');
    } catch (error) {
      console.error('Failed to delete rector speech:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const savedItem = await saveSetting(
        'rector-speech',
        prepareRectorSpeechPayload({
          ...form,
          imageFile: null
        })
      );

      if (savedItem) {
        const normalizedItem = normalizeRectorSpeechSetting(savedItem);
        setRectorSpeech(normalizedItem);
        setForm(normalizedItem);
      }

      setMode('table');
    } catch (error) {
      console.error('Failed to save rector speech:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={rectorSpeech ? 'Rektor murojaatini tahrirlash' : 'Rektor murojaati qo‘shish'}
        secondary={
          <Button
            startIcon={<ArrowLeftOutlined />}
            variant="outlined"
            onClick={() => setMode('table')}
          >
            Orqaga
          </Button>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Rektor sahifasidagi rasm, title va content ma’lumotlarini 4 tilda boshqarish.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={2.5}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    bgcolor: '#f8fbff'
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background:
                        'linear-gradient(135deg, rgba(8,46,105,0.12), rgba(8,46,105,0.02))'
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '6px',
                          bgcolor: '#082e69',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20
                        }}
                      >
                        <UploadOutlined />
                      </Box>

                      <Box>
                        <Typography variant="h5" fontWeight={900}>
                          Rasm
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Rektor rasmi yoki sahifa rasmi
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />

                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleImageDrop}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        height: 360,
                        borderRadius: '6px',
                        border: '2px dashed',
                        borderColor: form.image ? '#082e69' : 'divider',
                        bgcolor: '#fff',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {form.image ? (
                        <>
                          <Box
                            component="img"
                            src={form.image}
                            alt="Rektor rasmi"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />

                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              bgcolor: 'rgba(8, 46, 105, 0.45)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: '0.25s',
                              '&:hover': {
                                opacity: 1
                              }
                            }}
                          >
                            <Stack spacing={1} alignItems="center">
                              <UploadOutlined style={{ fontSize: 34 }} />

                              <Typography variant="subtitle1" fontWeight={800}>
                                Rasmni almashtirish
                              </Typography>
                            </Stack>
                          </Box>
                        </>
                      ) : (
                        <Stack spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 86,
                              height: 86,
                              borderRadius: '50%',
                              bgcolor: '#eef4ff',
                              color: '#082e69',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 36
                            }}
                          >
                            <UploadOutlined />
                          </Box>

                          <Typography variant="h5" fontWeight={900}>
                            Rasm yuklash
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            PNG, JPG, JPEG yoki WEBP
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {form.image && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlined />}
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev) => ({
                            ...prev,
                            image: '',
                            imageFile: null
                          }));
                        }}
                      >
                        Rasmni olib tashlash
                      </Button>
                    )}
                  </Box>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    p: 3,
                    bgcolor: '#fff'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Sahifa holati
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Murojaat sahifasini faol yoki nofaol qiling.
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
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    bgcolor: '#fff'
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background:
                        'linear-gradient(135deg, #082e69 0%, #0f4a9d 100%)',
                      color: '#fff'
                    }}
                  >
                    <Typography variant="h4" fontWeight={900}>
                      Asosiy ma’lumotlar
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.82, mt: 0.6 }}>
                      Rektor ism-familyasi va lavozimini 4 tilda kiriting.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2.5}>
                      {langList.map((lang) => (
                        <Grid item xs={12} md={6} key={`name-${lang.key}`}>
                          <TextField
                            fullWidth
                            label={`${lang.label} ism-familya`}
                            value={form.rectorName[lang.key]}
                            onChange={(e) =>
                              handleLangChange('rectorName', lang.key, e.target.value)
                            }
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}

                      {langList.map((lang) => (
                        <Grid item xs={12} md={6} key={`position-${lang.key}`}>
                          <TextField
                            fullWidth
                            label={`${lang.label} lavozim`}
                            value={form.position[lang.key]}
                            onChange={(e) =>
                              handleLangChange('position', lang.key, e.target.value)
                            }
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    bgcolor: '#fff'
                  }}
                >
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
                      Sahifada chiqadigan asosiy title matnlarini kiriting.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {langList.map((lang) => (
                        <Grid item xs={12} key={lang.key}>
                          <TextField
                            fullWidth
                            label={`${lang.label} title`}
                            value={form.title[lang.key]}
                            onChange={(e) =>
                              handleLangChange('title', lang.key, e.target.value)
                            }
                            required={lang.key === 'uz'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '6px',
                  overflow: 'hidden',
                  bgcolor: '#fff'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#f8fbff',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#082e69">
                    Content
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                    Rektor murojaati contentini 4 tilda kiriting.
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    {langList.map((lang) => (
                      <Paper
                        key={lang.key}
                        variant="outlined"
                        sx={{
                          borderRadius: '6px',
                          overflow: 'hidden',
                          bgcolor: '#fafafa'
                        }}
                      >
                        <Box
                          sx={{
                            px: 3,
                            py: 2,
                            bgcolor: '#fff',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Typography variant="h5" fontWeight={900}>
                            {lang.label}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Shu til uchun content kiriting.
                          </Typography>
                        </Box>

                        <Box sx={{ p: 3 }}>
                          <TinyMceWrapper>
                            <TinyMceField
                              label="Content"
                              value={form.content[lang.key]}
                              onChange={(value) =>
                                handleLangChange('content', lang.key, value)
                              }
                              height={340}
                            />
                          </TinyMceWrapper>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="flex-end"
              >
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
                    '&:hover': {
                      bgcolor: '#061f49'
                    }
                  }}
                >
                  Saqlash
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Rektor murojaati boshqaruvi"
      secondary={
        !rectorSpeech ? (
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={openCreate}
          >
            Murojaat qo‘shish
          </Button>
        ) : null
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Saqlangan murojaat jadvalda ko‘rinadi. Shu yerdan tahrirlash yoki o‘chirish mumkin.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Rasm</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Rektor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Yangilangan</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rectorSpeech ? (
              tablePagination.paginatedItems.map((item, index) => (
              <TableRow hover key={item.updatedAt || 'rector-speech'}>
                <TableCell>{tablePagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  {item.image ? (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.title?.uz || 'Rektor rasmi'}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '6px',
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Rasm yo‘q
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.title?.uz || '-'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    RU: {item.title?.ru || '-'} | EN: {item.title?.en || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.rectorName?.uz || '-'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {item.position?.uz || '-'}
                  </Typography>
                </TableCell>

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
                  Rektor murojaati hali saqlanmagan
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

function TinyMceWrapper({ children }) {
  return (
    <Box
      sx={{
        width: '100%',

        '& .tox-tinymce': {
          minHeight: '320px !important',
          borderRadius: '6px !important'
        },

        '& .tox-editor-header': {
          position: 'static !important',
          top: 'auto !important',
          zIndex: '1 !important'
        },

        '& .tox-toolbar-overlord': {
          position: 'static !important'
        },

        '& .tox-toolbar': {
          position: 'static !important'
        },

        '& .tox-menubar': {
          position: 'static !important'
        }
      }}
    >
      {children}
    </Box>
  );
}
