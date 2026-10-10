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
  TeamOutlined,
  TrophyOutlined,
  UploadOutlined,
  UserOutlined
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
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  BankOutlined,
  GlobalOutlined,
  TrophyOutlined
};

const iconOptions = [
  { value: 'UserOutlined', label: 'Talaba / User' },
  { value: 'TeamOutlined', label: 'Xodimlar / Team' },
  { value: 'ReadOutlined', label: 'Ta’lim / Education' },
  { value: 'BankOutlined', label: 'Universitet / Building' },
  { value: 'GlobalOutlined', label: 'Xalqaro / Global' },
  { value: 'TrophyOutlined', label: 'Yutuq / Trophy' }
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
  mediaType: 'icon',
  icon: 'UserOutlined',
  image: '',
  imageFile: null,
  title: '',
  count: '',
  order: '',
  active: true,
  ...createLangs()
});

const initialStatistics = [];

const sanitizeCountValue = (value) =>
  String(value ?? '')
    .replace(/[^\d]/g, '')
    .trim();

const formatCountLabel = (value) => {
  const normalized = sanitizeCountValue(value);

  if (!normalized) {
    return '0+';
  }

  return `${Number(normalized).toLocaleString('uz-UZ')}+`;
};

const normalizeStatisticItem = (item = {}) => {
  const normalizedCount = sanitizeCountValue(item.count);
  const hasImage = Boolean(item.image);

  return {
    ...getEmptyForm(),
    ...item,
    mediaType: item.mediaType || (hasImage ? 'image' : 'icon'),
    icon: item.icon || 'UserOutlined',
    image: item.image || '',
    count: normalizedCount,
    order: item.order ?? '',
    active: item.active ?? true,
    title: item.title || '',
    uz: { ...emptyLang, title: item.uz?.title || item.title || '' },
    ru: { ...emptyLang, ...(item.ru || {}) },
    en: { ...emptyLang, ...(item.en || {}) }
  };
};

const StatisticIcon = ({ icon, size = 24 }) => {
  const IconComponent = iconMap[icon] || UserOutlined;
  return <IconComponent style={{ fontSize: size }} />;
};

const StatisticMedia = ({ item, size = 34 }) => {
  if ((item.mediaType === 'image' || item.image) && item.image) {
    return (
      <Box
        component="img"
        src={item.image}
        alt={item.uz?.title || item.title || 'statistic'}
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block'
        }}
      />
    );
  }

  return <StatisticIcon icon={item.icon} size={size} />;
};

