import React, { Fragment, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
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
  Typography
} from '@mui/material';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  UpOutlined
} from '@ant-design/icons';

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

const emptyLang = {
  title: '',
  content: ''
};

const createLangs = () => ({
  uz: { ...emptyLang },
  ru: { ...emptyLang },
  en: { ...emptyLang }
});

const getEmptyForm = (nodeType = 'menu', menuId = '', dropdownId = '') => ({
  id: null,
  nodeType,
  menuId,
  dropdownId,
  url: '',
  order: '',
  active: true,
  displayAsHeader: false,
  files: [],
  ...createLangs()
});

const sortByOrder = (list = []) =>
  [...list].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const getNodeTitle = (node) =>
  node?.uz?.title || node?.en?.title || node?.ru?.title || '-';

const isAcademicItem = (item) => {
  const group = String(
    item.menuGroup ||
      item.group ||
      item.category ||
      item.scope ||
      item.resource ||
      item.section ||
      ''
  ).toLowerCase();

  const url = String(item.url || '').toLowerCase();

  return (
    group.includes('academic') ||
    group.includes('akademik') ||
    url.startsWith('/faculties') ||
    url.startsWith('/departments') ||
    url.startsWith('/sections')
  );
};

const buildTree = (items = [], contentResource = 'menus') => {
  const onlyMenuItems = items.filter((item) => {
    const isMenuItem = item.nodeType === 'menu' || item.nodeType === 'dropdown';

    if (!isMenuItem) {
      return false;
    }

    const academic = isAcademicItem(item);

    if (contentResource === 'menus') {
      return !academic;
    }

    if (contentResource === 'academic-menus') {
      return academic;
    }

    return true;
  });

  const nodeMap = new Map();

  onlyMenuItems.forEach((item) => {
    nodeMap.set(String(item.id), {
      ...item,
      parentId: item.parentId || null,
      children: []
    });
  });

  const roots = [];

  nodeMap.forEach((node) => {
    if (node.nodeType === 'dropdown' && node.parentId && nodeMap.has(String(node.parentId))) {
      nodeMap.get(String(node.parentId)).children.push(node);
      return;
    }

    if (node.nodeType === 'menu') {
      roots.push(node);
    }
  });

  const sortNested = (nodes) =>
    sortByOrder(nodes).map((node) => ({
      ...node,
      children: sortNested(node.children || [])
    }));

  return sortNested(roots);
};

const getRootMenus = (nodes = []) => nodes.filter((node) => node.nodeType === 'menu');

const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (String(node.id) === String(id)) {
      return node;
    }

    const found = findNodeById(node.children || [], id);
    if (found) {
      return found;
    }
  }

  return null;
};

const findRootMenuId = (nodes, nodeId, currentRootId = '') => {
  for (const node of nodes) {
    const nextRootId = node.nodeType === 'menu' ? String(node.id) : currentRootId;

    if (String(node.id) === String(nodeId)) {
      return nextRootId;
    }

    const found = findRootMenuId(node.children || [], nodeId, nextRootId);
    if (found) {
      return found;
    }
  }

  return '';
};

const collectDropdownOptionsByMenu = (menuNode, excludeId = null, level = 0, blocked = false) => {
  let options = [];

  (menuNode?.children || []).forEach((node) => {
    const isBlocked = blocked || String(node.id) === String(excludeId);

    if (!isBlocked && node.nodeType === 'dropdown') {
      options.push({
        value: String(node.id),
        label: `${'— '.repeat(level)}${getNodeTitle(node)}`
      });
    }

    options = [
      ...options,
      ...collectDropdownOptionsByMenu(
        { children: node.children || [] },
        excludeId,
        level + 1,
        isBlocked
      )
    ];
  });

  return options;
};

const collectNodeIdsForDelete = (node) => {
  let ids = [];

  (node.children || []).forEach((child) => {
    ids = [...ids, ...collectNodeIdsForDelete(child)];
  });

  ids.push(node.id);
  return ids;
};

