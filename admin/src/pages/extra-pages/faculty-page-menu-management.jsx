import React, { useEffect, useState } from 'react';

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
  Typography
} from '@mui/material';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  PlusOutlined,
  TeamOutlined
} from '@ant-design/icons';

// project import
import AttachedFilesEditor, { normalizeAttachedFiles } from 'components/AttachedFilesEditor';
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

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const pageTypeOptions = [
  { value: 'faculty', label: 'Fakultet sahifasi' },
  { value: 'department', label: 'Kafedra sahifasi' },
  { value: 'section', label: 'Bo‘lim sahifasi' }
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
  pageType: 'faculty',
  facultyId: '',
  departmentId: '',
  sectionId: '',
  sectionKey: '',
  order: '',
  active: true,
  files: [],
  ...createLangs()
});

const initialMenus = [];

const slugifyValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
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

const getLocalizedTitle = (item) =>
  item?.uz?.title || item?.title || item?.translations?.uz?.title || '';

const sortByOrder = (list = []) =>
  [...list].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const normalizeMenuItem = (item = {}) => ({
  id: item.id || null,
  pageType: item.pageType || 'faculty',
  facultyId: item.facultyId || '',
  departmentId: item.departmentId || '',
  sectionId: item.sectionId || '',
  sectionKey: String(item.sectionKey || '').trim(),
  order: item.order || item.sortOrder || '',
  active: item.active ?? true,
  files: normalizeAttachedFiles(item.files || []),
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

const prepareMenuPayload = (form, orderFallback) => ({
  ...form,
  title: form?.uz?.title?.trim() || '',
  sectionKey: String(form.sectionKey || '').trim(),
  order: form.order ? Number(form.order) : orderFallback,
  active: form.active ?? true,
  facultyId:
    form.pageType === 'faculty' || form.pageType === 'department' ? form.facultyId || '' : '',
  departmentId: form.pageType === 'department' ? form.departmentId || '' : '',
  sectionId: form.pageType === 'section' ? form.sectionId || '' : ''
});

const getPageTypeMeta = (pageType) => {
  if (pageType === 'faculty') {
    return {
      label: 'Fakultet',
      color: 'primary'
    };
  }

  if (pageType === 'department') {
    return {
      label: 'Kafedra',
      color: 'secondary'
    };
  }

  return {
    label: 'Bo‘lim',
    color: 'success'
  };
};

export default function FacultyPageMenuManagementPage() {
  const [menus, setMenus] = useState(initialMenus);
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [menuItems, facultyItems] = await Promise.all([
          fetchContentList('faculty-page-menus'),
          fetchContentList('faculties')
        ]);

        if (cancelled) {
          return;
        }

        const normalizedFaculties = normalizeFacultyList(
          facultyItems.filter((item) => item.entityType !== 'section')
        );
        const normalizedSections = facultyItems.filter(
          (item) => item.entityType === 'section'
        );

        setMenus(menuItems.map(normalizeMenuItem));
        setFaculties(normalizedFaculties);
        setSections(normalizedSections);
      } catch (error) {
        console.error('Failed to load faculty page menus:', error);
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

  const getSectionById = (sectionId) =>
    sections.find((section) => String(section.id) === String(sectionId));

  const getTargetTitle = (menu) => {
    if (menu.pageType === 'faculty') {
      const faculty = getFacultyById(menu.facultyId);

      return {
        title: getLocalizedTitle(faculty) || 'Fakultet tanlanmagan',
        subtitle: 'Fakultet sahifasi'
      };
    }

    if (menu.pageType === 'department') {
      const faculty = getFacultyById(menu.facultyId);
      const department = getDepartmentById(menu.facultyId, menu.departmentId);

      return {
        title: getLocalizedTitle(department) || 'Kafedra tanlanmagan',
        subtitle: getLocalizedTitle(faculty) || 'Fakultet tanlanmagan'
      };
    }

    const section = getSectionById(menu.sectionId);

    return {
      title: getLocalizedTitle(section) || 'Bo‘lim tanlanmagan',
      subtitle: 'Bo‘lim sahifasi'
    };
  };

  const selectedFaculty = getFacultyById(form.facultyId);
  const departmentOptions = selectedFaculty?.departments || [];
  const sortedMenus = sortByOrder(menus);
  const menusPagination = useTablePagination(sortedMenus);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (menu) => {
    setForm(normalizeMenuItem(menu));
    setMode('form');
  };

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => {
      if (name === 'pageType') {
        return {
          ...prev,
          pageType: value,
          facultyId: '',
          departmentId: '',
          sectionId: ''
        };
      }

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

  const handleFilesChange = (nextItems) => {
    setForm((prev) => ({
      ...prev,
      files: nextItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedForm = prepareMenuPayload(form, menus.length + 1);

    try {
      if (form.id) {
        const updatedMenu = await updateContentItem(
          'faculty-page-menus',
          form.id,
          preparedForm
        );
        setMenus((prev) =>
          prev.map((item) =>
            String(item.id) === String(form.id) ? normalizeMenuItem(updatedMenu) : item
          )
        );
      } else {
        const createdMenu = await createContentItem('faculty-page-menus', preparedForm);
        setMenus((prev) => [normalizeMenuItem(createdMenu), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save faculty page menu:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('faculty-page-menus', id);
      setMenus((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      console.error('Failed to delete faculty page menu:', error);
    }
  };

  const handleActiveChange = async (id) => {
    const selectedMenu = menus.find((item) => String(item.id) === String(id));

    if (!selectedMenu) {
      return;
    }

    try {
      const updatedMenu = await updateContentItem(
        'faculty-page-menus',
        id,
        prepareMenuPayload(
          {
            ...selectedMenu,
            active: !selectedMenu.active
          },
          selectedMenu.order || menus.length + 1
        )
      );

      setMenus((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? normalizeMenuItem(updatedMenu) : item
        )
      );
    } catch (error) {
      console.error('Failed to update faculty page menu state:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'O‘ng menu tahrirlash' : 'Yangi o‘ng menu qo‘shish'}
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
              <AttachedFilesEditor
                items={form.files}
                onChange={handleFilesChange}
                description="Menu contentidan keyin ko‘rinadigan yuklab olish fayllarini shu yerga qo‘shing."
              />
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
                    Qaysi sahifaga tegishli?
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Menu fakultet, kafedra yoki bo‘lim sahifasining o‘ng tomonida chiqadi.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    md={
                      form.pageType === 'faculty'
                        ? 6
                        : form.pageType === 'department'
                          ? 4
                          : 6
                    }
                  >
                    <TextField
                      select
                      fullWidth
                      label="Sahifa turi"
                      name="pageType"
                      value={form.pageType}
                      onChange={handleBaseChange}
                      required
                    >
                      {pageTypeOptions.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {(form.pageType === 'faculty' || form.pageType === 'department') && (
                    <Grid item xs={12} md={form.pageType === 'department' ? 4 : 6}>
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
                  )}

                  {form.pageType === 'department' && (
                    <Grid item xs={12} md={4}>
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
                  )}

                  {form.pageType === 'section' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Bo‘lim"
                        name="sectionId"
                        value={form.sectionId}
                        onChange={handleBaseChange}
                        required
                      >
                        {sections.map((section) => (
                          <MenuItem key={section.id} value={section.id}>
                            {getLocalizedTitle(section)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}
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
                    Menu sozlamalari
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    O‘ng menu linki, tartibi va faol holatini kiriting.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Menu key"
                      name="sectionKey"
                      value={form.sectionKey}
                      onChange={handleBaseChange}
                      placeholder="about, departments, faculty"
                      required
                      helperText="Masalan: about, departments, faculty, contact"
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
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          Holati
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Switch
                            checked={form.active}
                            onChange={handleBaseChange}
                            name="active"
                          />

                          <Typography variant="body2">
                            {form.active ? 'Faol' : 'Nofaol'}
                          </Typography>
                        </Stack>
                      </Stack>
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
                    Menu nomlari
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    O‘ng tomonda chiqadigan menu nomini 4 tilda kiriting.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {langList.map((lang) => (
                    <Grid item xs={12} md={6} key={lang.key}>
                      <TextField
                        fullWidth
                        label={`${lang.label} menu nomi`}
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
                    Menu contentlari
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    O‘ng menudan bosilganda pastda chiqadigan contentni 4 tilda kiriting.
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
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Box
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={900}>
                          {lang.label}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 2, md: 3 },
                          '& .tox-tinymce': {
                            borderRadius: '6px !important'
                          }
                        }}
                      >
                        <TinyMceField
                          label={`${lang.label} content`}
                          value={form[lang.key].content}
                          onChange={(value) => handleLangChange(lang.key, 'content', value)}
                          height={320}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
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
      title="Fakultet / kafedra / bo‘lim sahifasi o‘ng menulari"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          Menu qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Fakultet, kafedra yoki bo‘lim sahifasi ochilganda o‘ng tomonda chiqadigan menyularni boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Menu nomi</TableCell>
              <TableCell>Sahifa turi</TableCell>
              <TableCell>Tegishli sahifa</TableCell>
              <TableCell>Menu key</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell align="center">Faol</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {menusPagination.paginatedItems.map((menu, index) => {
              const targetInfo = getTargetTitle(menu);
              const pageTypeMeta = getPageTypeMeta(menu.pageType);

              return (
                <TableRow hover key={menu.id}>
                  <TableCell>{menusPagination.getRowNumber(index)}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '6px',
                          bgcolor: '#eef4ff',
                          color: '#082e69',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {menu.pageType === 'section' ? <TeamOutlined /> : <MenuOutlined />}
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" fontWeight={900}>
                          {menu.uz.title || '-'}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {menu.en.title || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color={pageTypeMeta.color}
                      label={pageTypeMeta.label}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {targetInfo.title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {targetInfo.subtitle}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip size="small" variant="outlined" label={menu.sectionKey || '-'} />
                  </TableCell>

                  <TableCell>{menu.order}</TableCell>

                  <TableCell align="center">
                    <Switch
                      checked={menu.active}
                      onChange={() => handleActiveChange(menu.id)}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openEdit(menu)}>
                      <EditOutlined />
                    </IconButton>

                    <IconButton color="error" onClick={() => handleDelete(menu.id)}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {!menus.length && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Menu mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedMenus.length}
        page={menusPagination.page}
        rowsPerPage={menusPagination.rowsPerPage}
        onPageChange={menusPagination.handlePageChange}
        onRowsPerPageChange={menusPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
