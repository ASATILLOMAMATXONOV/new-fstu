import React, { useEffect, useRef, useState } from 'react';

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
  ApartmentOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  CopyOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons';

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

const attachTypeOptions = [
  { value: 'faculty', label: 'Fakultet' },
  { value: 'department', label: 'Kafedra' },
  { value: 'section', label: 'Bo‘lim' }
];

const roleOptions = [
  { value: 'dean', label: 'Dekan', color: 'warning', icon: <CrownOutlined /> },
  { value: 'vice_dean', label: 'Dekan o‘rinbosari', color: 'success', icon: <BankOutlined /> },
  { value: 'department_head', label: 'Kafedra mudiri', color: 'secondary', icon: <ApartmentOutlined /> },
  { value: 'section_head', label: 'Bo‘lim boshlig‘i', color: 'info', icon: <TeamOutlined /> },
  { value: 'employee', label: 'Hodim', color: 'default', icon: <UserOutlined /> }
];

const emptyEmployeeLang = {
  position: ''
};

const assignmentLanguageKeys = ['uz', 'ru', 'en'];

const PANEL_COUNT = 1;

const createEmployeeLangs = () => ({
  uz: { ...emptyEmployeeLang },
  ru: { ...emptyEmployeeLang },
  en: { ...emptyEmployeeLang }
});

const createAssignmentId = (index = 0) =>
  `assignment-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 8)}`;

const createAssignmentLangs = (data = {}, fallback = {}) => ({
  uz: { position: data?.uz?.position ?? fallback?.uz?.position ?? '' },
  ru: { position: data?.ru?.position ?? fallback?.ru?.position ?? '' },
  en: { position: data?.en?.position ?? fallback?.en?.position ?? '' }
});

const hasLegacyAssignmentData = (item = {}) =>
  Boolean(
    item.attachType ||
      item.facultyId ||
      item.departmentId ||
      item.sectionId ||
      item.roleType ||
      assignmentLanguageKeys.some((lang) => String(item?.[lang]?.position || '').trim())
  );

const createAssignment = (data = {}, fallback = {}, index = 0) => ({
  id: data.id || createAssignmentId(index),
  attachType: data.attachType || fallback.attachType || 'faculty',
  facultyId: data.facultyId || fallback.facultyId || '',
  departmentId: data.departmentId || fallback.departmentId || '',
  sectionId: data.sectionId || fallback.sectionId || '',
  roleType: data.roleType || fallback.roleType || 'employee',
  ...createAssignmentLangs(data, fallback)
});

const normalizeAssignments = (item = {}) => {
  const sourceAssignments =
    Array.isArray(item.assignments) && item.assignments.length
      ? item.assignments
      : hasLegacyAssignmentData(item)
        ? [item]
        : [];

  if (!sourceAssignments.length) {
    return [createAssignment({}, {}, 0)];
  }

  return sourceAssignments.map((assignment, index) => createAssignment(assignment, item, index));
};

const getPrimaryAssignment = (assignments = []) =>
  assignments[0] || createAssignment({}, {}, 0);

const createPanelLangs = (data = {}) => ({
  uz: { title: data.uz?.title || '', content: data.uz?.content || '' },
  ru: { title: data.ru?.title || '', content: data.ru?.content || '' },
  en: { title: data.en?.title || '', content: data.en?.content || '' }
});

const createPanel = (order, data = {}) => ({
  id: data.id || `panel-${order}`,
  order,
  ...createPanelLangs(data)
});

const createFixedPanels = (panels = []) =>
  Array.from({ length: PANEL_COUNT }, (_, index) => {
    const order = index + 1;
    const foundPanel = panels.find(
      (panel) => Number(panel.order) === order || panel.id === `panel-${order}`
    );

    return createPanel(order, foundPanel || {});
  });

const slugify = (text = '') =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createEmployeeSlug = (fullName, id) => slugify(fullName) || `employee-${id}`;
const createEmployeeLink = (slug) => `/employees/${slug}`;

