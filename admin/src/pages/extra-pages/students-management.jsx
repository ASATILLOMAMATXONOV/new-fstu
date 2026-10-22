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
import { fileToDataUrl } from 'utils/file';

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
  imageChanged: false,
  fullName: '',
  direction: '',
  order: '',
  active: true,
  ...createLangs()
});

const initialStudents = [];

const normalizeStudentItem = (item = {}) => ({
  ...getEmptyForm(),
  ...item,
  image: item.image || '',
  fullName: item.fullName || '',
  direction: item.direction || '',
  order: item.order ?? '',
  active: item.active ?? true,
  uz: { ...emptyLang, title: item.uz?.title || item.title || '', content: item.uz?.content || '' },
  ru: { ...emptyLang, ...(item.ru || {}) },
  en: { ...emptyLang, ...(item.en || {}) }
});

export default function StudentsManagementPage() {
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState(initialStudents);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      try {
        const items = await fetchContentList('students');

        if (!cancelled) {
          setStudents(items.map(normalizeStudentItem));
        }
      } catch (error) {
        console.error('Failed to load students:', error);
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedStudents = [...students].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const studentsPagination = useTablePagination(sortedStudents);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (student) => {
    setForm({
      ...normalizeStudentItem(student),
      imageFile: null,
      imageChanged: false
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

    const imageUrl = await fileToDataUrl(file);

    setForm((prev) => ({
      ...prev,
      image: imageUrl,
      imageFile: file,
      imageChanged: true
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
      await deleteContentItem('students', id);
      setStudents((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedForm = {
      title: form.uz.title.trim(),
      fullName: form.fullName.trim(),
      direction: form.direction.trim(),
      order: form.order ? Number(form.order) : students.length + 1,
      active: form.active,
      uz: form.uz,
      ru: form.ru,
      en: form.en,
    };

    if (!form.id || form.imageChanged) {
      preparedForm.image = form.image || '';
    }

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('students', form.id, preparedForm);
        setStudents((prev) =>
          prev.map((item) => (item.id === form.id ? normalizeStudentItem(updatedItem) : item))
        );
      } else {
        const createdItem = await createContentItem('students', preparedForm);
        setStudents((prev) => [normalizeStudentItem(createdItem), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Talaba ma’lumotini tahrirlash' : 'Yangi talaba qo‘shish'}
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
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Talaba rasmi
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Rasm yuklash maydoniga bosing yoki rasmni shu joyga tashlang.
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
                    borderRadius: '6px',
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
                        alt="Talaba rasmi"
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
                        PNG, JPG, JPEG yoki WEBP formatda rasm tanlang
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
                          imageFile: null,
                          imageChanged: true
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
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Ism familya"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleBaseChange}
                      placeholder="Madina Karimova"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Yo‘nalish / fakultet"
                      name="direction"
                      value={form.direction}
                      onChange={handleBaseChange}
                      placeholder="IT yo‘nalishi talabasi"
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
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

                  <Grid item xs={12} md={2}>
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
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Titlelar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun talaba fikri sarlavhasini pastma-past kiriting.
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
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Contentlar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun talaba fikri yoki matnini kiriting.
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  {langList.map((lang) => (
                    <Paper
                      key={lang.key}
                      variant="outlined"
                      sx={{
                        borderRadius: '6px',
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
                          Shu til uchun talaba matni
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          width: '100%',

                          '& .tox-tinymce': {
                            minHeight: '420px !important',
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
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Typography variant="h5" fontWeight={800}>
                    Live preview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Talaba kartasi saytda taxminan shunday ko‘rinadi.
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      maxWidth: 440,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        height: 260,
                        bgcolor: '#eef3f8',
                        overflow: 'hidden'
                      }}
                    >
                      {form.image ? (
                        <Box
                          component="img"
                          src={form.image}
                          alt={form.fullName || 'student'}
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
                          fontSize: 22,
                          fontWeight: 900,
                          lineHeight: 1.25,
                          color: '#082e69'
                        }}
                      >
                        {form.fullName || 'Talaba ism familyasi'}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 14,
                          color: 'text.secondary',
                          mt: 0.5,
                          mb: 2
                        }}
                      >
                        {form.direction || 'Yo‘nalish / fakultet'}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 17,
                          fontWeight: 800,
                          lineHeight: 1.35,
                          color: '#1d3557'
                        }}
                      >
                        {form.uz.title || 'Talaba fikri title'}
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
      title="Bizning talabalarimiz"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          Talaba qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Talaba rasmi, ism-familyasi, yo‘nalishi, title va contentlarini boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Rasm</TableCell>
              <TableCell>Talaba</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {studentsPagination.paginatedItems.map((student, index) => (
              <TableRow hover key={student.id}>
                <TableCell>{studentsPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Box
                    sx={{
                      width: 78,
                      height: 78,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    {student.image ? (
                      <Box
                        component="img"
                        src={student.image}
                        alt={student.fullName}
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
                          No img
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {student.fullName || '-'}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {student.direction || '-'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {student.uz.title || '-'}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      RU: {student.ru.title || '-'} | EN: {student.en.title || '-'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{student.order}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={student.active ? 'success' : 'default'}
                    label={student.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openEdit(student)}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(student.id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!students.length && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Talaba mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedStudents.length}
        page={studentsPagination.page}
        rowsPerPage={studentsPagination.rowsPerPage}
        onPageChange={studentsPagination.handlePageChange}
        onRowsPerPageChange={studentsPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