export default function MenuManagementPage({
  contentResource = 'menus',
  pageTitle = 'Menu boshqaruvi',
  pageDescription = "Frontend navbar shu bo‘limdagi ma’lumotlardan quriladi. Har bir menu va dropdown uchun URL berishingiz mumkin.",
  allowDropdowns = true
} = {}) {
  const [menus, setMenus] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());
  const [openedRows, setOpenedRows] = useState({});

  const rootMenus = getRootMenus(menus);
  const selectedMenu = findNodeById(menus, form.menuId);
  const dropdownOptions = collectDropdownOptionsByMenu(selectedMenu, form.id);
  const menuPagination = useTablePagination(menus);

  const syncOpenState = (nextMenus) => {
    setOpenedRows((prev) => {
      const next = {};

      const walk = (nodes, level = 0) => {
        nodes.forEach((node) => {
          next[node.id] = prev[node.id] ?? level === 0;
          walk(node.children || [], level + 1);
        });
      };

      walk(nextMenus);
      return next;
    });
  };

  const loadMenus = async () => {
    try {
      const items = await fetchContentList(contentResource);
      const nextMenus = buildTree(items, contentResource);
      setMenus(nextMenus);
      syncOpenState(nextMenus);
    } catch (error) {
      console.error('Failed to load menus:', error);
      const nextMenus = [];
      setMenus(nextMenus);
      syncOpenState(nextMenus);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [contentResource]);

  const openCreateMenu = () => {
    setForm(getEmptyForm('menu'));
    setMode('form');
  };

  const openCreate = (parentId = '') => {
    if (!allowDropdowns) {
      return;
    }

    if (!parentId) {
      setForm(getEmptyForm('dropdown', rootMenus[0]?.id ? String(rootMenus[0].id) : '', ''));
      setMode('form');
      return;
    }

    const parentNode = findNodeById(menus, parentId);

    if (!parentNode) {
      return;
    }

    if (parentNode.nodeType === 'menu') {
      setForm(getEmptyForm('dropdown', String(parentNode.id), ''));
      setMode('form');
      return;
    }

    setForm(
      getEmptyForm(
        'dropdown',
        findRootMenuId(menus, parentNode.id),
        String(parentNode.id)
      )
    );
    setMode('form');
  };

  const openEdit = (node) => {
    const parentNode = node.parentId ? findNodeById(menus, node.parentId) : null;
    const menuId =
      node.nodeType === 'menu'
        ? String(node.id)
        : parentNode?.nodeType === 'menu'
          ? String(parentNode.id)
          : findRootMenuId(menus, parentNode?.id || '');
    const dropdownId = parentNode?.nodeType === 'dropdown' ? String(parentNode.id) : '';

    setForm({
      id: node.id,
      nodeType: node.nodeType || 'dropdown',
      menuId,
      dropdownId,
      url: node.url || '',
      order: node.order || '',
      active: Boolean(node.active),
      displayAsHeader: Boolean(node.displayAsHeader || node.metadata?.displayAsHeader),
      files: normalizeAttachedFiles(node.files || []),
      uz: { ...emptyLang, ...node.uz },
      ru: { ...emptyLang, ...node.ru },
      en: { ...emptyLang, ...node.en }
    });

    setMode('form');
  };

  const toggleRow = (id) => {
    setOpenedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleBaseChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'nodeType' && value === 'menu') {
        next.menuId = '';
        next.dropdownId = '';
        next.displayAsHeader = false;
      }

      if (name === 'menuId') {
        next.dropdownId = '';
      }

      return next;
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

  const buildPayload = () => {
    const nodeType = form.nodeType;
    const isMenu = nodeType === 'menu';
    const isAcademic = contentResource === 'academic-menus';
    const menuGroup = isAcademic ? 'academic' : 'main';

    return {
      nodeType,
      menuGroup,
      group: menuGroup,
      scope: menuGroup,
      parentId: isMenu ? null : form.dropdownId || form.menuId || null,
      url: form.url.trim(),
      title: form.uz.title.trim(),
      order: form.order ? Number(form.order) : 0,
      active: form.active,
      displayAsHeader: !isMenu && Boolean(form.displayAsHeader),
      files: normalizeAttachedFiles(form.files),
      uz: { ...form.uz, title: form.uz.title.trim() },
      ru: { ...form.ru, title: form.ru.title.trim() },
      en: { ...form.en, title: form.en.title.trim() }
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.nodeType === 'dropdown' && !form.menuId) {
      return;
    }

    const payload = buildPayload();

    if (!payload.title) {
      return;
    }

    try {
      if (form.id) {
        await updateContentItem(contentResource, form.id, payload);
      } else {
        await createContentItem(contentResource, payload);
      }

      await loadMenus();
      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save menu node:', error);
    }
  };

  const handleDelete = async (id) => {
    const node = findNodeById(menus, id);

    if (!node) {
      return;
    }

    try {
      const ids = collectNodeIdsForDelete(node);

      for (const nodeId of ids) {
        await deleteContentItem(contentResource, nodeId);
      }

      await loadMenus();
    } catch (error) {
      console.error('Failed to delete menu node:', error);
    }
  };

  const handleToggleActive = async (node) => {
    try {
      const fallbackGroup = contentResource === 'academic-menus' ? 'academic' : 'main';
      const menuGroup = node.menuGroup || node.group || node.scope || fallbackGroup;

      await updateContentItem(contentResource, node.id, {
        nodeType: node.nodeType,
        menuGroup,
        group: menuGroup,
        scope: menuGroup,
        parentId: node.parentId || null,
        url: node.url || '',
        title: node.uz?.title || '',
        order: node.order || 0,
        active: !node.active,
        metadata: node.metadata || {},
        displayAsHeader: Boolean(node.displayAsHeader || node.metadata?.displayAsHeader),
        files: normalizeAttachedFiles(node.files || []),
        uz: { ...emptyLang, ...node.uz },
        ru: { ...emptyLang, ...node.ru },
        en: { ...emptyLang, ...node.en }
      });

      await loadMenus();
    } catch (error) {
      console.error('Failed to update menu status:', error);
    }
  };

  const renderRows = (nodes, level = 0) =>
    sortByOrder(nodes).map((node, index) => {
      const hasChildren = Boolean(node.children?.length);
      const isMenu = node.nodeType === 'menu';
      const isNested = level > 0;

      return (
        <Fragment key={node.id}>
          <TableRow
            hover
            sx={{
              bgcolor: isMenu ? '#f8fbff' : isNested ? '#ffffff' : 'background.paper',
              animation: isNested ? 'menu-row-enter 0.2s ease both' : 'none',
              '@keyframes menu-row-enter': {
                from: { opacity: 0, transform: 'translateY(-6px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              },
              '&:hover': {
                bgcolor: isMenu ? '#f1f7ff' : '#f8fbff'
              },
              '& td': {
                borderBottom: '1px solid #edf1f7'
              }
            }}
          >
            <TableCell width={56}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={() => toggleRow(node.id)}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: openedRows[node.id] ? '#e8f1ff' : '#f7f9fc',
                    color: openedRows[node.id] ? 'primary.main' : 'text.secondary',
                    border: '1px solid',
                    borderColor: openedRows[node.id] ? '#bfd7ff' : '#e6edf6',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#e8f1ff', color: 'primary.main' }
                  }}
                >
                  {openedRows[node.id] ? <UpOutlined /> : <DownOutlined />}
                </IconButton>
              ) : null}
            </TableCell>

            <TableCell width={80}>
              <Chip
                size="small"
                variant="outlined"
                label={node.order || index + 1}
                sx={{ minWidth: 34, bgcolor: '#fff', fontWeight: 700 }}
              />
            </TableCell>

            <TableCell>
              <Box
                sx={{
                  pl: level * 3,
                  position: 'relative',
                  '&:before': isNested
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: `${Math.max(level * 24 - 14, 8)}px`,
                        top: 2,
                        bottom: 2,
                        width: 2,
                        borderRadius: '6px',
                        bgcolor: '#dbe7f7'
                      }
                    : undefined
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={isMenu ? 900 : 700}>{getNodeTitle(node)}</Typography>

                  {isMenu && !isNested ? (
                    <Chip size="small" color="secondary" label="Menu" />
                  ) : !isMenu ? (
                    <Chip
                      size="small"
                      color={isNested ? 'default' : 'primary'}
                      variant={isNested ? 'outlined' : 'filled'}
                      label={isNested ? 'Ichki dropdown' : 'Dropdown'}
                    />
                  ) : null}

                  {!isMenu && Boolean(node.displayAsHeader || node.metadata?.displayAsHeader) && (
                    <Chip size="small" color="info" variant="outlined" label="TH" sx={{ bgcolor: '#fff' }} />
                  )}

                  {hasChildren && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${node.children?.length || 0} ta ichki`}
                      sx={{ bgcolor: '#fff' }}
                    />
                  )}

                  {isNested && (
                    <Chip size="small" variant="outlined" label={`${level}-daraja`} />
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  URL: {node.url || '-'}
                </Typography>
              </Box>
            </TableCell>

            <TableCell width={120}>
              <Typography variant="caption" color="text.secondary">
                {hasChildren ? 'Ochib ko‘ring' : 'Ichki yo‘q'}
              </Typography>
            </TableCell>

            <TableCell width={120}>
              <Chip size="small" color={node.active ? 'success' : 'default'} label={node.active ? 'Faol' : 'Nofaol'} />
            </TableCell>

            <TableCell align="right" width={280}>
              <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                {allowDropdowns ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlusOutlined />}
                    onClick={() => openCreate(node.id)}
                  >
                    Ichiga
                  </Button>
                ) : null}

                <Switch checked={Boolean(node.active)} onChange={() => handleToggleActive(node)} />

                <IconButton color="primary" onClick={() => openEdit(node)}>
                  <EditOutlined />
                </IconButton>

                <IconButton color="error" onClick={() => handleDelete(node.id)}>
                  <DeleteOutlined />
                </IconButton>
              </Stack>
            </TableCell>
          </TableRow>

          {hasChildren && openedRows[node.id] && renderRows(node.children, level + 1)}
        </Fragment>
      );
    });

  if (mode === 'form') {
    const isMenu = form.nodeType === 'menu';

    return (
      <MainCard
        title={
          form.id
            ? isMenu
              ? 'Menu tahrirlash'
              : 'Dropdown tahrirlash'
            : isMenu
              ? 'Yangi menu qo‘shish'
              : 'Yangi dropdown qo‘shish'
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
            <Grid item xs={12} md={3}>
              {allowDropdowns ? (
                <TextField
                  select
                  required
                  fullWidth
                  label="Node turi"
                  name="nodeType"
                  value={form.nodeType}
                  onChange={handleBaseChange}
                >
                  <MenuItem value="menu">Asosiy menu</MenuItem>
                  <MenuItem value="dropdown">Dropdown</MenuItem>
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label="Node turi"
                  value={isMenu ? 'Asosiy menu' : 'Dropdown'}
                  InputProps={{ readOnly: true }}
                />
              )}
            </Grid>

            {!isMenu && (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Menu tanlang"
                  name="menuId"
                  value={form.menuId}
                  onChange={handleBaseChange}
                  helperText="Dropdown qaysi menu ichida bo‘lishini tanlang."
                >
                  {rootMenus.map((menu) => (
                    <MenuItem key={menu.id} value={menu.id}>
                      {getNodeTitle(menu)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {!isMenu && (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Parent dropdown"
                  name="dropdownId"
                  value={form.dropdownId}
                  onChange={handleBaseChange}
                  disabled={!form.menuId}
                  helperText="Bo‘sh qoldirilsa, bevosita menu ichiga qo‘shiladi."
                >
                  <MenuItem value="">Menu ichiga qo‘shish</MenuItem>

                  {dropdownOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12} md={isMenu ? 5 : 3}>
              <TextField
                fullWidth
                label="URL / Link"
                name="url"
                value={form.url}
                onChange={handleBaseChange}
                placeholder="/news yoki #aloqa"
                helperText="Ixtiyoriy. Link bo‘lmasa bo‘sh qoldiring."
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
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Switch checked={form.active} onChange={handleBaseChange} name="active" />}
                  label="Faol"
                />
              </Box>
            </Grid>

            {!isMenu && (
              <Grid item xs={12} md={3}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.displayAsHeader)}
                        onChange={handleBaseChange}
                        name="displayAsHeader"
                      />
                    }
                    label="TH/header qilib chiqarish"
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <AttachedFilesEditor
                items={form.files}
                onChange={handleFilesChange}
                description="Agar menu sahifasida alohida hujjatlar chiqishi kerak bo‘lsa, shu yerga yuklang."
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: '6px', p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Titlelar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun menu nomini kiriting.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {langList.map((lang) => (
                    <Grid item xs={12} key={lang.key}>
                      <TextField
                        fullWidth
                        label={`${lang.label} title`}
                        value={form[lang.key].title}
                        onChange={(event) => handleLangChange(lang.key, 'title', event.target.value)}
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
                    Contentlar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun izoh yoki tavsif matnini kiriting.
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  {langList.map((lang) => (
                    <Paper
                      key={lang.key}
                      variant="outlined"
                      sx={{ borderRadius: '6px', overflow: 'hidden', bgcolor: 'background.paper' }}
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
                          Shu til uchun content matni
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          width: '100%',
                          '& .tox-tinymce': {
                            minHeight: '320px !important',
                            borderRadius: '6px !important'
                          }
                        }}
                      >
                        <TinyMceField
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
      title={pageTitle}
      secondary={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {allowDropdowns ? (
            <Button variant="outlined" startIcon={<PlusOutlined />} onClick={() => openCreate()}>
              Dropdown qo‘shish
            </Button>
          ) : null}

          <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreateMenu}>
            Menu qo‘shish
          </Button>
        </Stack>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {pageDescription}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: '6px',
          overflow: 'hidden',
          borderColor: '#dfe8f5',
          boxShadow: '0 14px 34px rgba(15, 35, 70, 0.06)'
        }}
      >
        <Table>
          <TableHead
            sx={{
              '& th': {
                bgcolor: '#f8fbff',
                color: '#40526f',
                fontWeight: 800,
                borderBottom: '1px solid #dce6f3'
              }
            }}
          >
            <TableRow>
              <TableCell width={56} />
              <TableCell width={80}>Tartib</TableCell>
              <TableCell>Title</TableCell>
              <TableCell width={120}>Ichki</TableCell>
              <TableCell width={120}>Status</TableCell>
              <TableCell width={280} align="right">
                Amallar
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {renderRows(menuPagination.paginatedItems)}

            {!menus.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Menu mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={menus.length}
        page={menuPagination.page}
        rowsPerPage={menuPagination.rowsPerPage}
        onPageChange={menuPagination.handlePageChange}
        onRowsPerPageChange={menuPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
