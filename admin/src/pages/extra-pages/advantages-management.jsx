import React, { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
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
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  PlusOutlined,
  ReadOutlined,
  SettingOutlined,
  TeamOutlined,
  UploadOutlined
} from '@ant-design/icons';

// project import
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import { useTablePagination } from 'hooks/useTablePagination';
import {
  createContentItem,
  deleteContentItem,
  fetchContentList,
  updateContentItem
} from 'api/cms';
import { fileToDataUrl } from 'utils/file';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const iconMap = {
  ReadOutlined,
  TeamOutlined,
  BankOutlined,
  GlobalOutlined,
  SettingOutlined
};

const iconOptions = [
  {
    value: 'ReadOutlined',
    label: 'Ta’lim / Graduation'
  },
  {
    value: 'TeamOutlined',
    label: 'Jamoa / People'
  },
  {
    value: 'BankOutlined',
    label: 'Kampus / Building'
  },
  {
    value: 'GlobalOutlined',
    label: 'Global / International'
  },
  {
    value: 'SettingOutlined',
    label: 'Sifat / Settings'
  }
];

const emptyLang = {
  title: ''
};

const createLangs = () => ({
  uz: { ...emptyLang },
  ru: { ...emptyLang },
  en: { ...emptyLang }
});

const getEmptyForm = () => ({
  id: null,
  mediaType: 'icon', // icon | image
  icon: 'ReadOutlined',
  image: '',
  imageFile: null,
  link: '',
  order: '',
  active: true,
  ...createLangs()
});

const initialAdvantages = [];

const normalizeAdvantage = (item = {}) => ({
  ...getEmptyForm(),
  ...item,
  mediaType: item.mediaType === 'image' && item.image ? 'image' : 'icon',
  icon: item.icon || 'ReadOutlined',
  image: item.image || '',
  link: item.link || '',
  order: item.order ?? '',
  active: item.active ?? true,
  uz: { ...emptyLang, title: item.uz?.title || item.title || '' },
  ru: { ...emptyLang, ...(item.ru || {}) },
  en: { ...emptyLang, ...(item.en || {}) }
});

const AdvantageIcon = ({ icon, size = 22 }) => {
  const IconComponent = iconMap[icon] || ReadOutlined;

  return <IconComponent style={{ fontSize: size }} />;
};

const AdvantageMedia = ({ item, size = 24 }) => {
  if (item.mediaType === 'image' && item.image) {
    return (
      <Box
        component="img"
        src={item.image}
        alt={item.uz?.title || 'advantage'}
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block'
        }}
      />
    );
  }

  return <AdvantageIcon icon={item.icon} size={size} />;
};

