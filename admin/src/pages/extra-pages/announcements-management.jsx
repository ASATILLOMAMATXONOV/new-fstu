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
  Typography,
  FormControlLabel
} from '@mui/material';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';

// project import
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import {
  createContentItem,
  deleteContentItem,
  fetchContentList,
  updateContentItem
} from 'api/cms';
import {
  getManagedImageHelperText,
  prepareManagedImageDataUrl,
  prepareManagedImageUpload
} from 'utils/content-images';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
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
  image: '',
  imageFile: null,
  order: '',
  active: true,
  ...createLangs()
});

const initialAnnouncements = [];

export default function AnnouncementsManagementPage() {
  const fileInputRef = useRef(null);
  const imageHelperText = getManagedImageHelperText('announcements');

  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncements = async () => {
      try {
        const items = await fetchContentList('announcements');

        if (!cancelled) {
          setAnnouncements(items);
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
      }
    };

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const announcementsPagination = useTablePagination(sortedAnnouncements);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (announcement) => {
    setForm({
      ...announcement,
      imageFile: null,
      uz: { ...announcement.uz },
      ru: { ...announcement.ru },
      en: { ...announcement.en }
    });

    setMode('form');
  };

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const setImageFile = async (file) => {
    if (!file) return;

    const { dataUrl } = await prepareManagedImageUpload(file, 'announcements');

    setForm((prev) => ({
      ...prev,
      image: dataUrl,
      imageFile: file
    }));
  };

  const handleImageUpload = async (e) => {
    try {
      await setImageFile(e.target.files?.[0]);
    } catch (error) {
      window.alert(error.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();

    try {
      await setImageFile(e.dataTransfer.files?.[0]);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('announcements', id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let normalizedImage = form.image;

    try {
      normalizedImage = await prepareManagedImageDataUrl(form.image, 'announcements');
    } catch (error) {
      window.alert(error.message);
      return;
    }

    const preparedForm = {
      ...form,
      image: normalizedImage,
      imageFile: null,
      title: form.uz.title.trim(),
      order: form.order ? Number(form.order) : announcements.length + 1
    };

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('announcements', form.id, preparedForm);
        setAnnouncements((prev) =>
          prev.map((item) => (item.id === form.id ? updatedItem : item))
        );
      } else {
        const createdItem = await createContentItem('announcements', preparedForm);
        setAnnouncements((prev) => [createdItem, ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'E’lon tahrirlash' : 'Yangi e’lon qo‘shish'}
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
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    E’lon rasmi
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {imageHelperText}
                  </Typography>
                </Stack>

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
                    minHeight: 320,
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: form.image ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {form.image ? (
                    <>
                      <Box
                        component="img"
                        src={form.image}
                        alt="E’lon rasmi"
                        sx={{
                          width: '100%',
                          height: 320,
                          objectFit: 'cover'
                        }}
                      />

                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(8, 46, 105, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: '0.2s',
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<UploadOutlined />}
                          sx={{
                            bgcolor: '#082e69',
                            '&:hover': {
                              bgcolor: '#061f49'
                            }
                          }}
                        >
                          Rasmni almashtirish
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Stack spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: '#eef4ff',
                          color: '#082e69',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 30
                        }}
                      >
                        <UploadOutlined />
                      </Box>

                      <Typography variant="h5" fontWeight={800}>
                        Rasm yuklash
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {imageHelperText}
                      </Typography>

                      <Button variant="outlined" startIcon={<UploadOutlined />}>
                        Fayl tanlash
                      </Button>
                    </Stack>
                  )}
                </Box>

                {form.image && (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Rasm tanlandi. Almashtirish uchun rasm ustiga bosing.
                    </Typography>

                    <Button
                      variant="outlined"
                      color="error"
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
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.active}
                            onChange={handleBaseChange}
                            name="active"
                          />
                        }
                        label="Faol"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Titlelar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun e’lon sarlavhasini pastma-past kiriting.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {langList.map((lang) => (
                    <Grid item xs={12} key={lang.key}>
                      <TextField
                        fullWidth
                        label={`${lang.label} title`}
                        value={form[lang.key].title}
                        onChange={(e) =>
                          handleLangChange(lang.key, 'title', e.target.value)
                        }
                        required={lang.key === 'uz'}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Contentlar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun to‘liq e’lon matnini kiriting.
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  {langList.map((lang) => (
                    <Paper
                      key={lang.key}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: 'background.paper',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          px: { xs: 2, md: 2.5 },
                          py: 2
                        }}
                      >
                        <Typography variant="h6" fontWeight={800}>
                          {lang.label} content
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Shu til uchun e’lon matni
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          width: '100%',

                          '& .tox-tinymce': {
                            minHeight: '420px !important',
                            borderRadius: '8px !important'
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
                        <TinyMceField
                          value={form[lang.key].content}
                          onChange={(value) =>
                            handleLangChange(lang.key, 'content', value)
                          }
                          height={420}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Typography variant="h5" fontWeight={800}>
                    Live preview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    E’lon kartasi saytda taxminan shunday ko‘rinadi.
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      maxWidth: 420,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        height: 220,
                        bgcolor: '#eef3f8',
                        overflow: 'hidden'
                      }}
                    >
                      {form.image ? (
                        <Box
                          component="img"
                          src={form.image}
                          alt={form.uz.title || 'announcement'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography color="text.secondary">
                            Rasm tanlanmagan
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ p: 2.5 }}>
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 900,
                          lineHeight: 1.25,
                          color: '#082e69'
                        }}
                      >
                        {form.uz.title || 'E’lon title'}
                      </Typography>
                    </Box>
                  </Box>
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

                <Button type="submit" variant="contained">
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
      title="E’lonlar"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          E’lon qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        E’lon rasmini yuklash, title va contentlarni boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Rasm</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {announcementsPagination.paginatedItems.map((announcement, index) => (
              <TableRow hover key={announcement.id}>
                <TableCell>{announcementsPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Box
                    sx={{
                      width: 120,
                      height: 70,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    {announcement.image ? (
                      <Box
                        component="img"
                        src={announcement.image}
                        alt={announcement.uz.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No image
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {announcement.uz.title || '-'}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      RU: {announcement.ru.title || '-'} | EN:{' '}
                      {announcement.en.title || '-'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{announcement.order}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={announcement.active ? 'success' : 'default'}
                    label={announcement.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => openEdit(announcement)}
                  >
                    <EditOutlined />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!announcements.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  E’lon mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedAnnouncements.length}
        page={announcementsPagination.page}
        rowsPerPage={announcementsPagination.rowsPerPage}
        onPageChange={announcementsPagination.handlePageChange}
        onRowsPerPageChange={announcementsPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
