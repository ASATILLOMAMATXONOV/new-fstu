import React, { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
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
  Tooltip,
  Typography
} from '@mui/material';

import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UploadOutlined
} from '@ant-design/icons';

// project import
import AdminTablePagination from 'components/AdminTablePagination';
import LinkTableEditor, { normalizeLinkTableItems } from 'components/LinkTableEditor';
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

const typeOptions = [
  { value: 'faculty', label: 'Fakultet' },
  { value: 'department', label: 'Kafedra' },
  { value: 'section', label: 'Bo‘lim' }
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

const getEmptyFacultyForm = () => ({
  id: null,
  image: '',
  imageFile: null,
  bannerImage: '',
  bannerImageFile: null,
  order: '',
  active: true,
  departments: [],
  linkTable: [],
  ...createLangs()
});

const getEmptyDepartmentForm = (facultyId = '') => ({
  id: null,
  facultyId,
  image: '',
  imageFile: null,
  bannerImage: '',
  bannerImageFile: null,
  order: '',
  active: true,
  linkTable: [],
  ...createLangs()
});

const getEmptySectionForm = () => ({
  id: null,
  image: '',
  imageFile: null,
  bannerImage: '',
  bannerImageFile: null,
  order: '',
  active: true,
  linkTable: [],
  ...createLangs()
});

const initialFaculties = [];

const initialSections = [];

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

const normalizeFaculties = (list) =>
  list.map((faculty) => ({
    ...faculty,
    linkTable: normalizeLinkTableItems(faculty.linkTable || []),
    departments: (faculty.departments || []).map((department, index) => ({
      ...department,
      id: createDepartmentId(faculty.id, department, index),
      facultyId: department.facultyId || faculty.id,
      linkTable: normalizeLinkTableItems(department.linkTable || [])
    }))
  }));

const normalizeSectionItem = (section = {}) => ({
  ...section,
  linkTable: normalizeLinkTableItems(section.linkTable || [])
});

const sortByOrder = (list = []) =>
  [...list].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const prepareDepartmentPayload = (department, facultyId, departmentIndex = 0) => ({
  ...department,
  id: createDepartmentId(facultyId, department, departmentIndex),
  imageFile: null,
  bannerImageFile: null,
  facultyId,
  title: department?.uz?.title?.trim() || '',
  order: Number(department.order || 0)
});

const prepareFacultyPayload = (faculty, orderFallback) => ({
  ...faculty,
  imageFile: null,
  bannerImageFile: null,
  entityType: 'faculty',
  title: faculty?.uz?.title?.trim() || '',
  order: faculty.order ? Number(faculty.order) : orderFallback,
  departments: (faculty.departments || []).map((department) =>
    prepareDepartmentPayload(
      department,
      faculty.id || department.facultyId || null,
      faculty.departments?.findIndex((item) => item === department) ?? 0
    )
  )
});

const prepareSectionPayload = (section, orderFallback) => ({
  ...section,
  imageFile: null,
  bannerImageFile: null,
  entityType: 'section',
  title: section?.uz?.title?.trim() || '',
  order: section.order ? Number(section.order) : orderFallback
});

export default function FacultiesManagementPage() {
  const fileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);

  const [faculties, setFaculties] = useState(normalizeFaculties(initialFaculties));
  const [sections, setSections] = useState(initialSections);

  const [mode, setMode] = useState('table');
  const [formType, setFormType] = useState('faculty');

  const [facultyForm, setFacultyForm] = useState(getEmptyFacultyForm());
  const [departmentForm, setDepartmentForm] = useState(getEmptyDepartmentForm());
  const [sectionForm, setSectionForm] = useState(getEmptySectionForm());

  useEffect(() => {
    let cancelled = false;

    const loadFacultiesData = async () => {
      try {
        const items = await fetchContentList('faculties');

        if (cancelled) {
          return;
        }

        const nextFaculties = normalizeFaculties(
          items.filter((item) => item.entityType !== 'section')
        );
        const nextSections = items
          .filter((item) => item.entityType === 'section')
          .map(normalizeSectionItem);

        setFaculties(nextFaculties);
        setSections(nextSections);
      } catch (error) {
        console.error('Failed to load faculties:', error);
      }
    };

    loadFacultiesData();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedFaculties = sortByOrder(faculties);
  const sortedSections = sortByOrder(sections);
  const tableBlocks = React.useMemo(
    () => [
      ...sortedFaculties.map((faculty, facultyIndex) => ({
        key: `faculty-${faculty.id}`,
        kind: 'faculty',
        faculty,
        facultyNumber: facultyIndex + 1
      })),
      ...sortedSections.map((section, sectionIndex) => ({
        key: `section-${section.id}`,
        kind: 'section',
        section,
        sectionNumber: sectionIndex + 1
      }))
    ],
    [sortedFaculties, sortedSections]
  );
  const tableBlocksPagination = useTablePagination(tableBlocks);

  const isFaculty = formType === 'faculty';
  const isDepartment = formType === 'department';
  const isSection = formType === 'section';

  const currentForm = isFaculty ? facultyForm : isDepartment ? departmentForm : sectionForm;

  const openCreate = () => {
    setFormType('faculty');
    setFacultyForm(getEmptyFacultyForm());
    setDepartmentForm(getEmptyDepartmentForm());
    setSectionForm(getEmptySectionForm());
    setMode('form');
  };

  const openEditFaculty = (faculty) => {
    setFormType('faculty');
    setFacultyForm(
      {
        ...getEmptyFacultyForm(),
        ...JSON.parse(
          JSON.stringify({
            ...faculty,
            departments: faculty.departments || []
          })
        )
      }
    );
    setMode('form');
  };

  const openCreateDepartment = (facultyId) => {
    setFormType('department');
    setDepartmentForm(getEmptyDepartmentForm(facultyId));
    setMode('form');
  };

  const openEditDepartment = (facultyId, department) => {
    setFormType('department');
    setDepartmentForm(
      {
        ...getEmptyDepartmentForm(facultyId),
        ...JSON.parse(
          JSON.stringify({
            ...department,
            facultyId
          })
        )
      }
    );
    setMode('form');
  };

  const openEditSection = (section) => {
    setFormType('section');
    setSectionForm({
      ...getEmptySectionForm(),
      ...JSON.parse(JSON.stringify(section))
    });
    setMode('form');
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;

    setFormType(value);

    if (value === 'faculty') {
      setFacultyForm(getEmptyFacultyForm());
    }

    if (value === 'department') {
      setDepartmentForm(getEmptyDepartmentForm());
    }

    if (value === 'section') {
      setSectionForm(getEmptySectionForm());
    }
  };

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (isFaculty) {
      setFacultyForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      return;
    }

    if (isDepartment) {
      setDepartmentForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      return;
    }

    setSectionForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLangChange = (lang, field, value) => {
    if (isFaculty) {
      setFacultyForm((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value
        }
      }));
      return;
    }

    if (isDepartment) {
      setDepartmentForm((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value
        }
      }));
      return;
    }

    setSectionForm((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }));
  };

  const handleLinkTableChange = (nextItems) => {
    if (isFaculty) {
      setFacultyForm((prev) => ({
        ...prev,
        linkTable: nextItems
      }));
      return;
    }

    if (isDepartment) {
      setDepartmentForm((prev) => ({
        ...prev,
        linkTable: nextItems
      }));
      return;
    }

    setSectionForm((prev) => ({
      ...prev,
      linkTable: nextItems
    }));
  };

  const setImageFile = async (file, target = 'image') => {
    if (!file) return;

    const imageUrl = await fileToDataUrl(file);
    const fileKey = `${target}File`;

    if (isFaculty) {
      setFacultyForm((prev) => ({
        ...prev,
        [target]: imageUrl,
        [fileKey]: file
      }));
      return;
    }

    if (isDepartment) {
      setDepartmentForm((prev) => ({
        ...prev,
        [target]: imageUrl,
        [fileKey]: file
      }));
      return;
    }

    setSectionForm((prev) => ({
      ...prev,
      [target]: imageUrl,
      [fileKey]: file
    }));
  };

  const handleImageUpload = async (e) => {
    await setImageFile(e.target.files?.[0], 'image');
  };

  const handleBannerImageUpload = async (e) => {
    await setImageFile(e.target.files?.[0], 'bannerImage');
  };

  const handleImageDrop = async (e, target = 'image') => {
    e.preventDefault();
    await setImageFile(e.dataTransfer.files?.[0], target);
  };

  const removeImage = (target = 'image') => {
    const fileKey = `${target}File`;

    if (isFaculty) {
      setFacultyForm((prev) => ({
        ...prev,
        [target]: '',
        [fileKey]: null
      }));
      return;
    }

    if (isDepartment) {
      setDepartmentForm((prev) => ({
        ...prev,
        [target]: '',
        [fileKey]: null
      }));
      return;
    }

    setSectionForm((prev) => ({
      ...prev,
      [target]: '',
      [fileKey]: null
    }));
  };

  const renderUploadCard = ({
    title,
    description,
    inputRef,
    value,
    onChange,
    onDrop,
    onRemove,
    previewAlt
  }) => (
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
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={onChange}
      />

      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          minHeight: 220,
          borderRadius: '6px',
          border: '2px dashed',
          borderColor: value ? 'primary.main' : 'divider',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {value ? (
          <>
            <Box
              component="img"
              src={value}
              alt={previewAlt}
              sx={{
                width: '100%',
                height: 220,
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
              PNG, JPG, JPEG yoki WEBP
            </Typography>

            <Button variant="outlined" startIcon={<UploadOutlined />}>
              Fayl tanlash
            </Button>
          </Stack>
        )}
      </Box>

      {value && (
        <Button
          fullWidth
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          Rasmni olib tashlash
        </Button>
      )}
    </Paper>
  );

  const handleSubmitFaculty = async (e) => {
    e.preventDefault();

    const preparedForm = prepareFacultyPayload(facultyForm, faculties.length + 1);

    try {
      if (facultyForm.id) {
        const updatedFaculty = await updateContentItem('faculties', facultyForm.id, preparedForm);
        setFaculties((prev) =>
          prev.map((faculty) =>
            faculty.id === facultyForm.id ? normalizeFaculties([updatedFaculty])[0] : faculty
          )
        );
      } else {
        const createdFaculty = await createContentItem('faculties', preparedForm);
        setFaculties((prev) => [normalizeFaculties([createdFaculty])[0], ...prev]);
      }

      setMode('table');
      setFacultyForm(getEmptyFacultyForm());
    } catch (error) {
      console.error('Failed to save faculty:', error);
    }
  };

  const handleSubmitDepartment = async (e) => {
    e.preventDefault();

    const facultyId = String(departmentForm.facultyId || '');
    const selectedFaculty = faculties.find((faculty) => String(faculty.id) === facultyId);

    if (!selectedFaculty) return;

    const currentDepartments = selectedFaculty.departments || [];

    const preparedForm = prepareDepartmentPayload(
      {
        ...departmentForm,
        order: departmentForm.order
          ? Number(departmentForm.order)
          : currentDepartments.length + 1
      },
      selectedFaculty.id,
      departmentForm.id
        ? currentDepartments.findIndex((item) => item.id === departmentForm.id)
        : currentDepartments.length
    );

    const nextFaculty = {
      ...selectedFaculty,
      departments: currentDepartments.some((department) => department.id === preparedForm.id)
        ? currentDepartments.map((department) =>
            department.id === preparedForm.id ? preparedForm : department
          )
        : [preparedForm, ...currentDepartments]
    };

    try {
      const updatedFaculty = await updateContentItem(
        'faculties',
        selectedFaculty.id,
        prepareFacultyPayload(nextFaculty, selectedFaculty.order || faculties.length + 1)
      );

      setFaculties((prev) =>
        prev.map((faculty) =>
          String(faculty.id) === String(selectedFaculty.id)
            ? normalizeFaculties([updatedFaculty])[0]
            : faculty
        )
      );

      setMode('table');
      setDepartmentForm(getEmptyDepartmentForm());
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  const handleSubmitSection = async (e) => {
    e.preventDefault();

    const preparedForm = prepareSectionPayload(sectionForm, sections.length + 1);

    try {
      if (sectionForm.id) {
        const updatedSection = await updateContentItem('faculties', sectionForm.id, preparedForm);
        setSections((prev) =>
          prev.map((section) =>
            section.id === sectionForm.id ? normalizeSectionItem(updatedSection) : section
          )
        );
      } else {
        const createdSection = await createContentItem('faculties', preparedForm);
        setSections((prev) => [normalizeSectionItem(createdSection), ...prev]);
      }

      setMode('table');
      setSectionForm(getEmptySectionForm());
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const handleSubmit = (e) => {
    if (isFaculty) {
      handleSubmitFaculty(e);
      return;
    }

    if (isDepartment) {
      handleSubmitDepartment(e);
      return;
    }

    handleSubmitSection(e);
  };

  const handleDeleteFaculty = async (facultyId) => {
    try {
      await deleteContentItem('faculties', facultyId);
      setFaculties((prev) => prev.filter((faculty) => faculty.id !== facultyId));
    } catch (error) {
      console.error('Failed to delete faculty:', error);
    }
  };

  const handleDeleteDepartment = async (facultyId, departmentId) => {
    const selectedFaculty = faculties.find((faculty) => faculty.id === facultyId);

    if (!selectedFaculty) return;

    const nextFaculty = {
      ...selectedFaculty,
      departments: selectedFaculty.departments.filter(
        (department) => department.id !== departmentId
      )
    };

    try {
      const updatedFaculty = await updateContentItem(
        'faculties',
        facultyId,
        prepareFacultyPayload(nextFaculty, selectedFaculty.order || faculties.length + 1)
      );

      setFaculties((prev) =>
        prev.map((faculty) =>
          faculty.id === facultyId ? normalizeFaculties([updatedFaculty])[0] : faculty
        )
      );
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await deleteContentItem('faculties', sectionId);
      setSections((prev) => prev.filter((section) => section.id !== sectionId));
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleFacultyActiveChange = async (facultyId) => {
    const selectedFaculty = faculties.find((faculty) => faculty.id === facultyId);

    if (!selectedFaculty) return;

    try {
      const updatedFaculty = await updateContentItem(
        'faculties',
        facultyId,
        prepareFacultyPayload(
          {
            ...selectedFaculty,
            active: !selectedFaculty.active
          },
          selectedFaculty.order || faculties.length + 1
        )
      );

      setFaculties((prev) =>
        prev.map((faculty) =>
          faculty.id === facultyId ? normalizeFaculties([updatedFaculty])[0] : faculty
        )
      );
    } catch (error) {
      console.error('Failed to update faculty state:', error);
    }
  };

  const handleDepartmentActiveChange = async (facultyId, departmentId) => {
    const selectedFaculty = faculties.find((faculty) => faculty.id === facultyId);

    if (!selectedFaculty) return;

    const nextFaculty = {
      ...selectedFaculty,
      departments: selectedFaculty.departments.map((department) =>
        department.id === departmentId
          ? {
              ...department,
              active: !department.active
            }
          : department
      )
    };

    try {
      const updatedFaculty = await updateContentItem(
        'faculties',
        facultyId,
        prepareFacultyPayload(nextFaculty, selectedFaculty.order || faculties.length + 1)
      );

      setFaculties((prev) =>
        prev.map((faculty) =>
          faculty.id === facultyId ? normalizeFaculties([updatedFaculty])[0] : faculty
        )
      );
    } catch (error) {
      console.error('Failed to update department state:', error);
    }
  };

  const handleSectionActiveChange = async (sectionId) => {
    const selectedSection = sections.find((section) => section.id === sectionId);

    if (!selectedSection) return;

    try {
      const updatedSection = await updateContentItem(
        'faculties',
        sectionId,
        prepareSectionPayload(
          {
            ...selectedSection,
            active: !selectedSection.active
          },
          selectedSection.order || sections.length + 1
        )
      );

      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? normalizeSectionItem(updatedSection) : section
        )
      );
    } catch (error) {
      console.error('Failed to update section state:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={
          currentForm.id
            ? isFaculty
              ? 'Fakultet tahrirlash'
              : isDepartment
                ? 'Kafedra tahrirlash'
                : 'Bo‘lim tahrirlash'
            : 'Fakultet, kafedra yoki bo‘lim qo‘shish'
        }
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
            <Grid item xs={12} lg={4}>
              <Stack spacing={2.5}>
                {renderUploadCard({
                  title: 'Logo yoki rasm',
                  description: 'Kartalar va ichki bo‘limlarda chiqadigan asosiy rasm.',
                  inputRef: fileInputRef,
                  value: currentForm.image,
                  onChange: handleImageUpload,
                  onDrop: (e) => handleImageDrop(e, 'image'),
                  onRemove: () => removeImage('image'),
                  previewAlt: 'Logo yoki rasm'
                })}

                {renderUploadCard({
                  title: 'Banner rasmi',
                  description: 'Detail sahifadagi katta banner fonida chiqadigan rasm.',
                  inputRef: bannerFileInputRef,
                  value: currentForm.bannerImage,
                  onChange: handleBannerImageUpload,
                  onDrop: (e) => handleImageDrop(e, 'bannerImage'),
                  onRemove: () => removeImage('bannerImage'),
                  previewAlt: 'Banner rasmi'
                })}
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
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
                      Turi va biriktirish
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Avval turini tanlang: fakultet, kafedra yoki bo‘lim.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={isDepartment ? 6 : 12}>
                      <TextField
                        select
                        fullWidth
                        label="Turi"
                        value={formType}
                        onChange={handleTypeChange}
                        disabled={Boolean(currentForm.id)}
                        required
                      >
                        {typeOptions.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {isDepartment && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="Qaysi fakultetga tegishli"
                          name="facultyId"
                          value={departmentForm.facultyId}
                          onChange={handleBaseChange}
                          required
                        >
                          {sortedFaculties.map((faculty) => (
                            <MenuItem key={faculty.id} value={faculty.id}>
                              {faculty.uz.title || 'Fakultet'}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

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
                      Asosiy sozlamalar
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Tartib raqami va faol holatini belgilang.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Tartib"
                        name="order"
                        value={currentForm.order}
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
                              checked={currentForm.active}
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
                      Titlelarni 4 tilda kiriting.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    {langList.map((lang) => (
                      <Grid item xs={12} key={lang.key}>
                        <TextField
                          fullWidth
                          label={`${lang.label} title`}
                          value={currentForm[lang.key].title}
                          onChange={(e) =>
                            handleLangChange(lang.key, 'title', e.target.value)
                          }
                          required={lang.key === 'uz'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <LinkTableEditor
                items={currentForm.linkTable}
                onChange={handleLinkTableChange}
                description="Frontendda ma’lumotning yuqorisida chiqadigan linkli jadval satrlarini kiriting."
              />
            </Grid>

            <Grid item xs={12}>
              <LanguageContentSection
                currentForm={currentForm}
                onChange={handleLangChange}
              />
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
      title="Fakultet, kafedra va bo‘limlar"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          Qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Fakultet, kafedra va bo‘limlarni logo/img, title va content bilan boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Logo / Img</TableCell>
              <TableCell>Nomi</TableCell>
              <TableCell>Turi</TableCell>
              <TableCell>Tegishli joy</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell align="center">Faol</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableBlocksPagination.paginatedItems.map((block) => {
              if (block.kind === 'faculty') {
                const faculty = block.faculty;
                const sortedDepartments = sortByOrder(faculty.departments || []);

                return (
                  <React.Fragment key={block.key}>
                    <TableRow hover>
                      <TableCell>{block.facultyNumber}</TableCell>

                      <TableCell>
                        <ImageCell image={faculty.image} title={faculty.uz.title} />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ApartmentOutlined />

                          <Box>
                            <Typography variant="subtitle1" fontWeight={900}>
                              {faculty.uz.title || '-'}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {faculty.departments?.length || 0} ta kafedra
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip size="small" color="primary" label="Fakultet" />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          Asosiy
                        </Typography>
                      </TableCell>

                      <TableCell>{faculty.order}</TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={faculty.active}
                          onChange={() => handleFacultyActiveChange(faculty.id)}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Kafedra qo‘shish" arrow>
                          <IconButton
                            color="success"
                            onClick={() => openCreateDepartment(faculty.id)}
                          >
                            <PlusOutlined />
                          </IconButton>
                        </Tooltip>

                        <IconButton color="primary" onClick={() => openEditFaculty(faculty)}>
                          <EditOutlined />
                        </IconButton>

                        <IconButton color="error" onClick={() => handleDeleteFaculty(faculty.id)}>
                          <DeleteOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {sortedDepartments.map((department, departmentIndex) => (
                      <TableRow hover key={department.id}>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {block.facultyNumber}.{departmentIndex + 1}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <ImageCell image={department.image} title={department.uz.title} />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ pl: { xs: 0, md: 3 } }}>
                            <Typography variant="subtitle1" fontWeight={800}>
                              {department.uz.title || '-'}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              Kafedra
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip size="small" color="secondary" label="Kafedra" />
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {faculty.uz.title || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>{department.order}</TableCell>

                        <TableCell align="center">
                          <Switch
                            checked={department.active}
                            onChange={() =>
                              handleDepartmentActiveChange(faculty.id, department.id)
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => openEditDepartment(faculty.id, department)}
                          >
                            <EditOutlined />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDeleteDepartment(faculty.id, department.id)
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              }

              const section = block.section;

              return (
              <TableRow hover key={section.id}>
                <TableCell>B{block.sectionNumber}</TableCell>

                <TableCell>
                  <ImageCell image={section.image} title={section.uz.title} />
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TeamOutlined />

                    <Box>
                      <Typography variant="subtitle1" fontWeight={900}>
                        {section.uz.title || '-'}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Bo‘lim
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip size="small" color="success" label="Bo‘lim" />
                </TableCell>

                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    Mustaqil bo‘lim
                  </Typography>
                </TableCell>

                <TableCell>{section.order}</TableCell>

                <TableCell align="center">
                  <Switch
                    checked={section.active}
                    onChange={() => handleSectionActiveChange(section.id)}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openEditSection(section)}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDeleteSection(section.id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
              );
            })}

            {!tableBlocks.length && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Ma’lumot mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={tableBlocks.length}
        page={tableBlocksPagination.page}
        rowsPerPage={tableBlocksPagination.rowsPerPage}
        onPageChange={tableBlocksPagination.handlePageChange}
        onRowsPerPageChange={tableBlocksPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}

function LanguageContentSection({ currentForm, onChange }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '6px',
        p: { xs: 2, md: 3 },
        bgcolor: '#fafafa'
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Contentlar
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Fakultet, kafedra yoki bo‘lim uchun asosiy contentlarni 4 tilda kiriting.
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
            <SectionHeader
              title={lang.label}
              description="Shu til uchun asosiy contentni kiriting."
            />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <TinyMceWrapper>
                <TinyMceField
                  label="Content"
                  value={currentForm[lang.key].content}
                  onChange={(value) => onChange(lang.key, 'content', value)}
                  height={360}
                />
              </TinyMceWrapper>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

function SectionHeader({ title, description }) {
  return (
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
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ImageCell({ image, title }) {
  return (
    <Box
      sx={{
        width: 86,
        height: 60,
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt={title || 'image'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <Typography variant="caption" color="text.secondary">
          No img
        </Typography>
      )}
    </Box>
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