export default function AdvantagesManagementPage() {
  const fileInputRef = useRef(null);

  const [advantages, setAdvantages] = useState(initialAdvantages);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadAdvantages = async () => {
      try {
        const items = await fetchContentList('advantages');

        if (!cancelled) {
          setAdvantages(items.map(normalizeAdvantage));
        }
      } catch (error) {
        console.error('Failed to load advantages:', error);
      }
    };

    loadAdvantages();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedAdvantages = [...advantages].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const advantagesPagination = useTablePagination(sortedAdvantages);

  const activeAdvantages = sortedAdvantages.filter((item) => item.active);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (item) => {
    setForm({
      ...normalizeAdvantage(item),
      imageFile: null
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

  const handleLangChange = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        title: value
      }
    }));
  };

  const setImageFile = async (file) => {
    if (!file) return;

    const imageUrl = await fileToDataUrl(file);

    setForm((prev) => ({
      ...prev,
      mediaType: 'image',
      image: imageUrl,
      imageFile: file
    }));
  };

  const handleImageUpload = async (e) => {
    await setImageFile(e.target.files?.[0]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('advantages', id);
      setAdvantages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete advantage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedForm = {
      ...form,
      imageFile: null,
      image: form.image.trim(),
      link: form.link.trim(),
      order: form.order ? Number(form.order) : advantages.length + 1
    };

    if (preparedForm.mediaType === 'icon') {
      preparedForm.image = '';
      preparedForm.imageFile = null;
    }

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('advantages', form.id, preparedForm);
        setAdvantages((prev) =>
          prev.map((item) =>
            item.id === form.id ? normalizeAdvantage(updatedItem) : item
          )
        );
      } else {
        const createdItem = await createContentItem('advantages', preparedForm);
        setAdvantages((prev) => [normalizeAdvantage(createdItem), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save advantage:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Afzallik tahrirlash' : 'Yangi afzallik qo‘shish'}
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
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Ko‘rinish turi"
                name="mediaType"
                value={form.mediaType}
                onChange={handleBaseChange}
              >
                <MenuItem value="icon">Ikonka</MenuItem>
                <MenuItem value="image">Rasm</MenuItem>
              </TextField>
            </Grid>

            {form.mediaType === 'icon' && (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Ikonka"
                  name="icon"
                  value={form.icon}
                  onChange={handleBaseChange}
                >
                  {iconOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <AdvantageIcon icon={option.value} size={18} />
                        <span>{option.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {form.mediaType === 'image' && (
              <>
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />

                    <Button
                      variant="outlined"
                      startIcon={<UploadOutlined />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ height: 41 }}
                    >
                      Rasm yuklash
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Rasm URL"
                    name="image"
                    value={form.image}
                    onChange={handleBaseChange}
                    placeholder="https://..."
                    helperText="Rasm yuklang yoki URL kiriting."
                  />
                </Grid>
              </>
            )}

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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Link"
                name="link"
                value={form.link}
                onChange={handleBaseChange}
                placeholder="/partners yoki https://example.com"
                helperText="Ichki sahifa yoki tashqi URL kiriting."
              />
            </Grid>

            <Grid item xs={12} md={form.mediaType === 'image' ? 6 : 3}>
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

            {form.mediaType === 'image' && (
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    bgcolor: '#fafafa'
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {form.image ? (
                        <Box
                          component="img"
                          src={form.image}
                          alt="preview"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 1
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No img
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography fontWeight={800}>Rasm preview</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Shu rasm ko‘k blok ichidagi ikonka o‘rnida chiqadi.
                      </Typography>
                    </Box>

                    {form.image && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            image: '',
                            imageFile: null
                          }))
                        }
                      >
                        Rasmni olib tashlash
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            )}

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
                    Har bir til uchun afzallik matnini pastma-past kiriting.
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
                          handleLangChange(lang.key, e.target.value)
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
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Typography variant="h5" fontWeight={800}>
                    Live preview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Saytda pastdagi ko‘k blok taxminan shunday ko‘rinadi.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2, md: 4 },
                    bgcolor: '#eef3f8'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: 1500,
                      mx: 'auto',
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(5, 1fr)'
                      },
                      bgcolor: '#082d63',
                      color: '#fff',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      boxShadow: '0 18px 35px rgba(8, 45, 99, 0.22)'
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.2,
                        py: 2.3,
                        minHeight: 88,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        borderRight: {
                          xs: 0,
                          lg: '1px solid rgba(255,255,255,0.28)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.22)',
                          flexShrink: 0,
                          overflow: 'hidden'
                        }}
                      >
                        <AdvantageMedia item={form} size={24} />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 14,
                          lineHeight: 1.35,
                          fontWeight: 800
                        }}
                      >
                        {form.uz.title || 'Xalqaro standartlar asosidagi ta’lim'}
                      </Typography>

                      {form.link && (
                        <Typography
                          sx={{
                            position: 'absolute',
                            right: 12,
                            bottom: 8,
                            fontSize: 11,
                            opacity: 0.75
                          }}
                        >
                          Link mavjud
                        </Typography>
                      )}
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
      title="Afzalliklar bloki"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          Afzallik qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Bosh sahifa banner pastidagi ko‘k afzalliklar blokini boshqarish.
        Har bir elementga ikonka yoki rasm qo‘yish mumkin.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: '#fafafa'
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>
            Umumiy preview
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Faol elementlar tartib bo‘yicha ko‘rsatiladi.
          </Typography>
        </Stack>

        <Box
          sx={{
            maxWidth: 1500,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: `repeat(${Math.min(activeAdvantages.length || 1, 5)}, 1fr)`
            },
            bgcolor: '#082d63',
            color: '#fff',
            borderRadius: 1.5,
            overflow: 'hidden',
            boxShadow: '0 18px 35px rgba(8, 45, 99, 0.22)'
          }}
        >
          {activeAdvantages.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                px: 2.2,
                py: 2.3,
                minHeight: 88,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRight:
                  index !== activeAdvantages.length - 1
                    ? '1px solid rgba(255,255,255,0.28)'
                    : 0
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                <AdvantageMedia item={item} size={24} />
              </Box>

              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.35,
                  fontWeight: 800
                }}
              >
                {item.uz.title || '-'}
              </Typography>
            </Box>
          ))}

          {!activeAdvantages.length && (
            <Box sx={{ p: 3 }}>
              <Typography>Faol afzallik mavjud emas</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Ikonka/Rasm</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {advantagesPagination.paginatedItems.map((item, index) => (
              <TableRow hover key={item.id}>
                <TableCell>{advantagesPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#eef4ff',
                        color: '#082d63',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                      }}
                    >
                      <AdvantageMedia item={item} size={24} />
                    </Box>

                    <Chip
                      size="small"
                      label={item.mediaType === 'image' ? 'Rasm' : 'Ikonka'}
                      color={item.mediaType === 'image' ? 'primary' : 'default'}
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.uz.title || '-'}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      RU: {item.ru.title || '-'} | EN: {item.en.title || '-'}
                    </Typography>

                    {item.link && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="primary"
                        sx={{ mt: 0.5, wordBreak: 'break-all' }}
                      >
                        {item.link}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>{item.order}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={item.active ? 'success' : 'default'}
                    label={item.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openEdit(item)}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!advantages.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Afzallik mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedAdvantages.length}
        page={advantagesPagination.page}
        rowsPerPage={advantagesPagination.rowsPerPage}
        onPageChange={advantagesPagination.handlePageChange}
        onRowsPerPageChange={advantagesPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