export default function StatisticsManagementPage() {
  const fileInputRef = useRef(null);

  const [statistics, setStatistics] = useState(initialStatistics);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        const items = await fetchContentList('statistics');

        if (!cancelled) {
          setStatistics(items.map(normalizeStatisticItem));
        }
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedStatistics = [...statistics].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const statisticsPagination = useTablePagination(sortedStatistics);

  const activeStatistics = sortedStatistics.filter((item) => item.active);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (item) => {
    setForm({
      ...normalizeStatisticItem(item),
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

  const handleImageDrop = async (e) => {
    e.preventDefault();
    await setImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('statistics', id);
      setStatistics((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete statistic:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedForm = {
      ...form,
      imageFile: null,
      title: form.uz.title.trim(),
      uz: form.uz,
      ru: form.ru,
      en: form.en,
      count: sanitizeCountValue(form.count),
      image: form.image.trim(),
      order: form.order ? Number(form.order) : statistics.length + 1
    };

    if (preparedForm.mediaType === 'icon') {
      preparedForm.image = '';
      preparedForm.imageFile = null;
    }

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('statistics', form.id, preparedForm);
        setStatistics((prev) =>
          prev.map((item) =>
            item.id === form.id ? normalizeStatisticItem(updatedItem) : item
          )
        );
      } else {
        const createdItem = await createContentItem('statistics', preparedForm);
        setStatistics((prev) => [normalizeStatisticItem(createdItem), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save statistic:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Statistika tahrirlash' : 'Yangi statistika qo‘shish'}
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
            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    bgcolor: '#fafafa'
                  }}
                >
                  <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                    <Typography variant="h5" fontWeight={800}>
                      Asosiy ma’lumotlar
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Har bir til uchun title, soni, tartib va statusni kiriting.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    {langList.map((lang) => (
                      <Grid item xs={12} md={6} key={lang.key}>
                        <TextField
                          fullWidth
                          label={`${lang.label} title`}
                          value={form[lang.key].title}
                          onChange={(e) => handleLangChange(lang.key, e.target.value)}
                          placeholder="Talabalar"
                          required={lang.key === 'uz'}
                        />
                      </Grid>
                    ))}

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Soni"
                        name="count"
                        value={form.count}
                        onChange={handleBaseChange}
                        placeholder="12000"
                        inputProps={{ inputMode: 'numeric' }}
                        helperText="Faqat son kiriting. Masalan: 12000"
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
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

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    bgcolor: '#fafafa'
                  }}
                >
                  <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                    <Typography variant="h5" fontWeight={800}>
                      Icon yoki rasm
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Statistika uchun ikonka tanlang yoki rasm yuklang.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2} alignItems="stretch">
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
                      <Grid item xs={12} md={5}>
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
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <StatisticIcon icon={option.value} size={18} />
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
                          <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                          />

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<UploadOutlined />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ height: 41 }}
                          >
                            Rasm yuklash
                          </Button>
                        </Grid>

                        <Grid item xs={12} md={5}>
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

                    <Grid item xs={12} md={4}>
                      <Box
                        onDrop={handleImageDrop}
                        onDragOver={(e) => e.preventDefault()}
                        sx={{
                          minHeight: 96,
                          borderRadius: 2.5,
                          border: '1px dashed',
                          borderColor:
                            form.mediaType === 'image' && form.image
                              ? 'primary.main'
                              : 'divider',
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            width: 62,
                            height: 62,
                            borderRadius: 2.5,
                            bgcolor: '#eef4ff',
                            color: '#082e69',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                        >
                          <StatisticMedia item={form} size={34} />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {form.mediaType === 'image' && form.image && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Rasm tanlandi. Almashtirish uchun qayta rasm yuklang.
                      </Typography>

                      <Button
                        variant="outlined"
                        color="error"
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
                    </Stack>
                  )}
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Typography variant="h5" fontWeight={800}>
                    Live preview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Saytda chiqadigan karta ko‘rinishi.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2, md: 3 },
                    height: 'calc(100% - 90px)',
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      bgcolor: '#fff',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.1)',
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 78,
                        height: 78,
                        borderRadius: 3,
                        bgcolor: '#eef4ff',
                        color: '#082e69',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <StatisticMedia item={form} size={42} />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 38,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: '#082e69',
                        mb: 1
                      }}
                    >
                      {formatCountLabel(form.count || '12000')}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: 'text.secondary'
                      }}
                    >
                      {form.uz.title || 'Talabalar'}
                    </Typography>
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
      title="Talabalar va xodimlar hajmi"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          Statistika qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Talabalar, xodimlar va boshqa sonli ko‘rsatkichlarni icon yoki rasm bilan boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: '#fafafa'
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800}>
            Umumiy preview
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Faol elementlar tartib bo‘yicha ko‘rsatiladi.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {activeStatistics.map((item) => (
            <Box
              key={item.id}
              sx={{
                borderRadius: 4,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.07)',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2.2
              }}
            >
              <Box
                sx={{
                  width: 66,
                  height: 66,
                  borderRadius: 3,
                  bgcolor: '#eef4ff',
                  color: '#082e69',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <StatisticMedia item={item} size={36} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: '#082e69'
                  }}
                >
                  {formatCountLabel(item.count)}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'text.secondary',
                    mt: 0.9
                  }}
                >
                  {item.title || '-'}
                </Typography>
              </Box>
            </Box>
          ))}

          {!activeStatistics.length && (
            <Typography color="text.secondary">
              Faol statistika mavjud emas
            </Typography>
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Icon / Img</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Soni</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {statisticsPagination.paginatedItems.map((item, index) => (
              <TableRow hover key={item.id}>
                <TableCell>{statisticsPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#eef4ff',
                        color: '#082e69',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                      }}
                    >
                      <StatisticMedia item={item} size={26} />
                    </Box>

                    <Chip
                      size="small"
                      label={item.mediaType === 'image' ? 'Rasm' : 'Ikonka'}
                      color={item.mediaType === 'image' ? 'primary' : 'default'}
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {item.uz?.title || item.title || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography fontWeight={900}>{formatCountLabel(item.count)}</Typography>
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

            {!statistics.length && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Statistika mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedStatistics.length}
        page={statisticsPagination.page}
        rowsPerPage={statisticsPagination.rowsPerPage}
        onPageChange={statisticsPagination.handlePageChange}
        onRowsPerPageChange={statisticsPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