const createDepartmentId = (facultyId, department, index) => {
  if (department?.id) {
    return department.id;
  }

  const orderPart = department?.order || index + 1;
  const titlePart =
    slugify(department?.uz?.title || department?.title || department?.en?.title) ||
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

const getEmptyForm = () => ({
  id: null,
  image: '',
  imageFile: null,
  fullName: '',
  link: '',
  attachType: 'faculty',
  facultyId: '',
  departmentId: '',
  sectionId: '',
  roleType: 'employee',
  telegram: '',
  instagram: '',
  phone: '',
  order: '',
  active: true,
  assignments: [createAssignment({}, {}, 0)],
  panels: createFixedPanels(),
  ...createEmployeeLangs()
});

const normalizeEmployeeItem = (item = {}) => {
  const assignments = normalizeAssignments(item);
  const primaryAssignment = getPrimaryAssignment(assignments);

  return {
    ...getEmptyForm(),
    ...item,
    image: item.image || '',
    imageFile: null,
    fullName: item.fullName || item.title || '',
    link:
      item.link ||
      createEmployeeLink(item.slug || createEmployeeSlug(item.fullName || item.title, item.id)),
    attachType: primaryAssignment.attachType,
    facultyId: primaryAssignment.facultyId,
    departmentId: primaryAssignment.departmentId,
    sectionId: primaryAssignment.sectionId,
    roleType: primaryAssignment.roleType,
    telegram: item.telegram || '',
    instagram: item.instagram || '',
    phone: item.phone || '',
    order: item.order ?? item.sortOrder ?? '',
    active: item.active ?? true,
    assignments,
    panels: createFixedPanels(item.panels || []),
    uz: { ...emptyEmployeeLang, ...(item.uz || {}), position: primaryAssignment.uz.position || item?.uz?.position || '' },
    ru: { ...emptyEmployeeLang, ...(item.ru || {}), position: primaryAssignment.ru.position || item?.ru?.position || '' },
    en: { ...emptyEmployeeLang, ...(item.en || {}), position: primaryAssignment.en.position || item?.en?.position || '' }
  };
};

const normalizeTelegram = (value) => {
  const text = String(value || '').trim();

  if (!text) return '';
  if (text.startsWith('https://t.me/') || text.startsWith('http://t.me/')) return text;
  if (text.startsWith('@')) return `https://t.me/${text.replace('@', '')}`;

  return text;
};

const normalizeInstagram = (value) => {
  const text = String(value || '').trim();

  if (!text) return '';
  if (text.startsWith('https://instagram.com/') || text.startsWith('http://instagram.com/')) return text;
  if (text.startsWith('@')) return `https://instagram.com/${text.replace('@', '')}`;

  return text;
};

const prepareEmployeePayload = (form, orderFallback) => {
  const employeeId = form.id || Date.now();
  const fullName = form.fullName.trim();
  const slug = createEmployeeSlug(fullName, employeeId);
  const assignments = normalizeAssignments(form).map((assignment, index) =>
    createAssignment(assignment, {}, index)
  );
  const primaryAssignment = getPrimaryAssignment(assignments);

  return {
    ...form,
    id: employeeId,
    imageFile: null,
    title: fullName,
    slug,
    link: createEmployeeLink(slug),
    fullName,
    attachType: primaryAssignment.attachType,
    facultyId:
      primaryAssignment.attachType === 'faculty' || primaryAssignment.attachType === 'department'
        ? primaryAssignment.facultyId || ''
        : '',
    departmentId:
      primaryAssignment.attachType === 'department' ? primaryAssignment.departmentId || '' : '',
    sectionId: primaryAssignment.attachType === 'section' ? primaryAssignment.sectionId || '' : '',
    roleType: primaryAssignment.roleType || 'employee',
    telegram: normalizeTelegram(form.telegram),
    instagram: normalizeInstagram(form.instagram),
    phone: String(form.phone || '').trim(),
    order: form.order ? Number(form.order) : orderFallback,
    active: form.active ?? true,
    assignments,
    panels: createFixedPanels(form.panels),
    uz: { ...(form.uz || {}), position: primaryAssignment.uz.position || '' },
    ru: { ...(form.ru || {}), position: primaryAssignment.ru.position || '' },
    en: { ...(form.en || {}), position: primaryAssignment.en.position || '' }
  };
};

const getRoleMeta = (roleType) => roleOptions.find((item) => item.value === roleType) || roleOptions[4];

async function copyToClipboard(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand('copy');
    textarea.remove();

    return copied;
  } catch (error) {
    return false;
  }
}

export default function EmployeesPortfolioManagementPage() {
  const fileInputRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [employeeItems, facultyItems] = await Promise.all([
          fetchContentList('employees-portfolios'),
          fetchContentList('faculties')
        ]);

        if (cancelled) {
          return;
        }

        setEmployees(employeeItems.map(normalizeEmployeeItem));
        setFaculties(normalizeFacultyList(facultyItems.filter((item) => item.entityType !== 'section')));
        setSections(facultyItems.filter((item) => item.entityType === 'section'));
      } catch (error) {
        console.error('Failed to load employee portfolios:', error);
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

    return faculty?.departments?.find((department) => String(department.id) === String(departmentId));
  };

  const getSectionById = (sectionId) =>
    sections.find((section) => String(section.id) === String(sectionId));

  const getAttachTitle = (assignment = {}) => {
    if (assignment.attachType === 'faculty') {
      const faculty = getFacultyById(assignment.facultyId);

      return {
        title: getLocalizedTitle(faculty) || 'Fakultet tanlanmagan',
        subtitle: 'Fakultet'
      };
    }

    if (assignment.attachType === 'department') {
      const faculty = getFacultyById(assignment.facultyId);
      const department = getDepartmentById(assignment.facultyId, assignment.departmentId);

      return {
        title: getLocalizedTitle(department) || 'Kafedra tanlanmagan',
        subtitle: getLocalizedTitle(faculty) || 'Fakultet tanlanmagan'
      };
    }

    const section = getSectionById(assignment.sectionId);

    return {
      title: getLocalizedTitle(section) || 'Bo‘lim tanlanmagan',
      subtitle: 'Bo‘lim'
    };
  };

  const getEmployeeAssignmentsSummary = (employee = {}) =>
    normalizeAssignments(employee).map((assignment) => ({
      ...getAttachTitle(assignment),
      assignment
    }));
  const sortedEmployees = sortByOrder(employees);
  const employeesPagination = useTablePagination(sortedEmployees);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (employee) => {
    setForm({
      ...normalizeEmployeeItem(employee),
      imageFile: null
    });
    setMode('form');
  };

  const handleBaseChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAssignmentChange = (assignmentId, name, value) => {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.map((assignment) => {
        if (assignment.id !== assignmentId) {
          return assignment;
        }

        if (name === 'attachType') {
          return {
            ...assignment,
            attachType: value,
            facultyId: '',
            departmentId: '',
            sectionId: ''
          };
        }

        if (name === 'facultyId') {
          return {
            ...assignment,
            facultyId: value,
            departmentId: ''
          };
        }

        return {
          ...assignment,
          [name]: value
        };
      })
    }));
  };

  const handleAssignmentPositionChange = (assignmentId, lang, value) => {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              [lang]: {
                ...assignment[lang],
                position: value
              }
            }
          : assignment
      )
    }));
  };

  const handleAddAssignment = () => {
    setForm((prev) => ({
      ...prev,
      assignments: [...prev.assignments, createAssignment({}, {}, prev.assignments.length)]
    }));
  };

  const handleRemoveAssignment = (assignmentId) => {
    setForm((prev) => {
      const nextAssignments = prev.assignments.filter((assignment) => assignment.id !== assignmentId);

      return {
        ...prev,
        assignments: nextAssignments.length ? nextAssignments : [createAssignment({}, {}, 0)]
      };
    });
  };

  const handlePanelLangChange = (panelId, lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      panels: prev.panels.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              [lang]: {
                ...panel[lang],
                [field]: value
              }
            }
          : panel
      )
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

  const handleImageUpload = async (event) => {
    await setImageFile(event.target.files?.[0]);
  };

  const handleImageDrop = async (event) => {
    event.preventDefault();
    await setImageFile(event.dataTransfer.files?.[0]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('employees-portfolios', id);
      setEmployees((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      console.error('Failed to delete employee portfolio:', error);
    }
  };

  const handleActiveChange = async (id) => {
    const selectedEmployee = employees.find((item) => String(item.id) === String(id));

    if (!selectedEmployee) {
      return;
    }

    try {
      const updatedItem = await updateContentItem(
        'employees-portfolios',
        id,
        prepareEmployeePayload(
          {
            ...selectedEmployee,
            active: !selectedEmployee.active
          },
          selectedEmployee.order || employees.length + 1
        )
      );

      setEmployees((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? normalizeEmployeeItem(updatedItem) : item))
      );
    } catch (error) {
      console.error('Failed to update employee portfolio state:', error);
    }
  };

  const handleCopyLink = async (employee) => {
    const copied = await copyToClipboard(employee.link);

    if (copied) {
      setCopiedId(employee.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1200);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const preparedForm = prepareEmployeePayload(form, employees.length + 1);

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('employees-portfolios', form.id, preparedForm);
        setEmployees((prev) =>
          prev.map((item) => (String(item.id) === String(form.id) ? normalizeEmployeeItem(updatedItem) : item))
        );
      } else {
        const createdItem = await createContentItem('employees-portfolios', preparedForm);
        setEmployees((prev) => [normalizeEmployeeItem(createdItem), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save employee portfolio:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Hodim portfolio tahrirlash' : 'Yangi hodim portfolio qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined />} variant="outlined" onClick={() => setMode('table')}>
            Orqaga
          </Button>
        }
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={4}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Hodim rasmi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rasm yuklash maydoniga bosing yoki rasmni shu joyga tashlang.
                  </Typography>
                </Stack>

                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} />

                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleImageDrop}
                  onDragOver={(event) => event.preventDefault()}
                  sx={{
                    minHeight: 360,
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
                    <Box component="img" src={form.image} alt="Hodim rasmi" sx={{ width: '100%', height: 360, objectFit: 'cover' }} />
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
                    </Stack>
                  )}
                </Box>

                {form.image && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={(event) => {
                      event.stopPropagation();
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
              </Paper>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Ism familya"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleBaseChange}
                        placeholder="Akmal Karimov"
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
                  </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 2.5 }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="h5" fontWeight={800}>
                        Biriktirishlar
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hodim ishlaydigan joylar, roli va shu joydagi lavozimini alohida kiriting.
                      </Typography>
                    </Stack>

                    <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleAddAssignment}>
                      Biriktirish qo‘shish
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {form.assignments.map((assignment, index) => {
                      const selectedAssignmentFaculty = getFacultyById(assignment.facultyId);
                      const assignmentDepartmentOptions = selectedAssignmentFaculty?.departments || [];

                      return (
                        <Paper
                          key={assignment.id}
                          variant="outlined"
                          sx={{ borderRadius: 3, p: { xs: 2, md: 2.5 }, bgcolor: 'background.paper' }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            sx={{ mb: 2 }}
                          >
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle1" fontWeight={800}>
                                Biriktirish #{index + 1}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Joy, rol va lavozim shu blokka tegishli bo‘ladi.
                              </Typography>
                            </Stack>

                            {form.assignments.length > 1 ? (
                              <Button
                                color="error"
                                variant="text"
                                startIcon={<DeleteOutlined />}
                                onClick={() => handleRemoveAssignment(assignment.id)}
                              >
                                Olib tashlash
                              </Button>
                            ) : null}
                          </Stack>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                select
                                fullWidth
                                label="Biriktirish turi"
                                value={assignment.attachType}
                                onChange={(event) =>
                                  handleAssignmentChange(assignment.id, 'attachType', event.target.value)
                                }
                                required
                              >
                                {attachTypeOptions.map((item) => (
                                  <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                select
                                fullWidth
                                label="Lavozim belgisi"
                                value={assignment.roleType}
                                onChange={(event) =>
                                  handleAssignmentChange(assignment.id, 'roleType', event.target.value)
                                }
                                required
                              >
                                {roleOptions.map((item) => (
                                  <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            {(assignment.attachType === 'faculty' || assignment.attachType === 'department') && (
                              <Grid item xs={12} md={assignment.attachType === 'department' ? 6 : 12}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Fakultet"
                                  value={assignment.facultyId}
                                  onChange={(event) =>
                                    handleAssignmentChange(assignment.id, 'facultyId', event.target.value)
                                  }
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

                            {assignment.attachType === 'department' && (
                              <Grid item xs={12} md={6}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Kafedra"
                                  value={assignment.departmentId}
                                  onChange={(event) =>
                                    handleAssignmentChange(assignment.id, 'departmentId', event.target.value)
                                  }
                                  required
                                  disabled={!assignment.facultyId}
                                >
                                  {assignmentDepartmentOptions.map((department) => (
                                    <MenuItem key={department.id} value={department.id}>
                                      {getLocalizedTitle(department)}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                            )}

                            {assignment.attachType === 'section' && (
                              <Grid item xs={12}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Bo‘lim"
                                  value={assignment.sectionId}
                                  onChange={(event) =>
                                    handleAssignmentChange(assignment.id, 'sectionId', event.target.value)
                                  }
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

                            {langList.map((lang) => (
                              <Grid item xs={12} md={6} key={`${assignment.id}-${lang.key}`}>
                                <TextField
                                  fullWidth
                                  label={`${lang.label} lavozim`}
                                  value={assignment[lang.key].position}
                                  onChange={(event) =>
                                    handleAssignmentPositionChange(
                                      assignment.id,
                                      lang.key,
                                      event.target.value
                                    )
                                  }
                                  required={lang.key === 'uz'}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Telegram" name="telegram" value={form.telegram} onChange={handleBaseChange} placeholder="@username yoki https://t.me/username" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Instagram" name="instagram" value={form.instagram} onChange={handleBaseChange} placeholder="@username yoki https://instagram.com/username" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Telefon" name="phone" value={form.phone} onChange={handleBaseChange} placeholder="+998901234567" />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                    <Switch checked={form.active} onChange={handleBaseChange} name="active" />
                    <Typography variant="body2">{form.active ? 'Faol' : 'Nofaol'}</Typography>
                  </Stack>
                </Paper>

              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={3}>
                  {langList.map((lang) => (
                    <Paper key={lang.key} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}>
                      <Box
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: 2.3,
                          bgcolor: '#fff',
                          color: 'text.primary',
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="h5" fontWeight={900}>
                          {lang.label} panel
                        </Typography>
                      </Box>

                      <Box sx={{ p: { xs: 2, md: 3 } }}>
                        {form.panels.map((panel) => (
                          <Grid container spacing={2} key={`${lang.key}-${panel.id}`}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label={`${lang.label} title`}
                                value={panel[lang.key].title}
                                onChange={(event) => handlePanelLangChange(panel.id, lang.key, 'title', event.target.value)}
                                required={lang.key === 'uz'}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Box
                                sx={{
                                  width: '100%',
                                  '& .tox-tinymce': {
                                    minHeight: '320px !important',
                                    borderRadius: '8px !important'
                                  }
                                }}
                              >
                                <TinyMceField
                                  value={panel[lang.key].content}
                                  onChange={(value) => handlePanelLangChange(panel.id, lang.key, 'content', value)}
                                  height={320}
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        ))}
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
      title="Hodimlar portfolio"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          Hodim qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hodim rasmi, biriktirilgan fakultet/kafedra/bo‘lim, lavozimi va portfolio kontentini boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Rasm</TableCell>
              <TableCell>Hodim</TableCell>
              <TableCell>Biriktirilgan joy</TableCell>
              <TableCell>Lavozim belgisi</TableCell>
              <TableCell align="center">Link</TableCell>
              <TableCell align="center">Faol</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employeesPagination.paginatedItems.map((employee, index) => {
              const assignmentsSummary = getEmployeeAssignmentsSummary(employee);
              const primaryAssignment = assignmentsSummary[0]?.assignment || getPrimaryAssignment(employee.assignments);

              return (
                <TableRow hover key={employee.id}>
                  <TableCell>{employeesPagination.getRowNumber(index)}</TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: '#f5f5f5'
                      }}
                    >
                      {employee.image ? (
                        <Box component="img" src={employee.image} alt={employee.fullName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            No img
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {employee.fullName || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {primaryAssignment?.uz?.position || employee.uz.position || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={0.75}>
                      {assignmentsSummary.map((item, assignmentIndex) => (
                        <Box key={`${employee.id}-attach-${assignmentIndex}`}>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.subtitle}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {assignmentsSummary.map((item, assignmentIndex) => {
                        const roleMeta = getRoleMeta(item.assignment?.roleType);

                        return (
                          <Chip
                            key={`${employee.id}-role-${assignmentIndex}`}
                            size="small"
                            color={roleMeta.color}
                            icon={roleMeta.icon}
                            label={roleMeta.label}
                            variant={item.assignment?.roleType === 'employee' ? 'outlined' : 'filled'}
                            sx={{ fontWeight: 800 }}
                          />
                        );
                      })}
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton color={copiedId === employee.id ? 'success' : 'secondary'} onClick={() => handleCopyLink(employee)}>
                      <CopyOutlined />
                    </IconButton>
                  </TableCell>

                  <TableCell align="center">
                    <Switch checked={employee.active} onChange={() => handleActiveChange(employee.id)} />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openEdit(employee)}>
                      <EditOutlined />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(employee.id)}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {!sortedEmployees.length && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Hodim mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedEmployees.length}
        page={employeesPagination.page}
        rowsPerPage={employeesPagination.rowsPerPage}
        onPageChange={employeesPagination.handlePageChange}
        onRowsPerPageChange={employeesPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
